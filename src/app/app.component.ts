import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { InstallPromptComponent } from './components/install-prompt/install-prompt.component';
import { filter } from 'rxjs/operators';
import { trigger, transition, style, animate, query } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, InstallPromptComponent],
  template: `
    <app-header></app-header>
    <main [@routeAnimations]="prepareRoute(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </main>
    <app-install-prompt></app-install-prompt>
  `,
  styles: [],
  animations: [
    trigger('routeAnimations', [
      transition('* => *', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
          })
        ], { optional: true }),
        query(':enter', [style({ opacity: 0, transform: 'translateY(20px)' })], { optional: true }),
        query(':leave', [animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))], { optional: true }),
        query(':enter', [animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))], { optional: true })
      ])
    ])
  ]
})
export class AppComponent {
  title = 'الفتح للأدوات المنزلية';
  
  constructor(private router: Router) {
    // Add class to body when navigation starts and remove when it ends
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart || event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        document.body.classList.add('page-transitioning');
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => {
          document.body.classList.remove('page-transitioning');
        }, 400); // Match the animation duration
      }
    });
  }
  
  // Helper method for the route animations
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
