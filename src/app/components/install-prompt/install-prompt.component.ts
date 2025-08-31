import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showInstallPrompt" 
         class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div class="flex items-start space-x-3 space-x-reverse">
          <!-- App Icon -->
          <div class="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <!-- Content -->
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 mb-1">ثبت تطبيق الفتح</h3>
            <p class="text-sm text-gray-600 mb-3">احصل على تجربة أفضل مع تطبيقنا المثبت على هاتفك</p>
            
            <!-- Buttons -->
            <div class="flex space-x-2 space-x-reverse">
              <button (click)="installApp()" 
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                تثبيت
              </button>
              <button (click)="dismissPrompt()" 
                      class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                لاحقاً
              </button>
            </div>
          </div>
          
          <!-- Close Button -->
          <button (click)="dismissPrompt()" 
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  showInstallPrompt = false;
  private subscription: Subscription = new Subscription();

  constructor(private pwaService: PwaService) {}

  // Check if device is mobile
  private isMobileDevice(): boolean {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  ngOnInit(): void {
    // Only show on mobile devices
    if (!this.isMobileDevice()) {
      return;
    }

    // Check if PWA is already installed
    if (this.pwaService.isPWAInstalled()) {
      return;
    }

    // Listen for install prompt
    this.subscription.add(
      this.pwaService.installPrompt$.subscribe(prompt => {
        if (prompt && !this.pwaService.isPWAInstalled() && this.isMobileDevice()) {
          this.showInstallPrompt = true;
        }
      })
    );

    // Check if installable on init
    if (this.pwaService.isPWAInstallable() && !this.pwaService.isPWAInstalled() && this.isMobileDevice()) {
      this.showInstallPrompt = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async installApp(): Promise<void> {
    try {
      const success = await this.pwaService.installPWA();
      if (success) {
        this.showInstallPrompt = false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  }

  dismissPrompt(): void {
    this.showInstallPrompt = false;
    // Store in localStorage to not show again for a while
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  }
} 