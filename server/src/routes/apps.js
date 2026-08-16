import { Router } from 'express';
import App from '../models/App.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

const router = Router();
const appFields = ['name', 'description', 'type', 'iconUrl', 'installPath', 'webUrl', 'downloadUrl', 'updateUrl', 'currentVersion', 'latestVersion', 'category', 'platforms', 'isNew', 'isFeatured', 'status'];
const appPayload = body => Object.fromEntries(appFields.filter(key => key in body).map(key => [key, body[key]]));

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category, platform, status = 'published' } = req.query;
    const query = status === 'all' ? {} : { status };
    if (category && category !== 'All') query.category = category;
    if (platform && platform !== 'All') query.platforms = platform;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    const apps = await App.find(query).sort({ isFeatured: -1, publishedAt: -1 });
    res.json(apps);
  } catch (error) { next(error); }
});

router.get('/categories', async (_req, res, next) => {
  try { res.json(await App.distinct('category', { status: 'published' })); } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (error) { next(error); }
});

router.post('/', requireAuth, allowRoles('admin', 'editor'), async (req, res, next) => {
  try { res.status(201).json(await App.create({ ...appPayload(req.body), createdBy: req.user._id, updatedBy: req.user._id, owner: req.user.name })); } catch (error) { next(error); }
});
router.put('/:id', requireAuth, allowRoles('admin', 'editor'), async (req, res, next) => {
  try {
    const existing = await App.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Application not found' });
    if (req.user.role !== 'admin' && String(existing.createdBy) !== String(req.user._id)) return res.status(403).json({ message: 'Editors can only modify their own uploads.' });
    const app = await App.findByIdAndUpdate(req.params.id, { ...appPayload(req.body), updatedBy: req.user._id }, { new: true, runValidators: true });
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (error) { next(error); }
});
router.delete('/:id', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const app = await App.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
