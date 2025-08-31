import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';
import { Product, Category, Order } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { register } from 'swiper/element/bundle';

// Register Swiper elements
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  bestSellers: any[] = [];
  onSaleProducts: Product[] = [];
  currentOrder: Order | null = null;
  
  // Storage info
  storageInfo: any = null;
  cartSize = 0;
  wishlistSize = 0;

  constructor(
    private productService: ProductService,
    public orderService: OrderService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.viewportScroller.scrollToPosition([0, 0]);
    
    this.loadCategories();
    this.loadFeaturedProducts();
    this.loadBestSellers();
    this.loadOnSaleProducts();
    this.loadCurrentOrder();
    this.loadStorageInfo();
    this.subscribeToServices();
    
    // Test API response structure
    this.testAPIResponse();
  }

  // Data loading methods
  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log(this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.notificationService.error('خطأ', 'فشل في تحميل الأصناف');
      }
    });
  }

  loadFeaturedProducts(): void {
    this.productService.getFeaturedProductsFromAPI().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        console.log('Featured Products loaded:', products);
        console.log('Featured Products count:', products.length);
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.notificationService.error('خطأ', 'فشل في تحميل المنتجات المميزة');
      }
    });
  }

  loadBestSellers(): void {
    this.productService.getBestSellersFromAPI().subscribe({
      next: (products) => {
        this.bestSellers = products;
        console.log('Best Sellers loaded:', products);
        console.log('Best Sellers count:', products.length);
      },
      error: (error) => {
        console.error('Error loading best sellers:', error);
        this.notificationService.error('خطأ', 'فشل في تحميل الأكثر مبيعاً');
      }
    });
  }

  loadOnSaleProducts(): void {
    this.productService.getSpecialOfferProductsFromAPI().subscribe({
      next: (products) => {
        this.onSaleProducts = products;
        console.log('Special Offer Products loaded:', products);
        console.log('Special Offer Products count:', products.length);
      },
      error: (error) => {
        console.error('Error loading special offer products:', error);
        this.notificationService.error('خطأ', 'فشل في تحميل العروض الخاصة');
      }
    });
  }

  loadCurrentOrder(): void {
    this.orderService.getCurrentOrder().subscribe({
      next: (order) => {
        this.currentOrder = order;
      },
      error: (error) => {
        console.error('Error loading current order:', error);
        // Don't show error for this as it's not critical
      }
    });
  }

  loadStorageInfo(): void {
    try {
      this.storageInfo = this.storageService.getStorageInfo();
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  }

  subscribeToServices(): void {
    // Subscribe to cart changes
    this.cartService.getCartItems().subscribe(items => {
      this.cartSize = this.cartService.getCartSize();
    });

    // Subscribe to wishlist changes
    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistSize = this.wishlistService.getWishlistSize();
    });
  }

  onAddToCart(product: Product): void {
    // Product added to cart via product card component
    console.log('Product added to cart:', product.name);
    
    // Show success message
    this.notificationService.success('تم الإضافة', `${product.name} تم إضافته إلى السلة بنجاح`);
  }

  // Storage management methods
  clearStorage(): void {
    if (confirm('هل أنت متأكد من مسح جميع البيانات المحفوظة؟')) {
      const result = this.storageService.clearAll();
      this.notificationService.showStorageResult(result);
      
      if (result.success) {
        this.loadStorageInfo();
      }
    }
  }

  exportStorageData(): void {
    try {
      const data = this.storageService.exportStorageData();
      if (data) {
        // Create download link
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elfateh_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.notificationService.success('تم التصدير', 'تم تصدير البيانات بنجاح');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      this.notificationService.error('خطأ', 'فشل في تصدير البيانات');
    }
  }

  importStorageData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const result = this.storageService.importStorageData(e.target.result);
          this.notificationService.showStorageResult(result);
          
          if (result.success) {
            this.loadStorageInfo();
            // Refresh data
            this.subscribeToServices();
          }
        } catch (error) {
          console.error('Error importing data:', error);
          this.notificationService.error('خطأ', 'فشل في استيراد البيانات');
        }
      };
      reader.readAsText(file);
    }
  }

  // Get storage usage percentage
  getStorageUsagePercentage(): number {
    return this.storageInfo ? this.storageInfo.percentage : 0;
  }

  // Get storage usage color
  getStorageUsageColor(): string {
    const percentage = this.getStorageUsagePercentage();
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  }

  // Check if storage is healthy
  isStorageHealthy(): boolean {
    return this.storageInfo ? !this.storageInfo.quotaExceeded : true;
  }

  // Helper method to clean image URLs from API response
  getCleanImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // Remove data-src wrapper if exists
    if (imageUrl.includes('data-src=')) {
      const match = imageUrl.match(/data-src="([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Remove extra quotes if exists
    if (imageUrl.startsWith('"') && imageUrl.endsWith('"')) {
      return imageUrl.slice(1, -1);
    }
    
    // Remove escaped quotes if exists
    if (imageUrl.includes('\\"')) {
      return imageUrl.replace(/\\"/g, '');
    }
    
    return imageUrl;
  }

  // Test API response structure
  testAPIResponse(): void {
    this.productService.testAPIResponse().subscribe({
      next: (response) => {
        console.log('API Test completed in home component');
      },
      error: (error) => {
        console.error('API Test failed in home component:', error);
      }
    });
  }
}