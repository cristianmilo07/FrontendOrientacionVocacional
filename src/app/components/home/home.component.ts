import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  selectedOption = signal<string | null>(null);
  showInstructions = signal(false);
  private countdown?: number;

  get user() {
    return this.authService.user();
  }

  ngOnInit() {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('showInstructions') === 'true') {
      sessionStorage.removeItem('showInstructions');
      this.showInstructions.set(true);
      this.countdown = window.setTimeout(() => {
        this.showInstructions.set(false);
      }, 6000);
    }
  }

  ngOnDestroy() {
    if (this.countdown) {
      clearTimeout(this.countdown);
    }
  }

  closeInstructions() {
    if (this.countdown) {
      clearTimeout(this.countdown);
    }
    this.showInstructions.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
