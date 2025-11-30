// angular import
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AuthService } from '../../auth.service';
import { UserSession } from '../../core/user-session';
import { DataLookupService } from '../../core/services/data-lookup.service';
import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Password} from 'primeng/password';
import {Checkbox} from 'primeng/checkbox';
import {UnityConfig} from '../../app-config';
import { Dialog } from 'primeng/dialog';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';
import {ButtonDirective} from 'primeng/button';


@Component({
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule, Select, Dialog, TermsAndConditionsComponent, InputText, Password, Checkbox, ButtonDirective],
  templateUrl: './register.component.html',
  styleUrls: []
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = false;
  displayTerms = false;
  currentStep: 'form' | 'verify' = 'form';
  verifyEmail: string = '';
  pin: string = '';
  verifyMessage: string = '';

  // Map of form control names to human-friendly labels for error messages
  private readonly fieldLabels: Record<string, string> = {
    companyName: 'Company name',
    contactPerson: 'Contact person',
    industryId: 'Industry',
    countryId: 'Country',
    mobileNo: 'Mobile number',
    emailAddress: 'Email address',
    userPassword: 'Password',
    agreeToTerms: 'Terms and Conditions'
  };

  countries: any[] = [];
  industries: any[] = [];

  phoneNumberLength: number | null = null;
  mobilePattern: string | null = null;
  private countryChangeSub: any;

  private authService = inject(AuthService);
  private router = inject(Router);
  private dataLookup = inject(DataLookupService);
  private document = inject(DOCUMENT);

  private previousThemeAttr: string | null = null;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    // Ensure Register page never uses dark mode: temporarily disable dark theme
    const docEl = this.document?.documentElement;
    if (docEl) {
      this.previousThemeAttr = docEl.getAttribute('data-theme');
      if (this.previousThemeAttr === 'dark') {
        docEl.removeAttribute('data-theme');
      }
    }
    this.initializeForm();
    this.handleCountryChange();
    this.loadLookUps();

  }

  ngOnDestroy(): void {
    // Restore previous theme attribute when leaving Register page
    const docEl = this.document?.documentElement;
    if (docEl) {
      if (this.previousThemeAttr === null) {
        docEl.removeAttribute('data-theme');
      } else {
        docEl.setAttribute('data-theme', this.previousThemeAttr);
      }
    }
    if (this.countryChangeSub?.unsubscribe) {
      this.countryChangeSub.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      id: "",
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      contactPerson: ['', [Validators.required, Validators.minLength(2)]],
      countryId: [''],
      industryId: ['', [Validators.required]],
      mobileNo: ['', [Validators.required]],
      emailAddress: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(UnityConfig.PasswordMinLength)]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    });
  }

  private async loadLookUps(): Promise<void> {
    try {
      let response = await this.dataLookup.getCountries();
      this.countries = response.data;

      const industryResponse = await this.dataLookup.getIndustries();
      this.industries = industryResponse.data ;

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

  async startRegistration(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formData = this.registerForm.value;
      this.verifyEmail = formData.emailAddress;
      try {

        const data:any = {email: this.verifyEmail, mobileNo: formData.mobileNo };
        const resp = await this.authService.sendVerifyPin(data);
        if (resp.success) {
          this.verifyMessage = '';
          this.currentStep = 'verify';
        } else {
          this.verifyMessage = resp.message || 'Failed to send verification PIN.';
        }

      } catch (error) {
        console.error('Failed to send verification PIN:', error);
        this.verifyMessage = 'Failed to send verification PIN.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  async proceedVerification(): Promise<void> {
    if (!this.verifyEmail || !this.pin) {
      this.verifyMessage = 'Please enter the verification PIN.';
      return;
    }

    this.isLoading = true;
    this.verifyMessage = '';
    try {
      const resp = await this.authService.verifyPin({ email: this.verifyEmail, pin: this.pin });
      if (resp.success) {
        // Proceed with actual registration
        await this.register();
      } else {
        this.verifyMessage = resp.message || 'Verification failed.';
      }
    } catch (e) {
      console.error('PIN verification failed:', e);
      this.verifyMessage = 'Verification failed.';
    } finally {
      this.isLoading = false;
    }
  }

  async register(): Promise<void> {
    // Called after successful PIN verification
    this.isLoading = true;
    const formData = this.registerForm.value;
    try {
      const response = await this.authService.register(formData);
      console.log('Registration successful:', response);
      if (response.success) {
        UserSession.login(response.data);
        this.router.navigate(['/dashboard']);
      } else {
        this.verifyMessage = response.message || 'Registration failed.';
      }
    } catch (error) {
      console.error('Registration failed:', error);
      this.verifyMessage = 'Registration failed.';
    } finally {
      this.isLoading = false;
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
    const displayName = this.fieldLabels[fieldName] || fieldName;
    if (field?.errors) {
      if (field.errors['required']) return `${displayName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) {
        if (fieldName === 'userPassword') {
          return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
        }
        if (fieldName === 'mobileNo' && this.phoneNumberLength) {
          return `Mobile number must be exactly ${this.phoneNumberLength} digits`;
        }
        return `${displayName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        if (fieldName === 'mobileNo' && this.phoneNumberLength) {
          return `Mobile number must be exactly ${this.phoneNumberLength} digits`;
        }
        return `${displayName} must be at most ${field.errors['maxlength'].requiredLength} characters`;
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



  openTerms(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.displayTerms = true;
  }
}
