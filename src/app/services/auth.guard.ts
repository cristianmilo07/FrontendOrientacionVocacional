import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.user()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

export const AuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthGuardService);
  return auth.canActivate();
};
