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
import { SmsModel, SmsNature, ApplicationModel, SenderIdModel } from '../sms.model';
import { NotificationService } from '../../core/notification.service';
import {Textarea} from 'primeng/inputtextarea';
import {TextareaModule} from 'primeng/textarea';

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
  @Input() smsData: SmsModel | null = null;
  @Output() smsSubmitted = new EventEmitter<SmsModel>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private smsService = inject(SmsService);
  private notificationService = inject(NotificationService);

  smsForm!: FormGroup;
  applications: ApplicationModel[] = [];
  senderIds: SenderIdModel[] = [];
  smsNatures: { label: string; value: SmsNature }[] = [];
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
      applicationId: ['', Validators.required],
      senderId: ['', Validators.required],
      messageText: ['', [Validators.required, Validators.maxLength(1000)]],
      phoneNos: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9,\s-]+$/)]],
      totalReceipient: [0, [Validators.required, Validators.min(1)]],
      actualCost: [0, [Validators.required, Validators.min(0)]],
      pagesCount: [{ value: 1, disabled: true }], // Read-only field
      dispatched: [false],
      flashSms: [false],
      scheduleSms: [false],
      templateSms: [false],
      smsNature: [SmsNature.TRANSACTIONAL, Validators.required],
      smsNatureName: ['Transactional'],
      scheduledTime: [null]
    });

    this.initializeSmsNatures();
    this.populateForm();
  }

  initializeSmsNatures() {
    this.smsNatures = [
      { label: 'Transactional', value: SmsNature.TRANSACTIONAL },
      { label: 'Promotional', value: SmsNature.PROMOTIONAL },
      { label: 'Service Explicit', value: SmsNature.SERVICE_EXPLICIT },
      { label: 'Service Implicit', value: SmsNature.SERVICE_IMPLICIT }
    ];
  }

  setupFormSubscriptions() {
    // Auto-calculate pages count when message text changes
    this.smsForm.get('messageText')?.valueChanges.subscribe((value: string) => {
      if (value) {
        const pagesCount = this.smsService.calculatePagesCount(value);
        this.smsForm.patchValue({ pagesCount }, { emitEvent: false });
      }
    });

    // Update SMS nature name when SMS nature changes
    this.smsForm.get('smsNature')?.valueChanges.subscribe((value: SmsNature) => {
      const selectedNature = this.smsNatures.find(n => n.value === value);
      if (selectedNature) {
        this.smsForm.patchValue({ smsNatureName: selectedNature.label }, { emitEvent: false });
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
      // Load applications
      const applicationsResponse = await this.smsService.getApplications();
      this.applications = applicationsResponse.data;

      // Load sender IDs
      const senderIdsResponse = await this.smsService.getSenderIds();
      this.senderIds = senderIdsResponse.data;
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      this.notificationService.error('Failed to load dropdown data');
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
      const smsData: SmsModel = {
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
