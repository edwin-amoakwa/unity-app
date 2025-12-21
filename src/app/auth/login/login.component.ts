// angular import
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {UntypedFormBuilder, Validators, ReactiveFormsModule, FormGroup} from '@angular/forms';
import {AuthService, LoginPayload} from '../../auth.service';
import {UserSession} from '../../core/user-session';
import {CommonModule} from '@angular/common';
import {UnityConfig} from '../../app-config';
import {MessageBox} from '../../message-helper';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(UntypedFormBuilder);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  private originalTheme: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      userPassword: ['', [Validators.required, Validators.minLength(UnityConfig.PasswordMinLength)]]
    });
  }

  ngOnInit(): void {
    this.originalTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
  }

  ngOnDestroy(): void {
    if (this.originalTheme) {
      document.documentElement.setAttribute('data-theme', this.originalTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  async onSubmit() {
    if(this.loginForm.valid == false)
    {
      this.errorMessage = "Please enter valid username and password (min of 8 characters)";
      MessageBox.error(this.errorMessage)
      this.markFormGroupTouched();
    }


      this.isLoading = true;
      this.errorMessage = '';

      const payload: LoginPayload = this.loginForm.value;

      try {
        const response = await this.authService.login(payload);
        this.isLoading = false;
        // Handle successful login - could store token, redirect, etc.
        console.log('Login successful:', response);
        if(response.success)
        {
          UserSession.login(response.data);
        }
        this.router.navigate(['/dashboard']); // Adjust route as needed
      } catch (error: any) {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }

  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get userPassword() {
    return this.loginForm.get('userPassword');
  }
}
