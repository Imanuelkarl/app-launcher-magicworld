import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

const router = Router();
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, active: user.active });
const issueToken = user => jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
const validPassword = password => typeof password === 'string' && password.length >= 12;

router.post('/bootstrap', async (req, res, next) => {
  try {
    if (await User.exists({})) return res.status(403).json({ message: 'An administrator already exists.' });
    const { name, email, password } = req.body;
    if (!name || !email || !validPassword(password)) return res.status(400).json({ message: 'Name, company email, and a 12-character password are required.' });
    if (process.env.BOOTSTRAP_ADMIN_EMAIL && email.toLowerCase() !== process.env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) return res.status(403).json({ message: 'This email is not authorized to bootstrap the system.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' });
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+passwordHash');
    if (!user || !user.active || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});
router.get('/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

router.get('/users', requireAuth, allowRoles('admin'), async (_req, res, next) => { try { res.json((await User.find().sort({ createdAt: -1 })).map(publicUser)); } catch (error) { next(error); } });
router.patch('/users/:id', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const updates = {}; if (['admin', 'editor', 'viewer'].includes(req.body.role)) updates.role = req.body.role;
    if (typeof req.body.active === 'boolean') updates.active = req.body.active;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(publicUser(user));
  } catch (error) { next(error); }
});
router.post('/invitations', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const { email, role = 'editor' } = req.body;
    if (!email || !['admin', 'editor', 'viewer'].includes(role)) return res.status(400).json({ message: 'Provide a valid email and role.' });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'This person already has an account.' });
    const token = crypto.randomBytes(32).toString('hex');
    await Invitation.findOneAndUpdate({ email: email.toLowerCase(), acceptedAt: null }, { email: email.toLowerCase(), role, tokenHash: crypto.createHash('sha256').update(token).digest('hex'), invitedBy: req.user._id, expiresAt: new Date(Date.now() + 7 * 86400000), acceptedAt: null }, { upsert: true, new: true });
    res.status(201).json({ inviteUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/accept-invite?token=${token}`, expiresInDays: 7 });
  } catch (error) { next(error); }
});
router.post('/accept-invite', async (req, res, next) => {
  try {
    const { token, name, password } = req.body;
    if (!token || !name || !validPassword(password)) return res.status(400).json({ message: 'A name and 12-character password are required.' });
    const invitation = await Invitation.findOne({ tokenHash: crypto.createHash('sha256').update(token).digest('hex'), acceptedAt: null, expiresAt: { $gt: new Date() } });
    if (!invitation) return res.status(400).json({ message: 'This invitation is invalid or expired.' });
    const user = await User.create({ name, email: invitation.email, passwordHash: await bcrypt.hash(password, 12), role: invitation.role });
    invitation.acceptedAt = new Date(); await invitation.save();
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});
export default router;
