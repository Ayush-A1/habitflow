import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitById,
} from '../controllers/habitController';

const router = Router();
router.use(protect);

const habitValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('frequency').isIn(['daily', 'weekly', 'custom']).withMessage('Invalid frequency'),
  body('color').optional().isHexColor(),
  body('reminderTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
];

router.get('/', getHabits);
router.post('/', habitValidation, createHabit);
router.get('/:id', getHabitById);
router.put('/:id', habitValidation, updateHabit);
router.delete('/:id', deleteHabit);

export default router;
