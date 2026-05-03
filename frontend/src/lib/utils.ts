import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
};

export const getStreakColor = (streak: number): string => {
  if (streak >= 30) return 'text-yellow-400';
  if (streak >= 14) return 'text-orange-400';
  if (streak >= 7)  return 'text-amber-400';
  if (streak >= 3)  return 'text-green-400';
  return 'text-white/28';
};

export const HABIT_COLORS = [
  '#6366F1','#8B5CF6','#EC4899','#EF4444',
  '#F97316','#EAB308','#22C55E','#14B8A6',
  '#06B6D4','#3B82F6','#A78BFA','#F472B6',
];

export const HABIT_ICONS = [
  '⭐','💪','📚','🏃','🧘','💧','🍎','😴',
  '✍️','🎯','🎨','🎵','💻','🧠','❤️','🌱',
  '🏋️','🚴','🧪','🔥','🎤','🦷','🥗','🛌',
];
