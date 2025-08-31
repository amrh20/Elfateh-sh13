import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  // Company information
  companyInfo = {
    name: 'الفتح للأدوات المنزلية',
    englishName: 'El Fateh for Household Tools',
    founded: '2010',
    mission: 'تقديم أفضل الأدوات المنزلية بجودة عالية وأسعار منافسة',
    vision: 'أن نكون الخيار الأول للمصريين في الأدوات المنزلية',
    values: [
      'الجودة العالية',
      'الأسعار المنافسة',
      'خدمة العملاء المتميزة',
      'الموثوقية والثقة'
    ]
  };

  // Statistics
  stats = [
    { number: '13+', label: 'سنوات من الخبرة' },
    { number: '50K+', label: 'عميل راضي' },
    { number: '1000+', label: 'منتج متنوع' },
    { number: '15+', label: 'فرع في مصر' }
  ];

  // Team members
  team = [
    {
      name: 'أحمد محمد',
      position: 'المدير التنفيذي',
      image: 'https://via.placeholder.com/150',
      description: 'خبرة 15 عام في مجال الأدوات المنزلية'
    },
    {
      name: 'فاطمة علي',
      position: 'مدير المبيعات',
      image: 'https://via.placeholder.com/150',
      description: 'متخصصة في تطوير استراتيجيات المبيعات'
    },
    {
      name: 'محمد حسن',
      position: 'مدير الجودة',
      image: 'https://via.placeholder.com/150',
      description: 'ضمان أعلى معايير الجودة في جميع منتجاتنا'
    }
  ];

  // Services
  services = [
    {
      title: 'منتجات متنوعة',
      description: 'نوفر تشكيلة واسعة من الأدوات المنزلية عالية الجودة',
      icon: '🛠️'
    },
    {
      title: 'خدمة التوصيل',
      description: 'خدمة توصيل سريعة وآمنة لجميع أنحاء مصر',
      icon: '🚚'
    },
    {
      title: 'ضمان الجودة',
      description: 'ضمان شامل على جميع منتجاتنا مع خدمة ما بعد البيع',
      icon: '✅'
    },
    {
      title: 'أسعار منافسة',
      description: 'أفضل الأسعار مع خصومات وعروض خاصة',
      icon: '💰'
    }
  ];

  // Contact information
  contactInfo = {
    phone: '+20 123 456 7890',
    email: 'info@elfateh.com',
    address: 'القاهرة، مصر'
  };
} 