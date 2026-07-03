import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupService } from '../services/popup.service';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService, 
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], // Email ki jagah Username
      password: ['', [Validators.required]]
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

// login.component.ts ka onSubmit function
onSubmit() {
  if (this.loginForm.valid && !this.isLoading) { 
    this.isLoading = true; 
    
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => { // Added :any
        this.authService.setToken(res.token);
        this.popupService.openModal({ success: true }, 'Login successful');
        
        if (res.user.role === 'admin') {
          this.router.navigate(['/products/add']);
        } else {
          this.router.navigate(['/products/add']);
        }
        this.isLoading = false;
      },
      error: (err: any) => { // Added :any
        this.isLoading = false;
        const msg = err.error?.msg || 'Invalid username or password';
        this.popupService.openModal({ error: true }, msg);
      }
    });
  }
}
}