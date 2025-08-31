import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ProductCardComponent
  ],
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.scss']
})
export class AllProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filterForm: FormGroup;
  
  // Search
  searchQuery = '';
  
  // Sorting
  sortOptions = [
    { value: 'name_asc', label: 'الاسم (أ-ي)' },
    { value: 'name_desc', label: 'الاسم (ي-أ)' },
    { value: 'price_asc', label: 'السعر (من الأقل)' },
    { value: 'price_desc', label: 'السعر (من الأعلى)' },
    { value: 'rating_desc', label: 'التقييم (الأعلى)' },
    { value: 'reviews_desc', label: 'عدد المراجعات' }
  ];
  
  // Product types for filtering
  productTypes = [
    { value: 'normal', label: 'عادي' },
    { value: 'featured', label: 'مميز' },
    { value: 'bestSeller', label: 'الأكثر مبيعاً' },
    { value: 'specialOffer', label: 'عرض خاص' }
  ];

  // Categories and subcategories
  categories: any[] = [];
  subCategories: any[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private fb: FormBuilder,
    private viewportScroller: ViewportScroller
  ) {
    this.filterForm = this.fb.group({
      subcategory: [''],
      minPrice: [''],
      maxPrice: [''],
      sort: [''],
      productType: [''],
      featured: ['']
    });
  }

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.viewportScroller.scrollToPosition([0, 0]);
    
    this.loadProducts();
    this.setupFilterListeners();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterListeners(): void {
    // Listen to form changes with debounce
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    // Listen to search query changes
    this.searchQueryChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  private get searchQueryChanges() {
    return new Subject<string>();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchQueryChanges.next(query);
    
    // Reset to first page when searching
    this.currentPage = 1;
    
    // Load products with search query
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    // Build query parameters
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    // Add search query
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery.trim();
    }

    // Add filter values
    const filterValues = this.filterForm.value;
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key] && filterValues[key] !== '') {
        params[key] = filterValues[key];
      }
    });

    // Convert to query string
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');



    this.productService.getProductsWithFilters(queryString)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Check if pagination is at root level
            if (response.pagination) {
              // Pagination at root level
              this.products = response.data || [];
              this.totalItems = response.pagination.total || 0;
              this.totalPages = response.pagination.pages || 0;
              this.currentPage = response.pagination.current || 1;
              this.itemsPerPage = response.pagination.limit || 12;
            } else if (response.data.pagination) {
              // Pagination inside data object
              this.products = response.data.products || [];
              this.totalItems = response.data.pagination.total || 0;
              this.totalPages = response.data.pagination.pages || 0;
              this.currentPage = response.data.pagination.current || 1;
              this.itemsPerPage = response.data.pagination.limit || 12;
            } else if (response.data.products) {
              // Products array with total at data level
              this.products = response.data.products;
              this.totalItems = response.data.total || response.data.products.length;
              this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            } else if (Array.isArray(response.data)) {
              // Direct array structure
              this.products = response.data;
              this.totalItems = response.data.length;
              this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            } else {
              this.products = [];
              this.totalItems = 0;
              this.totalPages = 0;
            }
            
            // Apply filters after loading products
            this.applyFilters();
          } else {
            this.error = 'حدث خطأ في تحميل المنتجات';
            this.products = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.error = 'حدث خطأ في تحميل المنتجات';
          this.loading = false;
          this.products = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      });
  }

  private applyFilters(): void {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
(product.brand || '').toLowerCase().includes(query)
      );
    }

    // Apply price filters
    const minPrice = this.filterForm.get('minPrice')?.value;
    const maxPrice = this.filterForm.get('maxPrice')?.value;
    
    if (minPrice) {
      filtered = filtered.filter(product => product.price >= minPrice);
    }
    
    if (maxPrice) {
      filtered = filtered.filter(product => product.price <= maxPrice);
    }

    // Apply product type filter
    const productType = this.filterForm.get('productType')?.value;
    if (productType) {
      filtered = filtered.filter(product => {
        switch (productType) {
          case 'featured':
            return (product.rating || 0) >= 4.5;
          case 'bestSeller':
            return (product.reviews || 0) >= 100;
          case 'specialOffer':
            return product.isOnSale;
          default:
            return true;
        }
      });
    }

    // Apply featured filter
    const featured = this.filterForm.get('featured')?.value;
    if (featured !== null && featured !== '') {
      filtered = filtered.filter(product => 
        featured ? (product.rating || 0) >= 4.5 : true
      );
    }

    // Apply sorting
    const sort = this.filterForm.get('sort')?.value;
    if (sort) {
      filtered = this.sortProducts(filtered, sort);
    }

    this.filteredProducts = filtered;
    
    // IMPORTANT: Don't override totalItems and totalPages from API
    // Only recalculate if we're doing client-side filtering AND have active filters
    if ((this.searchQuery.trim() || this.hasActiveFilters()) && filtered.length !== this.products.length) {
      // Client-side filtering with different results - recalculate pagination
      this.totalItems = filtered.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      
      // Reset to first page if current page is out of bounds
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = 1;
      }
    }
    

  }

  private hasActiveFilters(): boolean {
    const filterValues = this.filterForm.value;
    return Object.values(filterValues).some(value => value && value !== '');
  }

  private loadCategories(): void {
    this.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.subCategories = this.extractAllSubcategories(this.categories);
      },
      error: (error) => {
        this.categories = [];
        this.subCategories = [];
      }
    });
  }

  private getCategories(): Observable<any[]> {
    return this.productService.getCategories().pipe(
      map((response: any) => {
        if (response && response.success && response.data) {
          return response.data;
        } else if (response && Array.isArray(response)) {
          return response;
        }
        return this.categories;
      }),
      catchError((error: any) => {
        return of(this.categories).pipe(delay(500));
      })
    );
  }

  private extractAllSubcategories(categories: any[]): any[] {
    const allSubcategories: any[] = [];
    
    categories.forEach(category => {
      if (category.subcategories && Array.isArray(category.subcategories)) {
        category.subcategories.forEach((subcategory: any) => {
          const subcategoryWithParent = {
            ...subcategory,
            parentCategoryId: category._id || category.id,
            parentCategoryName: category.name
          };
          allSubcategories.push(subcategoryWithParent);
        });
      }
    });
    
    return allSubcategories;
  }

  private sortProducts(products: Product[], sortBy: string): Product[] {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name, 'ar'));
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating_desc':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'reviews_desc':
        return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      default:
        return sorted;
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.searchQuery = '';
    this.currentPage = 1;
    this.totalItems = 0;
    this.totalPages = 0;
    this.loadProducts();
  }

  onAddToCart(product: Product): void {
    // العملية تتم داخل product-card component
    // لا نحتاج لاستدعاء addToCart مرة أخرى هنا
  }

  get paginatedProducts(): Product[] {
    // If we have server-side pagination, return all products from current page
    // If we have client-side filtering, apply pagination locally
    if (this.searchQuery.trim() || this.hasActiveFilters()) {
      // Client-side pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredProducts.slice(startIndex, endIndex);
    } else {
      // Server-side pagination - return all products from current page
      console.log('Server-side pagination - returning all products from current page');
      console.log('Filtered products:', this.filteredProducts);
      return this.filteredProducts;
    }


  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }
}
