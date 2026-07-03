import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    if (token) {
      this.router.navigate(['/add-sale']); // ✅ Login hai, login page nahi, sale par bhejo
      return false;
    } else {
      return true; // ❌ Login nahi, login page kholo
    }
  }
}
