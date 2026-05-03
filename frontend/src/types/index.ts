export interface User { id:string; name:string; email:string; createdAt:string; }
export interface AuthResponse { accessToken:string; refreshToken:string; user:User; }
export type Frequency = 'daily'|'weekly'|'custom';
export type DayOfWeek = 'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun';
export type LogStatus = 'completed'|'missed'|'skipped';
export interface Habit { _id:string; userId:string; name:string; description?:string; frequency:Frequency; customDays?:DayOfWeek[]; color:string; icon:string; reminderTime?:string; isActive:boolean; currentStreak:number; longestStreak:number; totalCompleted:number; createdAt:string; updatedAt:string; }
export interface HabitLog { _id:string; habitId:string|Habit; userId:string; date:string; status:LogStatus; note?:string; createdAt:string; }
export interface HabitFormData { name:string; description?:string; frequency:Frequency; customDays?:DayOfWeek[]; color:string; icon:string; reminderTime?:string; }
export interface Goal { _id:string; userId:string; title:string; description?:string; startDate:string; endDate:string; habitIds:(string|Habit)[]; isCompleted:boolean; progress:number; createdAt:string; }
export type NoteColor = 'default'|'blue'|'green'|'yellow'|'red'|'purple';
export interface Note { _id:string; userId:string; title:string; content:string; color:NoteColor; tags:string[]; isPinned:boolean; habitId?:string; createdAt:string; updatedAt:string; }
export interface NoteFormData { title?:string; content:string; color:NoteColor; tags:string[]; habitId?:string; }
export interface AnalyticsOverview { totalHabits:number; completedToday:number; completionRate:number; bestStreak:number; activeStreaks:number; }
export interface HeatmapEntry { date:string; count:number; level:0|1|2|3|4; }
export interface TrendEntry { date:string; completed:number; rate:number; }
export interface WeeklyEntry { day:string; completed:number; total:number; }
