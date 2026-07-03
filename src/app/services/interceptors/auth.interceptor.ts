// src/app/services/interceptors/auth.interceptor.ts
import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');

    if (token) {
      request = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!this.router.url.includes('/login')) {
          const errorMsg = error?.error?.msg || error?.error?.message || '';
          const isTokenError =
            error.status === 401 ||
            error.status === 403 ||
            errorMsg.toLowerCase().includes('invalid token') ||
            errorMsg.toLowerCase().includes('token expired') ||
            errorMsg.toLowerCase().includes('jwt expired') ||
            errorMsg.toLowerCase().includes('not authorized');

          if (isTokenError) {
            // Lazy resolve — circular dependency break karta hai
            const authService = this.injector.get(AuthService);
            authService.logout();
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
