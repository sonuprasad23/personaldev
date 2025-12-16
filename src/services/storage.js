// Cross-platform storage service
// Uses localStorage for web and Capacitor Preferences for native

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();

export const storage = {
  async get(key) {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      } else {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      const stringValue = JSON.stringify(value);
      if (isNative) {
        await Preferences.set({ key, value: stringValue });
      } else {
        localStorage.setItem(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  async remove(key) {
    try {
      if (isNative) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  async clear() {
    try {
      if (isNative) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

export default storage;

