import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeClass = 'dark-mode';

  enableDarkMode() {
    document.body.classList.add(this.darkModeClass);
    localStorage.setItem('theme', 'dark');
  }

  enableLightMode() {
    document.body.classList.remove(this.darkModeClass);
    localStorage.setItem('theme', 'light');
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else {
      this.enableLightMode();
    }
  }
}
