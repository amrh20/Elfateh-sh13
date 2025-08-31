import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  cartCount = 0;
  wishlistCount = 0;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isLoggedIn = false;
  userName = '';

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartCount = this.cartService.getTotalItems();
    });

    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistCount = this.wishlistService.getWishlistCount();
    });

    // Check if user is logged in (this should be integrated with your auth service)
    this.checkUserLoginStatus();
  }

  checkUserLoginStatus(): void {
    // هنا يجب أن تتكامل مع خدمة المصادقة الخاصة بك
    // For now, we'll simulate checking localStorage or a service
    const userData = localStorage.getItem('user');
    if (userData) {
      this.isLoggedIn = true;
      const user = JSON.parse(userData);
      this.userName = user.name || user.fullName || 'المستخدم';
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Close user menu if open
    this.isUserMenuOpen = false;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Close mobile menu if open
    this.isMobileMenuOpen = false;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  logout(): void {
    // Clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Update status
    this.isLoggedIn = false;
    this.userName = '';
    
    // Close menu
    this.closeUserMenu();
    
    // Optional: redirect to home or show notification
    console.log('User logged out');
  }
} 