# دليل أنيميشن Product Card

## الأنيميشن المضافة

### 1. أنيميشن إضافة للسلة (Cart Animation)
- **الحالة العادية**: `normal` - حجم عادي
- **الحالة المضاف**: `added` - تكبير مع تأثير نبض
- **المدة**: 300ms مع ease-out

```typescript
[@cartAnimation]="cartAnimationState"
```

### 2. أنيميشن المفضلة (Wishlist Animation)
- **الحالة العادية**: `normal` - حجم عادي بدون دوران
- **الحالة المضاف**: `added` - تكبير مع دوران 360 درجة
- **الحالة المحذوف**: `removed` - تصغير مع دوران -180 درجة
- **المدة**: 400ms للإضافة، 300ms للحذف

```typescript
[@wishlistAnimation]="wishlistAnimationState"
```

### 3. أنيميشن النص (Text Animation)
- **الحالة العادية**: `normal` - شفافية كاملة
- **الحالة المتغيرة**: `changed` - شفافية منخفضة مع حركة لأعلى
- **المدة**: 200ms

```typescript
[@textAnimation]="textAnimationState"
```

## كيفية الاستخدام

### في المكون
```typescript
export class ProductCardComponent {
  // حالات الأنيميشن
  cartAnimationState = 'normal';
  wishlistAnimationState = 'normal';
  textAnimationState = 'normal';

  addToCart(): void {
    // تشغيل أنيميشن الإضافة
    this.cartAnimationState = 'added';
    
    // ... منطق إضافة المنتج
    
    // إعادة تعيين الحالة
    setTimeout(() => {
      this.cartAnimationState = 'normal';
    }, 300);
  }

  toggleWishlist(): void {
    if (this.isInWishlist) {
      // أنيميشن الإزالة
      this.wishlistAnimationState = 'removed';
      
      // ... منطق إزالة المنتج
      
      setTimeout(() => {
        this.wishlistAnimationState = 'normal';
      }, 300);
    } else {
      // أنيميشن الإضافة
      this.wishlistAnimationState = 'added';
      
      // ... منطق إضافة المنتج
      
      setTimeout(() => {
        this.wishlistAnimationState = 'normal';
      }, 400);
    }
  }
}
```

### في الـ Template
```html
<!-- زر السلة مع الأنيميشن -->
<button (click)="addToCart()" 
        [@cartAnimation]="cartAnimationState"
        class="add-to-cart-btn">
  أضف للسلة
</button>

<!-- زر المفضلة مع الأنيميشن -->
<button (click)="toggleWishlist()" 
        [@wishlistAnimation]="wishlistAnimationState"
        class="wishlist-btn">
  <svg class="heart-icon">...</svg>
</button>

<!-- عنوان المنتج مع الأنيميشن -->
<h3 [@textAnimation]="textAnimationState"
    class="product-title">
  {{ product.name }}
</h3>
```

## تخصيص الأنيميشن

### تغيير المدة
```typescript
// في الـ animations array
transition('normal => added', [
  animate('500ms ease-out', keyframes([
    style({ transform: 'scale(1)', offset: 0 }),
    style({ transform: 'scale(1.3)', offset: 0.5 }),
    style({ transform: 'scale(1.1)', offset: 1 })
  ]))
])
```

### تغيير التأثير
```typescript
// تأثير دوران مختلف
state('added', style({ 
  transform: 'scale(1.2) rotate(180deg)' 
}))

// تأثير حركي مختلف
transition('normal => added', [
  animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)')
])
```

### إضافة تأثيرات جديدة
```typescript
// تأثير الوثب
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

// استخدام التأثير
state('bounce', style({
  animation: 'bounce 1s ease-in-out'
}))
```

## أفضل الممارسات

### 1. توقيت الأنيميشن
- استخدم مدة مناسبة (200ms - 500ms)
- تجنب الأنيميشن البطيئة جداً
- تأكد من إعادة تعيين الحالة

### 2. أداء الأنيميشن
- استخدم `transform` و `opacity` للأداء الأفضل
- تجنب تغيير `layout` أو `paint`
- استخدم `will-change` للعناصر المتحركة

### 3. تجربة المستخدم
- الأنيميشن يجب أن تكون سلسة
- لا تفرط في الأنيميشن
- تأكد من أن الأنيميشن تضيف قيمة

## استكشاف الأخطاء

### الأنيميشن لا تعمل
1. تأكد من استيراد `BrowserAnimationsModule`
2. تحقق من صحة أسماء الأنيميشن
3. تأكد من تحديث الحالة

### الأنيميشن بطيئة
1. تحقق من استخدام `transform` بدلاً من `left/top`
2. قلل من عدد العناصر المتحركة
3. استخدم `will-change` للعناصر الثقيلة

### الأنيميشن تتوقف
1. تأكد من إعادة تعيين الحالة
2. تحقق من `setTimeout` values
3. تأكد من عدم تداخل الأنيميشن

## أمثلة إضافية

### أنيميشن متسلسلة
```typescript
addToCartWithSequence(): void {
  // 1. تكبير الزر
  this.cartAnimationState = 'added';
  
  setTimeout(() => {
    // 2. تحريك النص
    this.textAnimationState = 'changed';
    
    setTimeout(() => {
      // 3. إعادة تعيين كل شيء
      this.cartAnimationState = 'normal';
      this.textAnimationState = 'normal';
    }, 200);
  }, 300);
}
```

### أنيميشن متزامنة
```typescript
addToWishlistAndCart(): void {
  // تشغيل كل الأنيميشن معاً
  this.wishlistAnimationState = 'added';
  this.cartAnimationState = 'added';
  this.textAnimationState = 'changed';
  
  // إعادة تعيين كل شيء معاً
  setTimeout(() => {
    this.wishlistAnimationState = 'normal';
    this.cartAnimationState = 'normal';
    this.textAnimationState = 'normal';
  }, 400);
}
```
