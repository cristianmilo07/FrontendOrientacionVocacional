import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-student.component.html',
  styleUrl: './create-student.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateStudentComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  firstName = signal('');
  lastName = signal('');
  password = signal('');
  message = signal('');
  loading = signal(false);
  success = signal(false);

  get user() {
    return this.authService.user();
  }

  ngOnInit() {
    if (this.user?.role !== 'admin') {
      this.router.navigate(['/home']);
    }
  }

  submit() {
    const first = this.firstName().trim();
    const last = this.lastName().trim();
    const pwd = this.password().trim();
    if (!first || !last) {
      this.message.set('Ingresa nombre y apellido');
      this.success.set(false);
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.http.post('/api/users', { firstName: first, lastName: last, password: pwd || undefined }).subscribe({
      next: (data: any) => {
        this.success.set(true);
        this.message.set(data?.message || 'Se ha creado correctamente');
        this.firstName.set('');
        this.lastName.set('');
        this.password.set('');
        this.loading.set(false);
      },
      error: (err) => {
        this.success.set(false);
        this.message.set(err?.error?.message || 'Error al crear el usuario');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
