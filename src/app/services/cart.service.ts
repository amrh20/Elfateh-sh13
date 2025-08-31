import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private readonly STORAGE_KEY = 'elfateh_cart';
  private readonly MAX_CART_ITEMS = 100; // Prevent excessive storage usage

  constructor() {
    this.loadCartFromStorage();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getCartItemsValue(): CartItem[] {
    return this.cartItems;
  }

  getCartSize(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  addToCart(product: any, quantity: number = 1): { success: boolean; message: string } {
    try {
      // Validate input
      if (!product || !product._id) {
        return { success: false, message: 'منتج غير صالح' };
      }

      if (quantity <= 0) {
        return { success: false, message: 'الكمية يجب أن تكون أكبر من صفر' };
      }

      // Check storage quota
      if (this.cartItems.length >= this.MAX_CART_ITEMS) {
        return { success: false, message: 'السلة ممتلئة، يرجى إزالة بعض المنتجات أولاً' };
      }

      const existingItem: any = this.cartItems.find((item: any) => item.product._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
        this.updateCart();
        return { success: true, message: `تم تحديث الكمية لـ ${product.name}` };
      } else {
        this.cartItems.push({ product, quantity });
        this.updateCart();
        return { success: true, message: `تم إضافة ${product.name} إلى السلة` };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'حدث خطأ أثناء إضافة المنتج للسلة' };
    }
  }

  removeFromCart(productId: number): { success: boolean; message: string } {
    try {
      const item: any = this.cartItems.find((item: any) => item.product._id === productId);
      if (!item) {
        return { success: false, message: 'المنتج غير موجود في السلة' };
      }

      this.cartItems = this.cartItems.filter((item: any) => item.product._id !== productId);
      this.updateCart();
      return { success: true, message: `تم إزالة ${item.product.name} من السلة` };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'حدث خطأ أثناء إزالة المنتج من السلة' };
    }
  }

  updateQuantity(productId: number, quantity: number): { success: boolean; message: string } {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }

      const item: any = this.cartItems.find((item: any) => item.product._id === productId);
      if (!item) {
        return { success: false, message: 'المنتج غير موجود في السلة' };
      }

      item.quantity = quantity;
      this.updateCart();
      return { success: true, message: `تم تحديث كمية ${item.product.name}` };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'حدث خطأ أثناء تحديث الكمية' };
    }
  }

  clearCart(): { success: boolean; message: string } {
    try {
      this.cartItems = [];
      this.updateCart();
      return { success: true, message: 'تم تفريغ السلة بنجاح' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'حدث خطأ أثناء تفريغ السلة' };
    }
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      const price = item.product.isOnSale && item.product.originalPrice 
        ? item.product.originalPrice 
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }



  isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  // Check if localStorage is available and working
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const cartData = localStorage.getItem(this.STORAGE_KEY) || '';
      const used = new Blob([cartData]).size;
      const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  private saveCartToStorage(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      const cartData = JSON.stringify(this.cartItems);
      
      // Check storage quota before saving
      const storageInfo = this.getStorageInfo();
      if (storageInfo.percentage > 80) {
        console.warn('Storage usage is high:', storageInfo.percentage.toFixed(2) + '%');
      }

      localStorage.setItem(this.STORAGE_KEY, cartData);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      
      // If storage is full, try to clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded();
      }
    }
  }

  private loadCartFromStorage(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available, starting with empty cart');
      return;
    }

    try {
      const savedCart = localStorage.getItem(this.STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        
        // Validate parsed data
        if (Array.isArray(parsedCart)) {
          this.cartItems = parsedCart.filter(item => 
            item && 
            item.product && 
            item.product._id && 
            typeof item.quantity === 'number' && 
            item.quantity > 0
          );
        } else {
          console.warn('Invalid cart data format, starting with empty cart');
          this.cartItems = [];
        }
        
        this.cartSubject.next([...this.cartItems]);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.cartItems = [];
      this.cartSubject.next([...this.cartItems]);
    }
  }

  private handleStorageQuotaExceeded(): void {
    try {
      // Remove oldest items to free up space
      if (this.cartItems.length > 10) {
        this.cartItems = this.cartItems.slice(-10); // Keep only last 10 items
        this.updateCart();
        console.warn('Storage quota exceeded, removed old items');
      }
    } catch (error) {
      console.error('Error handling storage quota exceeded:', error);
    }
  }

  // Migration support for old storage keys
  migrateFromOldStorage(): void {
    const oldKeys = ['cart', 'shopping_cart', 'user_cart'];
    
    oldKeys.forEach(oldKey => {
      try {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          const parsedData = JSON.parse(oldData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // Merge with current cart
            parsedData.forEach(item => {
              if (item && item.product && item.product._id) {
                this.addToCart(item.product, item.quantity || 1);
              }
            });
            
            // Remove old data
            localStorage.removeItem(oldKey);
            console.log(`Migrated data from ${oldKey}`);
          }
        }
      } catch (error) {
        console.error(`Error migrating from ${oldKey}:`, error);
      }
    });
  }
} 