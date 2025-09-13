import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  isLoading: boolean = false;
  isEditMode: boolean = false;
  isPasswordLoading: boolean = false;
  activeTab: string = 'profile';

  user: User = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'user'
  };

  editFullName: string = '';
  editUsername: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private notifications: NotificationService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getMyProfile().subscribe(user => {
      if (user) {
        this.user = { ...this.user, ...user };
        this.editFullName = this.user.name || '';
        this.editUsername = this.user.email || this.user.phone || '';
      }
    });
  }

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.editFullName = this.user.name || '';
      this.editUsername = this.user.email || this.user.phone || '';
    }
  }

  saveProfile(): void {
    this.isLoading = true;
    this.authService.updateMyProfile({
      username: this.editUsername || undefined,
      fullName: this.editFullName || undefined
    }).subscribe(success => {
      this.isLoading = false;
      if (success) {
        this.isEditMode = false;
        this.loadProfile();
        this.notifications.showSuccess('تم تحديث المعلومات بنجاح!', { duration: 3000 });
      } else {
        this.notifications.showError('حدث خطأ أثناء تحديث المعلومات!');
      }
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.notifications.showError('كلمتا المرور غير متطابقتان!');
      return;
    }

    if (this.newPassword.length < 6) {
      this.notifications.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل!');
      return;
    }

    this.isPasswordLoading = true;
    this.authService.updateMyProfile({
      password: this.newPassword
    }).subscribe(success => {
      this.isPasswordLoading = false;
      if (success) {
        this.newPassword = '';
        this.confirmPassword = '';
        this.notifications.showSuccess('تم تغيير كلمة المرور بنجاح!', { duration: 3000 });
      } else {
        this.notifications.showError('حدث خطأ أثناء تغيير كلمة المرور!');
      }
    });
  }
}


