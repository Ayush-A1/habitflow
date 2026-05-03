import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import {
  getNotes, getNoteById, createNote,
  updateNote, deleteNote, togglePin, getAllTags,
} from '../controllers/noteController';

const router = Router();
router.use(protect);

const noteValidation = [
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 10000 }),
  body('title').optional().trim().isLength({ max: 150 }),
  body('color').optional().isIn(['default', 'blue', 'green', 'yellow', 'red', 'purple']),
  body('tags').optional().isArray({ max: 10 }),
];

router.get('/',           getNotes);
router.get('/tags',       getAllTags);
router.get('/:id',        getNoteById);
router.post('/',          noteValidation, createNote);
router.put('/:id',        noteValidation, updateNote);
router.patch('/:id/pin',  togglePin);
router.delete('/:id',     deleteNote);

export default router;
