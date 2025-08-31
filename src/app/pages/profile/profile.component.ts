import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/product.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">الملف الشخصي</h1>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="text-center mb-6">
                <div class="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                    </path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">{{ user.name }}</h3>
                <p class="text-gray-600 text-sm">{{ user.email }}</p>
              </div>

              <nav class="space-y-2">
                <a (click)="activeTab = 'profile'" 
                   [class.bg-red-50]="activeTab === 'profile'"
                   [class.text-red-600]="activeTab === 'profile'"
                   class="block px-4 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  المعلومات الشخصية
                </a>
                <a (click)="activeTab = 'orders'" 
                   [class.bg-red-50]="activeTab === 'orders'"
                   [class.text-red-600]="activeTab === 'orders'"
                   class="block px-4 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  طلباتي
                </a>
                <a (click)="activeTab = 'addresses'" 
                   [class.bg-red-50]="activeTab === 'addresses'"
                   [class.text-red-600]="activeTab === 'addresses'"
                   class="block px-4 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  العناوين
                </a>
                <a (click)="activeTab = 'settings'" 
                   [class.bg-red-50]="activeTab === 'settings'"
                   [class.text-red-600]="activeTab === 'settings'"
                   class="block px-4 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  الإعدادات
                </a>
                <a routerLink="/login" 
                   class="block px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors">
                  تسجيل الخروج
                </a>
              </nav>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">
            <!-- Profile Information -->
            <div *ngIf="activeTab === 'profile'" class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-6">المعلومات الشخصية</h2>
              
              <form (ngSubmit)="updateProfile()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                    <input type="text" [(ngModel)]="user.name" name="name"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">رقم الموبايل</label>
                    <input type="tel" [(ngModel)]="user.phone" name="phone"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" [(ngModel)]="user.email" name="email"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                    <input type="text" [(ngModel)]="user.address" name="address"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                  </div>
                </div>
                
                <div class="flex justify-end">
                  <button type="submit" 
                          [disabled]="isLoading"
                          class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                    {{ isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Orders -->
            <div *ngIf="activeTab === 'orders'" class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-6">طلباتي</h2>
              
              <div *ngIf="orders.length > 0" class="space-y-4">
                <div *ngFor="let order of orders" class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-semibold text-gray-800">طلب رقم: {{ order.id }}</h3>
                      <p class="text-gray-600 text-sm">{{ order.orderDate | date:'medium' }}</p>
                      <p class="text-gray-600 text-sm">المجموع: {{ order.totalAmount }} ج.م</p>
                    </div>
                    <div class="text-right">
                      <span [class]="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                        {{ getStatusText(order.status) }}
                      </span>
                      <a [routerLink]="['/track-order']" [queryParams]="{orderId: order.id}"
                         class="block text-red-600 hover:text-red-700 text-sm mt-2">
                        تتبع الطلب
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="orders.length === 0" class="text-center py-8">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z">
                  </path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-600 mb-2">لا توجد طلبات</h3>
                <p class="text-gray-500">لم تقم بإنشاء أي طلبات بعد</p>
                <a routerLink="/categories" 
                   class="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                  تصفح المنتجات
                </a>
              </div>
            </div>

            <!-- Addresses -->
            <div *ngIf="activeTab === 'addresses'" class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-6">العناوين</h2>
              
              <div class="space-y-4">
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-semibold text-gray-800">العنوان الرئيسي</h3>
                      <p class="text-gray-600">{{ user.address }}</p>
                    </div>
                    <button class="text-red-600 hover:text-red-700 text-sm">تعديل</button>
                  </div>
                </div>
                
                <button class="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
                  + إضافة عنوان جديد
                </button>
              </div>
            </div>

            <!-- Settings -->
            <div *ngIf="activeTab === 'settings'" class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-6">الإعدادات</h2>
              
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-800 mb-4">تغيير كلمة المرور</h3>
                  <form class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
                      <input type="password" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                      <input type="password" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                      <input type="password" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                    </div>
                    <button type="submit" 
                            class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                      تغيير كلمة المرور
                    </button>
                  </form>
                </div>
                
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-lg font-medium text-gray-800 mb-4">الإشعارات</h3>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input type="checkbox" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                      <span class="mr-3 text-gray-700">إشعارات الطلبات</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                      <span class="mr-3 text-gray-700">إشعارات العروض</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                      <span class="mr-3 text-gray-700">رسائل تسويقية</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'profile';
  isLoading: boolean = false;
  
  user: User = {
    id: 1,
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '0123456789',
    address: 'شارع النيل، القاهرة، مصر'
  };

  orders: any[] = [
    {
      id: 'ORD-001',
      orderDate: new Date('2024-01-15'),
      totalAmount: 450,
      status: 'delivered'
    },
    {
      id: 'ORD-002',
      orderDate: new Date('2024-01-20'),
      totalAmount: 1200,
      status: 'shipped'
    }
  ];

  ngOnInit(): void {
    // Load user data from service
  }

  updateProfile(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // Show success message
    }, 1000);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'delivered': return 'تم التوصيل';
      case 'shipped': return 'تم الشحن';
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      default: return 'غير محدد';
    }
  }
} 