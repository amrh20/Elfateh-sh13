import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Product, Category, SubCategory } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  // Fallback mock products for development/testing
  private fallbackProducts: Product[] = [
    {
      _id: '1',
      name: 'منظف أرضيات لافندر',
      description: 'منظف أرضيات عالي الجودة برائحة اللافندر',
      price: 45.99,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      category: 'منظفات',
      brand: 'كلين برو',
      stock: 50,
      rating: 4.8,
      reviews: 120,
      featured: true,
      bestSeller: false,
      specialOffer: false
    },
    {
      _id: '2',
      name: 'مكواة بخار كهربائية',
      description: 'مكواة بخار احترافية مع خزان مياه كبير',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      category: 'أدوات منزلية',
      brand: 'إير برو',
      stock: 25,
      rating: 4.6,
      reviews: 89,
      featured: false,
      bestSeller: true,
      specialOffer: false
    },
    {
      _id: '3',
      name: 'طقم أواني طبخ',
      description: 'طقم أواني طبخ من الستانلس ستيل عالي الجودة',
      price: 599.99,
      image: 'https://images.unsplash.com/photo-1556909114-fcd25c85cd64?w=400',
      category: 'أدوات مطبخ',
      brand: 'كوك برو',
      stock: 15,
      rating: 4.9,
      reviews: 156,
      featured: true,
      bestSeller: true,
      specialOffer: false
    },
    {
      _id: '4',
      name: 'منظف زجاج',
      description: 'منظف زجاج بدون آثار مع رائحة منعشة',
      price: 25.99,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      category: 'منظفات',
      brand: 'كلين برو',
      stock: 100,
      rating: 4.5,
      reviews: 78,
      featured: false,
      bestSeller: false,
      specialOffer: true
    },
    {
      _id: '5',
      name: 'منتج مميز إضافي',
      description: 'منتج مميز للاختبار',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      category: 'منظفات',
      brand: 'تست برو',
      stock: 30,
      rating: 4.9,
      reviews: 200,
      productType: 'featured',
      featured: false,
      bestSeller: false,
      specialOffer: false
    },
    {
      _id: '6',
      name: 'منتج الأكثر مبيعاً إضافي',
      description: 'منتج الأكثر مبيعاً للاختبار',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      category: 'أدوات منزلية',
      brand: 'سيل برو',
      stock: 40,
      rating: 4.7,
      reviews: 300,
      productType: 'bestSeller',
      featured: false,
      bestSeller: false,
      specialOffer: false
    },
    {
      _id: '7',
      name: 'عرض خاص إضافي',
      description: 'عرض خاص للاختبار',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1556909114-fcd25c85cd64?w=400',
      category: 'أدوات مطبخ',
      brand: 'أوفر برو',
      stock: 60,
      rating: 4.4,
      reviews: 150,
      productType: 'specialOffer',
      featured: false,
      bestSeller: false,
      specialOffer: false
    }
  ];

  // Fallback mock categories for development/testing
  private fallbackCategories: Category[] = [
    {
      _id: '1',
      name: 'منظفات',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      description: 'جميع أنواع المنظفات المنزلية',
      isActive: true,
      parent: null,
      ancestors: [],
      subcategories: ['1', '2', '3', '4']
    },
    {
      _id: '2',
      name: 'أدوات منزلية',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      description: 'الأدوات الكهربائية والمنزلية',
      isActive: true,
      parent: null,
      ancestors: [],
      subcategories: ['5', '6', '7', '8', '9']
    },
    {
      _id: '3',
      name: 'أدوات مطبخ',
      image: 'https://images.unsplash.com/photo-1556909114-fcd25c85cd64?w=400',
      description: 'أدوات الطبخ والطهي الاحترافية',
      isActive: true,
      parent: null,
      ancestors: [],
      subcategories: ['10', '11', '12', '13']
    }
  ];

  getProducts(): Observable<Product[]> {
    // Try to get products from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/products`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackProducts;
      }),
      catchError(() => {
        console.log('Using fallback products');
        return of(this.fallbackProducts);
      })
    );
  }

  getProductById(id: string | number): Observable<Product | undefined> {
    // Try to get product from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/products/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackProducts.find(p => p._id === id);
      }),
      catchError(() => {
        console.log('Using fallback product');
        return of(this.fallbackProducts.find(p => p._id === id));
      })
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    // Try to get products by category from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/products/category/${category}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackProducts.filter(p => p.category === category);
      }),
      catchError(() => {
        console.log('Using fallback products by category');
        return of(this.fallbackProducts.filter(p => p.category === category));
      })
    );
  }

  getProductsBySubcategory(subcategoryId: string): Observable<Product[]> {
    // Call the subcategory products API endpoint
    return this.http.get<any>(`${environment.apiUrl}/products/subcategory/${subcategoryId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError((err) => {
        console.error('Error loading products for subcategory:', subcategoryId, err);
        return of([]);
      })
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    // Try to get featured products from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/products/featured`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackProducts.filter(p => p.featured === true).slice(0, 4);
      }),
      catchError(() => {
        console.log('Using fallback featured products');
        return of(this.fallbackProducts.filter(p => p.featured === true).slice(0, 4));
      })
    );
  }

  getBestSellers(): Observable<Product[]> {
    // Try to get best sellers from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/products/bestsellers`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackProducts.filter(p => p.bestSeller === true).slice(0, 4);
      }),
      catchError(() => {
        console.log('Using fallback best sellers');
        return of(this.fallbackProducts.filter(p => p.bestSeller === true).slice(0, 4));
      })
    );
  }

  getOnSaleProducts(): Observable<Product[]> {
    // Try to get on-sale products from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/products/onsale`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackProducts.filter(p => p.specialOffer === true).slice(0, 4);
      }),
      catchError(() => {
        console.log('Using fallback on-sale products');
        return of(this.fallbackProducts.filter(p => p.specialOffer === true).slice(0, 4));
      })
    );
  }

  getCategories(): Observable<Category[]> {
    // Try to get categories from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/categories`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackCategories;
      }),
      catchError(() => {
        console.log('Using fallback categories');
        return of(this.fallbackCategories);
      })
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    // Try to search products from API first, fallback to mock data
    return this.http.get<any>(`${environment.apiUrl}/products/search?q=${encodeURIComponent(query)}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return this.fallbackProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(query.toLowerCase())
        );
      }),
      catchError(() => {
        console.log('Using fallback search');
        return of(this.fallbackProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(query.toLowerCase())
        ));
      })
    );
  }

  // Get products with filters and pagination
  getProductsWithFilters(queryString: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/products?${queryString}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response;
        }
        // Fallback to mock data if API fails
        return {
          success: true,
          data: {
            products: this.fallbackProducts,
            total: this.fallbackProducts.length,
            page: 1,
            limit: 12
          }
        };
      }),
      catchError((err) => {
        console.error('Error loading products with filters:', err);
        // Return fallback data
        return of({
          success: true,
          data: {
            products: this.fallbackProducts,
            total: this.fallbackProducts.length,
            page: 1,
            limit: 12
          }
        });
      })
    );
  }

  // Get featured products from main products API
  getFeaturedProductsFromAPI(): Observable<Product[]> {
    return this.http.get<any>(`${environment.apiUrl}/products`).pipe(
      map(response => {
        console.log('Featured Products API Response:', response);
        
        // Handle direct array response
        let products: Product[] = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            products = response.data;
          } else if (response.data.products) {
            products = response.data.products;
          }
        }
        
        console.log('Products array length:', products.length);
        
        if (products.length > 0) {
          // Filter products where featured: true OR productType: "featured"
          const featuredProducts = products.filter((p: Product) => 
            p.featured === true || p.productType === 'featured'
          );
          console.log('Filtered Featured Products:', featuredProducts);
          console.log('Products with featured flags:', products.map((p: Product) => ({
            name: p.name,
            featured: p.featured,
            productType: p.productType,
            bestSeller: p.bestSeller,
            specialOffer: p.specialOffer
          })));
          return featuredProducts.slice(0, 4);
        }
        
        // Fallback to existing method if API structure is different
        console.log('Using fallback for featured products');
        return this.fallbackProducts.filter(p => p.featured === true).slice(0, 4);
      }),
      catchError((error) => {
        console.error('Error in getFeaturedProductsFromAPI:', error);
        console.log('Using fallback featured products');
        return of(this.fallbackProducts.filter(p => p.featured === true).slice(0, 4));
      })
    );
  }

  // Get best sellers from main products API
  getBestSellersFromAPI(): Observable<Product[]> {
    return this.http.get<any>(`${environment.apiUrl}/products`).pipe(
      map(response => {
        console.log('Best Sellers API Response:', response);
        
        // Handle direct array response
        let products: Product[] = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            products = response.data;
          } else if (response.data.products) {
            products = response.data.products;
          }
        }
        
        console.log('Products array length:', products.length);
        
        if (products.length > 0) {
          // Filter products where bestSeller: true OR productType: "bestSeller"
          const bestSellerProducts = products.filter((p: Product) => 
            p.bestSeller === true || p.productType === 'bestSeller'
          );
          console.log('Filtered Best Seller Products:', bestSellerProducts);
          console.log('Products with bestSeller flags:', products.map((p: Product) => ({
            name: p.name,
            featured: p.featured,
            productType: p.productType,
            bestSeller: p.bestSeller,
            specialOffer: p.specialOffer
          })));
          return bestSellerProducts.slice(0, 4);
        }
        
        // Fallback to existing method if API structure is different
        console.log('Using fallback for best sellers');
        return this.fallbackProducts.filter(p => p.bestSeller === true).slice(0, 4);
      }),
      catchError((error) => {
        console.error('Error in getBestSellersFromAPI:', error);
        console.log('Using fallback best sellers');
        return of(this.fallbackProducts.filter(p => p.bestSeller === true).slice(0, 4));
      })
    );
  }

  // Get special offer products from main products API
  getSpecialOfferProductsFromAPI(): Observable<Product[]> {
    return this.http.get<any>(`${environment.apiUrl}/products`).pipe(
      map(response => {
        console.log('Special Offer Products API Response:', response);
        
        // Handle direct array response
        let products: Product[] = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            products = response.data;
          } else if (response.data.products) {
            products = response.data.products;
          }
        }
        
        console.log('Products array length:', products.length);
        
        if (products.length > 0) {
          // Filter products where specialOffer: true OR productType: "specialOffer"
          const specialOfferProducts = products.filter((p: Product) => 
            p.specialOffer === true || p.productType === 'specialOffer'
          );
          console.log('Filtered Special Offer Products:', specialOfferProducts);
          console.log('Products with specialOffer flags:', products.map((p: Product) => ({
            name: p.name,
            featured: p.featured,
            productType: p.productType,
            bestSeller: p.bestSeller,
            specialOffer: p.specialOffer
          })));
          return specialOfferProducts.slice(0, 4);
        }
        
        // Fallback to existing method if API structure is different
        console.log('Using fallback for special offer products');
        return this.fallbackProducts.filter(p => p.specialOffer === true).slice(0, 4);
      }),
      catchError((error) => {
        console.error('Error in getSpecialOfferProductsFromAPI:', error);
        console.log('Using fallback special offer products');
        return of(this.fallbackProducts.filter(p => p.specialOffer === true).slice(0, 4));
      })
    );
  }

  // Test method to check API response structure
  testAPIResponse(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/products`).pipe(
      map(response => {
        console.log('=== API Response Test ===');
        console.log('Full Response:', response);
        console.log('Response Type:', typeof response);
        console.log('Is Array:', Array.isArray(response));
        
        // Handle different response structures
        let products: Product[] = [];
        if (Array.isArray(response)) {
          products = response;
          console.log('Direct Array Response');
        } else if (response.data) {
          console.log('Response Keys:', Object.keys(response));
          console.log('Data Keys:', Object.keys(response.data));
          if (Array.isArray(response.data)) {
            products = response.data;
            console.log('Data is Array');
          } else if (response.data.products) {
            products = response.data.products;
            console.log('Data has products property');
          }
        }
        
        if (products.length > 0) {
          console.log('Products Array Length:', products.length);
          console.log('First Product Sample:', products[0]);
          
          // Check productType values
          const productTypes = products.map(p => p.productType).filter(Boolean);
          console.log('Product Types found:', [...new Set(productTypes)]);
          
          // Filter by productType
          console.log('Products with productType "featured":', products.filter((p: Product) => p.productType === 'featured'));
          console.log('Products with productType "bestSeller":', products.filter((p: Product) => p.productType === 'bestSeller'));
          console.log('Products with productType "specialOffer":', products.filter((p: Product) => p.productType === 'specialOffer'));
          
          // Filter by boolean flags
          console.log('Products with featured: true flag:', products.filter((p: Product) => p.featured === true));
          console.log('Products with bestSeller: true flag:', products.filter((p: Product) => p.bestSeller === true));
          console.log('Products with specialOffer: true flag:', products.filter((p: Product) => p.specialOffer === true));
        }
        
        return response;
      }),
      catchError((error) => {
        console.error('Error testing API:', error);
        return of(null);
      })
    );
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
} 