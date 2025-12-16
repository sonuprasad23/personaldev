import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { Plus, Trash2, Play, BookOpen, Clock, ChevronLeft, ChevronRight, X, BookMarked, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const BOOK_IMAGE = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=300&fit=crop';

export default function BookReading() {
  const { data, setData, currentDate, setCurrentDate, api } = useContext(AppContext);
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', targetMins: 30, pagesTotal: 0 });
  const [logInput, setLogInput] = useState({});
  const [loading, setLoading] = useState(false);

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const addBook = async () => {
    if (!newBook.title.trim()) return;
    setLoading(true);
    const book = { id: Date.now().toString(), ...newBook, title: newBook.title.trim(), logs: {}, pagesRead: 0 };
    
    try {
      await api.addBook(book);
      setData(prev => ({ ...prev, books: [...prev.books, book] }));
      setNewBook({ title: '', author: '', targetMins: 30, pagesTotal: 0 });
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add book:', e);
    }
    setLoading(false);
  };

  const removeBook = async (id) => {
    try {
      await api.deleteBook(id);
      setData(prev => ({ ...prev, books: prev.books.filter(b => b.id !== id) }));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const logReading = async (id, type) => {
    const val = parseInt(logInput[`${id}_${type}`]);
    if (!val) return;
    setLoading(true);
    
    try {
      await api.logBook(id, dateKey, type === 'time' ? val : 0, type === 'pages' ? val : 0);
      setData(prev => ({
        ...prev,
        books: prev.books.map(b => b.id === id ? {
          ...b,
          logs: { ...b.logs, [dateKey]: { ...b.logs?.[dateKey], duration: (b.logs?.[dateKey]?.duration || 0) + (type === 'time' ? val : 0) } },
          pagesRead: type === 'pages' ? (b.pagesRead || 0) + val : b.pagesRead
        } : b)
      }));
      setLogInput(p => ({ ...p, [`${id}_${type}`]: '' }));
    } catch (e) {
      console.error('Failed to log:', e);
    }
    setLoading(false);
  };

  const startTimer = (book) => navigate('/timer', { state: { type: 'reading', item: book } });
  const navigateDate = (dir) => { const d = new Date(currentDate); d.setDate(d.getDate() + dir); setCurrentDate(d); };

  const totalTime = data.books.reduce((a, b) => a + (b.logs?.[dateKey]?.duration || 0), 0);
  const formatTime = (m) => m === 0 ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">Book Reading</h1>
          <p className="text-[var(--text-secondary)] text-lg">Track your reading journey</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Add Book
        </button>
      </div>

      {/* Banner */}
      <div className="block overflow-hidden p-0 relative h-48 lg:h-56">
        <img src={BOOK_IMAGE} alt="Books" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-8">
          <div>
            <p className="text-[var(--text-secondary)] mb-1">Today's Reading</p>
            <p className="text-5xl lg:text-6xl font-bold text-[var(--red)]">{formatTime(totalTime)}</p>
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
          <div className="icon-box icon-box-lg bg-[var(--red)]/20">
            <Clock className="w-8 h-8 text-[var(--red)]" />
          </div>
          <p className="stat-value text-[var(--red)]">{formatTime(totalTime)}</p>
          <p className="stat-label">Read Today</p>
        </div>
        <div className="stat-block">
          <div className="icon-box icon-box-lg bg-[var(--purple)]/20">
            <BookMarked className="w-8 h-8 text-[var(--purple)]" />
          </div>
          <p className="stat-value text-[var(--purple)]">{data.books.length}</p>
          <p className="stat-label">Books</p>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Add Book</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Book Title</label>
                  <input type="text" value={newBook.title} onChange={(e) => setNewBook(p => ({ ...p, title: e.target.value }))} placeholder="Book name..." className="input" autoFocus />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Author</label>
                  <input type="text" value={newBook.author} onChange={(e) => setNewBook(p => ({ ...p, author: e.target.value }))} placeholder="Author name..." className="input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Daily Target (min)</label>
                    <input type="number" value={newBook.targetMins} onChange={(e) => setNewBook(p => ({ ...p, targetMins: e.target.value }))} className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] mb-3 block font-medium">Total Pages</label>
                    <input type="number" value={newBook.pagesTotal} onChange={(e) => setNewBook(p => ({ ...p, pagesTotal: e.target.value }))} className="input" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAdd(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={addBook} disabled={loading} className="btn btn-primary flex-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Book'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Books */}
      <div className="space-y-5">
        {data.books.length === 0 ? (
          <div className="block text-center py-16">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No books yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Add a book to start tracking</p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus className="w-5 h-5" /> Add Book</button>
          </div>
        ) : (
          data.books.map((book, idx) => {
            const todayTime = book.logs?.[dateKey]?.duration || 0;
            const progress = Math.min(100, Math.round((todayTime / parseInt(book.targetMins)) * 100));
            const pageProgress = book.pagesTotal > 0 ? Math.round((book.pagesRead / book.pagesTotal) * 100) : 0;
            return (
              <motion.div 
                key={book.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="icon-box icon-box-lg bg-[var(--red)]/20">
                      <BookOpen className="w-8 h-8 text-[var(--red)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{book.title}</h3>
                      {book.author && <p className="text-[var(--text-secondary)]">by {book.author}</p>}
                    </div>
                  </div>
                  <button onClick={() => removeBook(book.id)} className="btn-icon hover:bg-[var(--red)]/20 hover:text-[var(--red)]">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Time Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">Today: {todayTime}/{book.targetMins} min</span>
                    <span className={`font-bold ${progress >= 100 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{progress}%</span>
                  </div>
                  <div className="progress h-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`progress-bar ${progress >= 100 ? '!bg-[var(--green)]' : '!bg-[var(--red)]'}`}
                    />
                  </div>
                </div>

                {/* Pages */}
                {book.pagesTotal > 0 && (
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--text-secondary)]">Pages: {book.pagesRead}/{book.pagesTotal}</span>
                      <span className="font-bold text-[var(--purple)]">{pageProgress}%</span>
                    </div>
                    <div className="progress h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pageProgress}%` }}
                        className="progress-bar !bg-[var(--purple)]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => startTimer(book)} className="btn btn-primary flex-1 min-w-[120px]">
                    <Play className="w-5 h-5" /> Timer
                  </button>
                  <div className="flex gap-2 flex-1 min-w-[150px]">
                    <input type="number" value={logInput[`${book.id}_time`] || ''} onChange={(e) => setLogInput(p => ({ ...p, [`${book.id}_time`]: e.target.value }))} placeholder="min" className="input w-20" />
                    <button onClick={() => logReading(book.id, 'time')} disabled={loading} className="btn btn-secondary">+Time</button>
                  </div>
                  {book.pagesTotal > 0 && (
                    <div className="flex gap-2">
                      <input type="number" value={logInput[`${book.id}_pages`] || ''} onChange={(e) => setLogInput(p => ({ ...p, [`${book.id}_pages`]: e.target.value }))} placeholder="pg" className="input w-16" />
                      <button onClick={() => logReading(book.id, 'pages')} disabled={loading} className="btn btn-secondary">+Pages</button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
