// src/app/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://machine-api.vercel.app/api/auth'; 
  private userSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.loadUserCredentials();
  }

  // ✅ Signup method (Jo error de raha tha ab theek ho gaya)
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  // ✅ Login method
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        this.setToken(res.token);
        this.userSubject.next(res.user);
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // ✅ Refresh hone par user wapis lane ke liye
  loadUserCredentials() {
    const token = this.getToken();
    if (token) {
      this.getUserDetails().subscribe({
        next: (user: any) => this.userSubject.next(user),
        error: () => {
          console.log("Session expired");
          this.logout(); // Token expire ho to logout kar dein
        }
      });
    }
  }

  getUserDetails(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/me`, { headers });
  }

  getCurrentUser() {
    return this.userSubject.asObservable();
  }

  // ✅ Logout: Jab tak user khud na dabaye logout nahi hoga
  logout() {
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }
}