import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  activeSession: { username: string; name: string; lastLogin: string } | null = null;
  theme: 'light' | 'dark' = 'dark';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private themeService: ThemeService) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.theme = this.themeService.theme();
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    this.themeService.setTheme(theme);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.activeSession = null;

    const { username, password } = this.form.value;
    this.authService.login(username, password).pipe()
      .subscribe({
        next: (user) => {
          this.loading = false;
          if (user) {
            sessionStorage.setItem('showInstructions', 'true');
            this.router.navigate(['/home']);
          } else {
            this.error = 'Usuario o contraseña incorrectos';
          }
        },
        error: (err: any) => {
          this.loading = false;
          if (err?.status === 409 && err?.error?.activeSession) {
            this.activeSession = err.error.user;
          } else {
            this.error = 'Error de conexión';
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  forceLogin() {
    if (!this.activeSession) return;
    this.loading = true;
    this.error = '';

    this.authService.forceLogin(this.activeSession.username).pipe()
      .subscribe({
        next: (user) => {
          this.loading = false;
          this.activeSession = null;
          if (user) {
            sessionStorage.setItem('showInstructions', 'true');
            this.router.navigate(['/home']);
          } else {
            this.error = 'No se pudo iniciar sesión';
          }
        },
        error: () => {
          this.loading = false;
          this.error = 'No se pudo iniciar sesión';
        }
      });
  }

  closeModal() {
    this.activeSession = null;
  }
}
