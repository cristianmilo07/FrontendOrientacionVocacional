import { Injectable, signal, computed, EffectRef, effect } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'app-theme';
  theme = signal<Theme>('dark');
  readonly isDark = computed(() => this.theme() === 'dark');
  private themeEffect?: EffectRef;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey) as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        this.theme.set(stored);
      }
    }

    this.themeEffect = effect(() => {
      const selected = this.theme();
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', selected);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, selected);
      }
    });
  }

  toggle() {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
  }
}
