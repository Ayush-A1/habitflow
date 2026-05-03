import mongoose, { Document, Schema } from 'mongoose';

export type NoteColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  color: NoteColor;
  tags: string[];
  isPinned: boolean;
  habitId?: mongoose.Types.ObjectId; // optional link to a habit
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
    default: '',
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10,000 characters'],
  },
  color: {
    type: String,
    enum: ['default', 'blue', 'green', 'yellow', 'red', 'purple'],
    default: 'default',
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30,
  }],
  isPinned: {
    type: Boolean,
    default: false,
  },
  habitId: {
    type: Schema.Types.ObjectId,
    ref: 'Habit',
  },
}, {
  timestamps: true,
});

noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
