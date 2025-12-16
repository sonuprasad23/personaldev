import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, CheckSquare, Dumbbell, BookOpen, Languages, Timer, Target,
  Bell, Calendar, Youtube, Settings, Menu, Flame, Download, Cloud, CloudOff, 
  Loader2, CheckCircle, Info
} from 'lucide-react';
import { api } from './services/api';

import Dashboard from './components/Dashboard';
import DailyTasks from './components/DailyTasks';
import Exercise from './components/Exercise';
import BookReading from './components/BookReading';
import LanguageLearning from './components/LanguageLearning';
import TimerPage from './components/TimerPage';
import WeeklyGoals from './components/WeeklyGoals';
import Reminders from './components/Reminders';
import CalendarView from './components/CalendarView';
import YouTubeAnalytics from './components/YouTubeAnalytics';
import SettingsPage from './components/SettingsPage';
import AboutPage from './components/AboutPage';

export const AppContext = createContext();

// Initial empty data
const initialData = {
  tasks: [],
  dailyCheckins: {},
  exercises: [],
  books: [],
  languages: [],
  weeklyGoals: [],
  reminders: [],
  screenTime: {},
  youtubeHistory: {},
  streak: 0,
  lastCheckIn: null,
  settings: { notifications: true }
};

// Detect device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/mobile/i.test(ua)) return 'mobile';
  return 'web';
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('personalDevData');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('personalDevData', JSON.stringify(data));
  }, [data]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Streak calculation
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const checkins = data.dailyCheckins[today];
    if (checkins && Object.values(checkins).some(Boolean) && data.lastCheckIn !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = data.lastCheckIn === yesterday ? data.streak + 1 : 1;
      setData(prev => ({ ...prev, streak: newStreak, lastCheckIn: today }));
    }
  }, [data.dailyCheckins, data.lastCheckIn, data.streak]);

  // SYNC TO GOOGLE SHEETS
  const syncToCloud = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncStatus('syncing');

    try {
      const device = getDeviceType();
      const result = await api.syncData(data, device);
      
      if (result.success) {
        setSyncStatus('success');
        setLastSyncTime(new Date());
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
    
    setSyncing(false);
  }, [data, syncing]);

  // FETCH FROM GOOGLE SHEETS
  const fetchFromCloud = useCallback(async () => {
    setSyncing(true);
    setSyncStatus('syncing');

    try {
      const result = await api.fetchData();
      
      if (result.success && result.data) {
        setData(result.data);
        localStorage.setItem('personalDevData', JSON.stringify(result.data));
        setSyncStatus('success');
        setLastSyncTime(new Date(result.timestamp));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('idle');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
    
    setSyncing(false);
  }, []);

  // Export data
  const exportData = (format = 'json') => {
    const exportObj = format === 'pdev' ? {
      _format: 'PersonaDev',
      _version: '2.0.0',
      _exportedAt: new Date().toISOString(),
      _creator: 'PersonaDev by Sonu Prasad',
      data
    } : data;

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personadev-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (fileData) => {
    try {
      let importedData = fileData;
      if (fileData._format === 'PersonaDev') {
        importedData = fileData.data;
      }
      setData(importedData);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ 
      data, setData, currentDate, setCurrentDate, 
      exportData, importData, syncToCloud, fetchFromCloud,
      syncing, syncStatus, lastSyncTime, isOnline, api 
    }}>
      {children}
    </AppContext.Provider>
  );
};

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/exercise', icon: Dumbbell, label: 'Exercise' },
  { path: '/books', icon: BookOpen, label: 'Reading' },
  { path: '/languages', icon: Languages, label: 'Languages' },
  { path: '/timer', icon: Timer, label: 'Timer' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/reminders', icon: Bell, label: 'Reminders' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/youtube', icon: Youtube, label: 'YouTube' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/about', icon: Info, label: 'About' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { data, syncToCloud, syncing, syncStatus, lastSyncTime, isOnline } = useContext(AppContext);
  
  return (
    <>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      <aside className={`fixed top-0 left-0 h-full w-80 bg-[#080808] border-r border-[var(--border)] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        {/* Logo */}
        <div className="p-7 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--green)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <Flame className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PersonaDev</h1>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              {isOnline ? (
                <><Cloud className="w-3 h-3 text-[var(--green)]" /> Online</>
              ) : (
                <><CloudOff className="w-3 h-3 text-[var(--red)]" /> Offline</>
              )}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="mx-5 mb-5">
          <div className="streak-card glow-orange">
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl">🔥</span>
              </div>
              <div>
                <p className="text-5xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{data.streak}</p>
                <p className="text-white/80 font-medium">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sync Button */}
        <div className="p-5 space-y-3">
          {lastSyncTime && (
            <p className="text-xs text-[var(--text-muted)] text-center">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
          <button 
            onClick={syncToCloud} 
            disabled={syncing}
            className={`btn w-full ${
              syncStatus === 'success' ? 'bg-[var(--green)] text-black' :
              syncStatus === 'error' ? 'bg-[var(--red)] text-white' :
              'btn-primary'
            }`}
          >
            {syncing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Syncing...</>
            ) : syncStatus === 'success' ? (
              <><CheckCircle className="w-5 h-5" /> Synced!</>
            ) : syncStatus === 'error' ? (
              <><CloudOff className="w-5 h-5" /> Retry</>
            ) : (
              <><Cloud className="w-5 h-5" /> Sync Now</>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, syncStatus, syncing, isOnline } = useContext(AppContext);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 h-18 bg-[var(--bg-dark)]/95 backdrop-blur-lg border-b border-[var(--border)] z-30 flex items-center justify-between px-5 py-4">
          <button onClick={() => setSidebarOpen(true)} className="btn-icon">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--green)] flex items-center justify-center">
              <Flame className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-lg">PersonaDev</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--orange)] to-[var(--red)] text-white font-bold text-base">
            🔥 {data.streak}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tasks" element={<DailyTasks />} />
                  <Route path="/exercise" element={<Exercise />} />
                  <Route path="/books" element={<BookReading />} />
                  <Route path="/languages" element={<LanguageLearning />} />
                  <Route path="/timer" element={<TimerPage />} />
                  <Route path="/goals" element={<WeeklyGoals />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/youtube" element={<YouTubeAnalytics />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Sync Status Toast */}
        <AnimatePresence>
          {(syncStatus === 'syncing' || syncStatus === 'success' || syncStatus === 'error') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl z-50 ${
                syncStatus === 'success' ? 'bg-[var(--green)] text-black' :
                syncStatus === 'error' ? 'bg-[var(--red)] text-white' :
                'bg-[var(--bg-card)] border border-[var(--border)]'
              }`}
            >
              {syncStatus === 'syncing' && <><Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" /> Syncing to Google Sheets...</>}
              {syncStatus === 'success' && <><CheckCircle className="w-5 h-5" /> Synced successfully!</>}
              {syncStatus === 'error' && <><CloudOff className="w-5 h-5" /> Sync failed. Try again.</>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout />
      </Router>
    </AppProvider>
  );
}
