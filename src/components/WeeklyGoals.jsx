import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { Plus, Trash2, Target, CheckCircle, X, Loader2, Trophy, Sparkles } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const GOALS_IMAGE = 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=300&fit=crop';

export default function WeeklyGoals() {
  const { data, setData, currentDate, api } = useContext(AppContext);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', progress: 0 });
  const [loading, setLoading] = useState(false);

  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d');
  const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy');

  const addGoal = async () => {
    if (!newGoal.title.trim()) return;
    setLoading(true);
    const goal = { 
      id: Date.now().toString(), 
      ...newGoal, 
      title: newGoal.title.trim(),
      completed: false,
      week: format(currentDate, 'yyyy-ww')
    };
    
    try {
      await api.addGoal(goal);
      setData(prev => ({ ...prev, weeklyGoals: [...prev.weeklyGoals, goal] }));
      setNewGoal({ title: '', description: '', progress: 0 });
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add:', e);
    }
    setLoading(false);
  };

  const updateGoal = async (id, updates) => {
    try {
      await api.updateGoal(id, updates);
      setData(prev => ({
        ...prev,
        weeklyGoals: prev.weeklyGoals.map(g => g.id === id ? { ...g, ...updates } : g)
      }));
    } catch (e) {
      console.error('Failed to update:', e);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      setData(prev => ({ ...prev, weeklyGoals: prev.weeklyGoals.filter(g => g.id !== id) }));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const activeGoals = data.weeklyGoals.filter(g => !g.completed);
  const completedGoals = data.weeklyGoals.filter(g => g.completed);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">Weekly Goals</h1>
          <p className="text-[var(--text-secondary)] text-lg">{weekStart} - {weekEnd}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Add Goal
        </button>
      </div>

      {/* Banner */}
      <div className="block overflow-hidden p-0 relative h-48 lg:h-56">
        <img src={GOALS_IMAGE} alt="Goals" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-8">
          <div>
            <p className="text-[var(--text-secondary)] mb-1">This Week</p>
            <p className="text-5xl lg:text-6xl font-bold gradient-text">{activeGoals.length} Active</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--orange)]/20">
            <Target className="w-8 h-8 text-[var(--orange)]" />
          </div>
          <p className="stat-value text-[var(--orange)]">{activeGoals.length}</p>
          <p className="stat-label">In Progress</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--green)]/20">
            <Trophy className="w-8 h-8 text-[var(--green)]" />
          </div>
          <p className="stat-value text-[var(--green)]">{completedGoals.length}</p>
          <p className="stat-label">Completed</p>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Add Goal</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Goal</label>
                  <input type="text" value={newGoal.title} onChange={(e) => setNewGoal(p => ({ ...p, title: e.target.value }))} placeholder="What do you want to achieve?" className="input" autoFocus />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Description (optional)</label>
                  <textarea value={newGoal.description} onChange={(e) => setNewGoal(p => ({ ...p, description: e.target.value }))} placeholder="Add details..." className="input min-h-[120px]" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdd(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={addGoal} disabled={loading} className="btn btn-primary flex-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Goal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      <div className="block">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[var(--orange)]" /> Active Goals
        </h2>
        
        {activeGoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-4">
              <Target className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] mb-4">No active goals this week</p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-5 h-5" /> Set a Goal</button>
          </div>
        ) : (
          <div className="space-y-5">
            {activeGoals.map((goal, idx) => (
              <motion.div 
                key={goal.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[var(--bg-elevated)] rounded-3xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{goal.title}</h3>
                    {goal.description && <p className="text-[var(--text-secondary)] mt-1">{goal.description}</p>}
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="btn-icon hover:text-[var(--red)]"><Trash2 className="w-5 h-5" /></button>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress || 0}
                    onChange={(e) => updateGoal(goal.id, { progress: parseInt(e.target.value) })}
                    className="flex-1 h-3 accent-[var(--accent)] cursor-pointer"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span className="font-bold text-2xl gradient-text w-16">{goal.progress || 0}%</span>
                </div>
                
                <div className="progress h-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress || 0}%` }}
                    className="progress-bar"
                  />
                </div>
                
                {goal.progress >= 100 && (
                  <button onClick={() => updateGoal(goal.id, { completed: true })} className="btn btn-primary w-full mt-5">
                    <CheckCircle className="w-5 h-5" /> Mark Complete
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completedGoals.length > 0 && (
        <div className="block">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[var(--green)]" /> Completed
          </h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <motion.div 
                key={goal.id} 
                layout
                className="list-item bg-[var(--green)]/10 border border-[var(--green)]/30"
              >
                <CheckCircle className="w-6 h-6 text-[var(--green)]" />
                <span className="flex-1 font-medium">{goal.title}</span>
                <button onClick={() => deleteGoal(goal.id)} className="btn-icon w-10 h-10 hover:text-[var(--red)]"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
