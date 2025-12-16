import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { 
  Settings, Download, Upload, Trash2, Bell, Moon, RefreshCw, FileText, 
  Shield, Cloud, Database, Loader2, CloudOff, CheckCircle, Smartphone
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function SettingsPage() {
  const { 
    data, setData, exportData, importData, syncToCloud, fetchFromCloud,
    syncing, syncStatus, lastSyncTime, isOnline 
  } = useContext(AppContext);
  const [showReset, setShowReset] = useState(false);
  const [importing, setImporting] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  const toggleNotifications = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, notifications: !prev.settings?.notifications }
    }));
  };

  const exportCSV = () => {
    const rows = [];
    
    rows.push(['=== PERSONADEV DATA EXPORT ===']);
    rows.push(['Exported At:', new Date().toISOString()]);
    rows.push(['']);
    
    rows.push(['=== TASKS ===']);
    rows.push(['ID', 'Title', 'Importance']);
    data.tasks.forEach(t => rows.push([t.id, t.title, t.importance]));
    rows.push([]);
    
    rows.push(['=== DAILY CHECKINS ===']);
    rows.push(['Date', 'Task ID', 'Completed']);
    Object.entries(data.dailyCheckins).forEach(([date, checkins]) => {
      Object.entries(checkins).forEach(([taskId, done]) => rows.push([date, taskId, done]));
    });
    rows.push([]);
    
    rows.push(['=== EXERCISES ===']);
    rows.push(['Name', 'Target (min)', 'Date', 'Duration']);
    data.exercises.forEach(e => {
      Object.entries(e.logs || {}).forEach(([date, log]) => rows.push([e.name, e.targetDuration, date, log.duration]));
    });
    rows.push([]);
    
    rows.push(['=== BOOKS ===']);
    rows.push(['Title', 'Author', 'Target (min)', 'Pages Read', 'Total Pages']);
    data.books.forEach(b => rows.push([b.title, b.author, b.targetMins, b.pagesRead, b.pagesTotal]));
    rows.push([]);

    rows.push(['=== LANGUAGES ===']);
    rows.push(['Name', 'Target (min)']);
    data.languages.forEach(l => rows.push([l.name, l.targetMins]));

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personadev-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        const success = importData(imported);
        if (success) {
          alert('Data imported successfully!');
        } else {
          alert('Failed to import data.');
        }
      } catch {
        alert('Failed to import data. Invalid file format.');
      }
      setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetData = () => {
    localStorage.removeItem('personalDevData');
    setData({
      tasks: [], dailyCheckins: {}, exercises: [], books: [], languages: [],
      weeklyGoals: [], reminders: [], screenTime: {}, youtubeHistory: {},
      streak: 0, lastCheckIn: null, settings: { notifications: true }
    });
    setShowReset(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="hero-header text-3xl lg:text-4xl">Settings</h1>
        <p className="text-[var(--text-secondary)] text-lg">Manage your preferences & data</p>
      </div>

      {/* Platform Info */}
      <div className="block">
        <div className="flex items-center gap-5">
          <div className="icon-box icon-box-lg bg-[var(--purple)]/20">
            <Smartphone className="w-8 h-8 text-[var(--purple)]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">Platform</p>
            <p className="text-[var(--text-secondary)]">
              {isNative ? 'Android App' : 'Web Browser'}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className={`block ${isOnline ? 'border-[var(--green)]' : 'border-[var(--red)]'}`}>
        <div className="flex items-center gap-5 mb-4">
          <div className={`icon-box icon-box-lg ${isOnline ? 'bg-[var(--green)]/20' : 'bg-[var(--red)]/20'}`}>
            {isOnline ? <Cloud className="w-8 h-8 text-[var(--green)]" /> : <CloudOff className="w-8 h-8 text-[var(--red)]" />}
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">{isOnline ? 'Online' : 'Offline'}</p>
            <p className="text-[var(--text-secondary)]">
              {lastSyncTime ? `Last sync: ${lastSyncTime.toLocaleString()}` : 'Never synced'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={syncToCloud} 
            disabled={syncing}
            className={`btn flex-1 ${syncStatus === 'success' ? 'bg-[var(--green)] text-black' : 'btn-primary'}`}
          >
            {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : syncStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button onClick={fetchFromCloud} disabled={syncing} className="btn btn-secondary flex-1">
            <RefreshCw className="w-5 h-5" /> Fetch Latest
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="block">
        <h2 className="text-xl font-bold mb-5">Preferences</h2>
        <div className="space-y-4">
          <div className="list-item">
            <div className="icon-box bg-[var(--accent)]/20">
              <Bell className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Notifications</p>
              <p className="text-sm text-[var(--text-secondary)]">Enable reminders & alerts</p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-16 h-9 rounded-full transition-colors ${data.settings?.notifications ? 'bg-[var(--green)]' : 'bg-[var(--bg-elevated)]'}`}
            >
              <motion.div 
                className="w-7 h-7 rounded-full bg-white shadow-lg"
                animate={{ x: data.settings?.notifications ? 32 : 4 }}
              />
            </button>
          </div>

          <div className="list-item opacity-60">
            <div className="icon-box bg-[var(--purple)]/20">
              <Moon className="w-6 h-6 text-[var(--purple)]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Dark Mode</p>
              <p className="text-sm text-[var(--text-secondary)]">Always enabled</p>
            </div>
            <span className="badge bg-[var(--bg-elevated)]">Default</span>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="block">
        <h2 className="text-xl font-bold mb-5">Export Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => exportData('json')} className="quick-action">
            <div className="icon-box bg-[var(--green)]/20">
              <Download className="w-6 h-6 text-[var(--green)]" />
            </div>
            <span className="font-semibold">JSON</span>
            <span className="text-xs text-[var(--text-muted)]">Standard backup</span>
          </button>

          <button onClick={() => exportData('pdev')} className="quick-action">
            <div className="icon-box bg-[var(--accent)]/20">
              <Database className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <span className="font-semibold">PDEV</span>
            <span className="text-xs text-[var(--text-muted)]">App format</span>
          </button>

          <button onClick={exportCSV} className="quick-action">
            <div className="icon-box bg-[var(--purple)]/20">
              <FileText className="w-6 h-6 text-[var(--purple)]" />
            </div>
            <span className="font-semibold">CSV</span>
            <span className="text-xs text-[var(--text-muted)]">Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Data Import */}
      <div className="block">
        <h2 className="text-xl font-bold mb-5">Import Data</h2>
        <label className="list-item cursor-pointer hover:border-[var(--accent)] border border-transparent transition-colors">
          <div className="icon-box bg-[var(--orange)]/20">
            {importing ? <Loader2 className="w-6 h-6 text-[var(--orange)] animate-spin" /> : <Upload className="w-6 h-6 text-[var(--orange)]" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold">Import Backup</p>
            <p className="text-sm text-[var(--text-secondary)]">Restore from JSON or PDEV file</p>
          </div>
          <input type="file" accept=".json,.pdev" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {/* Danger Zone */}
      <div className="block border-[var(--red)]/50">
        <h2 className="text-xl font-bold mb-5 text-[var(--red)]">Danger Zone</h2>
        <button onClick={() => setShowReset(true)} className="list-item w-full text-left hover:border-[var(--red)] border border-transparent transition-colors">
          <div className="icon-box bg-[var(--red)]/20">
            <Trash2 className="w-6 h-6 text-[var(--red)]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--red)]">Reset All Data</p>
            <p className="text-sm text-[var(--text-secondary)]">Delete everything and start fresh</p>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="block">
        <h2 className="text-xl font-bold mb-5">Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5 text-center">
            <p className="stat-value text-[var(--accent)]">{data.tasks.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Tasks</p>
          </div>
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5 text-center">
            <p className="stat-value text-[var(--green)]">{data.exercises.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Exercises</p>
          </div>
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5 text-center">
            <p className="stat-value text-[var(--red)]">{data.books.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Books</p>
          </div>
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5 text-center">
            <p className="stat-value text-[var(--purple)]">{data.languages.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Languages</p>
          </div>
        </div>
      </div>

      {/* Reset Confirm */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-[var(--red)]/20 flex items-center justify-center mx-auto mb-5">
                <Shield className="w-10 h-10 text-[var(--red)]" />
              </div>
              <h2 className="text-2xl font-bold">Reset All Data?</h2>
              <p className="text-[var(--text-secondary)] mt-3">This will permanently delete all your data. This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowReset(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={resetData} className="btn flex-1 bg-[var(--red)] text-white hover:opacity-90">Delete Everything</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
