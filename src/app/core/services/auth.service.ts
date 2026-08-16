import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginCredentials } from '../models/auth.model';
import { MessageService } from 'primeng/api';

const SESSION_STORAGE_KEY = 'bank_user_session';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private messageService = inject(MessageService);

  private currentUserSignal = signal<User | null>(
    this.getStoredSession()
  );

  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isLoggedIn = computed(
    () => this.currentUserSignal() !== null
  );

  readonly userRole = computed(
    () => this.currentUserSignal()?.role ?? null
  );

  login(credentials: LoginCredentials): boolean {
    const email = credentials.email.toLowerCase().trim();

    const namePart = email
      .split('@')[0]
      .replace(/[._-]/g, ' ');

    const formattedName = namePart
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const user: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formattedName,
      email,
      role: 'Bank Admin'
    };

    this.currentUserSignal.set(user);

    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(user)
      );
    } catch (e) {
      console.warn(
        'Could not persist session to localStorage',
        e
      );
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Authentication Successful',
      detail: `Welcome back, ${user.name}!`
    });

    return true;
  }

  logout(): void {
    this.currentUserSignal.set(null);

    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn(
        'Could not remove session from localStorage',
        e
      );
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Signed Out',
      detail: 'You have been securely signed out.'
    });

    this.router.navigate(['/login']);
  }

  private getStoredSession(): User | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);

      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(
        'Error reading stored session',
        e
      );
    }

    return null;
  }
}