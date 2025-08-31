import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any;
  private installPromptSource = new BehaviorSubject<any>(null);
  public installPrompt$ = this.installPromptSource.asObservable();

  constructor() {
    this.initPWA();
  }

  private initPWA(): void {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.installPromptSource.next(e);
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.installPromptSource.next(null);
    });
  }

  async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }

  isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  isPWAInstallable(): boolean {
    return !!this.deferredPrompt;
  }

  getInstallPrompt(): any {
    return this.deferredPrompt;
  }
} 