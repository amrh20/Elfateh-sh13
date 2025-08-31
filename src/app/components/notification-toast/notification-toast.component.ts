import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <div 
        *ngFor="let notification of notifications" 
        [id]="'notification-' + notification.id"
        [@slideInOut]="notification.show ? 'in' : 'out'"
        [class]="notificationService.getNotificationClasses(notification.type)"
        class="transform transition-all duration-300 ease-in-out"
      >
        <div class="flex items-start">
          <!-- Icon -->
          <div [class]="notificationService.getIconClasses(notification.type)">
            {{ notificationService.getNotificationIcon(notification.type) }}
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-sm mb-1">{{ notification.title }}</h4>
            <p class="text-sm opacity-90">{{ notification.message }}</p>
          </div>
          
          <!-- Close Button -->
          <button 
            (click)="removeNotification(notification.id)"
            class="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="إغلاق الإشعار"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Progress Bar -->
        <div 
          *ngIf="notification.duration && notification.duration > 0"
          class="mt-3 h-1 bg-current opacity-20 rounded-full overflow-hidden"
        >
          <div 
            class="h-full bg-current transition-all duration-300 ease-linear"
            [style.width.%]="notification.progress"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-item {
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .notification-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }
  `],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition('void => in', [
        style({
          transform: 'translateX(100%)',
          opacity: 0
        }),
        animate('300ms ease-out', keyframes([
          style({ transform: 'translateX(100%)', opacity: 0, offset: 0 }),
          style({ transform: 'translateX(50%)', opacity: 0.5, offset: 0.5 }),
          style({ transform: 'translateX(0)', opacity: 1, offset: 1 })
        ]))
      ]),
      transition('in => out', [
        animate('300ms ease-in', keyframes([
          style({ transform: 'translateX(0)', opacity: 1, offset: 0 }),
          style({ transform: 'translateX(50%)', opacity: 0.5, offset: 0.5 }),
          style({ transform: 'translateX(100%)', opacity: 0, offset: 1 })
        ]))
      ])
    ])
  ]
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  notifications: (Notification & { show: boolean; progress: number })[] = [];
  private subscription: Subscription = new Subscription();
  private progressIntervals: Map<string, any> = new Map();

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(notifications => {
      this.updateNotifications(notifications);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.clearAllProgressIntervals();
  }

  private updateNotifications(notifications: Notification[]): void {
    // Remove notifications that no longer exist
    this.notifications = this.notifications.filter(n => 
      notifications.some(notification => notification.id === n.id)
    );

    // Add new notifications
    notifications.forEach(notification => {
      if (!this.notifications.find(n => n.id === notification.id)) {
        const notificationWithProgress = {
          ...notification,
          show: true,
          progress: 100
        };
        
        this.notifications.unshift(notificationWithProgress);
        
        // Start progress animation
        if (notification.duration && notification.duration > 0) {
          this.startProgressAnimation(notification.id, notification.duration);
        }
        
        // Auto-hide after duration
        setTimeout(() => {
          this.hideNotification(notification.id);
        }, notification.duration || 5000);
      }
    });
  }

  private startProgressAnimation(notificationId: string, duration: number): void {
    const interval = setInterval(() => {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.progress -= (100 / (duration / 100)); // Update every 100ms
        
        if (notification.progress <= 0) {
          notification.progress = 0;
          clearInterval(interval);
          this.progressIntervals.delete(notificationId);
        }
      } else {
        clearInterval(interval);
        this.progressIntervals.delete(notificationId);
      }
    }, 100);
    
    this.progressIntervals.set(notificationId, interval);
  }

  private hideNotification(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.show = false;
      
      // Remove after animation
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      }, 300);
    }
  }

  removeNotification(notificationId: string): void {
    // Clear progress interval
    const interval = this.progressIntervals.get(notificationId);
    if (interval) {
      clearInterval(interval);
      this.progressIntervals.delete(notificationId);
    }
    
    // Remove from service
    this.notificationService.removeNotification(notificationId);
  }

  private clearAllProgressIntervals(): void {
    this.progressIntervals.forEach(interval => clearInterval(interval));
    this.progressIntervals.clear();
  }
}
