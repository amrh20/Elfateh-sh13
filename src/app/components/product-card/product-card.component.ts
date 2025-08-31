import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';
import { Product } from '../../models/product.model';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  animations: [
    // أنيميشن إضافة للسلة
    trigger('cartAnimation', [
      state('normal', style({ transform: 'scale(1)' })),
      state('added', style({ transform: 'scale(1.1)' })),
      transition('normal => added', [
        animate('300ms ease-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.2)', offset: 0.5 }),
          style({ transform: 'scale(1.1)', offset: 1 })
        ]))
      ]),
      transition('added => normal', [
        animate('200ms ease-in')
      ])
    ]),
    
    // أنيميشن إضافة للمفضلة
    trigger('wishlistAnimation', [
      state('normal', style({ transform: 'scale(1) rotate(0deg)' })),
      state('added', style({ transform: 'scale(1.2) rotate(360deg)' })),
      state('removed', style({ transform: 'scale(0.8) rotate(-180deg)' })),
      transition('normal => added', [
        animate('400ms ease-out', keyframes([
          style({ transform: 'scale(1) rotate(0deg)', offset: 0 }),
          style({ transform: 'scale(1.3) rotate(180deg)', offset: 0.5 }),
          style({ transform: 'scale(1.2) rotate(360deg)', offset: 1 })
        ]))
      ]),
      transition('normal => removed', [
        animate('300ms ease-in', keyframes([
          style({ transform: 'scale(1) rotate(0deg)', offset: 0 }),
          style({ transform: 'scale(0.6) rotate(-90deg)', offset: 0.5 }),
          style({ transform: 'scale(0.8) rotate(-180deg)', offset: 1 })
        ]))
      ]),
      transition('added => normal', [
        animate('200ms ease-in')
      ]),
      transition('removed => normal', [
        animate('200ms ease-in')
      ])
    ]),
    
    // أنيميشن النص
    trigger('textAnimation', [
      state('normal', style({ opacity: 1, transform: 'translateY(0)' })),
      state('changed', style({ opacity: 0.8, transform: 'translateY(-5px)' })),
      transition('normal => changed', [
        animate('200ms ease-out')
      ]),
      transition('changed => normal', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class ProductCardComponent {
  @Input() product!: any;
  @Output() addToCartEvent = new EventEmitter<Product>();

  // حالات الأنيميشن
  cartAnimationState = 'normal';
  wishlistAnimationState = 'normal';
  textAnimationState = 'normal';
  
  // حالة tooltip الوصف
  showDescriptionTooltip = false;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private notificationService: NotificationService
  ) {}

  get isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product._id || this.product.id);
  }

  // إظهار tooltip الوصف
  showDescription(): void {
    this.showDescriptionTooltip = true;
  }

  // إخفاء tooltip الوصف
  hideDescription(): void {
    this.showDescriptionTooltip = false;
  }

  addToCart(): void {
    if (this.product.stock) {
      console.log(this.product);
      // تشغيل أنيميشن الإضافة
      this.cartAnimationState = 'added';
      
      const result = this.cartService.addToCart(this.product);
      
      // Show notification
      this.notificationService.showCartResult(result);
      
      // Emit event if successful
      if (result.success) {
        this.addToCartEvent.emit(this.product);
        
        // تشغيل أنيميشن النص
        this.textAnimationState = 'changed';
        setTimeout(() => {
          this.textAnimationState = 'normal';
        }, 200);
      }
      
      // إعادة تعيين حالة أنيميشن السلة
      setTimeout(() => {
        this.cartAnimationState = 'normal';
      }, 300);
    } else {
      this.notificationService.error('غير متوفر', 'هذا المنتج غير متوفر حالياً');
    }
  }

  toggleWishlist(): void {
    if (this.isInWishlist) {
      // أنيميشن الإزالة
      this.wishlistAnimationState = 'removed';
      
      const result = this.wishlistService.removeFromWishlist(this.product._id || this.product.id);
      this.notificationService.showWishlistResult(result);
      
      // إعادة تعيين الحالة
      setTimeout(() => {
        this.wishlistAnimationState = 'normal';
      }, 300);
    } else {
      // أنيميشن الإضافة
      this.wishlistAnimationState = 'added';
      
      const result = this.wishlistService.addToWishlist(this.product);
      this.notificationService.showWishlistResult(result);
      
      // إعادة تعيين الحالة
      setTimeout(() => {
        this.wishlistAnimationState = 'normal';
      }, 400);
    }
  }

  // Quick add to cart with quantity
  quickAddToCart(quantity: number = 1): void {
    if (this.product.stock) {
      this.cartAnimationState = 'added';
      
      const result = this.cartService.addToCart(this.product, quantity);
      this.notificationService.showCartResult(result);
      
      if (result.success) {
        this.addToCartEvent.emit(this.product);
      }
      
      setTimeout(() => {
        this.cartAnimationState = 'normal';
      }, 300);
    } else {
      this.notificationService.error('غير متوفر', 'هذا المنتج غير متوفر حالياً');
    }
  }

  // Move from wishlist to cart
  moveToCart(): void {
    if (this.isInWishlist) {
      this.cartAnimationState = 'added';
      this.wishlistAnimationState = 'removed';
      
      const result = this.wishlistService.moveToCart(this.product);
      this.notificationService.showWishlistResult(result);
      
      if (result.success) {
        this.addToCartEvent.emit(this.product);
      }
      
      setTimeout(() => {
        this.cartAnimationState = 'normal';
        this.wishlistAnimationState = 'normal';
      }, 400);
    }
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

  // Price and Discount Methods
  hasDiscount(): boolean {
    return (this.product.discount && this.product.discount > 0) || 
           (this.product.priceAfterDiscount && this.product.priceAfterDiscount < this.product.price) ||
           this.product.isOnSale;
  }

  getCurrentPrice(): number {
    if (this.product.priceAfterDiscount && this.product.priceAfterDiscount > 0) {
      return this.product.priceAfterDiscount;
    }
    
    if (this.product.discount && this.product.discount > 0) {
      return Math.max(0, this.product.price - this.product.discount);
    }
    
    return this.product.price;
  }

  getDiscountAmount(): number {
    if (this.product.discount && this.product.discount > 0) {
      return this.product.discount;
    }
    
    if (this.product.priceAfterDiscount && this.product.priceAfterDiscount > 0) {
      return this.product.price - this.product.priceAfterDiscount;
    }
    
    return 0;
  }

  calculateDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    
    const originalPrice = this.product.price;
    const discountAmount = this.getDiscountAmount();
    
    if (originalPrice > 0) {
      return Math.round((discountAmount / originalPrice) * 100);
    }
    
    return 0;
  }
} 