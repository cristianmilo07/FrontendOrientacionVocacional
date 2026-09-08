import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  students: any[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient, private authService: AuthService) {
    this.http.get<any[]>('http://localhost:3000/api/students').subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los estudiantes';
        this.loading = false;
      }
    });
  }

  get user() {
    return this.authService.user();
  }

  logout() {
    this.authService.logout();
  }
}
