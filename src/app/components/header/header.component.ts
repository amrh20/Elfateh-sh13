import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService, User } from '../../services/auth.service';

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
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartCount = this.cartService.getTotalItems();
    });

    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistCount = this.wishlistService.getWishlistCount();
    });

    // Subscribe to auth state
    this.authService.isLoggedIn$.subscribe(isLogged => {
      this.isLoggedIn = isLogged;
    });

    this.authService.currentUser$.subscribe((user: User | null) => {
      this.userName = user?.name || 'المستخدم';
    });
  }

  checkUserLoginStatus(): void {}

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
    this.authService.logout();
    this.closeUserMenu();
    this.router.navigate(['/home']);
  }
} 