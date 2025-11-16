// angular import
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { UserSession } from '../../core/user-session';
import { DataLookupService } from '../../core/services/data-lookup.service';
import {Select} from 'primeng/select';
import {UnityConfig} from '../../app-config';
import {Button} from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';


@Component({
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, Select, Dialog, TermsAndConditionsComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = false;

  countries: any[] = [];
  // Dynamic validators for mobile number based on selected country
  phoneNumberLength: number | null = null;
  mobilePattern: string | null = null;
  private countryChangeSub: any;

  private authService = inject(AuthService);
  private router = inject(Router);
  private dataLookup = inject(DataLookupService);
  private originalTheme: string | null = null;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.originalTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');

    this.initializeForm();
    this.handleCountryChange();
    this.loadCountries();

    // Terms & Conditions are now a standalone component rendered in a dialog.
  }

  ngOnDestroy(): void {
    if (this.originalTheme) {
      document.documentElement.setAttribute('data-theme', this.originalTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (this.countryChangeSub?.unsubscribe) {
      this.countryChangeSub.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      "id": "",
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      contactPerson: ['', [Validators.required, Validators.minLength(2)]],
      countryId: [''],
      // Start with required only; will be updated dynamically when country changes
      mobileNo: ['', [Validators.required]],
      emailAddress: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(UnityConfig.PasswordMinLength)]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    });
  }

  private async loadCountries(): Promise<void> {
    try {
      let response = await this.dataLookup.getCountries();
      this.countries = response.data;
      // If a country is already selected (e.g., from a previous state), apply validators now
      const selectedId = this.registerForm.get('countryId')?.value;
      if (selectedId) {
        this.updateMobileValidators(selectedId);
      }
    } catch (e) {
      console.error('Failed to load countries', e);
      this.countries = [];
    }
  }

  private handleCountryChange(): void {
    const countryControl = this.registerForm.get('countryId');
    if (!countryControl) return;
    this.countryChangeSub = countryControl.valueChanges.subscribe((countryId: any) => {
      this.updateMobileValidators(countryId);
    });
  }

  private updateMobileValidators(countryId: any): void {
    const control = this.registerForm.get('mobileNo');
    if (!control) return;

    const country = this.countries?.find(c => c.id === countryId);
    // Accept both correct and misspelled property names from backend: mobileLength / mobileLenght
    const length=  country.phoneNumberLength ;

    if (length && length > 0) {
      this.phoneNumberLength = length;
      this.mobilePattern = `^[0-9]{${length}}$`;

      control.setValidators([
        Validators.required,
        Validators.minLength(length),
        Validators.maxLength(length),
        Validators.pattern(new RegExp(`^[0-9]{${length}}$`))
      ]);
    } else {
      // Fallback to just required when no country or length is provided
      this.phoneNumberLength = null;
      this.mobilePattern = null;
      control.setValidators([Validators.required]);
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formData = this.registerForm.value;



      try {
        const response = await this.authService.register(formData);
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
      if (field.errors['minlength']) {
        if (fieldName === 'userPassword') {
          return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
        }
        if (fieldName === 'mobileNo' && this.phoneNumberLength) {
          return `Mobile number must be exactly ${this.phoneNumberLength} digits`;
        }
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        if (fieldName === 'mobileNo' && this.phoneNumberLength) {
          return `Mobile number must be exactly ${this.phoneNumberLength} digits`;
        }
        return `${fieldName} must be at most ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'mobileNo' && this.phoneNumberLength) {
          return `Please enter a valid mobile number with ${this.phoneNumberLength} digits`;
        }
        return 'Invalid format';
      }
      if (field.errors['requiredTrue']) return 'You must agree to the terms and conditions';
    }
    return '';
  }

  // Terms & Conditions dialog state
  displayTerms = false;

  openTerms(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.displayTerms = true;
  }
}
