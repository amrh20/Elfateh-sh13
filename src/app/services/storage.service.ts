import { Injectable } from '@angular/core';

export interface StorageInfo {
  used: number;
  available: number;
  percentage: number;
  quotaExceeded: boolean;
}

export interface StorageItem {
  key: string;
  value: any;
  size: number;
  lastModified: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_PREFIX = 'elfateh_';
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly WARNING_THRESHOLD = 80; // 80% usage warning

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage and migrate old data if needed
   */
  private initializeStorage(): void {
    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return;
      }

      // Migrate old data if exists
      this.migrateOldStorageKeys();

      // Clean up expired data
      this.cleanupExpiredData();

      // Check storage health
      this.checkStorageHealth();
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  /**
   * Check if localStorage is available and working
   */
  isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Set item in localStorage with validation and error handling
   */
  setItem(key: string, value: any): { success: boolean; message: string } {
    try {
      if (!this.isLocalStorageAvailable()) {
        return { success: false, message: 'localStorage غير متاح' };
      }

      const fullKey = this.STORAGE_PREFIX + key;
      const serializedValue = JSON.stringify(value);
      
      // Check storage quota
      const storageInfo = this.getStorageInfo();
      if (storageInfo.quotaExceeded) {
        return { success: false, message: 'مساحة التخزين ممتلئة' };
      }

      // Check if adding this item would exceed quota
      const newItemSize = new Blob([serializedValue]).size;
      if (storageInfo.used + newItemSize > this.MAX_STORAGE_SIZE) {
        return { success: false, message: 'مساحة التخزين غير كافية' };
      }

      // Add metadata
      const itemWithMetadata = {
        data: value,
        metadata: {
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          size: newItemSize,
          version: '1.0'
        }
      };

      localStorage.setItem(fullKey, JSON.stringify(itemWithMetadata));
      
      // Update storage info
      this.updateStorageInfo();
      
      return { success: true, message: 'تم حفظ البيانات بنجاح' };
    } catch (error) {
      console.error('Error setting storage item:', error);
      return { success: false, message: 'حدث خطأ أثناء حفظ البيانات' };
    }
  }

  /**
   * Get item from localStorage with validation
   */
  getItem<T>(key: string): { success: boolean; data?: T; message: string } {
    try {
      if (!this.isLocalStorageAvailable()) {
        return { success: false, message: 'localStorage غير متاح' };
      }

      const fullKey = this.STORAGE_PREFIX + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return { success: false, message: 'البيانات غير موجودة' };
      }

      const parsedItem = JSON.parse(item);
      
      // Validate item structure
      if (!parsedItem || !parsedItem.data) {
        return { success: false, message: 'بيانات غير صالحة' };
      }

      // Update last accessed
      parsedItem.metadata.lastAccessed = new Date().toISOString();
      localStorage.setItem(fullKey, JSON.stringify(parsedItem));

      return { success: true, data: parsedItem.data, message: 'تم استرجاع البيانات بنجاح' };
    } catch (error) {
      console.error('Error getting storage item:', error);
      return { success: false, message: 'حدث خطأ أثناء استرجاع البيانات' };
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): { success: boolean; message: string } {
    try {
      if (!this.isLocalStorageAvailable()) {
        return { success: false, message: 'localStorage غير متاح' };
      }

      const fullKey = this.STORAGE_PREFIX + key;
      localStorage.removeItem(fullKey);
      
      // Update storage info
      this.updateStorageInfo();
      
      return { success: true, message: 'تم حذف البيانات بنجاح' };
    } catch (error) {
      console.error('Error removing storage item:', error);
      return { success: false, message: 'حدث خطأ أثناء حذف البيانات' };
    }
  }

  /**
   * Clear all storage items with prefix
   */
  clearAll(): { success: boolean; message: string; clearedCount: number } {
    try {
      if (!this.isLocalStorageAvailable()) {
        return { success: false, message: 'localStorage غير متاح', clearedCount: 0 };
      }

      let clearedCount = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });

      // Update storage info
      this.updateStorageInfo();
      
      return { success: true, message: `تم مسح ${clearedCount} عنصر`, clearedCount };
    } catch (error) {
      console.error('Error clearing storage:', error);
      return { success: false, message: 'حدث خطأ أثناء مسح البيانات', clearedCount: 0 };
    }
  }

  /**
   * Get storage information and usage
   */
  getStorageInfo(): StorageInfo {
    try {
      if (!this.isLocalStorageAvailable()) {
        return { used: 0, available: this.MAX_STORAGE_SIZE, percentage: 0, quotaExceeded: false };
      }

      let totalUsed = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalUsed += new Blob([item]).size;
          }
        }
      });

      const percentage = (totalUsed / this.MAX_STORAGE_SIZE) * 100;
      const quotaExceeded = totalUsed > this.MAX_STORAGE_SIZE;

      return {
        used: totalUsed,
        available: this.MAX_STORAGE_SIZE,
        percentage,
        quotaExceeded
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: this.MAX_STORAGE_SIZE, percentage: 0, quotaExceeded: false };
    }
  }

  /**
   * Get all storage items with metadata
   */
  getAllItems(): StorageItem[] {
    try {
      if (!this.isLocalStorageAvailable()) {
        return [];
      }

      const items: StorageItem[] = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsedItem = JSON.parse(item);
              items.push({
                key: key.replace(this.STORAGE_PREFIX, ''),
                value: parsedItem.data,
                size: new Blob([item]).size,
                lastModified: new Date(parsedItem.metadata?.lastModified || Date.now())
              });
            } catch (error) {
              console.warn('Invalid item in storage:', key);
            }
          }
        }
      });

      return items.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    } catch (error) {
      console.error('Error getting all storage items:', error);
      return [];
    }
  }

  /**
   * Check storage health and log warnings
   */
  private checkStorageHealth(): void {
    const storageInfo = this.getStorageInfo();
    
    if (storageInfo.percentage > this.WARNING_THRESHOLD) {
      console.warn(`Storage usage is high: ${storageInfo.percentage.toFixed(2)}%`);
    }
    
    if (storageInfo.quotaExceeded) {
      console.error('Storage quota exceeded!');
    }
  }

  /**
   * Update storage info and check health
   */
  private updateStorageInfo(): void {
    this.checkStorageHealth();
  }

  /**
   * Migrate old storage keys to new format
   */
  private migrateOldStorageKeys(): void {
    const oldKeys = ['cart', 'wishlist', 'favorites', 'user_cart', 'user_wishlist'];
    
    oldKeys.forEach(oldKey => {
      try {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          // Try to parse and validate old data
          const parsedData = JSON.parse(oldData);
          if (parsedData && (Array.isArray(parsedData) || typeof parsedData === 'object')) {
            // Store in new format
            this.setItem(oldKey, parsedData);
            
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

  /**
   * Clean up expired data (older than 30 days)
   */
  private cleanupExpiredData(): void {
    try {
      const items = this.getAllItems();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      items.forEach(item => {
        if (item.lastModified < thirtyDaysAgo) {
          this.removeItem(item.key);
          console.log(`Cleaned up expired item: ${item.key}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }

  /**
   * Export storage data for backup
   */
  exportStorageData(): string {
    try {
      const items = this.getAllItems();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalItems: items.length,
        totalSize: items.reduce((sum, item) => sum + item.size, 0),
        items: items.map(item => ({
          key: item.key,
          value: item.value,
          size: item.size,
          lastModified: item.lastModified.toISOString()
        }))
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting storage data:', error);
      return '';
    }
  }

  /**
   * Import storage data from backup
   */
  importStorageData(data: string): { success: boolean; message: string; importedCount: number } {
    try {
      const parsedData = JSON.parse(data);
      
      if (!parsedData.items || !Array.isArray(parsedData.items)) {
        return { success: false, message: 'بيانات استيراد غير صالحة', importedCount: 0 };
      }

      let importedCount = 0;
      parsedData.items.forEach((item: any) => {
        if (item.key && item.value !== undefined) {
          const result = this.setItem(item.key, item.value);
          if (result.success) {
            importedCount++;
          }
        }
      });

      return { 
        success: true, 
        message: `تم استيراد ${importedCount} عنصر بنجاح`, 
        importedCount 
      };
    } catch (error) {
      console.error('Error importing storage data:', error);
      return { success: false, message: 'حدث خطأ أثناء استيراد البيانات', importedCount: 0 };
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalItems: number;
    totalSize: number;
    averageItemSize: number;
    oldestItem: Date | null;
    newestItem: Date | null;
  } {
    try {
      const items = this.getAllItems();
      
      if (items.length === 0) {
        return {
          totalItems: 0,
          totalSize: 0,
          averageItemSize: 0,
          oldestItem: null,
          newestItem: null
        };
      }

      const totalSize = items.reduce((sum, item) => sum + item.size, 0);
      const averageItemSize = totalSize / items.length;
      const oldestItem = items[items.length - 1]?.lastModified || null;
      const newestItem = items[0]?.lastModified || null;

      return {
        totalItems: items.length,
        totalSize,
        averageItemSize,
        oldestItem,
        newestItem
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        averageItemSize: 0,
        oldestItem: null,
        newestItem: null
      };
    }
  }
}
