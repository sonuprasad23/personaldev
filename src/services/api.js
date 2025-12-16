const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || response.statusText);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // Health check
  health: () => request('/health'),

  // Main sync endpoints
  syncData: (data, device = 'web') => request('/sync', { 
    method: 'POST', 
    body: JSON.stringify({ data, device }) 
  }),

  fetchData: () => request('/sync'),

  getSyncHistory: () => request('/sync/history'),

  // Export in custom format
  exportData: (format = 'json') => request(`/export/${format}`),

  // Import data
  importData: (data, device = 'web') => request('/import', {
    method: 'POST',
    body: JSON.stringify({ data, device })
  }),

  // Legacy endpoints (kept for compatibility during transition)
  getTasks: () => Promise.resolve([]),
  getCheckins: () => Promise.resolve({}),
  getExercises: () => Promise.resolve([]),
  getBooks: () => Promise.resolve([]),
  getLanguages: () => Promise.resolve([]),
  getGoals: () => Promise.resolve([]),
  getReminders: () => Promise.resolve([]),
  getScreenTime: () => Promise.resolve({}),
  getYouTube: () => Promise.resolve({}),
  getStreak: () => Promise.resolve({ streak: 0, lastCheckIn: null }),
  getSettings: () => Promise.resolve({ notifications: true }),

  // These are no-ops now since we use full sync
  addTask: () => Promise.resolve({ success: true }),
  deleteTask: () => Promise.resolve({ success: true }),
  setCheckin: () => Promise.resolve({ success: true }),
  addExercise: () => Promise.resolve({ success: true }),
  deleteExercise: () => Promise.resolve({ success: true }),
  logExercise: () => Promise.resolve({ success: true }),
  addBook: () => Promise.resolve({ success: true }),
  deleteBook: () => Promise.resolve({ success: true }),
  logBook: () => Promise.resolve({ success: true }),
  addLanguage: () => Promise.resolve({ success: true }),
  deleteLanguage: () => Promise.resolve({ success: true }),
  logLanguage: () => Promise.resolve({ success: true }),
  addWord: () => Promise.resolve({ success: true }),
  deleteWord: () => Promise.resolve({ success: true }),
  addGoal: () => Promise.resolve({ success: true }),
  updateGoal: () => Promise.resolve({ success: true }),
  deleteGoal: () => Promise.resolve({ success: true }),
  addReminder: () => Promise.resolve({ success: true }),
  updateReminder: () => Promise.resolve({ success: true }),
  deleteReminder: () => Promise.resolve({ success: true }),
  setScreenTime: () => Promise.resolve({ success: true }),
  addYouTube: () => Promise.resolve({ success: true }),
  deleteYouTube: () => Promise.resolve({ success: true }),
  setSetting: () => Promise.resolve({ success: true }),
  setStreak: () => Promise.resolve({ success: true }),
};
