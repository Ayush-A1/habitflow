import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HabitLog } from '../models/HabitLog';
import { Habit } from '../models/Habit';
import { AuthRequest } from '../middleware/auth';
import { format, subDays, parseISO } from 'date-fns';

// Recalculate streak for a habit
const recalculateStreak = async (habitId: string): Promise<void> => {
  const logs = await HabitLog.find({ habitId, status: 'completed' })
    .sort({ date: -1 });

  if (!logs.length) {
    await Habit.findByIdAndUpdate(habitId, { currentStreak: 0 });
    return;
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = format(new Date(), 'yyyy-MM-dd');

  for (const log of logs) {
    if (log.date === expectedDate) {
      if (currentStreak === 0) currentStreak++;
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      expectedDate = format(subDays(parseISO(log.date), 1), 'yyyy-MM-dd');
    } else {
      break;
    }
  }

  // Also find the actual longest streak
  let maxStreak = 0;
  let streak = 1;
  for (let i = 1; i < logs.length; i++) {
    const prev = parseISO(logs[i - 1].date);
    const curr = parseISO(logs[i].date);
    const diff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }
  maxStreak = Math.max(maxStreak, 1);

  await Habit.findByIdAndUpdate(habitId, {
    currentStreak,
    longestStreak: Math.max(maxStreak, currentStreak),
    totalCompleted: logs.length,
  });
};

export const logHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { habitId, date, status, note } = req.body;

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
    if (!habit) { res.status(404).json({ message: 'Habit not found' }); return; }

    // Upsert: update if already logged for that date
    const log = await HabitLog.findOneAndUpdate(
      { habitId, date },
      { habitId, userId: req.userId, date, status, note },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate streak async
    await recalculateStreak(habitId);

    res.status(201).json(log);
  } catch (err) { next(err); }
};

export const getLogsForDate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;
    const logs = await HabitLog.find({ userId: req.userId, date })
      .populate('habitId', 'name color icon frequency');
    res.json(logs);
  } catch (err) { next(err); }
};

export const getLogsForHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { habitId } = req.params;
    const { from, to } = req.query;

    const query: any = { habitId, userId: req.userId };
    if (from && to) {
      query.date = { $gte: from, $lte: to };
    }

    const logs = await HabitLog.find(query).sort({ date: -1 });
    res.json(logs);
  } catch (err) { next(err); }
};

export const deleteLog = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await HabitLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) { res.status(404).json({ message: 'Log not found' }); return; }
    await recalculateStreak(log.habitId.toString());
    res.json({ message: 'Log deleted' });
  } catch (err) { next(err); }
};
