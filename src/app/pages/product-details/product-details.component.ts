import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  selectedImage: string = '';
  quantity: number = 1;
  
  // Lightbox properties
  showLightbox: boolean = false;
  lightboxImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.viewportScroller.scrollToPosition([0, 0]);
    
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(productId: string | number): void {
    this.productService.getProductById(productId).subscribe(product => {
      this.product = product;
      if (product && product.images && product.images.length > 0) {
        this.selectedImage = product?.images[0];
      }
    });
  }

  get isInWishlist(): boolean {
    return this.product && this.product._id ? this.wishlistService.isInWishlist(this.product._id) : false;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product && this.product.stock) {
      this.cartService.addToCart(this.product, this.quantity);
      // Show success message or redirect to cart
    }
  }

  toggleWishlist(): void {
    if (this.product && this.product._id) {
      if (this.isInWishlist) {
        this.wishlistService.removeFromWishlist(this.product._id);
      } else {
        this.wishlistService.addToWishlist(this.product);
      }
    }
  }

  getSpecifications(): { key: string; value: string }[] {
    if (!this.product?.specifications) return [];
    return Object.entries(this.product.specifications).map(([key, value]) => ({
      key,
      value
    }));
  }

  // Lightbox Methods
  openLightbox(image: string): void {
    this.lightboxImage = image;
    this.showLightbox = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.showLightbox = false;
    document.body.style.overflow = '';
  }

  nextImage(): void {
    if (!this.product?.images) return;
    const currentIndex = this.getCurrentImageIndex();
    const nextIndex = (currentIndex + 1) % this.product.images.length;
    this.lightboxImage = this.product.images[nextIndex];
    this.selectedImage = this.product.images[nextIndex];
  }

  previousImage(): void {
    if (!this.product?.images) return;
    const currentIndex = this.getCurrentImageIndex();
    const prevIndex = currentIndex === 0 ? this.product.images.length - 1 : currentIndex - 1;
    this.lightboxImage = this.product.images[prevIndex];
    this.selectedImage = this.product.images[prevIndex];
  }

  getCurrentImageIndex(): number {
    if (!this.product?.images) return 0;
    return this.product.images.findIndex(img => img === this.lightboxImage);
  }

  // Price and Discount Methods
  hasDiscount(): boolean {
    return !!(this.product?.discount && this.product.discount > 0) || 
           !!(this.product?.priceAfterDiscount && this.product.priceAfterDiscount < this.product.price) ||
           !!(this.product?.isOnSale);
  }

  getCurrentPrice(): number {
    if (!this.product) return 0;
    
    if (this.product.priceAfterDiscount && this.product.priceAfterDiscount > 0) {
      return this.product.priceAfterDiscount;
    }
    
    if (this.product.discount && this.product.discount > 0) {
      return Math.max(0, this.product.price - this.product.discount);
    }
    
    return this.product.price;
  }

  getDiscountAmount(): number {
    if (!this.product) return 0;
    
    if (this.product.discount && this.product.discount > 0) {
      return this.product.discount;
    }
    
    if (this.product.priceAfterDiscount && this.product.priceAfterDiscount > 0) {
      return this.product.price - this.product.priceAfterDiscount;
    }
    
    return 0;
  }

  calculateDiscountPercentage(): number {
    if (!this.hasDiscount() || !this.product) return 0;
    
    const originalPrice = this.product.price;
    const discountAmount = this.getDiscountAmount();
    
    if (originalPrice > 0) {
      return Math.round((discountAmount / originalPrice) * 100);
    }
    
    return 0;
  }
} 