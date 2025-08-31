/**
 * ملف اختبار بسيط لنظام التخزين
 * يمكن تشغيله في console المتصفح لاختبار الوظائف
 */

// اختبار CartService
export function testCartService() {
  console.log('🧪 بدء اختبار CartService...');
  
  try {
    // إنشاء خدمة جديدة
    const cartService = new CartService();
    
    // اختبار إضافة منتج
    const testProduct = {
      id: 1,
      name: 'منتج تجريبي',
      price: 100,
      image: 'test.jpg',
      category: 'اختبار',
      brand: 'ماركة تجريبية',
      inStock: true,
      rating: 5,
      reviews: 10,
      isOnSale: false,
      images: ['test.jpg'],
      description: 'وصف تجريبي'
    };
    
    const addResult = cartService.addToCart(testProduct, 2);
    console.log('✅ إضافة منتج:', addResult);
    
    // اختبار الحصول على العناصر
    const items = cartService.getCartItemsValue();
    console.log('✅ عناصر السلة:', items);
    
    // اختبار حساب المجموع
    const total = cartService.getTotalPrice();
    console.log('✅ المجموع:', total);
    
    // اختبار إزالة منتج
    const removeResult = cartService.removeFromCart(1);
    console.log('✅ إزالة منتج:', removeResult);
    
    console.log('🎉 اختبار CartService مكتمل بنجاح!');
    return true;
  } catch (error) {
    console.error('❌ فشل في اختبار CartService:', error);
    return false;
  }
}

// اختبار WishlistService
export function testWishlistService() {
  console.log('🧪 بدء اختبار WishlistService...');
  
  try {
    // إنشاء خدمة جديدة
    const wishlistService = new WishlistService();
    
    // اختبار إضافة منتج
    const testProduct = {
      id: 1,
      name: 'منتج مفضل',
      price: 200,
      image: 'favorite.jpg',
      category: 'مفضلة',
      brand: 'ماركة مفضلة',
      inStock: true,
      rating: 4,
      reviews: 15,
      isOnSale: true,
      originalPrice: 250,
      discountPercentage: 20,
      images: ['favorite.jpg'],
      description: 'وصف المنتج المفضل'
    };
    
    const addResult = wishlistService.addToWishlist(testProduct);
    console.log('✅ إضافة للمفضلة:', addResult);
    
    // اختبار التحقق من وجود المنتج
    const isInWishlist = wishlistService.isInWishlist(1);
    console.log('✅ موجود في المفضلة:', isInWishlist);
    
    // اختبار البحث
    const searchResults = wishlistService.searchInWishlist('منتج');
    console.log('✅ نتائج البحث:', searchResults);
    
    // اختبار إزالة من المفضلة
    const removeResult = wishlistService.removeFromWishlist(1);
    console.log('✅ إزالة من المفضلة:', removeResult);
    
    console.log('🎉 اختبار WishlistService مكتمل بنجاح!');
    return true;
  } catch (error) {
    console.error('❌ فشل في اختبار WishlistService:', error);
    return false;
  }
}

// اختبار StorageService
export function testStorageService() {
  console.log('🧪 بدء اختبار StorageService...');
  
  try {
    // إنشاء خدمة جديدة
    const storageService = new StorageService();
    
    // اختبار حفظ بيانات
    const testData = { message: 'بيانات تجريبية', timestamp: Date.now() };
    const setResult = storageService.setItem('test_key', testData);
    console.log('✅ حفظ بيانات:', setResult);
    
    // اختبار استرجاع بيانات
    const getResult = storageService.getItem('test_key');
    console.log('✅ استرجاع بيانات:', getResult);
    
    // اختبار معلومات التخزين
    const storageInfo = storageService.getStorageInfo();
    console.log('✅ معلومات التخزين:', storageInfo);
    
    // اختبار إحصائيات التخزين
    const stats = storageService.getStorageStats();
    console.log('✅ إحصائيات التخزين:', stats);
    
    // اختبار حذف بيانات
    const removeResult = storageService.removeItem('test_key');
    console.log('✅ حذف بيانات:', removeResult);
    
    console.log('🎉 اختبار StorageService مكتمل بنجاح!');
    return true;
  } catch (error) {
    console.error('❌ فشل في اختبار StorageService:', error);
    return false;
  }
}

// اختبار NotificationService
export function testNotificationService() {
  console.log('🧪 بدء اختبار NotificationService...');
  
  try {
    // إنشاء خدمة جديدة
    const notificationService = new NotificationService();
    
    // اختبار إشعار نجاح
    const successId = notificationService.success('نجح الاختبار', 'تم اختبار الإشعارات بنجاح');
    console.log('✅ إشعار نجاح:', successId);
    
    // اختبار إشعار خطأ
    const errorId = notificationService.error('خطأ في الاختبار', 'هذا إشعار خطأ تجريبي');
    console.log('✅ إشعار خطأ:', errorId);
    
    // اختبار إشعار تحذير
    const warningId = notificationService.warning('تحذير', 'هذا إشعار تحذير تجريبي');
    console.log('✅ إشعار تحذير:', warningId);
    
    // اختبار إشعار معلومات
    const infoId = notificationService.info('معلومات', 'هذا إشعار معلومات تجريبي');
    console.log('✅ إشعار معلومات:', infoId);
    
    // اختبار الحصول على الإشعارات
    const notifications = notificationService.getNotificationsValue();
    console.log('✅ الإشعارات:', notifications);
    
    // اختبار عدد الإشعارات غير المقروءة
    const unreadCount = notificationService.getUnreadCount();
    console.log('✅ عدد الإشعارات غير المقروءة:', unreadCount);
    
    console.log('🎉 اختبار NotificationService مكتمل بنجاح!');
    return true;
  } catch (error) {
    console.error('❌ فشل في اختبار NotificationService:', error);
    return false;
  }
}

// اختبار شامل للنظام
export function runAllTests() {
  console.log('🚀 بدء الاختبارات الشاملة...\n');
  
  const results = {
    cartService: testCartService(),
    wishlistService: testWishlistService(),
    storageService: testStorageService(),
    notificationService: testNotificationService()
  };
  
  console.log('\n📊 نتائج الاختبارات:');
  console.log('CartService:', results.cartService ? '✅' : '❌');
  console.log('WishlistService:', results.wishlistService ? '✅' : '❌');
  console.log('StorageService:', results.storageService ? '✅' : '❌');
  console.log('NotificationService:', results.notificationService ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 جميع الاختبارات نجحت! النظام يعمل بشكل صحيح.');
  } else {
    console.log('\n⚠️ بعض الاختبارات فشلت. يرجى مراجعة الأخطاء أعلاه.');
  }
  
  return allPassed;
}

// اختبار الأداء
export function performanceTest() {
  console.log('⚡ بدء اختبار الأداء...');
  
  const startTime = performance.now();
  
  // اختبار إضافة 100 منتج للسلة
  const cartService = new CartService();
  const testProduct = {
    id: 1,
    name: 'منتج تجريبي',
    price: 100,
    image: 'test.jpg',
    category: 'اختبار',
    brand: 'ماركة تجريبية',
    inStock: true,
    rating: 5,
    reviews: 10,
    isOnSale: false,
    images: ['test.jpg'],
    description: 'وصف تجريبي'
  };
  
  for (let i = 0; i < 100; i++) {
    cartService.addToCart({ ...testProduct, id: i + 1 });
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`✅ إضافة 100 منتج استغرقت: ${duration.toFixed(2)} مللي ثانية`);
  console.log(`⚡ متوسط الوقت لكل منتج: ${(duration / 100).toFixed(2)} مللي ثانية`);
  
  // اختبار حجم البيانات
  const cartSize = cartService.getCartSize();
  const storageInfo = cartService.getStorageInfo();
  
  console.log(`📊 حجم السلة: ${cartSize} منتج`);
  console.log(`💾 مساحة التخزين المستخدمة: ${(storageInfo.used / 1024).toFixed(2)} KB`);
  
  // تنظيف
  cartService.clearCart();
  
  return { duration, cartSize, storageUsed: storageInfo.used };
}

// اختبار التوافق
export function compatibilityTest() {
  console.log('🔧 بدء اختبار التوافق...');
  
  const results = {
    localStorage: typeof localStorage !== 'undefined',
    json: typeof JSON !== 'undefined',
    blob: typeof Blob !== 'undefined',
    performance: typeof performance !== 'undefined'
  };
  
  console.log('✅ localStorage:', results.localStorage ? 'متاح' : 'غير متاح');
  console.log('✅ JSON:', results.json ? 'متاح' : 'غير متاح');
  console.log('✅ Blob:', results.blob ? 'متاح' : 'غير متاح');
  console.log('✅ Performance:', results.performance ? 'متاح' : 'غير متاح');
  
  const allCompatible = Object.values(results).every(result => result);
  
  if (allCompatible) {
    console.log('🎉 المتصفح متوافق تماماً مع النظام!');
  } else {
    console.log('⚠️ المتصفح غير متوافق مع بعض الميزات.');
  }
  
  return allCompatible;
}

// دالة مساعدة لاختبار localStorage مباشرة
export function testLocalStorageDirectly() {
  console.log('🔍 اختبار localStorage مباشرة...');
  
  try {
    // اختبار الكتابة
    localStorage.setItem('test_direct', 'test_value');
    console.log('✅ الكتابة نجحت');
    
    // اختبار القراءة
    const value = localStorage.getItem('test_direct');
    console.log('✅ القراءة نجحت:', value);
    
    // اختبار الحذف
    localStorage.removeItem('test_direct');
    console.log('✅ الحذف نجح');
    
    // اختبار المساحة
    const testData = 'x'.repeat(1024 * 1024); // 1MB
    localStorage.setItem('test_large', testData);
    console.log('✅ كتابة بيانات كبيرة نجحت');
    
    localStorage.removeItem('test_large');
    console.log('✅ تنظيف البيانات الكبيرة نجح');
    
    console.log('🎉 اختبار localStorage المباشر نجح!');
    return true;
  } catch (error) {
    console.error('❌ فشل في اختبار localStorage المباشر:', error);
    return false;
  }
}

// تصدير الدوال للاستخدام في console
(window as any).testStorageSystem = {
  testCartService,
  testWishlistService,
  testStorageService,
  testNotificationService,
  runAllTests,
  performanceTest,
  compatibilityTest,
  testLocalStorageDirectly
};

console.log(`
🚀 نظام التخزين جاهز للاختبار!

استخدم الدوال التالية في console:

🔧 testStorageSystem.runAllTests() - تشغيل جميع الاختبارات
🧪 testStorageSystem.testCartService() - اختبار خدمة السلة
🧪 testStorageSystem.testWishlistService() - اختبار خدمة المفضلة
🧪 testStorageSystem.testStorageService() - اختبار خدمة التخزين
🧪 testStorageSystem.testNotificationService() - اختبار خدمة الإشعارات
⚡ testStorageSystem.performanceTest() - اختبار الأداء
🔧 testStorageSystem.compatibilityTest() - اختبار التوافق
🔍 testStorageSystem.testLocalStorageDirectly() - اختبار localStorage مباشرة

مثال: testStorageSystem.runAllTests()
`);
