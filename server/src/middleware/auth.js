import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7);
    if (!token) return res.status(401).json({ message: 'Sign in is required.' });
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(sub);
    if (!user || !user.active) return res.status(401).json({ message: 'Your account is not active.' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: 'Your session is invalid or expired.' }); }
};

export const allowRoles = (...roles) => (req, res, next) => roles.includes(req.user.role)
  ? next() : res.status(403).json({ message: 'You do not have permission for this action.' });
