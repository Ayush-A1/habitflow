import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import { Goal } from '../models/Goal';
import { HabitLog } from '../models/HabitLog';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

const router = Router();
router.use(protect);

const goalValidation = [
  body('title').trim().notEmpty().isLength({ max: 100 }),
  body('startDate').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('endDate').matches(/^\d{4}-\d{2}-\d{2}$/),
];

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goals = await Goal.find({ userId: req.userId })
      .populate('habitIds', 'name color icon currentStreak')
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) { next(err); }
});

router.post('/', goalValidation, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { title, description, startDate, endDate, habitIds } = req.body;
    const goal = await Goal.create({ userId: req.userId, title, description, startDate, endDate, habitIds: habitIds || [] });
    res.status(201).json(goal);
  } catch (err) { next(err); }
});

router.put('/:id', goalValidation, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return; }
    res.json(goal);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return; }
    res.json({ message: 'Goal deleted' });
  } catch (err) { next(err); }
});

// GET /api/goals/:id/progress — calc progress from habit logs
router.get('/:id/progress', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return; }

    const days = eachDayOfInterval({ start: parseISO(goal.startDate), end: parseISO(goal.endDate) });
    const totalExpected = days.length * goal.habitIds.length;

    if (totalExpected === 0) { res.json({ progress: 0 }); return; }

    const logs = await HabitLog.countDocuments({
      habitId: { $in: goal.habitIds },
      date: { $gte: goal.startDate, $lte: goal.endDate },
      status: 'completed',
    });

    const progress = Math.round((logs / totalExpected) * 100);
    await Goal.findByIdAndUpdate(goal.id, { progress });
    res.json({ progress });
  } catch (err) { next(err); }
});

export default router;
