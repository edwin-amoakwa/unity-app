// angular import
import {Component, inject} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {UntypedFormBuilder, Validators, ReactiveFormsModule, FormGroup} from '@angular/forms';
import {AuthService, RequestPasswordPayload} from '../../auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-password-reset',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(UntypedFormBuilder);

  resetForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.resetForm = this.fb.group({
      username: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const payload: RequestPasswordPayload = this.resetForm.value;

      try {
        const response = await this.authService.requestPassword(payload);
        this.isLoading = false;

        if(response.success) {
          this.successMessage = 'Password reset instructions have been sent to you.';
          this.resetForm.reset();
        } else {
          this.errorMessage = response.message || 'Failed to send password reset instructions.';
        }
        console.log('Password reset request successful:', response);
      } catch (error: any) {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to send password reset instructions. Please try again.';
        console.error('Password reset error:', error);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      control?.markAsTouched();
    });
  }

  get username() {
    return this.resetForm.get('username');
  }
}
