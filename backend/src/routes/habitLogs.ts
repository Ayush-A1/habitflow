import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { logHabit, getLogsForDate, getLogsForHabit, deleteLog } from '../controllers/habitLogController';

const router = Router();
router.use(protect);

router.post('/', [
  body('habitId').notEmpty().isMongoId(),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('status').isIn(['completed', 'missed', 'skipped']),
  body('note').optional().isLength({ max: 500 }),
], logHabit);

router.get('/date/:date', getLogsForDate);   // /api/habit-logs/date/2024-06-01
router.get('/habit/:habitId', getLogsForHabit);
router.delete('/:id', deleteLog);

export default router;
