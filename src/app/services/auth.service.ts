import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

export interface AuthUser {
  username: string;
  role: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  user = signal<AuthUser | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    if (typeof localStorage !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        this.token.set(storedToken);
        this.user.set(JSON.parse(storedUser));
      }
    }
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser } | { message: string; activeSession: boolean; user: { username: string; name: string; lastLogin: string } }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.token.set(response.token);
          this.user.set(response.user);
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }),
      map((response: any) => response.user || null),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  forceLogin(username: string) {
    return this.http.post<{ token: string; user: AuthUser }>(`${this.apiUrl}/force-login`, { username }).pipe(
      tap((response) => {
        this.token.set(response.token);
        this.user.set(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      map((response) => response.user),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  logout() {
    const token = this.token();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
