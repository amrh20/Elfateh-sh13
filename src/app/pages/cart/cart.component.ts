import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
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
  isCouponLoading: boolean = false;
  
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

  // Saved order details for success dialog
  savedOrderDetails = {
    totalItems: 0,
    subtotal: 0,
    discount: 0,
    couponDiscount: 0,
    deliveryFee: 0,
    total: 0
  };

  // Invalid discount dialog
  showInvalidDiscountDialog = false;
  invalidDiscountMessage = '';
  orderWithoutDiscount = 0;

  // Areas in Zahraa El Maadi
  zahraaMaadiAreas: string[] = [
    'حي المستثمرين',
    'حي الشطر الثاني', 
    'حي الشطر الأول',
    'حي 6 أكتوبر',
    'حي البنفسج',
    'حي مدينة المعراج',
    'حي فيلات الشروق',
    'حي الموسيقار علي الحجار',
    'حي أول نادي المعادي',
    'حي النرجس'
  ];

  // Getter for auth service access in template
  get isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
      deliveryAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      additionalNotes: [''],
      paymentMethod: ['cash_on_delivery', Validators.required]
    });
    
    this.authForm = this.fb.group({
      email: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['']
    });

    // Login is default → fullName not required
    this.setAuthValidatorsForMode();
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

    // Calculate total: subtotal + shipping - product discount - coupon discount
    this.total = this.subtotal + this.deliveryFee - this.discount - this.couponDiscount;
    
    // Ensure total is not negative
    if (this.total < 0) {
      this.total = 0;
    }
  }

  applyCoupon(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
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

    this.isCouponLoading = true;
    this.couponMessage = '';

    // Calculate discount based on subtotal only (excluding delivery fee)
    // Call the discount API with subtotal only
    this.orderService.checkDiscount(this.couponCode.trim(), this.subtotal).subscribe({
      next: (response) => {
        this.isCouponLoading = false;
        
        if (response.error) {
          // Handle API error
          this.appliedCoupon = '';
          this.couponDiscount = 0;
          this.isCouponValid = false;
          this.couponMessage = 'كود الكوبون غير صحيح';
        } else {
          // Handle successful response
          this.appliedCoupon = this.couponCode.trim().toUpperCase();
          this.isCouponValid = true;
          
          // Use the discount amount from API response
          if (response.data && response.data.discountAmount !== undefined) {
            this.couponDiscount = parseFloat(response.data.discountAmount);
            this.couponMessage = `تم تطبيق الكوبون! خصم ${this.couponDiscount} جنيه`;
          } else if (response.amount !== undefined) {
            this.couponDiscount = parseFloat(response.amount);
            this.couponMessage = `تم تطبيق الكوبون! خصم ${this.couponDiscount} جنيه`;
          } else {
            // Fallback if amount structure is different
            this.couponDiscount = parseFloat(response.discountAmount || response.discount || 0);
            this.couponMessage = `تم تطبيق الكوبون! خصم ${this.couponDiscount} جنيه`;
          }
          
          this.calculateTotals();
        }
      },
      error: (error) => {
        this.isCouponLoading = false;
        this.appliedCoupon = '';
        this.couponDiscount = 0;
        this.isCouponValid = false;
        this.couponMessage = 'حدث خطأ أثناء التحقق من الكوبون، يرجى المحاولة مرة أخرى';
        console.error('Coupon validation error:', error);
      }
    });
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

  submitOrder(): void {
    if (this.checkoutForm.invalid) return;

    this.isSubmitting = true;

    // Create order object to match Swagger API schema
    const formData = this.checkoutForm.value;
    const currentUser = this.authService.getCurrentUser();
    const order = {
      customerInfo: {
        name: formData.fullName,
        email: currentUser?.email || "",
        phone: formData.mobileNumber,
        address: {
          street: formData.deliveryAddress,
          city: formData.city
        }
      },
      items: this.cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      notes: formData.additionalNotes || "",
      deliveryFee: this.deliveryFee,
      discountCode: this.appliedCoupon,
    };

    // Call the real API
    this.orderService.createOrder(order).subscribe({
      next: (response) => {
        console.log('Order API response:', response.details.error.message);
        
        // Check if order was successful
        if (response && (response.details.error.success === true || (!response.details.error&& !response.details.error.message))) {
          // Save order details before clearing cart
          this.savedOrderDetails = {
            totalItems: this.totalItems,
            subtotal: this.subtotal,
            discount: this.discount,
            couponDiscount: this.couponDiscount,
            deliveryFee: this.deliveryFee,
            total: this.total
          };

          // Clear cart
          this.cartService.clearCart();

          // Show success dialog
          this.showSuccessDialog = true;
          this.isSubmitting = false;
        } else {
          // Handle API error
          console.error('Order submission failed:', response);
          
          // Check if it's a discount code error (invalid or already used)
          if (response.details.error.message && 
              (response.details.error.message.includes('Invalid discount code') || 
               response.details.error.message.includes('Discount code already used') ||
               response.details.error.message.includes('already used by this user'))) {
            this.handleInvalidDiscountCode(response.details.error.message);
          } else {
            console.error('Order submission failed - response:', response);
            alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
            this.isSubmitting = false;
          }
        }
      },
      error: (error) => {
        console.error('Error submitting order - Full error object:', error);
        console.error('Error status:', error.status);
        console.error('Error error:', error.error);
        
        // Check if it's a discount code error in the error object
        let errorMessage = '';
        
        console.log('error.error type:', typeof error.error);
        console.log('error.error content:', error.error);
        
        // The API response shows error.error is an object with success: false, message: "..."
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
          console.log('Found message in error.error.message (object):', errorMessage);
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
          console.log('Found message in error.error.message (direct):', errorMessage);
        } else if (error?.error && typeof error.error === 'string') {
          errorMessage = error.error;
          console.log('Found message in error.error as string:', errorMessage);
        } else if (error?.message) {
          errorMessage = error.message;
          console.log('Found message in error.message:', errorMessage);
        }
        
        console.log('Final extracted error message:', errorMessage);
        
        if (errorMessage && 
            (errorMessage.includes('Invalid discount code') || 
             errorMessage.includes('Discount code already used') ||
             errorMessage.includes('already used by this user'))) {
          console.log('Detected discount code error, showing dialog');
          this.handleInvalidDiscountCode(errorMessage);
        } else {
          console.log('Not a discount code error, showing alert');
          alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
          this.isSubmitting = false;
        }
      }
    });
  }

  // New method to close success dialog and redirect
  closeSuccessDialog(): void {
    this.showSuccessDialog = false;
    this.router.navigate(['/']);
  }

  // Navigate to track order page
  goToTrackOrder(): void {
    this.showSuccessDialog = false;
    this.router.navigate(['/track-order']);
  }

  // Handle invalid discount code during order submission
  handleInvalidDiscountCode(apiMessage?: string): void {
    this.isSubmitting = false;
    this.orderWithoutDiscount = this.subtotal + this.deliveryFee - this.discount; // Calculate total without coupon discount
    
    // Create appropriate message based on API response
    let message = `كود الخصم "${this.appliedCoupon}" غير صالح أو تم استخدامه من قبل.`;
    
    if (apiMessage) {
      if (apiMessage.includes('already used')) {
        message = `كود الخصم "${this.appliedCoupon}" تم استخدامه من قبل ولا يمكن استخدامه مرة أخرى.`;
      } else if (apiMessage.includes('Invalid')) {
        message = `كود الخصم "${this.appliedCoupon}" غير صالح أو منتهي الصلاحية.`;
      }
    }
    
    this.invalidDiscountMessage = message;
    this.showInvalidDiscountDialog = true;
  }

  // Proceed with order without discount
  proceedWithoutDiscount(): void {
    this.showInvalidDiscountDialog = false;
    this.removeCoupon(); // Remove the invalid coupon
    this.submitOrder(); // Retry submitting the order
  }

  // Go back to cart to modify discount code
  goBackToCart(): void {
    this.showInvalidDiscountDialog = false;
    this.currentStep = 1; // Go back to cart step
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  // Close invalid discount dialog
  closeInvalidDiscountDialog(): void {
    this.showInvalidDiscountDialog = false;
    this.isSubmitting = false;
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
    this.setAuthValidatorsForMode();
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

    try {
      const response = await this.authService.login({
        username: email,
        password
      }).toPromise();

      if (response && response.success) {
        this.showAuthPopup = false;
        this.authForm.reset();
        this.authMessage = 'تم تسجيل الدخول بنجاح!';
        
        // Auto-apply the coupon after successful login
        setTimeout(() => {
          this.applyCoupon();
        }, 1000);
      } else {
        this.authMessage = 'خطأ في البيانات المدخلة';
      }
    } catch (error) {
      this.authMessage = 'حدث خطأ أثناء تسجيل الدخول';
      console.error('Login error:', error);
    }
  }

  private async register(): Promise<void> {
    const { email, password, fullName } = this.authForm.value;
    
    try {
      // First register
      const registerResponse = await this.authService.register({
        username: email,
        password,
        fullName
      }).toPromise();

      if (registerResponse && registerResponse.success) {
        // Then auto-login
        await this.login();
      } else {
        this.authMessage = 'حدث خطأ أثناء إنشاء الحساب';
      }
    } catch (error) {
      this.authMessage = 'حدث خطأ أثناء إنشاء الحساب';
      console.error('Registration error:', error);
    }
  }

  closeAuthPopup(): void {
    this.showAuthPopup = false;
    this.authForm.reset();
    this.authMessage = '';
  }

  // ===== Validators and helpers for auth form =====
  private setAuthValidatorsForMode(): void {
    const fullNameCtrl = this.authForm.get('fullName');
    if (!fullNameCtrl) { return; }
    if (this.isLoginMode) {
      fullNameCtrl.clearValidators();
    } else {
      fullNameCtrl.setValidators([Validators.required, Validators.minLength(3)]);
    }
    fullNameCtrl.updateValueAndValidity({ emitEvent: false });
  }

  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = (control.value || '').toString().trim();
    if (!value) { return { required: true }; }
    // Accept either valid email or Egyptian mobile number (starts 010/011/012/015 + 8 digits)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const egyptPhoneRegex = /^01[0-2,5][0-9]{8}$/;
    const isValid = emailRegex.test(value) || egyptPhoneRegex.test(value);
    return isValid ? null : { emailOrPhone: true };
  }
} 