import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'all-products', loadComponent: () => import('./pages/all-products/all-products.component').then(m => m.AllProductsComponent) },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
  { path: 'product/:id', loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent) },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  { path: 'wishlist', loadComponent: () => import('./pages/wishlist/wishlist.component').then(m => m.WishlistComponent) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'track-order', loadComponent: () => import('./pages/track-order/track-order.component').then(m => m.TrackOrderComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: '**', redirectTo: '/home' }
];
