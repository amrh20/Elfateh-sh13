import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.scss']
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

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    // Check for orderId in query params
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.searchOrderId = params['orderId'];
        this.searchOrder();
      }
    });

    // Load user orders from API and log the response
    this.orderService.getUserOrders().subscribe(res => {
      console.log('User orders API response:', res);
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