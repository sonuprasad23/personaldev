// Cross-platform notifications service
// Uses browser notifications for web and Capacitor LocalNotifications for native

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const isNative = Capacitor.isNativePlatform();

export const notifications = {
  async requestPermission() {
    try {
      if (isNative) {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      } else {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  },

  async schedule(notification) {
    try {
      const { id, title, body, schedule } = notification;

      if (isNative) {
        await LocalNotifications.schedule({
          notifications: [{
            id,
            title,
            body,
            schedule: schedule ? { at: new Date(schedule) } : undefined,
            sound: 'beep.wav',
            smallIcon: 'ic_stat_icon',
            iconColor: '#00d4ff'
          }]
        });
      } else {
        if ('Notification' in window && Notification.permission === 'granted') {
          if (schedule) {
            const delay = new Date(schedule).getTime() - Date.now();
            if (delay > 0) {
              setTimeout(() => {
                new Notification(title, { body, icon: '/logo.svg' });
              }, delay);
            }
          } else {
            new Notification(title, { body, icon: '/logo.svg' });
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Schedule notification error:', error);
      return false;
    }
  },

  async cancel(id) {
    try {
      if (isNative) {
        await LocalNotifications.cancel({ notifications: [{ id }] });
      }
      return true;
    } catch (error) {
      console.error('Cancel notification error:', error);
      return false;
    }
  },

  async cancelAll() {
    try {
      if (isNative) {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
      }
      return true;
    } catch (error) {
      console.error('Cancel all notifications error:', error);
      return false;
    }
  },

  async getPending() {
    try {
      if (isNative) {
        const result = await LocalNotifications.getPending();
        return result.notifications;
      }
      return [];
    } catch (error) {
      console.error('Get pending notifications error:', error);
      return [];
    }
  }
};

export default notifications;

