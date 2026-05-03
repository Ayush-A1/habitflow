import mongoose, { Document, Schema } from 'mongoose';

export type LogStatus = 'completed' | 'missed' | 'skipped';

export interface IHabitLog extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  status: LogStatus;
  note?: string;
  createdAt: Date;
}

const habitLogSchema = new Schema<IHabitLog>({
  habitId: {
    type: Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
  },
  status: {
    type: String,
    enum: ['completed', 'missed', 'skipped'],
    required: true,
  },
  note: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Compound index: one log per habit per day
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

export const HabitLog = mongoose.model<IHabitLog>('HabitLog', habitLogSchema);
