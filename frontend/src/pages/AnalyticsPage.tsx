import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../api';
import { format, parseISO } from 'date-fns';

const HEAT_COLS = ['#151520', '#2D2B78', '#4338CA', '#6366F1', '#A5B4FC'];

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E2E] border border-brand-500/30 rounded-xl px-3 py-2">
      <p className="text-[11px] text-white/50 mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-brand-300">{payload[0].value}{payload[0].name === 'rate' ? '%' : ''}</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const { data: overview } = useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.getOverview });
  const { data: trends = [] } = useQuery({ queryKey: ['analytics', 'trends'], queryFn: () => analyticsApi.getTrends(30) });
  const { data: weekly = [] } = useQuery({ queryKey: ['analytics', 'weekly'], queryFn: analyticsApi.getWeekly });
  const { data: heatmap = [] } = useQuery({ queryKey: ['analytics', 'heatmap'], queryFn: () => analyticsApi.getHeatmap(84) });

  const trendData = trends.map(t => ({ ...t, label: format(parseISO(t.date), 'MMM d') }));

  const stats = [
    { label: 'Avg Rate', value: `${overview?.completionRate ?? 0}%` },
    { label: 'Total Habits', value: overview?.totalHabits ?? 0 },
    { label: 'Best Streak', value: `${overview?.bestStreak ?? 0}d` },
    { label: 'Active Streaks', value: overview?.activeStreaks ?? 0 },
  ];

  const weeks = Array.from({ length: 12 });
  const days = 7;

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Last 30 days overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="stat-card">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Trend */}
      <div className="card p-5">
        <h2 className="text-[13px] font-semibold text-white/70 mb-4">30-Day Completion Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} interval={4} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip content={<TT />} />
            <Line type="monotone" dataKey="rate" name="rate" stroke="#6366F1" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-white/70 mb-4">This Week</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekly} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} />
              <Tooltip content={<TT />} />
              <Bar dataKey="completed" fill="#6366F1" fillOpacity={0.75} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-white/70 mb-3">12-Week Heatmap</h2>
          <div className="flex gap-1.5">
            {weeks.map((_, w) => (
              <div key={w} className="flex flex-col gap-1.5">
                {Array.from({ length: days }).map((_, d) => {
                  const entry = heatmap[w * 7 + d];
                  return (
                    <div
                      key={d}
                      title={entry ? `${entry.date}: ${entry.count}` : ''}
                      className="w-3 h-3 rounded-[3px]"
                      style={{ backgroundColor: entry ? HEAT_COLS[entry.level] : '#151520' }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3">
            <span className="text-[10px] text-white/28 mr-1">Less</span>
            {HEAT_COLS.map((c, i) => <div key={i} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: c }} />)}
            <span className="text-[10px] text-white/28 ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
