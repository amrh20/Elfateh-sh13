import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
  read: boolean;
}

export interface NotificationOptions {
  duration?: number;
  showIcon?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  autoClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private readonly DEFAULT_DURATION = 5000; // 5 seconds
  private readonly MAX_NOTIFICATIONS = 10;

  constructor() {
    this.loadNotificationsFromStorage();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  getNotificationsValue(): Notification[] {
    return this.notifications;
  }

  /**
   * Show success notification
   */
  success(title: string, message: string, options?: NotificationOptions): string {
    return this.showNotification('success', title, message, options);
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, options?: NotificationOptions): string {
    return this.showNotification('error', title, message, options);
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, options?: NotificationOptions): string {
    return this.showNotification('warning', title, message, options);
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, options?: NotificationOptions): string {
    return this.showNotification('info', title, message, options);
  }

  /**
   * Show success notification with simple message
   */
  showSuccess(message: string, options?: NotificationOptions): string {
    return this.success('نجح', message, options);
  }

  /**
   * Show error notification with simple message
   */
  showError(message: string, options?: NotificationOptions): string {
    return this.error('خطأ', message, options);
  }

  /**
   * Show cart operation result
   */
  showCartResult(result: { success: boolean; message: string }): string {
    if (result.success) {
      return this.success('السلة', result.message, { duration: 3000 });
    } else {
      return this.error('خطأ في السلة', result.message, { duration: 5000 });
    }
  }

  /**
   * Show wishlist operation result
   */
  showWishlistResult(result: { success: boolean; message: string }): string {
    if (result.success) {
      return this.success('المفضلة', result.message, { duration: 3000 });
    } else {
      return this.error('خطأ في المفضلة', result.message, { duration: 5000 });
    }
  }

  /**
   * Show storage operation result
   */
  showStorageResult(result: { success: boolean; message: string }): string {
    if (result.success) {
      return this.success('التخزين', result.message, { duration: 3000 });
    } else {
      return this.error('خطأ في التخزين', result.message, { duration: 5000 });
    }
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.updateNotifications();
    this.saveNotificationsToStorage();
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.updateNotifications();
      this.saveNotificationsToStorage();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.updateNotifications();
    this.saveNotificationsToStorage();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.updateNotifications();
    this.saveNotificationsToStorage();
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Get recent notifications (last 24 hours)
   */
  getRecentNotifications(): Notification[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return this.notifications.filter(n => n.timestamp > yesterday);
  }

  private showNotification(
    type: Notification['type'], 
    title: string, 
    message: string, 
    options?: NotificationOptions
  ): string {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: options?.duration || this.DEFAULT_DURATION,
      timestamp: new Date(),
      read: false
    };

    // Add to notifications array
    this.notifications.unshift(notification);
    
    // Limit notifications count
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, this.MAX_NOTIFICATIONS);
    }

    // Update subject
    this.updateNotifications();
    
    // Save to storage
    this.saveNotificationsToStorage();

    // Auto-remove after duration
    if (options?.autoClose !== false) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }

    return id;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private updateNotifications(): void {
    this.notificationsSubject.next([...this.notifications]);
  }

  private saveNotificationsToStorage(): void {
    try {
      const data = JSON.stringify(this.notifications);
      localStorage.setItem('elfateh_notifications', data);
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  private loadNotificationsFromStorage(): void {
    try {
      const data = localStorage.getItem('elfateh_notifications');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.notifications = parsed.map(n => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          this.updateNotifications();
        }
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }

  /**
   * Get notification CSS classes based on type
   */
  getNotificationClasses(type: Notification['type']): string {
    const baseClasses = 'notification-item p-4 rounded-lg shadow-lg border-l-4 mb-3 transition-all duration-300';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-500 text-gray-800`;
    }
  }

  /**
   * Get notification icon CSS classes based on type
   */
  getIconClasses(type: Notification['type']): string {
    const baseClasses = 'w-6 h-6 mr-3 flex-shrink-0';
    
    switch (type) {
      case 'success':
        return `${baseClasses} text-green-600`;
      case 'error':
        return `${baseClasses} text-red-600`;
      case 'warning':
        return `${baseClasses} text-yellow-600`;
      case 'info':
        return `${baseClasses} text-blue-600`;
      default:
        return `${baseClasses} text-gray-600`;
    }
  }
}
