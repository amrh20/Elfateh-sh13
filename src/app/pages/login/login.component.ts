import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  message = '';
  messageType: 'success' | 'error' = 'error';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], // changed from 'email' to 'username' to match API
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.message = '';

    try {
      const formData = this.loginForm.value;
      
      // إعداد بيانات تسجيل الدخول للـ API
      const loginRequest: LoginRequest = {
        username: formData.username, // email or phone
        password: formData.password
      };
      
      console.log('Attempting login with:', { username: loginRequest.username });
      
      // استدعاء الـ API الفعلي
      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.message = 'تم تسجيل الدخول بنجاح!';
            this.messageType = 'success';
            
            this.notificationService.showSuccess(`مرحباً ${response.data.user.name}!`);
            
            // التوجه للصفحة الرئيسية أو الصفحة المطلوبة
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1500);
          } else {
            // فشل في تسجيل الدخول
            this.message = response.message || 'حدث خطأ في تسجيل الدخول';
            this.messageType = 'error';
            this.notificationService.showError(this.message);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.message = 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
          this.messageType = 'error';
          this.notificationService.showError('فشل في تسجيل الدخول');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      this.message = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      this.messageType = 'error';
      this.notificationService.showError('خطأ غير متوقع');
      this.isLoading = false;
    }
  }
}