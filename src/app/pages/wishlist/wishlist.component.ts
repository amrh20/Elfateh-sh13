import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationDialogService,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.viewportScroller.scrollToPosition([0, 0]);
    
    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistItems = items;
    });
  }

  onAddToCart(product: any): void {
    // Product added to cart via product card component
    // يتم حذف المنتج من المفضلة بعد إضافته للسلة بنجاح
    setTimeout(() => {
      const productId = product._id || product.id;
      if (productId) {
        this.wishlistService.removeFromWishlist(productId);
        this.notificationService.info(
          'تم الحذف من المفضلة', 
          `تم حذف ${product.name} من المفضلة بعد إضافته للسلة`
        );
      }
    }, 500); // تأخير بسيط للسماح بإتمام عملية الإضافة للسلة
  }

  async addAllToCart(): Promise<void> {
    if (this.wishlistItems.length === 0) {
      this.notificationService.warning('المفضلة فارغة', 'لا توجد منتجات في المفضلة لإضافتها للسلة');
      return;
    }

    // تأكيد من المستخدم باستخدام popup جميل
    const confirmed = await this.confirmationService.confirmSuccess(
      'إضافة المنتجات للسلة',
      `هل تريد إضافة المنتجات (${this.wishlistItems.length}) إلى السلة وحذفها من المفضلة؟`,
      '✅ نعم، أضف الكل',
      '❌ إلغاء'
    );

    if (!confirmed) {
      return;
    }

    let addedCount = 0;
    let errorCount = 0;
    const productsToRemove: (string | number)[] = [];

    this.wishlistItems.forEach(product => {
      // التحقق من توفر المنتج
      if (product.stock || product.inStock) {
        const result = this.cartService.addToCart(product);
        if (result.success) {
          addedCount++;
          // إضافة معرف المنتج لقائمة الحذف من المفضلة
          productsToRemove.push(product._id || product.id);
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    });

    // حذف المنتجات المضافة بنجاح من المفضلة
    productsToRemove.forEach(productId => {
      this.wishlistService.removeFromWishlist(productId);
    });

    // عرض النتائج للمستخدم
    if (addedCount > 0) {
      if (errorCount === 0) {
        this.notificationService.success(
          'تم بنجاح!', 
          `تم إضافة المنتجات (${addedCount}) إلى السلة وحذفها من المفضلة`
        );
      } else {
        this.notificationService.success(
          'تم جزئياً', 
          `تم إضافة ${addedCount} منتج للسلة. ${errorCount} منتج غير متوفر`
        );
      }
    } else {
      this.notificationService.error(
        'فشل العملية', 
        'لم يتم إضافة أي منتج. المنتجات غير متوفرة'
      );
    }
  }

  async clearWishlist(): Promise<void> {
    const confirmed = await this.confirmationService.confirmDanger(
      'مسح جميع المنتجات',
      'هل أنت متأكد من حذف المنتجات من المفضلة؟ لا يمكن التراجع عن هذا الإجراء.',
      '🗑️ نعم، احذف الكل',
      '❌ إلغاء'
    );

    if (confirmed) {
      const result = this.wishlistService.clearWishlist();
      this.notificationService.showWishlistResult(result);
    }
  }
} 