import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { Plus, Trash2, CheckCircle, ChevronLeft, ChevronRight, Monitor, X, Loader2, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function DailyTasks() {
  const { data, setData, currentDate, setCurrentDate, api } = useContext(AppContext);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', importance: 'medium' });
  const [screenInput, setScreenInput] = useState('');
  const [loading, setLoading] = useState(false);

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const checkins = data.dailyCheckins[dateKey] || {};
  const screenTime = data.screenTime[dateKey] || 0;

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    setLoading(true);
    const task = { id: Date.now().toString(), ...newTask, title: newTask.title.trim() };
    
    try {
      await api.addTask(task);
      setData(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
      setNewTask({ title: '', importance: 'medium' });
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add task:', e);
    }
    setLoading(false);
  };

  const removeTask = async (id) => {
    try {
      await api.deleteTask(id);
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id),
        dailyCheckins: Object.fromEntries(
          Object.entries(prev.dailyCheckins).map(([d, c]) => [d, Object.fromEntries(Object.entries(c).filter(([i]) => i !== id))])
        )
      }));
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  const toggleTask = async (id) => {
    const newValue = !checkins[id];
    try {
      await api.setCheckin(dateKey, id, newValue);
      setData(prev => ({
        ...prev,
        dailyCheckins: {
          ...prev.dailyCheckins,
          [dateKey]: { ...prev.dailyCheckins[dateKey], [id]: newValue }
        }
      }));
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const updateScreenTime = async () => {
    if (!screenInput) return;
    setLoading(true);
    try {
      await api.setScreenTime(dateKey, parseInt(screenInput) || 0);
      setData(prev => ({ ...prev, screenTime: { ...prev.screenTime, [dateKey]: parseInt(screenInput) || 0 } }));
      setScreenInput('');
    } catch (e) {
      console.error('Failed to update screen time:', e);
    }
    setLoading(false);
  };

  const navigate = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const completedCount = Object.values(checkins).filter(Boolean).length;
  const progress = data.tasks.length > 0 ? Math.round((completedCount / data.tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">Daily Tasks</h1>
          <p className="text-[var(--text-secondary)] text-lg">Track your daily habits & routines</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdd(true)} 
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" /> Add Task
        </motion.button>
      </div>

      {/* Date Nav & Progress */}
      <div className="block">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="btn-icon"><ChevronLeft className="w-6 h-6" /></button>
          <div className="text-center">
            <p className="text-2xl font-bold">{format(currentDate, 'EEEE')}</p>
            <p className="text-[var(--text-secondary)]">{format(currentDate, 'MMMM d, yyyy')}</p>
          </div>
          <button onClick={() => navigate(1)} className="btn-icon"><ChevronRight className="w-6 h-6" /></button>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-[var(--text-secondary)]">{completedCount} of {data.tasks.length} completed</span>
          <span className="text-2xl font-bold gradient-text">{progress}%</span>
        </div>
        <div className="progress h-4">
          <motion.div 
            className="progress-bar !bg-[var(--green)]" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Screen Time */}
      <div className="block">
        <div className="flex items-center gap-5 mb-5">
          <div className="icon-box icon-box-lg bg-[var(--yellow)]/20">
            <Monitor className="w-8 h-8 text-[var(--yellow)]" />
          </div>
          <div className="flex-1">
            <p className="text-[var(--text-secondary)]">Today's Screen Time</p>
            <p className="text-3xl lg:text-4xl font-bold text-[var(--yellow)]">
              {screenTime > 0 ? `${Math.floor(screenTime/60)}h ${screenTime%60}m` : 'Not set'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            value={screenInput}
            onChange={(e) => setScreenInput(e.target.value)}
            placeholder="Enter minutes..."
            className="input flex-1"
          />
          <button onClick={updateScreenTime} disabled={loading} className="btn btn-primary min-w-[100px]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Add New Task</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Task Name</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
                    placeholder="What do you want to accomplish?"
                    className="input"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'low', label: 'Low', color: 'var(--green)' },
                      { key: 'medium', label: 'Medium', color: 'var(--yellow)' },
                      { key: 'high', label: 'High', color: 'var(--red)' }
                    ].map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setNewTask(prev => ({ ...prev, importance: p.key }))}
                        className={`py-4 rounded-2xl font-semibold transition-all ${
                          newTask.importance === p.key
                            ? 'text-black scale-105'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                        }`}
                        style={newTask.importance === p.key ? { background: p.color } : {}}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdd(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={addTask} disabled={loading} className="btn btn-primary flex-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Task'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="space-y-4">
        {data.tasks.length === 0 ? (
          <div className="block text-center py-16">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-5">
              <Zap className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tasks yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Start building your daily routine</p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" /> Add Your First Task
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {data.tasks.map((task, idx) => {
              const isChecked = checkins[task.id];
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`list-item ${isChecked ? 'bg-[var(--green)]/10 border border-[var(--green)]/30' : ''}`}
                >
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTask(task.id)} 
                    className={`checkbox ${isChecked ? 'checked' : ''}`}
                  >
                    {isChecked && <CheckCircle className="w-5 h-5 text-black" />}
                  </motion.button>
                  <span className={`flex-1 font-medium text-lg ${isChecked ? 'line-through text-[var(--text-secondary)]' : ''}`}>
                    {task.title}
                  </span>
                  <span className={`badge ${
                    task.importance === 'high' ? 'bg-[var(--red)]/20 text-[var(--red)]' :
                    task.importance === 'medium' ? 'bg-[var(--yellow)]/20 text-[var(--yellow)]' :
                    'bg-[var(--green)]/20 text-[var(--green)]'
                  }`}>
                    {task.importance}
                  </span>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeTask(task.id)} 
                    className="btn-icon hover:bg-[var(--red)]/20 hover:text-[var(--red)] hover:border-[var(--red)]"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Stats */}
      {data.tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-block items-center text-center">
            <p className="stat-value">{data.tasks.length}</p>
            <p className="stat-label">Total</p>
          </div>
          <div className="stat-block items-center text-center">
            <p className="stat-value text-[var(--green)]">{completedCount}</p>
            <p className="stat-label">Done</p>
          </div>
          <div className="stat-block items-center text-center">
            <p className="stat-value text-[var(--orange)]">{data.tasks.length - completedCount}</p>
            <p className="stat-label">Pending</p>
          </div>
        </div>
      )}
    </div>
  );
}
