// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'AlfalahDental';
  showFooter = true;
  showHeader = true;

  constructor(private authService: AuthService, private router: Router) {
    // 1. App start hote hi check karein ke purana session hai ya nahi
    this.authService.loadUserCredentials();

    // 2. Header/Footer hide/show logic
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentRoute = event.urlAfterRedirects;
      if (currentRoute.includes('/login') || currentRoute.includes('/signup')) {
        this.showHeader = false;
        this.showFooter = false;
      } else {
        this.showHeader = true;
        this.showFooter = true;
      }
    });
  }

  ngOnInit() {
    // Page refresh par user details ko sync mein rakhne ke liye subscription
    this.authService.getCurrentUser().subscribe(user => {
      // Yahan aap user status monitor kar sakte hain
    });
  }
}