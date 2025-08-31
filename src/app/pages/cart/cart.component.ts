import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalItems = 0;
  subtotal = 0;
  discount = 0;
  total = 0;
  
  // Coupon functionality
  couponCode: string = '';
  appliedCoupon: string = '';
  couponDiscount: number = 0;
  isCouponValid: boolean = false;
  couponMessage: string = '';
  
  // Fixed shipping cost
  deliveryFee: number = 20;
  
  // Authentication popup
  showAuthPopup: boolean = false;
  isLoginMode: boolean = true;
  authForm: FormGroup;
  isAuthLoading: boolean = false;
  authMessage: string = '';
  
  checkoutForm: FormGroup;
  isSubmitting = false;
  currentStep = 1; // Step 1: Cart Review, Step 2: Payment Details
  showSuccessDialog = false; // New property for success dialog

  constructor(
    private cartService: CartService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
      deliveryAddress: ['', [Validators.required]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      additionalNotes: [''],
      paymentMethod: ['cash_on_delivery', Validators.required]
    });
    
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.viewportScroller.scrollToPosition([0, 0]);
    
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });

    // Reset form state to ensure no validation errors show initially
    this.resetFormState();
  }

  resetFormState(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }

  calculateTotals(): void {
    this.totalItems = this.cartService.getTotalItems();
    
    // Calculate subtotal (original prices)
    this.subtotal = this.cartItems.reduce((sum, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      return sum + (originalPrice * item.quantity);
    }, 0);

    // Calculate discount only if there's a valid coupon
    if (this.appliedCoupon) {
      this.discount = this.cartItems.reduce((sum, item) => {
        if (item.product.originalPrice) {
          const savings = (item.product.originalPrice - item.product.price) * item.quantity;
          return sum + savings;
        }
        return sum;
      }, 0);
    } else {
      this.discount = 0;
    }

    // Calculate total with coupon and shipping
    this.total = this.subtotal - this.discount - this.couponDiscount + this.deliveryFee;
  }

  applyCoupon(): void {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      this.showAuthPopup = true;
      this.isLoginMode = true;
      this.couponMessage = 'يرجى تسجيل الدخول أولاً لاستخدام الكوبون';
      return;
    }

    if (!this.couponCode.trim()) {
      this.couponMessage = 'يرجى إدخال كود الكوبون';
      this.isCouponValid = false;
      return;
    }

    // Simulate coupon validation - you can replace this with actual API call
    const validCoupons: { [key: string]: number } = {
      'WELCOME10': 10, // 10% discount
      'SAVE20': 20,    // 20% discount
      'FREESHIP': 20,  // Free shipping (20 LE)
      'DISCOUNT50': 50 // 50 LE discount
    };

    const coupon = this.couponCode.trim().toUpperCase();
    
    if (validCoupons[coupon]) {
      this.appliedCoupon = coupon;
      this.isCouponValid = true;
      
      if (coupon === 'FREESHIP') {
        this.couponDiscount = this.deliveryFee;
        this.couponMessage = 'تم تطبيق الكوبون! الشحن مجاني';
      } else if (coupon === 'DISCOUNT50') {
        this.couponDiscount = 50;
        this.couponMessage = `تم تطبيق الكوبون! خصم ${this.couponDiscount} جنيه`;
      } else {
        // Percentage discount
        const discountPercentage = validCoupons[coupon];
        this.couponDiscount = (this.subtotal * discountPercentage) / 100;
        this.couponMessage = `تم تطبيق الكوبون! خصم ${discountPercentage}%`;
      }
      
      this.calculateTotals();
    } else {
      this.appliedCoupon = '';
      this.couponDiscount = 0;
      this.isCouponValid = false;
      this.couponMessage = 'كود الكوبون غير صحيح';
    }
  }

  removeCoupon(): void {
    this.appliedCoupon = '';
    this.couponDiscount = 0;
    this.couponCode = '';
    this.isCouponValid = false;
    this.couponMessage = '';
    this.calculateTotals();
  }

  getItemPrice(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  async submitOrder(): Promise<void> {
    if (this.checkoutForm.invalid) return;

    this.isSubmitting = true;

    try {
      // Create order object
      const order = {
        items: this.cartItems,
        totalAmount: this.total,
        deliveryInfo: this.checkoutForm.value,
        couponCode: this.appliedCoupon,
        couponDiscount: this.couponDiscount,
        deliveryFee: this.deliveryFee,
        orderDate: new Date(),
        status: 'pending'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart
      this.cartService.clearCart();

      // Show success dialog
      this.showSuccessDialog = true;

      // After 3 seconds, redirect to home page
      setTimeout(() => {
        this.closeSuccessDialog();
        this.router.navigate(['/']);
      }, 3000);

    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  // New method to close success dialog and redirect
  closeSuccessDialog(): void {
    this.showSuccessDialog = false;
    this.router.navigate(['/']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Step navigation methods
  goToStep(step: number): void {
    this.currentStep = step;
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  nextStep(): void {
    if (this.currentStep < 2) {
      this.currentStep++;
      this.viewportScroller.scrollToPosition([0, 0]);
      // Reset form validation state when moving to step 2
      this.resetFormState();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.viewportScroller.scrollToPosition([0, 0]);
    }
  }

  canProceedToPayment(): boolean {
    return this.cartItems.length > 0;
  }

  // Authentication methods
  toggleAuthMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.authMessage = '';
    this.authForm.reset();
  }

  async submitAuth(): Promise<void> {
    if (this.authForm.invalid) return;

    this.isAuthLoading = true;
    this.authMessage = '';

    try {
      if (this.isLoginMode) {
        await this.login();
      } else {
        await this.register();
      }
    } catch (error) {
      this.authMessage = 'حدث خطأ، يرجى المحاولة مرة أخرى';
    } finally {
      this.isAuthLoading = false;
    }
  }

  private async login(): Promise<void> {
    const { email, password } = this.authForm.value;
    
    const response = await this.http.post(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).toPromise();

    if (response && (response as any).token) {
      localStorage.setItem('token', (response as any).token);
      this.showAuthPopup = false;
      this.authForm.reset();
      this.authMessage = 'تم تسجيل الدخول بنجاح!';
      
      // Auto-apply the coupon after successful login
      setTimeout(() => {
        this.applyCoupon();
      }, 1000);
    }
  }

  private async register(): Promise<void> {
    const { email, password, fullName } = this.authForm.value;
    
    // First register
    await this.http.post(`${environment.apiUrl}/auth/register`, {
      email,
      password,
      fullName
    }).toPromise();

    // Then auto-login
    await this.login();
  }

  closeAuthPopup(): void {
    this.showAuthPopup = false;
    this.authForm.reset();
    this.authMessage = '';
  }
} 