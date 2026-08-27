import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import apps from "./routes/apps.js";
import auth from "./routes/auth.js";
import App from "./models/App.js";
import User from "./models/User.js";
dotenv.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error(
    "JWT_SECRET must be a random value of at least 32 characters.",
  );
const server = express();
server.use(helmet());
server.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
server.use(express.json({ limit: "100kb" }));
server.use(morgan("dev"));
server.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  auth,
);
server.get("/api/health", (_req, res) => res.json({ ok: true }));
server.use("/api/apps", apps);
server.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) =>
    res.status(400).json({ message: error.message || "Something went wrong" }),
);
const seedAdmin = async () => {
  const {
    DEFAULT_ADMIN_EMAIL: email,
    DEFAULT_ADMIN_PASSWORD: password,
    DEFAULT_ADMIN_NAME: name = "MagicWorld Administrator",
  } = process.env;
  if (!email && !password) return;
  if (!email || !password || password.length < 12)
    return console.warn(
      "Default admin not created: set valid DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD.",
    );
  if (!(await User.exists({ email: email.toLowerCase() }))) {
    await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    });
    console.log(`Created default administrator for ${email}.`);
  }
};
const seedApps = async () => {
  if (await App.countDocuments()) return;
  await App.insertMany([
    {
      name: "Pulse Analytics",
      description:
        "Real-time business metrics and beautiful performance dashboards.",
      type: "web",
      category: "Analytics",
      platforms: ["Web"],
      isFeatured: true,
      isNew: true,
      webUrl: "https://example.com",
      currentVersion: "2.3.1",
      latestVersion: "2.3.1",
    },
    {
      name: "Studio Desk",
      description: "A focused workspace for creative projects and approvals.",
      type: "desktop",
      category: "Productivity",
      platforms: ["Windows", "macOS"],
      currentVersion: "4.1.0",
      latestVersion: "4.2.0",
    },
  ]);
};
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/magicworld-launcher",
  )
  .then(async () => {
    await seedAdmin();
    await seedApps();
    server.listen(Number(process.env.PORT) || 5000, () =>
      console.log("API running"),
    );
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
