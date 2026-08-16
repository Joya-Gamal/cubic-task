import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { Toast } from 'primeng/toast';
import { AuthService } from './core/services/auth.service';
import { BankingService } from './core/services/banking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    Toast
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  authService = inject(AuthService);
  bankingService = inject(BankingService);

  isAuthPage = signal<boolean>(false);
  isSidebarOpen = signal<boolean>(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage.set(event.urlAfterRedirects.includes('/login'));
      this.isSidebarOpen.set(false);
    });
  }
}
