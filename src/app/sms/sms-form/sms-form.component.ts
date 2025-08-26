import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimNG imports
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

// Project imports
import { SmsService } from '../sms.service';
import { NotificationService } from '../../core/notification.service';
import { ConfigService } from '../../config.service';
import {Textarea} from 'primeng/inputtextarea';
import {TextareaModule} from 'primeng/textarea';
import {StaticDataService} from '../../static-data.service';

@Component({
  selector: 'app-sms-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    CheckboxModule,
    CalendarModule,
    ButtonModule,
    DividerModule
  ],
  templateUrl: './sms-form.component.html',
  styleUrls: ['./sms-form.component.scss']
})
export class SmsFormComponent implements OnInit, OnChanges {
  @Input() smsData: any | null = null;
  @Output() smsSubmitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private smsService = inject(SmsService);
  private notificationService = inject(NotificationService);
  private configService = inject(ConfigService);

  smsForm!: FormGroup;
  applications: any[] = [];
  senderIds: any[] = [];
  smsNatures:any[] =StaticDataService.smsNature();
  isLoading = false;

  ngOnInit() {
    this.initializeForm();
    this.loadDropdownData();
    this.setupFormSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['smsData'] && this.smsForm) {
      this.populateForm();
    }
  }

  initializeForm() {
    this.smsForm = this.fb.group({
      id:"",
      senderId: ['', Validators.required],
      messageText: ['', [Validators.required, Validators.maxLength(1000)]],
      phoneNos: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9,\s-]+$/)]],
      dispatched: [false],
      flashSms: [false],
      scheduleSms: [false],
      templateSms: [false],
      smsNature: ['ONE_TIME', Validators.required],
      scheduledTime: [null]
    });

    this.populateForm();
  }


  setupFormSubscriptions() {
    // Auto-calculate pages count when message text changes
    this.smsForm.get('messageText')?.valueChanges.subscribe((value: string) => {
      if (value) {
        const pagesCount = this.smsService.calculatePagesCount(value);
        this.smsForm.patchValue({ pagesCount }, { emitEvent: false });
      }
    });



    // Auto-calculate total recipients from phone numbers
    this.smsForm.get('phoneNos')?.valueChanges.subscribe((value: string) => {
      if (value) {
        const phoneNumbers = value.split(',').filter(phone => phone.trim().length > 0);
        this.smsForm.patchValue({ totalReceipient: phoneNumbers.length }, { emitEvent: false });
      }
    });

    // Enable/disable scheduled time based on scheduleSms checkbox
    this.smsForm.get('scheduleSms')?.valueChanges.subscribe((value: boolean) => {
      const scheduledTimeControl = this.smsForm.get('scheduledTime');
      if (value) {
        scheduledTimeControl?.setValidators([Validators.required]);
      } else {
        scheduledTimeControl?.clearValidators();
        scheduledTimeControl?.setValue(null);
      }
      scheduledTimeControl?.updateValueAndValidity();
    });
  }

  async loadDropdownData() {
    this.isLoading = true;

    try {
      // Load sender IDs using config service
      const response = await this.configService.getSenderIds();
      if (response.success) {
        this.senderIds = response.data;
      } else {
        console.error('Error loading sender IDs:', response);
        this.notificationService.error('Failed to load sender IDs');
      }
    } catch (error) {
      console.error('Error loading sender IDs:', error);
      this.notificationService.error('Failed to load sender IDs');
    } finally {
      this.isLoading = false;
    }
  }

  populateForm() {
    if (this.smsData && this.smsForm) {
      this.smsForm.patchValue({
        applicationId: this.smsData.applicationId,
        senderId: this.smsData.senderId,
        messageText: this.smsData.messageText,
        phoneNos: this.smsData.phoneNos,
        totalReceipient: this.smsData.totalReceipient,
        actualCost: this.smsData.actualCost,
        pagesCount: this.smsData.pagesCount,
        dispatched: this.smsData.dispatched,
        flashSms: this.smsData.flashSms,
        scheduleSms: this.smsData.scheduleSms,
        templateSms: this.smsData.templateSms,
        smsNature: this.smsData.smsNature,
        smsNatureName: this.smsData.smsNatureName,
        scheduledTime: this.smsData.scheduledTime ? new Date(this.smsData.scheduledTime) : null
      });
    }
  }

  onSubmit() {
    if (this.smsForm.valid) {
      const formValue = this.smsForm.getRawValue();
      const smsData: any = {
        ...formValue,
        id: this.smsData?.id,
        createdAt: this.smsData?.createdAt,
        updatedAt: new Date()
      };
      this.smsSubmitted.emit(smsData);
    } else {
      this.markFormGroupTouched(this.smsForm);
      this.notificationService.error('Please fill in all required fields correctly');
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.smsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.smsForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['pattern']) {
        return 'Please enter valid phone numbers separated by commas';
      }
      if (field.errors['maxlength']) {
        return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      }
      if (field.errors['min']) {
        return `Minimum value is ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}
