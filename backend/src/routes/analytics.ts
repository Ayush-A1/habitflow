import { Router } from 'express';
import { protect } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import { HabitLog } from '../models/HabitLog';
import { Habit } from '../models/Habit';
import { AuthRequest } from '../middleware/auth';
import { format, subDays, eachDayOfInterval, parseISO, startOfWeek, endOfWeek } from 'date-fns';

const router = Router();
router.use(protect);

// GET /api/analytics/overview
router.get('/overview', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const last30 = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    const habits = await Habit.find({ userId: req.userId, isActive: true });
    const todayLogs = await HabitLog.find({ userId: req.userId, date: today });

    const totalHabits = habits.length;
    const completedToday = todayLogs.filter(l => l.status === 'completed').length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    const longestStreaks = habits.map(h => h.longestStreak);
    const currentStreaks = habits.map(h => h.currentStreak);

    res.json({
      totalHabits,
      completedToday,
      completionRate,
      bestStreak: longestStreaks.length ? Math.max(...longestStreaks) : 0,
      activeStreaks: currentStreaks.filter(s => s > 0).length,
    });
  } catch (err) { next(err); }
});

// GET /api/analytics/heatmap?days=90
router.get('/heatmap', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 90;
    const from = format(subDays(new Date(), days), 'yyyy-MM-dd');
    const to = format(new Date(), 'yyyy-MM-dd');

    const logs = await HabitLog.find({
      userId: req.userId,
      date: { $gte: from, $lte: to },
      status: 'completed',
    });

    // Group by date
    const byDate: Record<string, number> = {};
    for (const log of logs) {
      byDate[log.date] = (byDate[log.date] || 0) + 1;
    }

    const habits = await Habit.countDocuments({ userId: req.userId, isActive: true });

    const heatmap = eachDayOfInterval({
      start: parseISO(from),
      end: parseISO(to),
    }).map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = byDate[dateStr] || 0;
      return {
        date: dateStr,
        count,
        level: habits === 0 ? 0 : Math.min(4, Math.floor((count / habits) * 4)),
      };
    });

    res.json(heatmap);
  } catch (err) { next(err); }
});

// GET /api/analytics/trends?days=30
router.get('/trends', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const from = format(subDays(new Date(), days), 'yyyy-MM-dd');

    const habits = await Habit.find({ userId: req.userId, isActive: true });
    const logs = await HabitLog.find({
      userId: req.userId,
      date: { $gte: from },
    });

    const totalHabits = habits.length;

    const byDate: Record<string, number> = {};
    for (const log of logs) {
      if (log.status === 'completed') {
        byDate[log.date] = (byDate[log.date] || 0) + 1;
      }
    }

    const trend = eachDayOfInterval({
      start: parseISO(from),
      end: new Date(),
    }).map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = byDate[dateStr] || 0;
      return {
        date: dateStr,
        completed: count,
        rate: totalHabits > 0 ? Math.round((count / totalHabits) * 100) : 0,
      };
    });

    res.json(trend);
  } catch (err) { next(err); }
});

// GET /api/analytics/weekly
router.get('/weekly', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const logs = await HabitLog.find({
      userId: req.userId,
      date: { $gte: weekStart, $lte: weekEnd },
    });

    const habits = await Habit.countDocuments({ userId: req.userId, isActive: true });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const byDay: Record<string, number> = {};

    for (const log of logs) {
      if (log.status === 'completed') {
        const day = format(parseISO(log.date), 'EEE');
        byDay[day] = (byDay[day] || 0) + 1;
      }
    }

    const weekly = days.map(day => ({
      day,
      completed: byDay[day] || 0,
      total: habits,
    }));

    res.json(weekly);
  } catch (err) { next(err); }
});

export default router;
