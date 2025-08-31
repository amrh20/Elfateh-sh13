import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string; // email or phone
  password: string;
}

export interface RegisterRequest {
  username: string; // email or phone
  fullName: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      role: string;
    };
  };
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      role: string;
    };
  };
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  /**
   * تسجيل مستخدم جديد
   */
  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/signup`, registerData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        let errorMessage = 'حدث خطأ في إنشاء الحساب';
        
        if (error.status === 400) {
          errorMessage = 'البيانات المدخلة غير صحيحة';
        } else if (error.status === 409) {
          errorMessage = 'هذا البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل';
        } else if (error.status === 422) {
          errorMessage = 'البيانات غير مكتملة أو غير صحيحة';
        } else if (error.status === 0) {
          errorMessage = 'تعذر الاتصال بالخادم';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        return of({
          success: false,
          message: errorMessage,
          error: errorMessage
        });
      })
    );
  }

  /**
   * تسجيل الدخول باستخدام email أو phone وكلمة المرور
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData).pipe(
      tap(response => {
        if (response.success && response.data) {
          // حفظ بيانات المستخدم والتوكن
          this.setUserData(response.data.user, response.data.token);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        let errorMessage = 'حدث خطأ في تسجيل الدخول';
        
        if (error.status === 401) {
          errorMessage = 'البريد الإلكتروني أو رقم الهاتف أو كلمة المرور غير صحيحة';
        } else if (error.status === 404) {
          errorMessage = 'المستخدم غير موجود';
        } else if (error.status === 422) {
          errorMessage = 'بيانات غير صالحة';
        } else if (error.status === 0) {
          errorMessage = 'تعذر الاتصال بالخادم';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        return of({
          success: false,
          message: errorMessage,
          error: errorMessage
        });
      })
    );
  }

  /**
   * تسجيل الخروج
   */
  logout(): void {
    // إزالة بيانات المستخدم من التخزين
    this.storageService.removeItem('user');
    this.storageService.removeItem('token');
    
    // تحديث الحالة
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    
    // التوجه لصفحة تسجيل الدخول
    this.router.navigate(['/login']);
  }

  /**
   * الحصول على المستخدم الحالي
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * التحقق من حالة تسجيل الدخول
   */
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * الحصول على التوكن
   */
  getToken(): string | null {
    const tokenResult = this.storageService.getItem<string>('token');
    return tokenResult.success ? tokenResult.data || null : null;
  }

  /**
   * تحديث بيانات المستخدم والتوكن
   */
  private setUserData(user: User, token: string): void {
    // حفظ في التخزين المحلي
    this.storageService.setItem('user', user);
    this.storageService.setItem('token', token);
    
    // تحديث الحالة
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
  }

  /**
   * فحص حالة المصادقة عند بدء التطبيق
   */
  private checkAuthStatus(): void {
    const userResult = this.storageService.getItem<User>('user');
    const tokenResult = this.storageService.getItem<string>('token');
    
    if (userResult.success && tokenResult.success && userResult.data && tokenResult.data) {
      this.currentUserSubject.next(userResult.data);
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  /**
   * التحقق من صحة التوكن (اختياري)
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.apiUrl}/validate-token`, { headers }).pipe(
      map(response => response.success === true),
      catchError(() => {
        // إذا فشل التحقق من التوكن، قم بتسجيل الخروج
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * تحديث معلومات المستخدم
   */
  updateUserData(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.storageService.setItem('user', updatedUser);
      this.currentUserSubject.next(updatedUser);
    }
  }
}
