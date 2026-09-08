import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

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
    return this.http.post<{ token: string; user: AuthUser }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response) => {
        this.token.set(response.token);
        this.user.set(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      map((response) => response.user),
      catchError(() => of(null))
    );
  }

  logout() {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
