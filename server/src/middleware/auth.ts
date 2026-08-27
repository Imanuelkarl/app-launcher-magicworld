import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined;
    if (!token)
      return res.status(401).json({ message: "Sign in is required." });
    const { sub } = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    const user = await User.findById(sub);
    if (!user || !user.active)
      return res.status(401).json({ message: "Your account is not active." });
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Your session is invalid or expired." });
  }
};
export const allowRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) =>
    roles.includes(req.user?.role)
      ? next()
      : res
          .status(403)
          .json({ message: "You do not have permission for this action." });
