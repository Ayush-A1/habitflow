import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Flame, Zap, TrendingUp, Target, Dot } from 'lucide-react';
import { habitsApi, logsApi, analyticsApi } from '../api';
import { todayStr, cn, getStreakColor } from '../lib/utils';
import { Habit, HabitLog } from '../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

function StatCard({ label, value, sub, subColor = 'text-white/38' }: { label: string; value: React.ReactNode; sub: string; subColor?: string }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className={cn('text-[11px] font-medium', subColor)}>{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const qc = useQueryClient();
  const today = todayStr();
  const { user } = useAuthStore();

  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: habitsApi.getAll });
  const { data: todayLogs = [] } = useQuery({ queryKey: ['logs', today], queryFn: () => logsApi.getForDate(today) });
  const { data: overview } = useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.getOverview });

  const logMutation = useMutation({
    mutationFn: logsApi.logHabit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logs', today] });
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const loggedMap = new Map<string, HabitLog>(todayLogs.map(l => [l.habitId as string, l]));
  const completedCount = todayLogs.filter(l => l.status === 'completed').length;
  const total = habits.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  const toggleHabit = (habit: Habit) => {
    const existing = loggedMap.get(habit._id);
    const newStatus = existing?.status === 'completed' ? 'missed' : 'completed';
    logMutation.mutate({ habitId: habit._id, date: today, status: newStatus });
    if (newStatus === 'completed') toast.success(`✅ ${habit.name} done!`);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const msgs = ["Let's get started!", 'Good start!', 'Halfway there!', 'Almost done!', 'All done! Amazing! 🎉'];
  const msgIdx = Math.min(completedCount, 4);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Good {greeting}, {firstName} 👋</h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 card rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[12px] text-white/55 font-medium">Streak Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Completed Today" value={<>{completedCount}<span className="text-base text-white/30 font-normal">/{total}</span></>} sub="Today's count" subColor="text-emerald-400" />
        <StatCard label="Completion Rate" value={<>{overview?.completionRate ?? 0}<span className="text-base text-white/30 font-normal">%</span></>} sub="↑ vs last week" subColor="text-brand-300" />
        <StatCard label="Best Streak" value={<>{overview?.bestStreak ?? 0}<span className="text-sm text-white/30 font-normal"> days</span></>} sub="🔥 Personal record" subColor="text-amber-400" />
        <StatCard label="Active Streaks" value={overview?.activeStreaks ?? 0} sub={`out of ${total} habits`} />
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[13px] font-semibold text-white/70">Today's Progress</span>
          <span className="text-[13px] font-bold text-brand-300">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[11px] text-white/30 mt-2">{completedCount} of {total} habits completed — {msgs[msgIdx]}</p>
      </div>

      {/* Habits */}
      <div>
        <h2 className="text-[13px] font-semibold text-white/60 mb-3">Today's Habits</h2>
        {habits.length === 0 ? (
          <div className="card p-10 text-center">
            <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">No habits yet — go add your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit, i) => {
              const log = loggedMap.get(habit._id);
              const done = log?.status === 'completed';
              return (
                <button
                  key={habit._id}
                  onClick={() => toggleHabit(habit)}
                  disabled={logMutation.isPending}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 animate-fade-up',
                    done ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-[#111118] border-white/[0.07] hover:border-brand-500/30'
                  )}
                >
                  <div className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[19px] shrink-0" style={{ backgroundColor: `${habit.color}1A` }}>
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] font-semibold', done ? 'text-white/35 line-through' : 'text-white/88')}>{habit.name}</p>
                    <p className={cn('text-[11px] mt-0.5', habit.currentStreak > 0 ? 'text-amber-400' : 'text-white/28')}>
                      {habit.currentStreak > 0 ? `🔥 ${habit.currentStreak} day streak` : 'No streak yet'}
                    </p>
                  </div>
                  <div className={cn('w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200', done ? 'bg-emerald-500 border-emerald-500' : 'border-white/20')}>
                    {done && <svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
