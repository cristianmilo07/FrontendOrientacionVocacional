import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

export interface StudentUser {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
}

@Component({
  selector: 'app-manage-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-students.component.html',
  styleUrl: './manage-students.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageStudentsComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  students = signal<StudentUser[]>([]);
  loading = signal(false);
  savingId = signal<string | null>(null);
  message = signal('');
  success = signal(false);

  editingId = signal<string | null>(null);
  editName = signal('');
  editPassword = signal('');

  get user() {
    return this.authService.user();
  }

  ngOnInit() {
    if (this.user?.role !== 'admin') {
      this.router.navigate(['/home']);
      return;
    }
    this.load();
  }

  load() {
    this.loading.set(true);
    this.message.set('');
    this.http.get<StudentUser[]>('/api/students').subscribe({
      next: (data) => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.set('Error al cargar estudiantes');
        this.success.set(false);
        this.loading.set(false);
      }
    });
  }

  startEdit(student: StudentUser) {
    this.editingId.set(student.id);
    this.editName.set(student.name);
    this.editPassword.set('');
    this.message.set('');
  }

  logoutUser(student: StudentUser) {
    if (!confirm(`¿Cerrar la sesión de ${student.name}?`)) {
      return;
    }
    this.savingId.set(student.id);
    this.message.set('');
    this.http.post(`/api/users/${student.id}/logout`, {}).subscribe({
      next: (data: any) => {
        this.success.set(true);
        this.message.set(data?.message || 'Sesión cerrada correctamente');
        this.savingId.set(null);
        this.load();
      },
      error: () => {
        this.success.set(false);
        this.message.set('Error al cerrar la sesión');
        this.savingId.set(null);
      }
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editName.set('');
    this.editPassword.set('');
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  save(student: StudentUser) {
    const name = this.editName().trim();
    const password = this.editPassword().trim();
    if (!name) {
      this.message.set('El nombre no puede estar vacío');
      this.success.set(false);
      return;
    }

    this.savingId.set(student.id);
    this.message.set('');
    const body: any = { name };
    if (password) body.password = password;

    this.http.patch(`/api/users/${student.id}`, body).subscribe({
      next: (data: any) => {
        this.success.set(true);
        this.message.set(data?.message || 'Usuario actualizado correctamente');
        this.cancelEdit();
        this.load();
        this.savingId.set(null);
      },
      error: () => {
        this.success.set(false);
        this.message.set('Error al actualizar el usuario');
        this.savingId.set(null);
      }
    });
  }
}
