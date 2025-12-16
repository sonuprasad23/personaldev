import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { Play, Pause, RotateCcw, Plus, Minus, Check, Clock, Dumbbell, BookOpen, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const TIMER_IMAGE = 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=600&h=300&fit=crop';

export default function TimerPage() {
  const { data, setData, currentDate, api } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { type, item } = location.state || {};
  
  const [mode, setMode] = useState('timer');
  const [duration, setDuration] = useState(type && item ? (item.targetMins || item.targetDuration || 15) * 60 : 15 * 60);
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef(null);

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === 'timer') {
          setRemaining(prev => {
            if (prev <= 1) {
              setIsRunning(false);
              clearTimer();
              playSound();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsed(prev => prev + 1);
        }
      }, 1000);
    }
    return clearTimer;
  }, [isRunning, mode, clearTimer]);

  const playSound = () => {
    try {
      const audio = new AudioContext();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
      osc.start();
      osc.stop(audio.currentTime + 0.5);
    } catch (e) {}
  };

  const toggle = () => setIsRunning(p => !p);

  const reset = () => {
    setIsRunning(false);
    clearTimer();
    setRemaining(duration);
    setElapsed(0);
  };

  const adjustTime = (mins) => {
    const newDuration = Math.max(60, (mode === 'timer' ? remaining : elapsed) + mins * 60);
    if (mode === 'timer') {
      setRemaining(newDuration);
      setDuration(newDuration);
    }
  };

  const finish = async () => {
    const mins = mode === 'timer' ? Math.ceil((duration - remaining) / 60) : Math.ceil(elapsed / 60);
    if (mins > 0 && type && item) {
      setSaving(true);
      try {
        if (type === 'exercise') {
          await api.logExercise(item.id, dateKey, mins);
          setData(prev => ({
            ...prev,
            exercises: prev.exercises.map(e => e.id === item.id ? {
              ...e, logs: { ...e.logs, [dateKey]: { duration: (e.logs?.[dateKey]?.duration || 0) + mins } }
            } : e)
          }));
        } else if (type === 'reading') {
          await api.logBook(item.id, dateKey, mins, 0);
          setData(prev => ({
            ...prev,
            books: prev.books.map(b => b.id === item.id ? {
              ...b, logs: { ...b.logs, [dateKey]: { duration: (b.logs?.[dateKey]?.duration || 0) + mins } }
            } : b)
          }));
        } else if (type === 'language') {
          await api.logLanguage(item.id, dateKey, mins);
          setData(prev => ({
            ...prev,
            languages: prev.languages.map(l => l.id === item.id ? {
              ...l, logs: { ...l.logs, [dateKey]: { duration: (l.logs?.[dateKey]?.duration || 0) + mins } }
            } : l)
          }));
        }
      } catch (e) {
        console.error('Failed to log:', e);
      }
      setSaving(false);
    }
    navigate(-1);
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const displayTime = mode === 'timer' ? remaining : elapsed;
  const progress = mode === 'timer' ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="hero-header text-3xl lg:text-4xl">{type && item ? item.name || item.title : 'Focus Timer'}</h1>
        {type && <p className="text-[var(--text-secondary)] text-lg mt-1 capitalize">{type}</p>}
      </div>

      {/* Banner */}
      {!type && (
        <div className="block overflow-hidden p-0 relative h-40">
          <img src={TIMER_IMAGE} alt="Timer" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <p className="text-lg font-medium">Stay focused, achieve more</p>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="tabs">
        <button onClick={() => { setMode('timer'); reset(); }} className={`tab flex-1 ${mode === 'timer' ? 'active' : ''}`}>
          Countdown
        </button>
        <button onClick={() => { setMode('stopwatch'); reset(); }} className={`tab flex-1 ${mode === 'stopwatch' ? 'active' : ''}`}>
          Stopwatch
        </button>
      </div>

      {/* Timer Display */}
      <div className="block relative overflow-hidden">
        {mode === 'timer' && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-30" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
            <motion.circle
              cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="3"
              strokeDasharray={283}
              animate={{ strokeDashoffset: 283 - (283 * progress / 100) }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--green)" />
              </linearGradient>
            </defs>
          </svg>
        )}
        <div className="relative py-16 text-center">
          <motion.p 
            key={displayTime}
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="timer-display"
          >
            {formatTime(displayTime)}
          </motion.p>
          {mode === 'timer' && (
            <p className="text-[var(--text-secondary)] mt-3 text-lg">
              {Math.ceil(remaining / 60)} minutes remaining
            </p>
          )}
          {mode === 'stopwatch' && (
            <p className="text-[var(--text-secondary)] mt-3 text-lg">
              {Math.floor(elapsed / 60)} minutes elapsed
            </p>
          )}
        </div>
      </div>

      {/* Adjust Time */}
      {mode === 'timer' && !isRunning && (
        <div className="flex items-center justify-center gap-5">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => adjustTime(-5)} 
            className="btn-icon"
          >
            <Minus className="w-6 h-6" />
          </motion.button>
          <span className="text-2xl font-bold w-28 text-center">{Math.ceil(duration / 60)} min</span>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => adjustTime(5)} 
            className="btn-icon"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* Quick Presets */}
      {mode === 'timer' && !isRunning && (
        <div className="grid grid-cols-4 gap-3">
          {[5, 15, 25, 45].map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setDuration(m * 60); setRemaining(m * 60); }}
              className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                Math.ceil(duration / 60) === m ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--green)] text-black' : 'bg-[var(--bg-elevated)]'
              }`}
            >
              {m}m
            </motion.button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          className="btn-icon w-16 h-16"
        >
          <RotateCcw className="w-7 h-7" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className="w-24 h-24 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--green)] flex items-center justify-center text-black shadow-xl shadow-[var(--accent)]/30"
        >
          {isRunning ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
        </motion.button>
        {type && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={finish}
            disabled={saving}
            className="btn-icon w-16 h-16 bg-[var(--green)] text-black border-none"
          >
            {saving ? <Loader2 className="w-7 h-7 animate-spin" /> : <Check className="w-7 h-7" />}
          </motion.button>
        )}
      </div>

      {/* Completion */}
      {mode === 'timer' && remaining === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-center bg-[var(--green)]/10 border-[var(--green)]"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--green)]/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[var(--green)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--green)]">Time's Up! 🎉</h3>
          <p className="text-[var(--text-secondary)] mt-2">Great job completing your session</p>
        </motion.div>
      )}

      {/* Quick Links */}
      {!type && (
        <div className="block">
          <h3 className="font-bold text-lg mb-4">Start a Timed Session</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/exercise')} className="quick-action">
              <div className="icon-box bg-[var(--accent)]/20">
                <Dumbbell className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <span className="font-semibold">Exercise</span>
            </button>
            <button onClick={() => navigate('/books')} className="quick-action">
              <div className="icon-box bg-[var(--red)]/20">
                <BookOpen className="w-6 h-6 text-[var(--red)]" />
              </div>
              <span className="font-semibold">Reading</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
