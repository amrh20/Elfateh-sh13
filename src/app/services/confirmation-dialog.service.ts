import { Injectable, ComponentRef, ViewContainerRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private dialogRef: ComponentRef<ConfirmationDialogComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  async confirm(data: ConfirmationDialogData): Promise<boolean> {
    return new Promise((resolve) => {
      // Close existing dialog if any
      this.close();

      // Add overlay to body
      this.addBodyOverlay();

      // Create component
      this.dialogRef = createComponent(ConfirmationDialogComponent, {
        environmentInjector: this.injector
      });

      // Set data and callback
      this.dialogRef.instance.setData(data);
      this.dialogRef.instance.setResolveCallback((result: boolean) => {
        this.close();
        resolve(result);
      });

      // Attach to DOM
      this.appRef.attachView(this.dialogRef.hostView);
      document.body.appendChild(this.dialogRef.location.nativeElement);

      // Add animation class
      setTimeout(() => {
        this.dialogRef?.location.nativeElement.classList.add('confirmation-enter-active');
      }, 10);
    });
  }

  // Convenience methods for different types
  async confirmWarning(title: string, message: string, confirmText?: string, cancelText?: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText,
      type: 'warning'
    });
  }

  async confirmDanger(title: string, message: string, confirmText?: string, cancelText?: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText,
      type: 'danger'
    });
  }

  async confirmSuccess(title: string, message: string, confirmText?: string, cancelText?: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText,
      type: 'success'
    });
  }

  async confirmInfo(title: string, message: string, confirmText?: string, cancelText?: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText,
      type: 'info'
    });
  }

  private close(): void {
    if (this.dialogRef) {
      // Add leave animation
      this.dialogRef.location.nativeElement.classList.add('confirmation-leave-active');
      
      // Remove body overlay
      this.removeBodyOverlay();
      
      setTimeout(() => {
        if (this.dialogRef) {
          this.appRef.detachView(this.dialogRef.hostView);
          this.dialogRef.destroy();
          this.dialogRef = null;
        }
      }, 200);
    }
  }

  private addBodyOverlay(): void {
    // Remove existing overlay if any
    this.removeBodyOverlay();
    
    // Add overlay styles to body
    document.body.style.overflow = 'hidden';
    document.body.classList.add('confirmation-dialog-open');
    
    // Add overlay element
    const overlay = document.createElement('div');
    overlay.id = 'confirmation-dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9999;
      opacity: 0;
      transition: opacity 300ms ease-out;
    `;
    
    document.body.appendChild(overlay);
    
    // Animate overlay in
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
  }

  private removeBodyOverlay(): void {
    // Remove overlay element
    const overlay = document.getElementById('confirmation-dialog-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
    
    // Remove body styles
    document.body.style.overflow = '';
    document.body.classList.remove('confirmation-dialog-open');
  }
}
