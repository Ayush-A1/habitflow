import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  habitIds: mongoose.Types.ObjectId[];
  isCompleted: boolean;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  startDate: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'],
  },
  endDate: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'],
  },
  habitIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Habit',
  }],
  isCompleted: { type: Boolean, default: false },
  progress:     { type: Number, default: 0, min: 0, max: 100 },
}, {
  timestamps: true,
});

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
