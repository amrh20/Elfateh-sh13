import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">تتبع الطلب</h1>

        <!-- Search Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">البحث عن طلب</h2>
          <div class="flex flex-col md:flex-row gap-4">
            <input type="text" 
                   [(ngModel)]="searchOrderId"
                   placeholder="أدخل رقم الطلب..."
                   class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
            <button (click)="searchOrder()" 
                    [disabled]="!searchOrderId"
                    class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              بحث
            </button>
          </div>
        </div>

        <!-- Order Details -->
        <div *ngIf="order" class="space-y-8">
          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">طلب رقم: {{ order.id }}</h2>
                <p class="text-gray-600">تاريخ الطلب: {{ order.orderDate | date:'medium' }}</p>
                <p class="text-gray-600">المجموع: {{ order.totalAmount }} ج.م</p>
              </div>
              <div class="mt-4 md:mt-0">
                <span [class]="getStatusClass(order.status)" class="px-4 py-2 rounded-full text-sm font-medium">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tracking Timeline -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6">حالة الطلب</h3>
            
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div class="space-y-8">
                <div *ngFor="let step of trackingSteps; let i = index" 
                     class="relative flex items-start">
                  <div [class]="step.completed ? 'bg-green-500' : 'bg-gray-300'"
                       class="w-8 h-8 rounded-full flex items-center justify-center z-10">
                    <svg *ngIf="step.completed" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span *ngIf="!step.completed" class="text-white text-sm font-bold">{{ i + 1 }}</span>
                  </div>
                  
                  <div class="mr-6 flex-1">
                    <h4 class="text-lg font-semibold text-gray-800">{{ step.title }}</h4>
                    <p class="text-gray-600">{{ step.description }}</p>
                    <p *ngIf="step.date" class="text-sm text-gray-500 mt-1">
                      {{ step.date | date:'medium' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6">تفاصيل الطلب</h3>
            
            <div class="space-y-4">
              <div *ngFor="let item of order.items" 
                   class="flex items-center space-x-4 space-x-reverse border-b border-gray-100 pb-4">
                <img [src]="item.product.image" [alt]="item.product.name" 
                     class="w-16 h-16 object-cover rounded-md">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800">{{ item.product.name }}</h4>
                  <p class="text-gray-600 text-sm">{{ item.product.brand }}</p>
                  <p class="text-gray-600 text-sm">الكمية: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-800">{{ item.product.price * item.quantity }} ج.م</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4 mt-4">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-800">المجموع الكلي:</span>
                <span class="text-xl font-bold text-red-600">{{ order.totalAmount }} ج.م</span>
              </div>
            </div>
          </div>

          <!-- Delivery Information -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6">معلومات التوصيل</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-gray-800 mb-2">عنوان التوصيل</h4>
                <p class="text-gray-600">{{ order.deliveryAddress }}</p>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-800 mb-2">طريقة الدفع</h4>
                <p class="text-gray-600">{{ getPaymentMethodText(order.paymentMethod) }}</p>
              </div>
              
              <div *ngIf="order.trackingNumber">
                <h4 class="font-semibold text-gray-800 mb-2">رقم التتبع</h4>
                <p class="text-gray-600 font-mono">{{ order.trackingNumber }}</p>
              </div>
              
              <div *ngIf="order.deliveryDate">
                <h4 class="font-semibold text-gray-800 mb-2">تاريخ التوصيل المتوقع</h4>
                <p class="text-gray-600">{{ order.deliveryDate | date:'medium' }}</p>
              </div>
            </div>
          </div>

          <!-- Contact Support -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">هل تحتاج مساعدة؟</h3>
            <p class="text-gray-600 mb-4">
              إذا كان لديك أي استفسارات حول طلبك، لا تتردد في التواصل معنا
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="tel:0123456789" 
                 class="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors text-center">
                اتصل بنا
              </a>
              <a href="mailto:support@elfateh.com" 
                 class="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors text-center">
                راسلنا عبر البريد الإلكتروني
              </a>
            </div>
          </div>
        </div>

        <!-- No Order Found -->
        <div *ngIf="searched && !order" class="text-center py-16">
          <svg class="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          <h2 class="text-2xl font-semibold text-gray-600 mb-4">لم يتم العثور على الطلب</h2>
          <p class="text-gray-500 mb-8">
            تأكد من إدخال رقم الطلب الصحيح أو تواصل معنا للمساعدة
          </p>
          <a routerLink="/profile" 
             class="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-colors">
            عرض جميع طلباتي
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TrackOrderComponent implements OnInit {
  searchOrderId: string = '';
  order: any = null;
  searched: boolean = false;

  trackingSteps = [
    {
      title: 'تم استلام الطلب',
      description: 'تم استلام طلبك بنجاح',
      completed: true,
      date: new Date('2024-01-20T10:00:00')
    },
    {
      title: 'تم تأكيد الطلب',
      description: 'تم مراجعة وتأكيد طلبك',
      completed: true,
      date: new Date('2024-01-20T11:30:00')
    },
    {
      title: 'جاري التحضير',
      description: 'جاري تحضير طلبك للتوصيل',
      completed: true,
      date: new Date('2024-01-20T14:00:00')
    },
    {
      title: 'تم الشحن',
      description: 'تم شحن طلبك وهو في الطريق إليك',
      completed: true,
      date: new Date('2024-01-21T09:00:00')
    },
    {
      title: 'تم التوصيل',
      description: 'تم توصيل طلبك بنجاح',
      completed: false,
      date: null
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Check for orderId in query params
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.searchOrderId = params['orderId'];
        this.searchOrder();
      }
    });
  }

  searchOrder(): void {
    if (!this.searchOrderId) return;

    this.searched = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.searchOrderId === 'ORD-001') {
        this.order = {
          id: 'ORD-001',
          orderDate: new Date('2024-01-20T10:00:00'),
          totalAmount: 450,
          status: 'shipped',
          deliveryAddress: 'شارع النيل، القاهرة، مصر',
          paymentMethod: 'cash',
          trackingNumber: 'TRK123456789',
          deliveryDate: new Date('2024-01-22T14:00:00'),
          items: [
            {
              product: {
                name: 'منظف أرضيات لافندر',
                brand: 'فريش',
                price: 45,
                image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'
              },
              quantity: 2
            },
            {
              product: {
                name: 'سائل غسيل الأطباق',
                brand: 'فيري',
                price: 35,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
              },
              quantity: 1
            }
          ]
        };
      } else {
        this.order = null;
      }
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

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'cash': return 'الدفع عند الاستلام';
      default: return method;
    }
  }
} 