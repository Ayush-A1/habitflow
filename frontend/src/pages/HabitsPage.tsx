import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Flame, ListChecks } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { habitsApi } from '../api';
import { Habit, HabitFormData } from '../types';
import { cn, HABIT_COLORS, HABIT_ICONS } from '../lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1,'Name required').max(100),
  description: z.string().max(300).optional(),
  frequency: z.enum(['daily','weekly','custom']),
  color: z.string(),
  icon: z.string(),
  reminderTime: z.string().optional(),
});
type F = z.infer<typeof schema>;

function Modal({ editing, onClose }: { editing: Habit | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset, formState:{errors} } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: editing
      ? { name:editing.name, description:editing.description, frequency:editing.frequency, color:editing.color, icon:editing.icon, reminderTime:editing.reminderTime }
      : { frequency:'daily', color:'#6366f1', icon:'⭐' },
  });
  const color = watch('color');
  const icon  = watch('icon');

  const create = useMutation({
    mutationFn: (d:HabitFormData) => habitsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({queryKey:['habits']}); toast.success('Habit created!'); onClose(); },
  });
  const update = useMutation({
    mutationFn: (d:HabitFormData) => habitsApi.update(editing!._id, d),
    onSuccess: () => { qc.invalidateQueries({queryKey:['habits']}); toast.success('Habit updated!'); onClose(); },
  });

  const onSubmit = (v:F) => editing ? update.mutate(v as HabitFormData) : create.mutate(v as HabitFormData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card bg-[#0e0e1a] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-pop max-h-[90vh] overflow-y-auto">
        <h2 className="text-[16px] font-bold text-white mb-5">{editing ? 'Edit Habit' : 'New Habit'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Name *</label>
            <input {...register('name')} placeholder="e.g. Morning Run" className="input-base" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Description</label>
            <input {...register('description')} placeholder="Optional" className="input-base" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Frequency</label>
            <select {...register('frequency')} className="input-base">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom days</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-2">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setValue('icon', ic)}
                  className={cn('w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all duration-100',
                    icon===ic ? 'bg-brand-500/30 ring-1 ring-brand-500 scale-110' : 'bg-white/[0.05] hover:bg-white/[0.10]')}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setValue('color', c)}
                  className={cn('w-7 h-7 rounded-full transition-all duration-100',
                    color===c && 'ring-2 ring-offset-2 ring-offset-[#0e0e1a] ring-white scale-110')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Reminder Time</label>
            <input {...register('reminderTime')} type="time" className="input-base" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={create.isPending||update.isPending} className="btn-primary flex-1 justify-center">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'new'|Habit|null>(null);

  const { data: habits = [], isLoading } = useQuery({ queryKey:['habits'], queryFn:habitsApi.getAll });

  const del = useMutation({
    mutationFn: habitsApi.delete,
    onSuccess: () => { qc.invalidateQueries({queryKey:['habits']}); toast.success('Habit deleted'); },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">{habits.length} active habit{habits.length!==1?'s':''}</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse" />)}</div>
      ) : habits.length === 0 ? (
        <div className="card rounded-2xl p-14 text-center">
          <ListChecks className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-[15px] font-semibold text-white/50 mb-1">No habits yet</h3>
          <p className="text-[13px] text-white/30 mb-5">Build your daily routine one habit at a time</p>
          <button onClick={() => setModal('new')} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" /> Add your first habit
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {habits.map((h, i) => (
            <div key={h._id}
              style={{ animationDelay: `${i*30}ms` }}
              className="flex items-center gap-3.5 p-4 card rounded-2xl hover:border-white/[0.12] transition-colors animate-fade-up">
              <div className="w-11 h-11 rounded-[13px] flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${h.color}1A` }}>
                {h.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/88">{h.name}</p>
                {h.description && <p className="text-[11px] text-white/35 truncate mt-0.5">{h.description}</p>}
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="badge bg-white/[0.06] text-white/40 capitalize text-[10px]">{h.frequency}</span>
                  {h.currentStreak>0 && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400">
                      <Flame className="w-3 h-3" />{h.currentStreak}d streak
                    </span>
                  )}
                  <span className="text-[11px] text-white/28">{h.totalCompleted} total</span>
                </div>
              </div>
              {/* Streak ring */}
              <div className="text-center hidden sm:block shrink-0">
                <p className="text-[18px] font-bold text-white">{h.longestStreak}</p>
                <p className="text-[10px] text-white/30">best</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setModal(h)}
                  className="p-2 rounded-xl text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm(`Delete "${h.name}"?`)) del.mutate(h._id); }}
                  className="p-2 rounded-xl text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <Modal editing={modal==='new'?null:modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
