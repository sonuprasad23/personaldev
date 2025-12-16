import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { Plus, Trash2, Youtube, Star, X, ThumbsUp, ThumbsDown, Clock, Loader2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const YOUTUBE_IMAGE = 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=300&fit=crop';

export default function YouTubeAnalytics() {
  const { data, setData, currentDate, api } = useContext(AppContext);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', category: 'educational', duration: 10 });
  const [loading, setLoading] = useState(false);

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const todayHistory = data.youtubeHistory[dateKey] || [];

  const categories = {
    educational: { label: 'Educational', points: 3, color: 'var(--green)' },
    documentary: { label: 'Documentary', points: 3, color: 'var(--accent)' },
    news: { label: 'News', points: 2, color: 'var(--purple)' },
    tutorial: { label: 'Tutorial', points: 3, color: 'var(--green)' },
    entertainment: { label: 'Entertainment', points: 1, color: 'var(--yellow)' },
    gaming: { label: 'Gaming', points: 0, color: 'var(--red)' },
    music: { label: 'Music', points: 1, color: 'var(--orange)' },
    other: { label: 'Other', points: 1, color: 'var(--text-muted)' }
  };

  const addEntry = async () => {
    if (!newEntry.title.trim()) return;
    setLoading(true);
    const entry = {
      id: Date.now().toString(),
      date: dateKey,
      ...newEntry,
      title: newEntry.title.trim(),
      timestamp: new Date().toISOString()
    };
    
    try {
      await api.addYouTube(entry);
      setData(prev => ({
        ...prev,
        youtubeHistory: {
          ...prev.youtubeHistory,
          [dateKey]: [...(prev.youtubeHistory[dateKey] || []), entry]
        }
      }));
      setNewEntry({ title: '', category: 'educational', duration: 10 });
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add:', e);
    }
    setLoading(false);
  };

  const removeEntry = async (id) => {
    try {
      await api.deleteYouTube(id);
      setData(prev => ({
        ...prev,
        youtubeHistory: {
          ...prev.youtubeHistory,
          [dateKey]: prev.youtubeHistory[dateKey].filter(e => e.id !== id)
        }
      }));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const totalPoints = todayHistory.reduce((a, e) => a + (categories[e.category]?.points || 0) * Math.ceil(e.duration / 10), 0);
  const totalTime = todayHistory.reduce((a, e) => a + e.duration, 0);
  const productiveTime = todayHistory.filter(e => categories[e.category]?.points >= 2).reduce((a, e) => a + e.duration, 0);
  const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
  const formatTime = (m) => m === 0 ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">YouTube Analytics</h1>
          <p className="text-[var(--text-secondary)] text-lg">Track your media consumption</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Log Video
        </button>
      </div>

      {/* Banner with productivity meter */}
      <div className="block overflow-hidden p-0 relative h-48 lg:h-56">
        <img src={YOUTUBE_IMAGE} alt="YouTube" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex items-center p-8">
          <div className="w-full max-w-md">
            <p className="text-[var(--text-secondary)] mb-2">Productivity Score</p>
            <p className="text-5xl lg:text-6xl font-bold" style={{ color: productivityScore >= 70 ? 'var(--green)' : productivityScore >= 40 ? 'var(--yellow)' : 'var(--red)' }}>
              {productivityScore}%
            </p>
            <div className="flex items-center gap-3 mt-4">
              <ThumbsDown className="w-5 h-5 text-[var(--red)]" />
              <div className="progress flex-1 h-3">
                <div 
                  className="h-full rounded-lg transition-all duration-500"
                  style={{ 
                    width: `${productivityScore}%`, 
                    background: productivityScore >= 70 ? 'var(--green)' : productivityScore >= 40 ? 'var(--yellow)' : 'var(--red)' 
                  }}
                />
              </div>
              <ThumbsUp className="w-5 h-5 text-[var(--green)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--accent)]/20">
            <Star className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <p className="stat-value text-[var(--accent)]">{totalPoints}</p>
          <p className="stat-label">Points</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--purple)]/20">
            <Clock className="w-8 h-8 text-[var(--purple)]" />
          </div>
          <p className="stat-value text-[var(--purple)]">{formatTime(totalTime)}</p>
          <p className="stat-label">Watch Time</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--green)]/20">
            <TrendingUp className="w-8 h-8 text-[var(--green)]" />
          </div>
          <p className="stat-value text-[var(--green)]">{formatTime(productiveTime)}</p>
          <p className="stat-label">Productive</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--orange)]/20">
            <Youtube className="w-8 h-8 text-[var(--orange)]" />
          </div>
          <p className="stat-value text-[var(--orange)]">{todayHistory.length}</p>
          <p className="stat-label">Videos</p>
        </div>
      </div>

      {/* Categories Guide */}
      <div className="block">
        <h2 className="text-xl font-bold mb-5">Point System</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(categories).map(([key, cat]) => (
            <div key={key} className="bg-[var(--bg-elevated)] rounded-2xl p-4 text-center">
              <p className="font-semibold">{cat.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: cat.color }}>+{cat.points}</p>
              <p className="text-xs text-[var(--text-muted)]">per 10 min</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Log Video</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Video Title</label>
                  <input type="text" value={newEntry.title} onChange={(e) => setNewEntry(p => ({ ...p, title: e.target.value }))} placeholder="What did you watch?" className="input" autoFocus />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(categories).map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => setNewEntry(p => ({ ...p, category: key }))}
                        className={`py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${
                          newEntry.category === key ? 'text-black scale-105' : 'bg-[var(--bg-elevated)]'
                        }`}
                        style={newEntry.category === key ? { background: cat.color } : {}}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Duration (minutes)</label>
                  <input type="number" value={newEntry.duration} onChange={(e) => setNewEntry(p => ({ ...p, duration: parseInt(e.target.value) || 0 }))} className="input" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdd(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={addEntry} disabled={loading} className="btn btn-primary flex-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <div className="block">
        <h2 className="text-xl font-bold mb-5">Today's Watch History</h2>
        {todayHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-4">
              <Youtube className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] mb-4">No videos logged today</p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-5 h-5" /> Log Video</button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayHistory.map((entry, idx) => {
              const cat = categories[entry.category];
              const points = cat.points * Math.ceil(entry.duration / 10);
              return (
                <motion.div 
                  key={entry.id} 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="list-item"
                >
                  <div className="icon-box" style={{ background: `${cat.color}20` }}>
                    <Youtube className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{entry.title}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{cat.label} • {entry.duration}m</p>
                  </div>
                  <span className="badge font-bold text-lg" style={{ background: `${cat.color}20`, color: cat.color }}>
                    +{points}
                  </span>
                  <button onClick={() => removeEntry(entry.id)} className="btn-icon hover:text-[var(--red)]">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
