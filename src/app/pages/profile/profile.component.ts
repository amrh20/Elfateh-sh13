import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

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

  user: User = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'user'
  };

  editFullName: string = '';
  editUsername: string = '';

  constructor(private authService: AuthService) {}

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
      }
    });
  }
}


