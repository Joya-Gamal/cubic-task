import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Bank | Sign In'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Bank | Dashboard'
  },
  {
    path: 'customers/:cif',
    loadComponent: () =>
      import('./features/customer-details/customer-details.component').then(
        m => m.CustomerDetailsComponent
      ),
    canActivate: [authGuard],
    title: 'Bank | Customer Details'
  },
  {
    path: 'accounts/:id/transactions',
    loadComponent: () =>
      import('./features/transactions/transaction-list/transaction-list.component').then(
        m => m.TransactionListComponent
      ),
    canActivate: [authGuard],
    title: 'Bank | Account Transactions'
  },
  {
    path: 'insights',
    loadComponent: () =>
      import('./features/insights/insights.component').then(m => m.InsightsComponent),
    canActivate: [authGuard],
    title: 'Bank | Monthly Insights'
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
