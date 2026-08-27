import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { sendInvitationEmail, sendPasswordResetEmail } from "../mail.js";
const router = Router();
const publicUser = (u: any) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  active: u.active,
});
const token = (u: any) =>
  jwt.sign({ sub: u._id, role: u.role }, process.env.JWT_SECRET!, {
    expiresIn: "8h",
  });
const goodPassword = (p: unknown): p is string =>
  typeof p === "string" && p.length >= 12;
const inviteUrl = (raw: string) =>
  `${process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173"}/accept-invite?token=${encodeURIComponent(raw)}`;
const temporaryPassword = () =>
  `${crypto.randomBytes(9).toString("base64url")}A1!`;
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email?.toLowerCase(),
    }).select("+passwordHash");
    if (
      !user ||
      !user.active ||
      !(await bcrypt.compare(req.body.password || "", user.passwordHash))
    )
      return res.status(401).json({ message: "Invalid email or password." });
    res.json({ token: token(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});
router.get("/me", requireAuth, (req, res) => res.json(publicUser(req.user)));
router.get(
  "/users",
  requireAuth,
  allowRoles("admin"),
  async (_req, res, next) => {
    try {
      res.json((await User.find().sort({ createdAt: -1 })).map(publicUser));
    } catch (e) {
      next(e);
    }
  },
);
router.patch(
  "/users/:id",
  requireAuth,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const update: Record<string, unknown> = {};
      if (typeof req.body.name === "string" && req.body.name.trim())
        update.name = req.body.name.trim();
      if (typeof req.body.email === "string" && req.body.email.trim()) {
        const email = req.body.email.trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(email))
          return res.status(400).json({ message: "Provide a valid email." });
        if (await User.exists({ email, _id: { $ne: req.params.id } }))
          return res
            .status(409)
            .json({ message: "This email is already in use." });
        update.email = email;
      }
      if (["admin", "editor", "viewer"].includes(req.body.role))
        update.role = req.body.role;
      if (typeof req.body.active === "boolean") update.active = req.body.active;
      const user = await User.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });
      if (!user) return res.status(404).json({ message: "User not found." });
      res.json(publicUser(user));
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/invitations",
  requireAuth,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const { email, role = "editor" } = req.body;
      if (!email || !["admin", "editor", "viewer"].includes(role))
        return res
          .status(400)
          .json({ message: "Provide a valid email and role." });
      const normalizedEmail = email.toLowerCase();
      if (await User.exists({ email: normalizedEmail }))
        return res
          .status(409)
          .json({ message: "This person already has an account." });
      const raw = crypto.randomBytes(32).toString("hex");
      await Invitation.findOneAndUpdate(
        { email: normalizedEmail, acceptedAt: null },
        {
          email: normalizedEmail,
          role,
          tokenHash: crypto.createHash("sha256").update(raw).digest("hex"),
          invitedBy: req.user._id,
          expiresAt: new Date(Date.now() + 7 * 86400000),
          acceptedAt: null,
        },
        { upsert: true },
      );
      try {
        await sendInvitationEmail(normalizedEmail, role, raw);
      } catch (error) {
        console.error(
          "Invitation email failed:",
          error instanceof Error ? error.message : error,
        );
        return res.status(502).json({
          message:
            "The invitation was created, but the email could not be sent.",
          inviteUrl: inviteUrl(raw),
        });
      }
      res.status(201).json({
        message: "Invitation email sent.",
        inviteUrl: inviteUrl(raw),
        expiresInDays: 7,
      });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/users/:id/reset-password",
  requireAuth,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select("+passwordHash");
      if (!user) return res.status(404).json({ message: "User not found." });
      const password = temporaryPassword();
      user.passwordHash = await bcrypt.hash(password, 12);
      await user.save();
      try {
        await sendPasswordResetEmail(user.email, user.name, password);
      } catch (error) {
        console.error(
          "Password reset email failed:",
          error instanceof Error ? error.message : error,
        );
        return res.status(502).json({
          message:
            "The password was reset, but the notification email could not be sent.",
        });
      }
      res.json({ message: "Temporary password sent to the user by email." });
    } catch (e) {
      next(e);
    }
  },
);
router.post("/accept-invite", async (req, res, next) => {
  try {
    const { token: raw, name, password } = req.body;
    if (!raw || !name || !goodPassword(password))
      return res
        .status(400)
        .json({ message: "A name and 12-character password are required." });
    const invite = await Invitation.findOne({
      tokenHash: crypto.createHash("sha256").update(raw).digest("hex"),
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!invite)
      return res
        .status(400)
        .json({ message: "This invitation is invalid or expired." });
    const user = await User.create({
      name,
      email: invite.email,
      passwordHash: await bcrypt.hash(password, 12),
      role: invite.role,
    });
    invite.acceptedAt = new Date();
    await invite.save();
    res.status(201).json({ token: token(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});
export default router;
