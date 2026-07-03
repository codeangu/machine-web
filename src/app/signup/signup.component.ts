import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required], // Backend ke mutabiq
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user'] // Default role
    });
  }

// signup.component.ts ka onSubmit function
onSubmit() {
  if (this.signupForm.valid && !this.isLoading) {
    this.isLoading = true;
    
    this.authService.signup(this.signupForm.value).subscribe({
      next: (res: any) => { // Added :any
        this.toast.success('Account created successfully! Please sign in.');
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (err: any) => { // Added :any
        console.error(err);
        this.errorMessage = err.error?.msg || 'Server Error';
        this.toast.error(this.errorMessage);
        this.isLoading = false;
      }
    });
  }
}

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}