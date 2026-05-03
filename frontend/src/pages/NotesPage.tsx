import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pin, Trash2, X, Tag, ChevronDown, BookOpen } from 'lucide-react';
import { notesApi, habitsApi } from '../api';
import { Note, NoteColor, NoteFormData } from '../types';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Color palette for notes ──────────────────────────────────────────────────
const NOTE_COLORS: { key: NoteColor; label: string; bg: string; border: string; dot: string }[] = [
  { key: 'default', label: 'Default', bg: 'bg-[#111118]',          border: 'border-white/[0.09]',      dot: 'bg-white/20'    },
  { key: 'blue',    label: 'Blue',    bg: 'bg-blue-950/60',         border: 'border-blue-500/25',       dot: 'bg-blue-400'    },
  { key: 'green',   label: 'Green',   bg: 'bg-emerald-950/60',      border: 'border-emerald-500/25',    dot: 'bg-emerald-400' },
  { key: 'yellow',  label: 'Yellow',  bg: 'bg-yellow-950/60',       border: 'border-yellow-500/25',     dot: 'bg-yellow-400'  },
  { key: 'red',     label: 'Red',     bg: 'bg-red-950/60',          border: 'border-red-500/25',        dot: 'bg-red-400'     },
  { key: 'purple',  label: 'Purple',  bg: 'bg-purple-950/60',       border: 'border-purple-500/25',     dot: 'bg-purple-400'  },
];

const colorOf = (c: NoteColor) => NOTE_COLORS.find(x => x.key === c) ?? NOTE_COLORS[0];

// ─── NoteCard ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete, onPin }: {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}) {
  const col = colorOf(note.color);
  const preview = note.content.length > 180 ? note.content.slice(0, 180) + '…' : note.content;

  return (
    <div
      onClick={() => onEdit(note)}
      className={cn(
        'group relative rounded-2xl border p-4 cursor-pointer',
        'transition-all duration-150 hover:scale-[1.01] hover:shadow-lg',
        col.bg, col.border
      )}
    >
      {/* Pin badge */}
      {note.isPinned && (
        <div className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center">
          <Pin className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
        </div>
      )}

      {/* Title */}
      {note.title && (
        <h3 className="text-[13px] font-semibold text-white/90 mb-1.5 pr-6 leading-snug">{note.title}</h3>
      )}

      {/* Content preview */}
      <p className="text-[12px] text-white/50 leading-relaxed whitespace-pre-wrap break-words">{preview}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {note.tags.slice(0, 4).map(t => (
            <span key={t} className="badge text-[10px] bg-white/[0.07] text-white/45 font-medium">#{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06]">
        <span className="text-[11px] text-white/28">
          {format(parseISO(note.updatedAt), 'MMM d, h:mm a')}
        </span>

        {/* Action buttons — show on hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onPin(note._id)}
            className={cn(
              'p-1.5 rounded-lg transition-colors text-xs',
              note.isPinned
                ? 'text-brand-400 bg-brand-500/15'
                : 'text-white/35 hover:text-brand-400 hover:bg-brand-500/10'
            )}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NoteEditor (modal) ───────────────────────────────────────────────────────
function NoteEditor({
  note, habits, onClose, onSave,
}: {
  note: Note | null;
  habits: { _id: string; name: string; icon: string }[];
  onClose: () => void;
  onSave: (data: NoteFormData, id?: string) => void;
}) {
  const [title,   setTitle]   = useState(note?.title   ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color,   setColor]   = useState<NoteColor>(note?.color ?? 'default');
  const [tagInput, setTagInput] = useState('');
  const [tags,    setTags]    = useState<string[]>(note?.tags ?? []);
  const [habitId, setHabitId] = useState<string>(note?.habitId ?? '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    if (e.key === 'Escape') onClose();
  };

  const handleSave = () => {
    if (!content.trim()) { toast.error('Note content cannot be empty'); return; }
    onSave({ title: title.trim(), content: content.trim(), color, tags, habitId: habitId || undefined }, note?._id);
  };

  const col = colorOf(color);
  const charCount = content.length;
  const charMax = 10000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={cn(
        'w-full max-w-xl rounded-2xl border flex flex-col animate-pop',
        'max-h-[90vh] overflow-hidden',
        col.bg, col.border
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-white/[0.07]">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="flex-1 bg-transparent text-[15px] font-semibold text-white placeholder-white/25 focus:outline-none"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.07] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing…"
            rows={10}
            className="w-full bg-transparent text-[13px] text-white/80 placeholder-white/25 resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 badge bg-white/[0.08] text-white/50">
                #{t}
                <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-white/30 hover:text-white/70 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Footer toolbar */}
        <div className="px-5 py-3 border-t border-white/[0.07] space-y-3">
          {/* Tag input */}
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tag and press Enter"
              className="flex-1 bg-transparent text-[12px] text-white/60 placeholder-white/25 focus:outline-none"
            />
          </div>

          {/* Link to habit */}
          {habits.length > 0 && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <select
                value={habitId}
                onChange={e => setHabitId(e.target.value)}
                className="flex-1 bg-transparent text-[12px] text-white/60 focus:outline-none appearance-none"
              >
                <option value="">Link to habit (optional)</option>
                {habits.map(h => (
                  <option key={h._id} value={h._id} className="bg-[#1a1a28]">{h.icon} {h.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Bottom row: color + char count + save */}
          <div className="flex items-center gap-3 pt-1">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] transition-colors text-[12px] text-white/55"
              >
                <span className={cn('w-3 h-3 rounded-full', col.dot)} />
                {col.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showColorPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-[#1a1a28] border border-white/[0.12] rounded-xl p-2 flex gap-1.5 shadow-2xl z-10">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.key}
                      onClick={() => { setColor(c.key); setShowColorPicker(false); }}
                      className={cn('w-6 h-6 rounded-full transition-transform hover:scale-110', c.dot,
                        color === c.key && 'ring-2 ring-offset-2 ring-offset-[#1a1a28] ring-white')}
                      title={c.label}
                    />
                  ))}
                </div>
              )}
            </div>

            <span className={cn('text-[11px] ml-auto', charCount > charMax * 0.9 ? 'text-red-400' : 'text-white/25')}>
              {charCount}/{charMax}
            </span>

            <button onClick={onClose} className="btn-ghost py-1.5 px-3 text-[12px]">Cancel</button>
            <button onClick={handleSave} className="btn-primary py-1.5 px-4 text-[12px]">
              {note ? 'Update' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [activeColor, setActiveColor] = useState<NoteColor | ''>('');
  const [editNote, setEditNote] = useState<Note | null | undefined>(undefined); // undefined = closed

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', search, activeTag, activeColor],
    queryFn: () => notesApi.getAll({
      q: search || undefined,
      tag: activeTag || undefined,
      color: activeColor || undefined,
    }),
  });

  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: () => import('../api').then(m => m.habitsApi.getAll()) });
  const { data: allTags = [] } = useQuery({ queryKey: ['notes-tags'], queryFn: notesApi.getTags });

  const inv = () => {
    qc.invalidateQueries({ queryKey: ['notes'] });
    qc.invalidateQueries({ queryKey: ['notes-tags'] });
  };

  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => { inv(); toast.success('Note saved!'); setEditNote(undefined); },
    onError: () => toast.error('Failed to save note'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteFormData> }) => notesApi.update(id, data),
    onSuccess: () => { inv(); toast.success('Note updated!'); setEditNote(undefined); },
    onError: () => toast.error('Failed to update note'),
  });

  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => { inv(); toast.success('Note deleted'); },
  });

  const pinMutation = useMutation({
    mutationFn: notesApi.togglePin,
    onSuccess: () => inv(),
  });

  const handleSave = (data: NoteFormData, id?: string) => {
    if (id) updateMutation.mutate({ id, data });
    else    createMutation.mutate(data);
  };

  const pinned   = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setEditNote(null)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="input-base pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Color filter */}
        <div className="flex items-center gap-1.5 card rounded-xl px-3 py-2">
          {NOTE_COLORS.map(c => (
            <button
              key={c.key}
              onClick={() => setActiveColor(activeColor === c.key ? '' : c.key)}
              className={cn('w-5 h-5 rounded-full transition-transform hover:scale-110', c.dot,
                activeColor === c.key && 'ring-2 ring-offset-2 ring-offset-[#111118] ring-white')}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              className={cn(
                'badge transition-colors cursor-pointer',
                activeTag === tag
                  ? 'bg-brand-500/25 text-brand-300'
                  : 'bg-white/[0.06] text-white/45 hover:bg-white/[0.10]'
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="card rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-[15px] font-semibold text-white/60 mb-2">
            {search || activeTag || activeColor ? 'No notes match your filters' : 'No notes yet'}
          </h3>
          <p className="text-[13px] text-white/30 mb-5">
            {search || activeTag || activeColor
              ? 'Try clearing your filters'
              : 'Capture your thoughts, ideas, and reflections'}
          </p>
          {!search && !activeTag && !activeColor && (
            <button onClick={() => setEditNote(null)} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" /> Write your first note
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Pinned */}
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Pin className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Pinned</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinned.map(n => (
                  <NoteCard key={n._id} note={n}
                    onEdit={setEditNote}
                    onDelete={id => { if (confirm('Delete this note?')) deleteMutation.mutate(id); }}
                    onPin={id => pinMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Others */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Others</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unpinned.map(n => (
                  <NoteCard key={n._id} note={n}
                    onEdit={setEditNote}
                    onDelete={id => { if (confirm('Delete this note?')) deleteMutation.mutate(id); }}
                    onPin={id => pinMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Editor modal */}
      {editNote !== undefined && (
        <NoteEditor
          note={editNote}
          habits={habits}
          onClose={() => setEditNote(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
