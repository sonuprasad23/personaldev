import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, Dumbbell, BookOpen, Languages, Clock, Flame } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isToday, isSameMonth, isSameDay } from 'date-fns';

const CALENDAR_IMAGE = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=200&fit=crop';

export default function CalendarView() {
  const { data, currentDate, setCurrentDate } = useContext(AppContext);
  const [viewMonth, setViewMonth] = useState(new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDayData = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const checkins = data.dailyCheckins[dateKey] || {};
    const completedTasks = Object.values(checkins).filter(Boolean).length;
    const exerciseTime = data.exercises.reduce((a, e) => a + (e.logs?.[dateKey]?.duration || 0), 0);
    const readingTime = data.books.reduce((a, b) => a + (b.logs?.[dateKey]?.duration || 0), 0);
    const languageTime = data.languages.reduce((a, l) => a + (l.logs?.[dateKey]?.duration || 0), 0);
    const hasActivity = completedTasks > 0 || exerciseTime > 0 || readingTime > 0 || languageTime > 0;
    return { completedTasks, exerciseTime, readingTime, languageTime, hasActivity };
  };

  const selectDay = (day) => setCurrentDate(day);
  const prevMonth = () => setViewMonth(subMonths(viewMonth, 1));
  const nextMonth = () => setViewMonth(addMonths(viewMonth, 1));
  const goToToday = () => { setViewMonth(new Date()); setCurrentDate(new Date()); };

  const selectedData = getDayData(currentDate);
  const formatTime = (m) => m === 0 ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hero-header text-3xl lg:text-4xl">Calendar</h1>
          <p className="text-[var(--text-secondary)] text-lg">View your activity history</p>
        </div>
        <button onClick={goToToday} className="btn btn-secondary">
          <Calendar className="w-5 h-5" /> Today
        </button>
      </div>

      {/* Banner */}
      <div className="block overflow-hidden p-0 relative h-36">
        <img src={CALENDAR_IMAGE} alt="Calendar" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{data.streak}</p>
              <p className="text-white/80">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="block">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="btn-icon"><ChevronLeft className="w-6 h-6" /></button>
          <h2 className="text-2xl font-bold">{format(viewMonth, 'MMMM yyyy')}</h2>
          <button onClick={nextMonth} className="btn-icon"><ChevronRight className="w-6 h-6" /></button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-sm font-semibold text-[var(--text-muted)] py-2">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayData = getDayData(day);
            const isSelected = isSameDay(day, currentDate);
            const isCurrentMonth = isSameMonth(day, viewMonth);
            return (
              <motion.button
                key={day.toISOString()}
                whileTap={{ scale: 0.9 }}
                onClick={() => selectDay(day)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative p-2 transition-all
                  ${isSelected ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--green)] text-black' : ''}
                  ${!isSelected && isToday(day) ? 'ring-2 ring-[var(--accent)]' : ''}
                  ${!isSelected && !isToday(day) ? 'hover:bg-[var(--bg-elevated)]' : ''}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                `}
              >
                <span className={`text-base font-semibold ${isSelected ? 'text-black' : ''}`}>{format(day, 'd')}</span>
                {dayData.hasActivity && !isSelected && (
                  <div className="absolute bottom-2 flex gap-1">
                    {dayData.completedTasks > 0 && <span className="w-2 h-2 rounded-full bg-[var(--green)]" />}
                    {dayData.exerciseTime > 0 && <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                    {dayData.readingTime > 0 && <span className="w-2 h-2 rounded-full bg-[var(--red)]" />}
                    {dayData.languageTime > 0 && <span className="w-2 h-2 rounded-full bg-[var(--purple)]" />}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="block">
        <h3 className="text-xl font-bold mb-5">
          {isToday(currentDate) ? "Today's Activity" : format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-[var(--green)]" />
              <span className="text-[var(--text-secondary)]">Tasks</span>
            </div>
            <p className="text-3xl font-bold text-[var(--green)]">
              {selectedData.completedTasks}/{data.tasks.length}
            </p>
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Dumbbell className="w-6 h-6 text-[var(--accent)]" />
              <span className="text-[var(--text-secondary)]">Exercise</span>
            </div>
            <p className="text-3xl font-bold text-[var(--accent)]">
              {formatTime(selectedData.exerciseTime)}
            </p>
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-[var(--red)]" />
              <span className="text-[var(--text-secondary)]">Reading</span>
            </div>
            <p className="text-3xl font-bold text-[var(--red)]">
              {formatTime(selectedData.readingTime)}
            </p>
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Languages className="w-6 h-6 text-[var(--purple)]" />
              <span className="text-[var(--text-secondary)]">Languages</span>
            </div>
            <p className="text-3xl font-bold text-[var(--purple)]">
              {formatTime(selectedData.languageTime)}
            </p>
          </div>
        </div>

        {!selectedData.hasActivity && (
          <div className="text-center py-10 mt-5 bg-[var(--bg-elevated)] rounded-2xl">
            <Clock className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">No activity recorded</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[var(--green)]" />
          <span className="text-[var(--text-secondary)]">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[var(--accent)]" />
          <span className="text-[var(--text-secondary)]">Exercise</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[var(--red)]" />
          <span className="text-[var(--text-secondary)]">Reading</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[var(--purple)]" />
          <span className="text-[var(--text-secondary)]">Languages</span>
        </div>
      </div>
    </div>
  );
}
