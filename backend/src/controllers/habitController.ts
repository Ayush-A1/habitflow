import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Habit } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import { AuthRequest } from '../middleware/auth';

export const getHabits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const habits = await Habit.find({ userId: req.userId, isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) { next(err); }
};

export const getHabitById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) { res.status(404).json({ message: 'Habit not found' }); return; }
    res.json(habit);
  } catch (err) { next(err); }
};

export const createHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { name, description, frequency, customDays, color, icon, reminderTime } = req.body;
    const habit = await Habit.create({
      userId: req.userId,
      name, description, frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      color: color || '#6366f1',
      icon: icon || '⭐',
      reminderTime,
    });
    res.status(201).json(habit);
  } catch (err) { next(err); }
};

export const updateHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!habit) { res.status(404).json({ message: 'Habit not found' }); return; }
    res.json(habit);
  } catch (err) { next(err); }
};

export const deleteHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isActive: false }, // Soft delete
      { new: true }
    );
    if (!habit) { res.status(404).json({ message: 'Habit not found' }); return; }
    res.json({ message: 'Habit deleted' });
  } catch (err) { next(err); }
};
