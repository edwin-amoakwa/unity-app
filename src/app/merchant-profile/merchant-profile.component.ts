// angular import
import {Component, OnDestroy, OnInit, inject, ViewChild, ElementRef} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';
import {DataLookupService} from '../core/services/data-lookup.service';
import {UserSession} from '../core/user-session';
import {MerchantService} from '../merchant.service';
import {SmsChannelPriceComponent} from '../sms-channel-price/sms-channel-price.component';


@Component({
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule, Select, InputText, Textarea, SmsChannelPriceComponent],
  templateUrl: './merchant-profile.component.html',
  standalone: true,
  styleUrls: ['./merchant-profile.component.css']
})
export class MerchantProfileComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = false;

  verifyMessage: string = '';

  merchant:any = {}

  fileString: any;
  fileName: any;

  // Map of form control names to human-friendly labels for error messages
  private readonly fieldLabels: Record<string, string> = {
    merchantName: 'Company name',
    contactPerson: 'Contact person',
    industryId: 'Industry',
    countryId: 'Country',
    contactMobileNo: 'Mobile number',
    emailAddress: 'Email address',
    userPassword: 'Password',
    agreeToTerms: 'Terms and Conditions',
    billingAddress: 'Billing address'
  };

  countries: any[] = [];
  industries: any[] = [];

  phoneNumberLength: number | null = null;
  mobilePattern: string | null = null;
  private countryChangeSub: any;


  private merchantService = inject(MerchantService);
  private dataLookup = inject(DataLookupService);


  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {

    this.initializeForm();
    this.handleCountryChange();
    this.loadLookUps();

 this.loadMerchant();

  }

  async loadMerchant(){
    let response = await this.merchantService.getMerchant(UserSession.getMerchantId());
    this.merchant = response.data;
    this.registerForm.patchValue(this.merchant);
  }

  ngOnDestroy(): void {

    if (this.countryChangeSub?.unsubscribe) {
      this.countryChangeSub.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      id: "",
      merchantName: ['', [Validators.required, Validators.minLength(2)]],
      contactName: ['', [Validators.required, Validators.minLength(2)]],
      countryId: [{ value: '', disabled: true }],
      industryId: ['', [Validators.required]],
      contactMobileNo: ['', [Validators.required]],
      emailAddress: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(5)]],
      billingAddress: ['', [Validators.required, Validators.minLength(5)]],
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



  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onFileChange(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length)
    {
      const [file] = event.target.files;
      if (file) {
        reader.readAsDataURL(file);
      }
      reader.onload = () => {
        this.fileString = reader.result;
      };
      this.fileName = file.name;
    }
  }


  async updateProfile(): Promise<void> {
    // Called after successful PIN verification
    this.isLoading = true;
    const formData = this.registerForm.value;

    formData.registrationFileName = this.fileName;
    formData.registrationDocFile = this.fileString;

    try {
      const response = await this.merchantService.updateMerchant(formData);
      console.log('Registration successful:', response);

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
        if (fieldName === 'contactMobileNo' && this.phoneNumberLength) {
          return `Please enter a valid mobile number with ${this.phoneNumberLength} digits`;
        }
        return 'Invalid format';
      }
      if (field.errors['requiredTrue']) return 'You must agree to the terms and conditions';
    }
    return '';
  }




}
