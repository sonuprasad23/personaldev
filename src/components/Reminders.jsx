import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { Plus, Trash2, Bell, CheckCircle, X, AlertCircle, Clock, Calendar, Loader2 } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture, parseISO } from 'date-fns';

export default function Reminders() {
  const { data, setData, api } = useContext(AppContext);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newReminder, setNewReminder] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', importance: 'medium' });
  const [loading, setLoading] = useState(false);

  const addReminder = async () => {
    if (!newReminder.title.trim()) return;
    setLoading(true);
    const reminder = {
      id: Date.now().toString(),
      ...newReminder,
      title: newReminder.title.trim(),
      completed: false,
      datetime: `${newReminder.date}T${newReminder.time}`
    };
    
    try {
      await api.addReminder(reminder);
      setData(prev => ({ ...prev, reminders: [...prev.reminders, reminder] }));
      setNewReminder({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', importance: 'medium' });
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add:', e);
    }
    setLoading(false);
  };

  const toggleReminder = async (id) => {
    const reminder = data.reminders.find(r => r.id === id);
    const newValue = !reminder.completed;
    
    try {
      await api.updateReminder(id, { completed: newValue });
      setData(prev => ({
        ...prev,
        reminders: prev.reminders.map(r => r.id === id ? { ...r, completed: newValue } : r)
      }));
    } catch (e) {
      console.error('Failed to toggle:', e);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await api.deleteReminder(id);
      setData(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== id) }));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const filterReminders = () => {
    let filtered = data.reminders;
    if (filter === 'today') filtered = filtered.filter(r => isToday(parseISO(r.date)));
    if (filter === 'upcoming') filtered = filtered.filter(r => isFuture(parseISO(r.date)));
    if (filter === 'overdue') filtered = filtered.filter(r => !r.completed && isPast(parseISO(r.date)) && !isToday(parseISO(r.date)));
    return filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  };

  const getDateLabel = (date) => {
    const d = parseISO(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d, yyyy');
  };

  const todayCount = data.reminders.filter(r => isToday(parseISO(r.date)) && !r.completed).length;
  const overdueCount = data.reminders.filter(r => !r.completed && isPast(parseISO(r.date)) && !isToday(parseISO(r.date))).length;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">Reminders</h1>
          <p className="text-[var(--text-secondary)] text-lg">Stay on track with notifications</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Add Reminder
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--accent)]/20">
            <Bell className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <p className="stat-value text-[var(--accent)]">{todayCount}</p>
          <p className="stat-label">Due Today</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--red)]/20">
            <AlertCircle className="w-8 h-8 text-[var(--red)]" />
          </div>
          <p className="stat-value text-[var(--red)]">{overdueCount}</p>
          <p className="stat-label">Overdue</p>
        </div>
      </div>

      {/* Filter */}
      <div className="tabs">
        {['all', 'today', 'upcoming', 'overdue'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`tab flex-1 ${filter === f ? 'active' : ''}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Add Reminder</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Title</label>
                  <input type="text" value={newReminder.title} onChange={(e) => setNewReminder(p => ({ ...p, title: e.target.value }))} placeholder="Reminder..." className="input" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Date</label>
                    <input type="date" value={newReminder.date} onChange={(e) => setNewReminder(p => ({ ...p, date: e.target.value }))} className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Time</label>
                    <input type="time" value={newReminder.time} onChange={(e) => setNewReminder(p => ({ ...p, time: e.target.value }))} className="input" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Priority</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'low', label: 'Low', color: 'var(--green)' },
                      { key: 'medium', label: 'Medium', color: 'var(--yellow)' },
                      { key: 'high', label: 'High', color: 'var(--red)' }
                    ].map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setNewReminder(prev => ({ ...prev, importance: p.key }))}
                        className={`py-4 rounded-2xl font-semibold transition-all ${
                          newReminder.importance === p.key ? 'text-black' : 'bg-[var(--bg-elevated)]'
                        }`}
                        style={newReminder.importance === p.key ? { background: p.color } : {}}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdd(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={addReminder} disabled={loading} className="btn btn-primary flex-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders List */}
      <div className="space-y-4">
        {filterReminders().length === 0 ? (
          <div className="block text-center py-16">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-5">
              <Bell className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No reminders</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              {filter === 'all' ? 'Add your first reminder' : `No ${filter} reminders`}
            </p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-5 h-5" /> Add</button>
          </div>
        ) : (
          filterReminders().map((reminder, idx) => {
            const isOverdue = !reminder.completed && isPast(parseISO(reminder.date)) && !isToday(parseISO(reminder.date));
            return (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`list-item ${reminder.completed ? 'bg-[var(--green)]/10 border border-[var(--green)]/30' : ''} ${isOverdue ? 'border border-[var(--red)]/50' : ''}`}
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleReminder(reminder.id)}
                  className={`checkbox ${reminder.completed ? 'checked' : ''}`}
                >
                  {reminder.completed && <CheckCircle className="w-5 h-5 text-black" />}
                </motion.button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-lg ${reminder.completed ? 'line-through text-[var(--text-secondary)]' : ''}`}>
                    {reminder.title}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{getDateLabel(reminder.date)}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{reminder.time}</span>
                  </div>
                </div>
                <span className={`badge ${
                  reminder.importance === 'high' ? 'bg-[var(--red)]/20 text-[var(--red)]' :
                  reminder.importance === 'medium' ? 'bg-[var(--yellow)]/20 text-[var(--yellow)]' :
                  'bg-[var(--green)]/20 text-[var(--green)]'
                }`}>
                  {reminder.importance}
                </span>
                <button onClick={() => deleteReminder(reminder.id)} className="btn-icon hover:text-[var(--red)]">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
