import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Note } from '../models/Note';
import { AuthRequest } from '../middleware/auth';

export const getNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, tag, color } = req.query;

    const filter: any = { userId: req.userId };
    if (color) filter.color = color;
    if (tag)   filter.tags = tag;
    if (q) {
      const regex = new RegExp(q as string, 'i');
      filter.$or = [{ title: regex }, { content: regex }, { tags: regex }];
    }

    const notes = await Note.find(filter)
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(100);

    res.json(notes);
  } catch (err) { next(err); }
};

export const getNoteById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) { res.status(404).json({ message: 'Note not found' }); return; }
    res.json(note);
  } catch (err) { next(err); }
};

export const createNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { title, content, color, tags, habitId } = req.body;
    const note = await Note.create({
      userId: req.userId,
      title: title?.trim() || '',
      content,
      color: color || 'default',
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      habitId: habitId || undefined,
    });
    res.status(201).json(note);
  } catch (err) { next(err); }
};

export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { title, content, color, tags, habitId } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, color, tags, habitId },
      { new: true, runValidators: true }
    );
    if (!note) { res.status(404).json({ message: 'Note not found' }); return; }
    res.json(note);
  } catch (err) { next(err); }
};

export const togglePin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) { res.status(404).json({ message: 'Note not found' }); return; }
    note.isPinned = !note.isPinned;
    await note.save();
    res.json(note);
  } catch (err) { next(err); }
};

export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) { res.status(404).json({ message: 'Note not found' }); return; }
    res.json({ message: 'Note deleted' });
  } catch (err) { next(err); }
};

export const getAllTags = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notes = await Note.find({ userId: req.userId }, { tags: 1 });
    const tagSet = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tagSet.add(t)));
    res.json([...tagSet]);
  } catch (err) { next(err); }
};
