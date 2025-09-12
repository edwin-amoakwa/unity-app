import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimNG imports
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

// Project imports
import { MessageService } from 'primeng/api';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { ConfigService } from '../../config.service';
import { NotificationService } from '../../core/notification.service';
import { StaticDataService } from '../../static-data.service';
import { SmsService } from '../sms.service';

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
    DividerModule,
    FileUploadModule

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
  groups: any[] = [];
  smsNatures:any[] =StaticDataService.smsNature();
  isLoading = false;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.initializeForm();
    this.loadDropdownData();
    this.setupFormSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges)
  {
    // if (changes['smsData'] && this.smsForm)
    // {
    //   console.log("--hereh herhe populateForm");
    //   this.populateForm();
    // }
    // else
    // {
    //   console.log("--hereh herhe initNewSms");
    //   this.initNewSms();
    // }
    this.characterCount = 0;
    this.smsCount = 1;
    console.log("--hereh herhe ngOnChanges(changes: SimpleChanges)");
    if(this.smsForm == null || this.smsForm == undefined)
    {
      this.ngOnInit();
    }
    console.log("--hereh herhe initNewSms changes['smsData'] = ",changes['smsData']);
    if(this.smsData == null || this.smsData == undefined)
    {
      console.log("--hereh herhe initNewSms");
      this.initNewSms();
    }
    else
    {
      console.log("--hereh herhe populateForm");
      this.populateForm();
    }
    this.updateCount();
  }

  initNewSms()
  {
    this.smsForm.reset();
    const record: any = {};
    record.smsMessageType = "SINGLE_SMS";
    record.phoneNumbersSource = "COPY_PASTE";
    record.smsNature = "ONE_TIME";
    this.smsForm.patchValue(record);
    console.log("===>this.smsForm value = ",this.smsForm.value);
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
      scheduledTime: [null],
      smsMessageType: [null],
      phoneNumbersSource: [null],
      groupId: [null],
      uploadedFile: [null],
      pagesCount: 0,
      totalRecipient: 0,
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
        phoneNumbersSource: this.smsData.phoneNumbersSource,
        phoneNos: this.smsData.phoneNos,
        totalReceipient: this.smsData.totalReceipient,
        actualCost: this.smsData.actualCost,
        pagesCount: this.smsData.pagesCount,
        dispatched: this.smsData.dispatched,
        flashSms: this.smsData.flashSms,
        scheduleSms: this.smsData.scheduleSms,
        templateSms: this.smsData.templateSms,
        smsMessageType: this.smsData.smsMessageType,
        smsNature: this.smsData.smsNature,
        smsNatureName: this.smsData.smsNatureName,
        scheduledTime: this.smsData.scheduledTime ? new Date(this.smsData.scheduledTime) : null
      });
    }
  }

  onSubmit()
  {
    if (this.smsForm.valid)
    {
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

  onFileSelect(event: FileSelectEvent)
  {
    const file = event.files[0];

    // Check for a file and validate its type
    if (!file) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No file selected.' });
      return;
    }

    if (file.type !== 'text/plain') {
      this.messageService.add({ severity: 'error', summary: 'Invalid File Type', detail: 'Please select a .txt file.' });
      this.clearFile();
      return;
    }

    // Use FileReader to read the file content
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      this.smsForm.controls['phoneNos'].setValue(fileContent);
    };

    reader.onerror = () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to read file.' });
      this.clearFile();
    };

    reader.readAsText(file);
  }

  // Clear the file and textarea content
  private clearFile() {
    // this.fileContent = '';
    this.smsForm.controls['phoneNos'].setValue('');
  }

  characterCount: number = 0;
  smsCount: number = 1;
  updateCount()
  {
    if(!this.smsForm.value.messageText)
    {
      return;
    }
    this.characterCount = this.smsForm.value.messageText?.length;
    if(this.characterCount == 0)
    {
      this.smsCount = 0;
    }
    else
    {
      this.smsCount = Math.ceil(this.characterCount / 160) || 1; // Ensure at least 1 SMS
    }

    this.smsForm.controls['pagesCount'].setValue(this.smsCount);
  }

}
