import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 flex items-center justify-center z-50" 
         style="z-index: 10000;"
         (click)="onBackdropClick($event)">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 border border-gray-200"
           style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-6 pb-4">
          <div class="flex items-center">
            <!-- Icon -->
            <div [ngClass]="getIconClasses()" class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="data.type === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                <path *ngIf="data.type === 'danger'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                <path *ngIf="data.type === 'info'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path *ngIf="data.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
              </svg>
            </div>
            
            <!-- Title -->
            <div class="mr-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6">
          <p class="text-gray-600 leading-relaxed">{{ data.message }}</p>
        </div>

        <!-- Actions -->
        <div class="px-6 pb-6 flex flex-col sm:flex-row-reverse gap-3">
          <button (click)="onConfirm()" 
                  [ngClass]="getConfirmButtonClasses()"
                  class="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold 
                  transition-all duration-200 hover:scale-105 transform shadow-md hover:shadow-lg">
            {{ data.confirmText || 'تأكيد' }}
          </button>
          <button (click)="onCancel()" 
                  class="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-105 transform shadow-md hover:shadow-lg">
            {{ data.cancelText || 'إلغاء' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .confirmation-enter {
      opacity: 0;
      transform: scale(0.9);
    }
    
    .confirmation-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: opacity 300ms ease-out, transform 300ms ease-out;
    }
    
    .confirmation-leave {
      opacity: 1;
      transform: scale(1);
    }
    
    .confirmation-leave-active {
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 200ms ease-in, transform 200ms ease-in;
    }

    /* Additional styles for better visibility */
    .bg-white {
      background-color: white !important;
      border: 2px solid #e5e7eb;
    }

    /* Ensure dialog is above everything */
    :host ::ng-deep .fixed {
      position: fixed !important;
      z-index: 10000 !important;
    }

    /* Better shadow for contrast */
    .shadow-2xl {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 
                  0 0 0 1px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    }
  `]
})
export class ConfirmationDialogComponent {
  data: ConfirmationDialogData = {
    title: '',
    message: '',
    type: 'info'
  };
  
  private resolveCallback: ((result: boolean) => void) | null = null;

  setData(data: ConfirmationDialogData): void {
    this.data = { ...data };
  }

  setResolveCallback(callback: (result: boolean) => void): void {
    this.resolveCallback = callback;
  }

  getIconClasses(): string {
    const baseClasses = 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center';
    switch (this.data.type) {
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-600`;
      case 'danger':
        return `${baseClasses} bg-red-100 text-red-600`;
      case 'success':
        return `${baseClasses} bg-green-100 text-green-600`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-600`;
    }
  }

  getConfirmButtonClasses(): string {
    const baseClasses = 'w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 transform shadow-md hover:shadow-lg text-white';
    switch (this.data.type) {
      case 'warning':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700`;
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700`;
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700`;
    }
  }

  onConfirm(): void {
    if (this.resolveCallback) {
      this.resolveCallback(true);
    }
  }

  onCancel(): void {
    if (this.resolveCallback) {
      this.resolveCallback(false);
    }
  }

  onBackdropClick(event: Event): void {
    // Close dialog when clicking backdrop
    this.onCancel();
  }
}
