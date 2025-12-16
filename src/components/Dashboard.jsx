import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { 
  CheckCircle, Dumbbell, BookOpen, Languages, Clock, Monitor, 
  ArrowRight, Flame, Target, Calendar, TrendingUp, Zap, Star, ChevronRight
} from 'lucide-react';
import { format, isToday } from 'date-fns';
import { motion } from 'framer-motion';

// Motivational images
const IMAGES = {
  workout: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  reading: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
  meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
  productivity: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
};

export default function Dashboard() {
  const { data, currentDate, isLoading } = useContext(AppContext);
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const stats = useMemo(() => {
    const checkins = data.dailyCheckins[dateKey] || {};
    const completedTasks = Object.values(checkins).filter(Boolean).length;
    const totalTasks = data.tasks.length;
    const exerciseTime = data.exercises.reduce((a, e) => a + (e.logs?.[dateKey]?.duration || 0), 0);
    const readingTime = data.books.reduce((a, b) => a + (b.logs?.[dateKey]?.duration || 0), 0);
    const languageTime = data.languages.reduce((a, l) => a + (l.logs?.[dateKey]?.duration || 0), 0);
    const screenTime = data.screenTime[dateKey] || 0;
    return { completedTasks, totalTasks, exerciseTime, readingTime, languageTime, screenTime };
  }, [data, dateKey]);

  const formatTime = (m) => m === 0 ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header */}
      <motion.div variants={itemVariants}>
        <h1 className="hero-header">Your Growth Journey</h1>
        <p className="text-[var(--text-secondary)] mt-2 text-lg">
          {isToday(currentDate) ? "Let's make today count!" : format(currentDate, 'EEEE, MMMM d')}
        </p>
      </motion.div>

      {/* Main Stats Grid - 2 columns on mobile, 4 on desktop */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Streak */}
        <Link to="/tasks" className="streak-card col-span-2 lg:col-span-1 glow-orange group">
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <span className="text-5xl lg:text-6xl">🔥</span>
            </div>
            <div>
              <p className="text-5xl lg:text-6xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{data.streak}</p>
              <p className="text-white/80 font-medium text-lg">Day Streak</p>
            </div>
          </div>
        </Link>

        {/* Tasks Progress */}
        <Link to="/tasks" className="stat-block col-span-2 lg:col-span-1 hover:border-[var(--green)] group">
          <div className="flex items-center justify-between">
            <div className="icon-box icon-box-lg bg-[var(--green)]/20 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-9 h-9 text-[var(--green)]" />
            </div>
            <span className="text-4xl lg:text-5xl font-bold text-[var(--green)]">{completionRate}%</span>
          </div>
          <div>
            <p className="stat-value text-[var(--green)]">{stats.completedTasks}/{stats.totalTasks}</p>
            <p className="stat-label">Tasks Done</p>
          </div>
          <div className="progress">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="progress-bar !bg-[var(--green)]" 
            />
          </div>
        </Link>

        {/* Exercise */}
        <Link to="/exercise" className="stat-block hover:border-[var(--accent)] group">
          <div className="icon-box icon-box-lg bg-[var(--accent)]/20 group-hover:scale-110 transition-transform">
            <Dumbbell className="w-9 h-9 text-[var(--accent)]" />
          </div>
          <p className="stat-value text-[var(--accent)]">{formatTime(stats.exerciseTime)}</p>
          <p className="stat-label">Exercise</p>
        </Link>

        {/* Reading */}
        <Link to="/books" className="stat-block hover:border-[var(--red)] group">
          <div className="icon-box icon-box-lg bg-[var(--red)]/20 group-hover:scale-110 transition-transform">
            <BookOpen className="w-9 h-9 text-[var(--red)]" />
          </div>
          <p className="stat-value text-[var(--red)]">{formatTime(stats.readingTime)}</p>
          <p className="stat-label">Reading</p>
        </Link>
      </motion.div>

      {/* Secondary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Link to="/languages" className="stat-block hover:border-[var(--purple)] group">
          <div className="icon-box bg-[var(--purple)]/20 group-hover:scale-110 transition-transform">
            <Languages className="w-7 h-7 text-[var(--purple)]" />
          </div>
          <p className="stat-value text-[var(--purple)]">{formatTime(stats.languageTime)}</p>
          <p className="stat-label">Languages</p>
        </Link>

        <Link to="/tasks" className="stat-block hover:border-[var(--yellow)] group">
          <div className="icon-box bg-[var(--yellow)]/20 group-hover:scale-110 transition-transform">
            <Monitor className="w-7 h-7 text-[var(--yellow)]" />
          </div>
          <p className="stat-value text-[var(--yellow)]">{stats.screenTime > 0 ? formatTime(stats.screenTime) : '—'}</p>
          <p className="stat-label">Screen Time</p>
        </Link>

        <Link to="/youtube" className="stat-block hover:border-[var(--orange)] group">
          <div className="icon-box bg-[var(--orange)]/20 group-hover:scale-110 transition-transform">
            <Star className="w-7 h-7 text-[var(--orange)]" />
          </div>
          <p className="stat-value text-[var(--orange)]">
            {(data.youtubeHistory[dateKey] || []).reduce((a, e) => a + e.duration, 0)}m
          </p>
          <p className="stat-label">Media Time</p>
        </Link>

        <Link to="/goals" className="stat-block hover:border-[var(--green)] group">
          <div className="icon-box bg-[var(--green)]/20 group-hover:scale-110 transition-transform">
            <Target className="w-7 h-7 text-[var(--green)]" />
          </div>
          <p className="stat-value text-[var(--green)]">
            {data.weeklyGoals.filter(g => !g.completed).length}
          </p>
          <p className="stat-label">Active Goals</p>
        </Link>
      </motion.div>

      {/* Quick Actions - BIG buttons for mobile */}
      <motion.div variants={itemVariants} className="block">
        <h2 className="text-xl font-bold mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/timer', icon: Clock, label: 'Start Timer', color: 'var(--accent)', gradient: 'from-[#00d4ff] to-[#00ff88]' },
            { to: '/tasks', icon: CheckCircle, label: 'Add Task', color: 'var(--green)', gradient: 'from-[#00ff88] to-[#00d4ff]' },
            { to: '/goals', icon: Target, label: 'Set Goal', color: 'var(--orange)', gradient: 'from-[#ff6b35] to-[#ff3366]' },
            { to: '/calendar', icon: Calendar, label: 'Calendar', color: 'var(--purple)', gradient: 'from-[#bf5af2] to-[#00d4ff]' },
          ].map((item, idx) => (
            <motion.div
              key={item.to}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={item.to} className="quick-action h-full">
                <div className={`icon-box icon-box-lg bg-gradient-to-br ${item.gradient}`}>
                  <item.icon className="w-8 h-8 text-black" />
                </div>
                <span className="font-semibold text-base">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Motivation Banner with Image */}
      <motion.div variants={itemVariants} className="block overflow-hidden p-0">
        <div className="relative h-48 lg:h-64">
          <img 
            src={IMAGES.productivity} 
            alt="Productivity" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent flex items-center">
            <div className="p-8">
              <h3 className="text-2xl lg:text-3xl font-bold mb-2">Stay Consistent</h3>
              <p className="text-[var(--text-secondary)] max-w-sm">
                Small daily improvements lead to stunning results. Keep pushing forward!
              </p>
              <Link to="/timer" className="btn btn-primary mt-4 inline-flex">
                <Zap className="w-5 h-5" /> Start Now
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Tasks */}
      <motion.div variants={itemVariants} className="block">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Today's Tasks</h2>
          <Link to="/tasks" className="flex items-center gap-1 text-[var(--accent)] font-medium hover:underline">
            View All <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        
        {data.tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] mb-4">No tasks yet. Start by adding one!</p>
            <Link to="/tasks" className="btn btn-primary inline-flex">Add Task</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.tasks.slice(0, 4).map((task) => {
              const isChecked = data.dailyCheckins[dateKey]?.[task.id];
              return (
                <motion.div 
                  key={task.id} 
                  className={`list-item ${isChecked ? 'bg-[var(--green)]/10 border border-[var(--green)]/30' : ''}`}
                  whileHover={{ x: 4 }}
                >
                  <div className={`checkbox ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <CheckCircle className="w-5 h-5 text-black" />}
                  </div>
                  <span className={`flex-1 font-medium text-lg ${isChecked ? 'line-through text-[var(--text-secondary)]' : ''}`}>
                    {task.title}
                  </span>
                  {task.importance === 'high' && (
                    <span className="badge bg-[var(--red)]/20 text-[var(--red)]">High</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Weekly Goals */}
      <motion.div variants={itemVariants} className="block">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Weekly Goals</h2>
          <Link to="/goals" className="flex items-center gap-1 text-[var(--accent)] font-medium hover:underline">
            View All <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        
        {data.weeklyGoals.filter(g => !g.completed).length === 0 ? (
          <div className="text-center py-12">
            <div className="icon-box icon-box-lg bg-[var(--bg-elevated)] mx-auto mb-4">
              <Target className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] mb-4">Set goals to track your progress</p>
            <Link to="/goals" className="btn btn-primary inline-flex">Set Goal</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {data.weeklyGoals.filter(g => !g.completed).slice(0, 3).map((goal) => (
              <div key={goal.id} className="bg-[var(--bg-elevated)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-lg">{goal.title}</span>
                  <span className="text-lg font-bold gradient-text">{goal.progress || 0}%</span>
                </div>
                <div className="progress">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress || 0}%` }}
                    className="progress-bar" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Activity Images Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { img: IMAGES.workout, label: 'Exercise', to: '/exercise', color: 'var(--accent)' },
          { img: IMAGES.reading, label: 'Reading', to: '/books', color: 'var(--red)' },
          { img: IMAGES.meditation, label: 'Focus', to: '/timer', color: 'var(--purple)' },
          { img: IMAGES.productivity, label: 'Tasks', to: '/tasks', color: 'var(--green)' },
        ].map((item) => (
          <Link key={item.label} to={item.to} className="group relative overflow-hidden rounded-3xl aspect-square">
            <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="font-bold text-lg">{item.label}</p>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
