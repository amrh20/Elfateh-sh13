import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  message = '';
  messageType: 'success' | 'error' = 'error';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  emailOrPhoneValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const value = control.value.trim();
    
    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Phone validation regex (Egyptian phone numbers and international formats)
    const phoneRegex = /^(\+?2)?01[0-9]{9}$|^\+?[1-9]\d{1,14}$/;
    
    const isValidEmail = emailRegex.test(value);
    const isValidPhone = phoneRegex.test(value);
    
    if (!isValidEmail && !isValidPhone) {
      return { invalidEmailOrPhone: true };
    }
    
    return null;
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove the passwordMismatch error if passwords match
      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
      return null;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isEmail(value: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.message = '';

    try {
      const formData = this.registerForm.value;
      
      // إعداد البيانات للـ API حسب المطلوب في الـ schema
      const registerData: RegisterRequest = {
        username: formData.username.trim(),   // email or phone
        fullName: formData.fullName.trim(),   // user's display name
        password: formData.password
      };
      
      console.log('Attempting registration with:', { username: registerData.username, fullName: registerData.fullName });
      
      // استدعاء الـ API باستخدام AuthService
      this.authService.register(registerData).subscribe({
        next: (response) => {
          if (response.success) {
            this.message = 'تم إنشاء الحساب بنجاح!';
            this.messageType = 'success';
            
            this.notificationService.showSuccess('تم إنشاء الحساب بنجاح');
            
            // التوجه لصفحة تسجيل الدخول
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          } else {
            // فشل في التسجيل
            this.message = response.message || 'حدث خطأ في إنشاء الحساب';
            this.messageType = 'error';
            this.notificationService.showError(this.message);
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.message = 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
          this.messageType = 'error';
          this.notificationService.showError('فشل في إنشاء الحساب');
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
