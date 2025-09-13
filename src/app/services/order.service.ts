import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Order } from '../models/product.model';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private auth: AuthService) {}

  getUserOrders(): Observable<any> {
    const token = this.auth.getToken();
    if (!token) { return of(null); }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>(`${this.apiUrl}/orders/user`, { headers }).pipe(
      map(res => res),
      catchError(() => of(null))
    );
  }

  getCurrentOrder(): Observable<Order | null> {
    // TODO: Replace with actual API call
    // For now, return mock data
    const mockOrder: Order = {
      id: 'ORD-2024-001',
      userId: 1,
      items: [
        {
          product: {
            _id: 1,
            name: 'منظف أرضيات لافندر',
            description: 'منظف أرضيات برائحة اللافندر',
            price: 45.99,
            image: 'https://via.placeholder.com/150',
            category: 'منظفات',
            brand: 'فيري',
            stock: 10,
            rating: 4.5,
            reviews: 128,
            isOnSale: false,
            images: ['https://via.placeholder.com/150']
          },
          quantity: 2
        },
        {
          product: {
            _id: 2,
            name: 'إسفنجة أطباق',
            description: 'إسفنجة أطباق عالية الجودة',
            price: 12.99,
            image: 'https://via.placeholder.com/150',
            category: 'أدوات مطبخ',
            brand: 'سكوتش',
            stock: 10,
            rating: 4.2,
            reviews: 89,
            isOnSale: true,
            discountPercentage: 15,
            images: ['https://via.placeholder.com/150']
          },
          quantity: 3
        }
      ],
      totalAmount: 123.95,
      status: 'confirmed',
      orderDate: new Date('2024-01-15T10:30:00'),
      deliveryDate: new Date('2024-01-17T14:00:00'),
      deliveryAddress: 'شارع النيل، المعادي، القاهرة',
      paymentMethod: 'cash',
      trackingNumber: 'TRK-2024-001'
    };

    // Simulate API delay
    return of(mockOrder);
  }

  hasActiveOrder(): Observable<boolean> {
    return new Observable(observer => {
      this.getCurrentOrder().subscribe(order => {
        if (order && ['pending', 'confirmed', 'shipped'].includes(order.status)) {
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      });
    });
  }

  getOrderStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'في انتظار التأكيد',
      'confirmed': 'تم التأكيد',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  }

  getOrderStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  checkDiscount(discountCode: string, totalAmount: number): Observable<any> {
    const token = this.auth.getToken();
    if (!token) { 
      return of({ error: 'Authentication required' }); 
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const payload = {
      discountCode: discountCode,
      totalAmount: totalAmount
    };

    return this.http.post<any>(`${this.apiUrl}/orders/check-discount`, payload, { headers }).pipe(
      map(res => res),
      catchError(error => {
        console.error('Discount check error:', error);
        return of({ error: 'Invalid discount code' });
      })
    );
  }
} 