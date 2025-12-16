import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { Plus, Trash2, Play, Dumbbell, Clock, ChevronLeft, ChevronRight, X, Loader2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const EXERCISE_IMAGES = {
  default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
  cardio: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=200&fit=crop',
  strength: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=200&fit=crop',
};

export default function Exercise() {
  const { data, setData, currentDate, setCurrentDate, api } = useContext(AppContext);
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [newEx, setNewEx] = useState({ name: '', duration: 30 });
  const [logInput, setLogInput] = useState({});
  const [loading, setLoading] = useState(false);

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const addExercise = async () => {
    if (!newEx.name.trim()) return;
    setLoading(true);
    const exercise = { id: Date.now().toString(), name: newEx.name.trim(), targetDuration: parseInt(newEx.duration) || 30, logs: {} };
    
    try {
      await api.addExercise(exercise);
      setData(prev => ({ ...prev, exercises: [...prev.exercises, exercise] }));
      setNewEx({ name: '', duration: 30 });
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add exercise:', e);
    }
    setLoading(false);
  };

  const removeExercise = async (id) => {
    try {
      await api.deleteExercise(id);
      setData(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== id) }));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const logExercise = async (id) => {
    const mins = parseInt(logInput[id]);
    if (!mins) return;
    setLoading(true);
    
    try {
      await api.logExercise(id, dateKey, mins);
      setData(prev => ({
        ...prev,
        exercises: prev.exercises.map(e => e.id === id ? {
          ...e, logs: { ...e.logs, [dateKey]: { duration: (e.logs?.[dateKey]?.duration || 0) + mins } }
        } : e)
      }));
      setLogInput(p => ({ ...p, [id]: '' }));
    } catch (e) {
      console.error('Failed to log:', e);
    }
    setLoading(false);
  };

  const startTimer = (ex) => navigate('/timer', { state: { type: 'exercise', item: ex } });
  const navigateDate = (dir) => { const d = new Date(currentDate); d.setDate(d.getDate() + dir); setCurrentDate(d); };

  const totalTime = data.exercises.reduce((a, e) => a + (e.logs?.[dateKey]?.duration || 0), 0);
  const formatTime = (m) => m === 0 ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">Exercise</h1>
          <p className="text-[var(--text-secondary)] text-lg">Track your workouts & stay fit</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Add Exercise
        </button>
      </div>

      {/* Banner */}
      <div className="block overflow-hidden p-0 relative h-48 lg:h-56">
        <img src={EXERCISE_IMAGES.default} alt="Exercise" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-8">
          <div>
            <p className="text-[var(--text-secondary)] mb-1">Today's Total</p>
            <p className="text-5xl lg:text-6xl font-bold gradient-text">{formatTime(totalTime)}</p>
          </div>
        </div>
      </div>

      {/* Date Nav */}
      <div className="block">
        <div className="flex items-center justify-between">
          <button onClick={() => navigateDate(-1)} className="btn-icon"><ChevronLeft className="w-6 h-6" /></button>
          <p className="text-xl font-bold">{format(currentDate, 'EEEE, MMM d')}</p>
          <button onClick={() => navigateDate(1)} className="btn-icon"><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--accent)]/20">
            <Clock className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <p className="stat-value text-[var(--accent)]">{formatTime(totalTime)}</p>
          <p className="stat-label">Total Today</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--green)]/20">
            <Dumbbell className="w-8 h-8 text-[var(--green)]" />
          </div>
          <p className="stat-value text-[var(--green)]">{data.exercises.length}</p>
          <p className="stat-label">Exercises</p>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Add Exercise</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Exercise Name</label>
                  <input type="text" value={newEx.name} onChange={(e) => setNewEx(p => ({ ...p, name: e.target.value }))} placeholder="Push-ups, Running, Yoga..." className="input" autoFocus />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Daily Target (minutes)</label>
                  <input type="number" value={newEx.duration} onChange={(e) => setNewEx(p => ({ ...p, duration: e.target.value }))} className="input" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdd(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={addExercise} disabled={loading} className="btn btn-primary flex-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises */}
      <div className="space-y-5">
        {data.exercises.length === 0 ? (
          <div className="block text-center py-16">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-5">
              <Dumbbell className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No exercises yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Add exercises to track your workouts</p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-5 h-5" /> Add Exercise</button>
          </div>
        ) : (
          data.exercises.map((ex, idx) => {
            const logged = ex.logs?.[dateKey]?.duration || 0;
            const progress = Math.min(100, Math.round((logged / ex.targetDuration) * 100));
            const done = progress >= 100;
            return (
              <motion.div 
                key={ex.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`block ${done ? 'border-[var(--green)]' : ''}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="icon-box icon-box-lg bg-[var(--accent)]/20">
                      <Dumbbell className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{ex.name}</h3>
                      <p className="text-[var(--text-secondary)]">Target: {ex.targetDuration} min</p>
                    </div>
                  </div>
                  <button onClick={() => removeExercise(ex.id)} className="btn-icon hover:bg-[var(--red)]/20 hover:text-[var(--red)]">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[var(--text-secondary)]">{logged}/{ex.targetDuration} min</span>
                  <span className={`text-2xl font-bold ${done ? 'text-[var(--green)]' : 'gradient-text'}`}>{progress}%</span>
                </div>
                <div className="progress h-3 mb-5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`progress-bar ${done ? '!bg-[var(--green)]' : ''}`}
                  />
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => startTimer(ex)} className="btn btn-primary flex-1 min-w-[120px]">
                    <Play className="w-5 h-5" /> Start Timer
                  </button>
                  <input 
                    type="number" 
                    value={logInput[ex.id] || ''} 
                    onChange={(e) => setLogInput(p => ({ ...p, [ex.id]: e.target.value }))} 
                    placeholder="Min" 
                    className="input w-24 text-center" 
                  />
                  <button onClick={() => logExercise(ex.id)} disabled={loading} className="btn btn-secondary">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '+ Log'}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
