// angular import
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../auth.service';
import {UserSession} from '../../core/user-session';


@Component({
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      contactPerson: ['', [Validators.required, Validators.minLength(2)]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(8)]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formData = this.registerForm.value;

      // Remove agreeToTerms from the payload as it's not needed by the API
      const registerPayload: any = {
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        mobileNo: formData.mobileNo,
        emailAddress: formData.emailAddress,
        userPassword: formData.userPassword
      };

      try {
        const response = await this.authService.register(registerPayload);
        console.log('Registration successful:', response);
        if(response.success)
        {
          UserSession.login(response.data);
          this.router.navigate(['/dashboard']);
        }
        // Redirect to login page or show success message

      } catch (error) {
        console.error('Registration failed:', error);
        // Handle error - could show error message to user
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid mobile number';
      if (field.errors['requiredTrue']) return 'You must agree to the terms and conditions';
    }
    return '';
  }
}
