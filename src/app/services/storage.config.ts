import { ApplicationConfig, InjectionToken } from '@angular/core';
import { StorageService } from './storage.service';
import { CartService } from './cart.service';
import { WishlistService } from './wishlist.service';
import { NotificationService } from './notification.service';

// Injection tokens for configuration
export const STORAGE_CONFIG = new InjectionToken<StorageConfig>('STORAGE_CONFIG');
export const CART_CONFIG = new InjectionToken<CartConfig>('CART_CONFIG');
export const WISHLIST_CONFIG = new InjectionToken<WishlistConfig>('WISHLIST_CONFIG');

// Configuration interfaces
export interface StorageConfig {
  prefix: string;
  maxSize: number;
  warningThreshold: number;
  cleanupInterval: number;
  enableMigration: boolean;
  enableBackup: boolean;
}

export interface CartConfig {
  maxItems: number;
  enableQuantityValidation: boolean;
  enablePriceCalculation: boolean;
  enableDiscountCalculation: boolean;
}

export interface WishlistConfig {
  maxItems: number;
  enableSearch: boolean;
  enableFiltering: boolean;
  enableExport: boolean;
}

// Default configurations
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  prefix: 'elfateh_',
  maxSize: 5 * 1024 * 1024, // 5MB
  warningThreshold: 80, // 80%
  cleanupInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
  enableMigration: true,
  enableBackup: true
};

export const DEFAULT_CART_CONFIG: CartConfig = {
  maxItems: 100,
  enableQuantityValidation: true,
  enablePriceCalculation: true,
  enableDiscountCalculation: true
};

export const DEFAULT_WISHLIST_CONFIG: WishlistConfig = {
  maxItems: 200,
  enableSearch: true,
  enableFiltering: true,
  enableExport: true
};

// Factory functions
export function provideStorageService(config: Partial<StorageConfig> = {}) {
  return {
    provide: StorageService,
    useFactory: () => {
      const mergedConfig = { ...DEFAULT_STORAGE_CONFIG, ...config };
      return new StorageService();
    }
  };
}

export function provideCartService(config: Partial<CartConfig> = {}) {
  return {
    provide: CartService,
    useFactory: () => {
      const mergedConfig = { ...DEFAULT_CART_CONFIG, ...config };
      return new CartService();
    }
  };
}

export function provideWishlistService(config: Partial<WishlistConfig> = {}) {
  return {
    provide: WishlistService,
    useFactory: () => {
      const mergedConfig = { ...DEFAULT_WISHLIST_CONFIG, ...config };
      return new WishlistService();
    }
  };
}

export function provideNotificationService() {
  return {
    provide: NotificationService,
    useFactory: () => {
      return new NotificationService();
    }
  };
}

// Main provider function
export function provideLocalStorage(
  storageConfig: Partial<StorageConfig> = {},
  cartConfig: Partial<CartConfig> = {},
  wishlistConfig: Partial<WishlistConfig> = {}
) {
  return [
    provideStorageService(storageConfig),
    provideCartService(cartConfig),
    provideWishlistService(wishlistConfig),
    provideNotificationService()
  ];
}

// Environment-specific configurations
export const PRODUCTION_STORAGE_CONFIG: StorageConfig = {
  ...DEFAULT_STORAGE_CONFIG,
  maxSize: 10 * 1024 * 1024, // 10MB for production
  warningThreshold: 70, // Lower threshold for production
  cleanupInterval: 7 * 24 * 60 * 60 * 1000 // 7 days for production
};

export const DEVELOPMENT_STORAGE_CONFIG: StorageConfig = {
  ...DEFAULT_STORAGE_CONFIG,
  maxSize: 2 * 1024 * 1024, // 2MB for development
  warningThreshold: 90, // Higher threshold for development
  cleanupInterval: 1 * 24 * 60 * 60 * 1000 // 1 day for development
};

// Utility functions
export function getStorageConfig(environment: 'production' | 'development' | 'test' = 'development'): StorageConfig {
  switch (environment) {
    case 'production':
      return PRODUCTION_STORAGE_CONFIG;
    case 'test':
      return { ...DEFAULT_STORAGE_CONFIG, maxSize: 1 * 1024 * 1024 }; // 1MB for testing
    default:
      return DEVELOPMENT_STORAGE_CONFIG;
  }
}

export function validateStorageConfig(config: StorageConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.maxSize <= 0) {
    errors.push('maxSize يجب أن يكون أكبر من صفر');
  }

  if (config.warningThreshold < 0 || config.warningThreshold > 100) {
    errors.push('warningThreshold يجب أن يكون بين 0 و 100');
  }

  if (config.cleanupInterval <= 0) {
    errors.push('cleanupInterval يجب أن يكون أكبر من صفر');
  }

  if (!config.prefix || config.prefix.trim() === '') {
    errors.push('prefix مطلوب');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Migration utilities
export function migrateStorageData(
  oldPrefix: string,
  newPrefix: string,
  storageService: StorageService
): { success: boolean; migratedCount: number; errors: string[] } {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(oldPrefix)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const newKey = key.replace(oldPrefix, newPrefix);
            localStorage.setItem(newKey, data);
            localStorage.removeItem(key);
            migratedCount++;
          }
        } catch (error) {
          errors.push(`فشل في هجرة ${key}: ${error}`);
        }
      }
    });

    return { success: true, migratedCount, errors };
  } catch (error) {
    errors.push(`خطأ عام في الهجرة: ${error}`);
    return { success: false, migratedCount, errors };
  }
}

// Backup utilities
export function createStorageBackup(
  storageService: StorageService,
  includeMetadata: boolean = true
): string {
  try {
    const items = storageService.getAllItems();
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      itemCount: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      items: items.map(item => ({
        key: item.key,
        value: item.value,
        size: item.size,
        lastModified: item.lastModified.toISOString(),
        ...(includeMetadata && { metadata: { backup: true } })
      }))
    };

    return JSON.stringify(backup, null, 2);
  } catch (error) {
    throw new Error(`فشل في إنشاء النسخة الاحتياطية: ${error}`);
  }
}

export function restoreStorageBackup(
  backupData: string,
  storageService: StorageService,
  clearExisting: boolean = false
): { success: boolean; restoredCount: number; errors: string[] } {
  const errors: string[] = [];
  let restoredCount = 0;

  try {
    const backup = JSON.parse(backupData);
    
    if (!backup.items || !Array.isArray(backup.items)) {
      throw new Error('بيانات النسخة الاحتياطية غير صالحة');
    }

    if (clearExisting) {
      storageService.clearAll();
    }

    backup.items.forEach((item: any) => {
      try {
        if (item.key && item.value !== undefined) {
          const result = storageService.setItem(item.key, item.value);
          if (result.success) {
            restoredCount++;
          } else {
            errors.push(`فشل في استعادة ${item.key}: ${result.message}`);
          }
        }
      } catch (error) {
        errors.push(`خطأ في استعادة ${item.key}: ${error}`);
      }
    });

    return { success: true, restoredCount, errors };
  } catch (error) {
    errors.push(`خطأ عام في الاستعادة: ${error}`);
    return { success: false, restoredCount: 0, errors };
  }
}
