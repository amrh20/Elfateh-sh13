import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ProductService } from '../../services/product.service';
import { Product, Category, SubCategory } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, ProductCardComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategoryId: string | null = null;
  selectedSubCategoryId: string | null = null;
  categorySearch: string = '';
  productSearch: string = '';
  loading: boolean = false;
  error: string | null = null;
  
  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  totalProducts: number = 0;
  limit: number = 12;
  pagination: any = null;
  
  // Make Math available in template
  Math = Math;

  constructor(
    private productService: ProductService,
    private http: HttpClient,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.viewportScroller.scrollToPosition([0, 0]);
    
    this.loadCategories();
    // Load all products for filtering purposes
    this.loadAllProducts();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    
    // Call the categories API endpoint
    this.http.get<any>(`${environment.apiUrl}/categories`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
          console.log('Categories loaded:', this.categories);
          
          // Load subcategories data for each category
          this.loadSubcategoriesData();
        } else {
          this.error = 'Failed to load categories';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = 'Error loading categories. Please try again.';
        this.loading = false;
        
        // Fallback to mock data if API fails
        this.loadMockCategories();
      }
    });
  }

  // Load subcategories data to get names and product counts
  loadSubcategoriesData(): void {
    this.categories.forEach(category => {
      if (category.subcategories && category.subcategories.length > 0) {
        // For each subcategory ID, try to get its data
        category.subcategories.forEach((subId: string) => {
          this.loadSubcategoryData(subId, category._id);
        });
      }
    });
  }

  // Load individual subcategory data and product count
  loadSubcategoryData(subId: string, categoryId: string): void {
    // First, get subcategory details
    this.http.get<any>(`${environment.apiUrl}/categories/${subId}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the subcategory in the categories array
          const category = this.categories.find(c => c._id === categoryId);
          if (category) {
            const subIndex = category.subcategories.findIndex((s: any) => 
              typeof s === 'string' ? s === subId : s._id === subId
            );
            if (subIndex !== -1) {
              // Replace the ID with the full subcategory object
              category.subcategories[subIndex] = response.data;
              
              // Load product count for this subcategory
              this.loadSubcategoryProductCount(subId, categoryId, subIndex);
            }
          }
        }
      },
      error: (err) => {
        console.log(`Could not load subcategory ${subId} details, using fallback`);
        // If API fails, we'll use fallback data
      }
    });
  }

  // Load product count for subcategory
  loadSubcategoryProductCount(subId: string, categoryId: string, subIndex: number): void {
    this.http.get<any>(`${environment.apiUrl}/products/subcategory/${subId}`).subscribe({
      next: (response) => {
        let productCount = 0;
        
        if (response.success && response.data) {
          productCount = response.data.length;
        } else if (Array.isArray(response)) {
          productCount = response.length;
        }
        
        // Update the product count in the subcategory
        const category = this.categories.find(c => c._id === categoryId);
        if (category && category.subcategories[subIndex]) {
          // Cast to any first, then add productCount property
          (category.subcategories[subIndex] as any).productCount = productCount;
        }
        
        console.log(`Subcategory ${subId} has ${productCount} products`);
      },
      error: (err) => {
        console.log(`Could not load product count for subcategory ${subId}`);
      }
    });
  }

  loadMockCategories(): void {
    // Fallback mock data structure matching the API response
    this.categories = [
      {
        _id: '1',
        name: 'منظفات',
        description: 'منتجات تنظيف عالية الجودة',
        image: 'assets/images/cleaners.jpg',
        isActive: true,
        parent: null,
        ancestors: [],
        subcategories: ['1', '2', '3', '4', '5']
      },
      {
        _id: '2',
        name: 'أدوات منزلية',
        description: 'أدوات منزلية متنوعة',
        image: 'assets/images/home-tools.jpg',
        isActive: true,
        parent: null,
        ancestors: [],
        subcategories: ['6', '7', '8', '9']
      },
      {
        _id: '3',
        name: 'منتجات العناية',
        description: 'منتجات العناية الشخصية',
        image: 'assets/images/care-products.jpg',
        isActive: true,
        parent: null,
        ancestors: [],
        subcategories: ['10', '11', '12']
      }
    ];
  }

  autoSelectFirstSubcategory(): void {
    // Don't auto-select anything - let user choose manually
    this.selectedCategoryId = null;
    this.selectedSubCategoryId = null;
    console.log('No auto-selection - waiting for user input');
  }

  loadAllProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        console.log('All products loaded:', products.length);
        
        // If there's a search query waiting, apply it now
        if (this.productSearch.trim()) {
          this.applyProductSearch();
        }
      },
      error: (error) => {
        console.error('Error loading all products:', error);
        this.allProducts = [];
      }
    });
  }

  loadProductsBySubcategory(subCategoryId: string, page: number = 1): void {
    this.loading = true;
    this.error = null;
    this.currentPage = page;
    
    // Call the subcategory products API endpoint with pagination
    const url = `${environment.apiUrl}/products/subcategory/${subCategoryId}?page=${page}&limit=${this.limit}`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        
        if (response.success && response.data) {
          this.filteredProducts = response.data;
          
          // Handle pagination info
          if (response.pagination) {
            this.pagination = response.pagination;
            this.currentPage = response.pagination.current || page;
            this.totalPages = response.pagination.pages || 1;
            this.totalProducts = response.pagination.total || 0;
          }
        } else if (Array.isArray(response)) {
          // Handle direct array response (fallback)
          this.filteredProducts = response;
          this.totalProducts = response.length;
          this.totalPages = Math.ceil(response.length / this.limit);
          console.log('Products loaded (direct array):', response);
          console.log('Products count:', response.length);
        } else {
          this.error = 'Failed to load products for this subcategory';
          this.filteredProducts = [];
          this.resetPagination();
          console.log('No products found for subcategory:', subCategoryId);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products for subcategory:', subCategoryId, err);
        this.error = 'Error loading products. Please try again.';
        this.filteredProducts = [];
        this.resetPagination();
        this.loading = false;
      }
    });
  }

  loadProductsByCategory(categoryId: string): void {
    this.loading = true;
    this.error = null;
    
    // For main category, we'll filter from all products or call a category API if available
    const category = this.categories.find(c => c._id === categoryId);
    if (category) {
      // Filter products by category name from all products
      this.filteredProducts = this.allProducts.filter(product => 
        product.category === category.name
      );
      console.log('Products filtered for category:', category.name, this.filteredProducts);
    }
    this.loading = false;
  }

  get filteredCategories(): Category[] {
    let filtered = this.categories;
    
    // Filter by search term if provided
    if (this.categorySearch) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(this.categorySearch.toLowerCase()) ||
        category.description.toLowerCase().includes(this.categorySearch.toLowerCase())
      );
    }
    
    // Only show categories that have subcategories with data (not just IDs)
    filtered = filtered.filter(category => {
      if (!category.subcategories || category.subcategories.length === 0) {
        return false;
      }
      
      // Check if subcategories have actual data (not just string IDs)
      const hasDataSubcategories = category.subcategories.some((sub: any) => 
        typeof sub === 'object' && sub._id && sub.name
      );
      
      return hasDataSubcategories;
    });
    
    return filtered;
  }

  toggleCategory(categoryId: string): void {
    if (this.selectedCategoryId === categoryId) {
      // إذا كانت مفتوحة، نغلقها
      this.selectedCategoryId = null;
      this.selectedSubCategoryId = null;
      this.filteredProducts = []; // Don't load all products
    } else {
      // نفتح الصنف الجديدة
      this.selectedCategoryId = categoryId;
      this.selectedSubCategoryId = null;
      this.filteredProducts = []; // Clear products when opening category
      // لا نحمل منتجات هنا، فقط نفتح Subcategories
    }
  }

  selectSubCategory(subCategory: any): void {
    // Get the subcategory ID
    const id = typeof subCategory === 'object' ? subCategory._id : subCategory;
    console.log('SubCategory selected:', { subCategory, id, type: typeof subCategory });
    
    this.selectedSubCategoryId = id;
    this.resetPagination();
    this.loadProductsBySubcategory(id, 1);
  }

  onProductSearch(): void {
    if (!this.selectedSubCategoryId) return;
    
    if (!this.productSearch.trim()) {
      // If search is empty, reload all products for the selected subcategory
      this.loadProductsBySubcategory(this.selectedSubCategoryId);
    } else {
      // Apply search filter to current products
      this.applyProductSearch();
    }
  }

  applyProductSearch(): void {
    if (!this.allProducts || this.allProducts.length === 0) {
      // If we don't have all products loaded, load them first
      this.loadAllProducts();
      return;
    }

    const query = this.productSearch.toLowerCase().trim();
    
    // Filter products by name only
    this.filteredProducts = this.allProducts.filter(product => 
      product.name.toLowerCase().includes(query)
    );
    
    console.log(`Search results for "${query}":`, this.filteredProducts.length, 'products found');
  }

  clearSearch(): void {
    this.productSearch = '';
    if (this.selectedSubCategoryId) {
      // Reload products for the selected subcategory from page 1
      this.resetPagination();
      this.loadProductsBySubcategory(this.selectedSubCategoryId, 1);
    }
  }

  clearAllFilters(): void {
    this.selectedCategoryId = null;
    this.selectedSubCategoryId = null;
    this.categorySearch = '';
    this.productSearch = '';
    this.filteredProducts = []; // Don't load all products
    this.loading = false;
    this.error = null;
  }

  getCurrentSelectionName(): string {
    if (this.selectedSubCategoryId) {
      return this.getSubCategoryName(this.selectedSubCategoryId);
    }
    if (this.selectedCategoryId) {
      const category = this.categories.find(c => c._id === this.selectedCategoryId);
      return category?.name || '';
    }
    return '';
  }

  getCurrentSelectionCount(): number {
    return this.filteredProducts.length;
  }

  getSubCategoryName(subCategory: any): string {
    // Handle both string IDs and object references
    const id = typeof subCategory === 'object' ? subCategory._id || subCategory.id : subCategory;
    
    // Mock subcategory names - in real app, you'd fetch this from API
    const subCategoryNames: { [key: string]: string } = {
      '1': 'منظفات الأرضيات',
      '2': 'منظفات المطبخ',
      '3': 'منظفات الحمام',
      '4': 'منظفات الزجاج',
      '5': 'منظفات الملابس',
      '6': 'أدوات المطبخ',
      '7': 'أدوات التنظيف',
      '8': 'أدوات الحمام',
      '9': 'أدوات الغسيل',
      '10': 'منتجات العناية بالبشرة',
      '11': 'منتجات العناية بالشعر',
      '12': 'منتجات العناية الشخصية'
    };
    return subCategoryNames[id] || 'صنف فرعية';
  }

  getSubCategoryProductCount(subCategory: any): number {
    // If the subcategory object has productCount, use it
    if (typeof subCategory === 'object' && subCategory.productCount !== undefined) {
      return subCategory.productCount || 0;
    }
    
    // Fallback to 0 if no product count available yet
    return 0;
  }

  // Get subcategories that have actual data (not just IDs)
  getSubcategoriesWithData(category: Category): any[] {
    if (!category.subcategories) return [];
    
    return category.subcategories.filter((sub: any) => 
      typeof sub === 'object' && sub._id && sub.name
    );
  }

  // Get display name for subcategory
  getSubCategoryDisplayName(subCategory: any): string {
    if (typeof subCategory === 'object' && subCategory.name) {
      return subCategory.name;
    }
    
    // Fallback to ID if no name available
    const id = typeof subCategory === 'string' ? subCategory : subCategory._id || subCategory.id;
    return this.getSubCategoryName(id);
  }

  // Helper method to safely extract subcategory ID
  getSubCategoryId(subCategory: any): string {
    return typeof subCategory === 'object' ? subCategory._id || subCategory.id : subCategory;
  }



  onAddToCart(product: Product): void {
    // Product added to cart via product card component
    console.log('Product added to cart:', product);
  }

  // Helper method to clean image URLs from API response
  getCleanImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // Remove data-src wrapper if exists
    if (imageUrl.includes('data-src=')) {
      const match = imageUrl.match(/data-src="([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Remove extra quotes if exists
    if (imageUrl.startsWith('"') && imageUrl.endsWith('"')) {
      return imageUrl.slice(1, -1);
    }
    
    // Remove escaped quotes if exists
    if (imageUrl.includes('\\"')) {
      return imageUrl.replace(/\\"/g, '');
    }
    
    return imageUrl;
  }

  // Pagination methods
  resetPagination(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalProducts = 0;
    this.pagination = null;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    if (this.selectedSubCategoryId) {
      this.loadProductsBySubcategory(this.selectedSubCategoryId, page);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}