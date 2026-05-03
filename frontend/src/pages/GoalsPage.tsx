import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Target, Trash2, Calendar, Pencil } from 'lucide-react';
import { goalsApi, habitsApi } from '../api';
import { Goal } from '../types';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

type FormState = { title:string; description:string; startDate:string; endDate:string; habitIds:string[] };
const blank = ():FormState => ({ title:'', description:'', startDate:'', endDate:'', habitIds:[] });

function GoalModal({ goal, habits, onClose }: { goal:Goal|null; habits:any[]; onClose:()=>void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<FormState>(goal
    ? { title:goal.title, description:goal.description||'', startDate:goal.startDate, endDate:goal.endDate, habitIds:(goal.habitIds as any[]).map((h:any)=>typeof h==='string'?h:h._id) }
    : blank());

  const upsert = useMutation({
    mutationFn: () => goal ? goalsApi.update(goal._id, f) : goalsApi.create(f),
    onSuccess: () => { qc.invalidateQueries({queryKey:['goals']}); toast.success(goal?'Goal updated!':'Goal created!'); onClose(); },
    onError: () => toast.error('Failed to save goal'),
  });

  const toggle = (id:string) =>
    setF(p => ({ ...p, habitIds: p.habitIds.includes(id) ? p.habitIds.filter(h=>h!==id) : [...p.habitIds,id] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card bg-[#0e0e1a] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-pop max-h-[90vh] overflow-y-auto">
        <h2 className="text-[16px] font-bold text-white mb-5">{goal ? 'Edit Goal' : 'New Goal'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Title *</label>
            <input value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="e.g. Run a 5K" className="input-base" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Description</label>
            <input value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} placeholder="Optional" className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" value={f.startDate} onChange={e=>setF(p=>({...p,startDate:e.target.value}))} className="input-base" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1.5">End Date</label>
              <input type="date" value={f.endDate} onChange={e=>setF(p=>({...p,endDate:e.target.value}))} className="input-base" />
            </div>
          </div>
          {habits.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-2">Link Habits</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {habits.map(h => (
                  <label key={h._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] cursor-pointer transition-colors">
                    <input type="checkbox" checked={f.habitIds.includes(h._id)} onChange={()=>toggle(h._id)} className="rounded accent-brand-500" />
                    <span className="text-sm">{h.icon}</span>
                    <span className="text-[13px] text-white/75">{h.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button
              onClick={() => { if (!f.title||!f.startDate||!f.endDate) { toast.error('Fill required fields'); return; } upsert.mutate(); }}
              disabled={upsert.isPending}
              className="btn-primary flex-1 justify-center">
              {goal ? 'Update' : 'Create Goal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<Goal|'new'|null>(null);
  const { data:goals=[], isLoading } = useQuery({ queryKey:['goals'], queryFn:goalsApi.getAll });
  const { data:habits=[] } = useQuery({ queryKey:['habits'], queryFn:habitsApi.getAll });

  const del = useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => { qc.invalidateQueries({queryKey:['goals']}); toast.success('Goal deleted'); },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">{goals.length} active goal{goals.length!==1?'s':''}</p>
        </div>
        <button onClick={()=>setModal('new')} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-36 bg-white/[0.03] rounded-2xl animate-pulse"/>)}</div>
      ) : goals.length===0 ? (
        <div className="card rounded-2xl p-14 text-center">
          <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-[15px] font-semibold text-white/50 mb-1">No goals yet</h3>
          <p className="text-[13px] text-white/30 mb-5">Set meaningful goals and attach habits to track them</p>
          <button onClick={()=>setModal('new')} className="btn-primary mx-auto"><Plus className="w-4 h-4"/>Add your first goal</button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g,i) => {
            const habitList = g.habitIds as any[];
            const daysLeft = differenceInDays(parseISO(g.endDate), new Date());
            const ended = isPast(parseISO(g.endDate));
            return (
              <div key={g._id} style={{animationDelay:`${i*40}ms`}}
                className="card rounded-2xl p-5 animate-fade-up hover:border-white/[0.12] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-[14px] font-bold text-white">{g.title}</h3>
                    {g.description && <p className="text-[12px] text-white/38 mt-0.5">{g.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={()=>setModal(g)} className="p-2 rounded-xl text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
                      <Pencil className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={()=>{if(confirm('Delete goal?'))del.mutate(g._id)}} className="p-2 rounded-xl text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-white/35 mb-1.5">
                    <span>Progress</span>
                    <span className="font-semibold text-white/60">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500 transition-all duration-700"
                      style={{width:`${g.progress}%`}} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-white/35">
                    <Calendar className="w-3.5 h-3.5"/>
                    {format(parseISO(g.startDate),'MMM d')} – {format(parseISO(g.endDate),'MMM d, yyyy')}
                  </span>
                  <span className={cn('font-semibold', ended?'text-red-400':daysLeft<=7?'text-amber-400':'text-white/38')}>
                    {ended ? 'Ended' : `${daysLeft}d left`}
                  </span>
                  {habitList.length>0 && (
                    <span className="badge bg-brand-500/15 text-brand-300">
                      {habitList.length} habit{habitList.length!==1?'s':''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal!==null && <GoalModal goal={modal==='new'?null:modal} habits={habits} onClose={()=>setModal(null)} />}
    </div>
  );
}
