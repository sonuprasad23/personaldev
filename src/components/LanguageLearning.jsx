import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { Plus, Trash2, Languages, Clock, ChevronLeft, ChevronRight, X, BookOpen, Loader2, Globe } from 'lucide-react';
import { format } from 'date-fns';

const LANGUAGE_IMAGE = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=300&fit=crop';

export default function LanguageLearning() {
  const { data, setData, currentDate, setCurrentDate, api } = useContext(AppContext);
  const [showAdd, setShowAdd] = useState(false);
  const [showWord, setShowWord] = useState(null);
  const [newLang, setNewLang] = useState({ name: '', targetMins: 20 });
  const [newWord, setNewWord] = useState({ word: '', meaning: '' });
  const [logInput, setLogInput] = useState({});
  const [loading, setLoading] = useState(false);

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const addLanguage = async () => {
    if (!newLang.name.trim()) return;
    setLoading(true);
    const language = { id: Date.now().toString(), name: newLang.name.trim(), targetMins: parseInt(newLang.targetMins) || 20, logs: {}, words: [] };
    
    try {
      await api.addLanguage(language);
      setData(prev => ({ ...prev, languages: [...prev.languages, language] }));
      setNewLang({ name: '', targetMins: 20 });
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add:', e);
    }
    setLoading(false);
  };

  const removeLang = async (id) => {
    try {
      await api.deleteLanguage(id);
      setData(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== id) }));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const logTime = async (id) => {
    const mins = parseInt(logInput[id]);
    if (!mins) return;
    setLoading(true);
    
    try {
      await api.logLanguage(id, dateKey, mins);
      setData(prev => ({
        ...prev,
        languages: prev.languages.map(l => l.id === id ? {
          ...l, logs: { ...l.logs, [dateKey]: { duration: (l.logs?.[dateKey]?.duration || 0) + mins } }
        } : l)
      }));
      setLogInput(p => ({ ...p, [id]: '' }));
    } catch (e) {
      console.error('Failed to log:', e);
    }
    setLoading(false);
  };

  const addWord = async (langId) => {
    if (!newWord.word.trim()) return;
    setLoading(true);
    const word = { id: Date.now().toString(), word: newWord.word.trim(), meaning: newWord.meaning.trim(), date: dateKey };
    
    try {
      await api.addWord(langId, word);
      setData(prev => ({
        ...prev,
        languages: prev.languages.map(l => l.id === langId ? {
          ...l, words: [...(l.words || []), word]
        } : l)
      }));
      setNewWord({ word: '', meaning: '' });
    } catch (e) {
      console.error('Failed to add word:', e);
    }
    setLoading(false);
  };

  const removeWord = async (langId, wordId) => {
    try {
      await api.deleteWord(langId, wordId);
      setData(prev => ({
        ...prev,
        languages: prev.languages.map(l => l.id === langId ? {
          ...l, words: l.words.filter(w => w.id !== wordId)
        } : l)
      }));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const navigateDate = (dir) => { const d = new Date(currentDate); d.setDate(d.getDate() + dir); setCurrentDate(d); };

  const totalTime = data.languages.reduce((a, l) => a + (l.logs?.[dateKey]?.duration || 0), 0);
  const totalWords = data.languages.reduce((a, l) => a + (l.words?.filter(w => w.date === dateKey)?.length || 0), 0);
  const formatTime = (m) => m === 0 ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">Languages</h1>
          <p className="text-[var(--text-secondary)] text-lg">Track vocabulary & study time</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Add Language
        </button>
      </div>

      {/* Banner */}
      <div className="block overflow-hidden p-0 relative h-48 lg:h-56">
        <img src={LANGUAGE_IMAGE} alt="Languages" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-8">
          <div>
            <p className="text-[var(--text-secondary)] mb-1">Today's Study</p>
            <p className="text-5xl lg:text-6xl font-bold text-[var(--purple)]">{formatTime(totalTime)}</p>
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
          <div className="icon-box icon-box-lg bg-[var(--purple)]/20">
            <Clock className="w-8 h-8 text-[var(--purple)]" />
          </div>
          <p className="stat-value text-[var(--purple)]">{formatTime(totalTime)}</p>
          <p className="stat-label">Study Time</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--green)]/20">
            <BookOpen className="w-8 h-8 text-[var(--green)]" />
          </div>
          <p className="stat-value text-[var(--green)]">{totalWords}</p>
          <p className="stat-label">Words Today</p>
        </div>
      </div>

      {/* Add Language Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Add Language</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Language</label>
                  <input type="text" value={newLang.name} onChange={(e) => setNewLang(p => ({ ...p, name: e.target.value }))} placeholder="Spanish, Japanese, French..." className="input" autoFocus />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Daily Target (min)</label>
                  <input type="number" value={newLang.targetMins} onChange={(e) => setNewLang(p => ({ ...p, targetMins: e.target.value }))} className="input" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdd(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={addLanguage} disabled={loading} className="btn btn-primary flex-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Words Modal */}
      <AnimatePresence>
        {showWord && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowWord(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{data.languages.find(l => l.id === showWord)?.name} Words</h2>
                <button onClick={() => setShowWord(null)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex gap-3 mb-5">
                <input type="text" value={newWord.word} onChange={(e) => setNewWord(p => ({ ...p, word: e.target.value }))} placeholder="Word..." className="input flex-1" />
                <input type="text" value={newWord.meaning} onChange={(e) => setNewWord(p => ({ ...p, meaning: e.target.value }))} placeholder="Meaning..." className="input flex-1" />
                <button onClick={() => addWord(showWord)} disabled={loading} className="btn btn-primary">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(data.languages.find(l => l.id === showWord)?.words || []).filter(w => w.date === dateKey).length === 0 ? (
                  <p className="text-center text-[var(--text-secondary)] py-8">No words added today</p>
                ) : (
                  (data.languages.find(l => l.id === showWord)?.words || []).filter(w => w.date === dateKey).map((w) => (
                    <div key={w.id} className="list-item">
                      <span className="flex-1 font-semibold">{w.word}</span>
                      <span className="text-[var(--text-secondary)]">{w.meaning}</span>
                      <button onClick={() => removeWord(showWord, w.id)} className="btn-icon w-10 h-10 hover:text-[var(--red)]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Languages */}
      <div className="space-y-5">
        {data.languages.length === 0 ? (
          <div className="block text-center py-16">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-5">
              <Globe className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No languages yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Add a language to track your learning</p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-5 h-5" /> Add Language</button>
          </div>
        ) : (
          data.languages.map((lang, idx) => {
            const todayTime = lang.logs?.[dateKey]?.duration || 0;
            const progress = Math.min(100, Math.round((todayTime / lang.targetMins) * 100));
            const todayWords = lang.words?.filter(w => w.date === dateKey)?.length || 0;
            return (
              <motion.div 
                key={lang.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="icon-box icon-box-lg bg-[var(--purple)]/20">
                      <Languages className="w-8 h-8 text-[var(--purple)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{lang.name}</h3>
                      <p className="text-[var(--text-secondary)]">{todayWords} words today</p>
                    </div>
                  </div>
                  <button onClick={() => removeLang(lang.id)} className="btn-icon hover:bg-[var(--red)]/20 hover:text-[var(--red)]">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">{todayTime}/{lang.targetMins} min</span>
                    <span className={`font-bold ${progress >= 100 ? 'text-[var(--green)]' : 'text-[var(--purple)]'}`}>{progress}%</span>
                  </div>
                  <div className="progress h-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`progress-bar ${progress >= 100 ? '!bg-[var(--green)]' : '!bg-[var(--purple)]'}`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setShowWord(lang.id)} className="btn btn-primary flex-1 min-w-[120px]">
                    <Plus className="w-5 h-5" /> Add Words
                  </button>
                  <input type="number" value={logInput[lang.id] || ''} onChange={(e) => setLogInput(p => ({ ...p, [lang.id]: e.target.value }))} placeholder="Min" className="input w-24" />
                  <button onClick={() => logTime(lang.id)} disabled={loading} className="btn btn-secondary">
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
