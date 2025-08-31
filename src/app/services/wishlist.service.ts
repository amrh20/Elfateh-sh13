import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistItems: any[] = [];
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  private readonly STORAGE_KEY = 'elfateh_wishlist';
  private readonly MAX_WISHLIST_ITEMS = 200; // Prevent excessive storage usage

  constructor() {
    this.loadWishlistFromStorage();
  }

  getWishlistItems(): Observable<Product[]> {
    return this.wishlistSubject.asObservable();
  }

  getWishlistItemsValue(): Product[] {
    return this.wishlistItems;
  }

  addToWishlist(product: any): { success: boolean; message: string } {
    try {
      // Validate input
      const productId = product._id || product.id;
      if (!product || !productId) {
        return { success: false, message: 'منتج غير صالح' };
      }

      // Check if already in wishlist
      if (this.isInWishlist(productId)) {
        return { success: false, message: 'المنتج موجود بالفعل في المفضلة' };
      }

      // Check storage quota
      if (this.wishlistItems.length >= this.MAX_WISHLIST_ITEMS) {
        return { success: false, message: 'قائمة المفضلة ممتلئة، يرجى إزالة بعض المنتجات أولاً' };
      }

      this.wishlistItems.push(product);
      this.updateWishlist();
      return { success: true, message: `تم إضافة ${product.name} إلى المفضلة` };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'حدث خطأ أثناء إضافة المنتج للمفضلة' };
    }
  }

  removeFromWishlist(productId: number | string): { success: boolean; message: string } {
    try {
      const item = this.wishlistItems.find((item: any) => (item._id || item.id) === productId);
      if (!item) {
        return { success: false, message: 'المنتج غير موجود في المفضلة' };
      }

      this.wishlistItems = this.wishlistItems.filter(item => (item._id || item.id) !== productId);
      this.updateWishlist();
      return { success: true, message: `تم إزالة ${item.name} من المفضلة` };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'حدث خطأ أثناء إزالة المنتج من المفضلة' };
    }
  }

  isInWishlist(productId: number | string): boolean {
    return this.wishlistItems.some(item => (item._id || item.id) === productId);
  }

  clearWishlist(): { success: boolean; message: string } {
    try {
      this.wishlistItems = [];
      this.updateWishlist();
      return { success: true, message: 'تم تفريغ قائمة المفضلة بنجاح' };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, message: 'حدث خطأ أثناء تفريغ قائمة المفضلة' };
    }
  }

  getWishlistCount(): number {
    return this.wishlistItems.length;
  }

  getWishlistSize(): number {
    return this.wishlistItems.length;
  }

  isWishlistEmpty(): boolean {
    return this.wishlistItems.length === 0;
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
      const wishlistData = localStorage.getItem(this.STORAGE_KEY) || '';
      const used = new Blob([wishlistData]).size;
      const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Move item from wishlist to cart (useful for quick actions)
  moveToCart(product: Product): { success: boolean; message: string } {
    try {
      const productId = product._id || product.id;
      if (!productId) {
        return { success: false, message: 'معرف المنتج غير صالح' };
      }
      
      const result = this.removeFromWishlist(productId);
      if (result.success) {
        return { success: true, message: `تم نقل ${product.name} من المفضلة إلى السلة` };
      }
      return result;
    } catch (error) {
      console.error('Error moving item to cart:', error);
      return { success: false, message: 'حدث خطأ أثناء نقل المنتج' };
    }
  }

  // Get products by category
  getProductsByCategory(category: string): Product[] {
    return this.wishlistItems.filter(item => item.category === category);
  }

  // Get products by brand
  getProductsByBrand(brand: string): Product[] {
    return this.wishlistItems.filter(item => item.brand === brand);
  }

  // Search in wishlist
  searchInWishlist(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.wishlistItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.brand.toLowerCase().includes(lowerQuery)
    );
  }

  private updateWishlist(): void {
    this.wishlistSubject.next([...this.wishlistItems]);
    this.saveWishlistToStorage();
  }

  private saveWishlistToStorage(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      const wishlistData = JSON.stringify(this.wishlistItems);
      
      // Check storage quota before saving
      const storageInfo = this.getStorageInfo();
      if (storageInfo.percentage > 80) {
        console.warn('Storage usage is high:', storageInfo.percentage.toFixed(2) + '%');
      }

      localStorage.setItem(this.STORAGE_KEY, wishlistData);
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
      
      // If storage is full, try to clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded();
      }
    }
  }

  private loadWishlistFromStorage(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available, starting with empty wishlist');
      return;
    }

    try {
      const savedWishlist = localStorage.getItem(this.STORAGE_KEY);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        
        // Validate parsed data
        if (Array.isArray(parsedWishlist)) {
          this.wishlistItems = parsedWishlist.filter(item => 
            item && 
            (item._id || item.id) && 
            item.name && 
            item.price &&
            typeof item.price === 'number'
          );
        } else {
          console.warn('Invalid wishlist data format, starting with empty wishlist');
          this.wishlistItems = [];
        }
        
        this.wishlistSubject.next([...this.wishlistItems]);
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      this.wishlistItems = [];
      this.wishlistSubject.next([...this.wishlistItems]);
    }
  }

  private handleStorageQuotaExceeded(): void {
    try {
      // Remove oldest items to free up space
      if (this.wishlistItems.length > 20) {
        this.wishlistItems = this.wishlistItems.slice(-20); // Keep only last 20 items
        this.updateWishlist();
        console.warn('Storage quota exceeded, removed old items');
      }
    } catch (error) {
      console.error('Error handling storage quota exceeded:', error);
    }
  }

  // Migration support for old storage keys
  migrateFromOldStorage(): void {
    const oldKeys = ['wishlist', 'favorites', 'user_wishlist'];
    
    oldKeys.forEach(oldKey => {
      try {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          const parsedData = JSON.parse(oldData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // Merge with current wishlist
            parsedData.forEach(item => {
              const itemId = item._id || item.id;
              if (item && itemId && !this.isInWishlist(itemId)) {
                this.addToWishlist(item);
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

  // Export wishlist data
  exportWishlist(): string {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        itemCount: this.wishlistItems.length,
        items: this.wishlistItems
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting wishlist:', error);
      return '';
    }
  }

  // Import wishlist data
  importWishlist(data: string): { success: boolean; message: string; importedCount: number } {
    try {
      const parsedData = JSON.parse(data);
      
      if (!parsedData.items || !Array.isArray(parsedData.items)) {
        return { success: false, message: 'بيانات غير صالحة', importedCount: 0 };
      }

      let importedCount = 0;
      parsedData.items.forEach((item: any) => {
        const itemId = item._id || item.id;
        if (item && itemId && !this.isInWishlist(itemId)) {
          this.addToWishlist(item);
          importedCount++;
        }
      });

      return { 
        success: true, 
        message: `تم استيراد ${importedCount} منتج بنجاح`, 
        importedCount 
      };
    } catch (error) {
      console.error('Error importing wishlist:', error);
      return { success: false, message: 'حدث خطأ أثناء استيراد البيانات', importedCount: 0 };
    }
  }
} 