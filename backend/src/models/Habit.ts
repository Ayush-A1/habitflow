import mongoose, { Document, Schema } from 'mongoose';

export type Frequency = 'daily' | 'weekly' | 'custom';
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  frequency: Frequency;
  customDays?: DayOfWeek[];
  color: string;
  icon: string;
  reminderTime?: string; // "HH:mm" format
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily',
  },
  customDays: [{
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }],
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: '⭐',
  },
  reminderTime: {
    type: String,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  currentStreak: { type: Number, default: 0 },
  longestStreak:  { type: Number, default: 0 },
  totalCompleted: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
