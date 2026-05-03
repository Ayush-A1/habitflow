import api from '../lib/api';
import { Habit, HabitFormData, HabitLog, Goal, Note, NoteFormData, AnalyticsOverview, HeatmapEntry, TrendEntry, WeeklyEntry, AuthResponse, LogStatus } from '../types';

export const authApi = {
  register: (d:{name:string;email:string;password:string}) => api.post<AuthResponse>('/auth/register',d).then(r=>r.data),
  login:    (d:{email:string;password:string}) => api.post<AuthResponse>('/auth/login',d).then(r=>r.data),
  logout:   () => api.post('/auth/logout'),
  getMe:    () => api.get('/auth/me').then(r=>r.data),
};

export const habitsApi = {
  getAll:  () => api.get<Habit[]>('/habits').then(r=>r.data),
  getById: (id:string) => api.get<Habit>(`/habits/${id}`).then(r=>r.data),
  create:  (d:HabitFormData) => api.post<Habit>('/habits',d).then(r=>r.data),
  update:  (id:string,d:Partial<HabitFormData>) => api.put<Habit>(`/habits/${id}`,d).then(r=>r.data),
  delete:  (id:string) => api.delete(`/habits/${id}`),
};

export const logsApi = {
  logHabit:    (d:{habitId:string;date:string;status:LogStatus;note?:string}) => api.post<HabitLog>('/habit-logs',d).then(r=>r.data),
  getForDate:  (date:string) => api.get<HabitLog[]>(`/habit-logs/date/${date}`).then(r=>r.data),
  getForHabit: (habitId:string,from?:string,to?:string) => api.get<HabitLog[]>(`/habit-logs/habit/${habitId}`,{params:{from,to}}).then(r=>r.data),
  delete:      (id:string) => api.delete(`/habit-logs/${id}`),
};

export const goalsApi = {
  getAll:      () => api.get<Goal[]>('/goals').then(r=>r.data),
  create:      (d:Partial<Goal>) => api.post<Goal>('/goals',d).then(r=>r.data),
  update:      (id:string,d:Partial<Goal>) => api.put<Goal>(`/goals/${id}`,d).then(r=>r.data),
  delete:      (id:string) => api.delete(`/goals/${id}`),
  getProgress: (id:string) => api.get<{progress:number}>(`/goals/${id}/progress`).then(r=>r.data),
};

export const notesApi = {
  getAll:    (params?:{q?:string;tag?:string;color?:string}) => api.get<Note[]>('/notes',{params}).then(r=>r.data),
  getById:   (id:string) => api.get<Note>(`/notes/${id}`).then(r=>r.data),
  create:    (d:NoteFormData) => api.post<Note>('/notes',d).then(r=>r.data),
  update:    (id:string,d:Partial<NoteFormData>) => api.put<Note>(`/notes/${id}`,d).then(r=>r.data),
  togglePin: (id:string) => api.patch<Note>(`/notes/${id}/pin`).then(r=>r.data),
  delete:    (id:string) => api.delete(`/notes/${id}`),
  getTags:   () => api.get<string[]>('/notes/tags').then(r=>r.data),
};

export const analyticsApi = {
  getOverview: () => api.get<AnalyticsOverview>('/analytics/overview').then(r=>r.data),
  getHeatmap:  (days?:number) => api.get<HeatmapEntry[]>('/analytics/heatmap',{params:{days}}).then(r=>r.data),
  getTrends:   (days?:number) => api.get<TrendEntry[]>('/analytics/trends',{params:{days}}).then(r=>r.data),
  getWeekly:   () => api.get<WeeklyEntry[]>('/analytics/weekly').then(r=>r.data),
};
