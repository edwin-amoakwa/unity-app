import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';

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
import { DistributionGroupsService } from 'src/app/distribution-groups/distribution-groups.service';
import { ConfigService } from '../../config.service';
import { NotificationService } from '../../core/notification.service';
import { CollectionUtil, ObjectUtil } from '../../core/system.utils';
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
  private distributionGroupsService = inject(DistributionGroupsService);
  private messageService = inject(MessageService);

  smsForm!: FormGroup;
  applications: any[] = [];
  senderIds: any[] = [];
  groups: any[] = [];
  smsNatures:any[] =StaticDataService.smsNature();
  isLoading = false;

  constructor() {}

  ngOnInit() {
    this.initializeForm();

    // Key Change: Subscribe to valueChanges on the specific form control
    this.smsForm.get('phoneNos')?.valueChanges.subscribe(
      (newValue: string) => {
        if(ObjectUtil.isNullOrUndefined(newValue)) return;

         // You can add a UX fix here to immediately clean the input
        const cleanedValue = newValue.replace(/[^0-9\s\-\n]/g, '');

        // This prevents infinite loops by not setting the same value again
        if (cleanedValue !== newValue) {
          newValue = ObjectUtil.standardizeNewlines(newValue);
          this.smsForm.get('phoneNos')?.setValue(cleanedValue, { emitEvent: false });
        }

        // This function will be called on every change (typing, paste, backspace)
        console.log("phoneNos value changed = ",newValue);
        this.countContactsInTextBox(newValue);
      }
    );

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
      // phoneNos: "",
      phoneNos: ['', [Validators.pattern(/^[\+]?[0-9,\s-]+$/)]],
      // phoneNos: [Validators.required, Validators.pattern(/^[0-9\s\-\n]*$/)],
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
    // this.isLoading = true;

    // try {
    //   // Load sender IDs using config service
    //   const response = await this.configService.getSenderIds();
    //   if (response.success) {
    //     this.senderIds = response.data;
    //   } else {
    //     console.error('Error loading sender IDs:', response);
    //     this.notificationService.error('Failed to load sender IDs');
    //   }
    // } catch (error) {
    //   console.error('Error loading sender IDs:', error);
    //   this.notificationService.error('Failed to load sender IDs');
    // } finally {
    //   this.isLoading = false;
    // }

    this.configService.getSenderIds().then(response=>{
      this.senderIds = response.data;
    });

    this.distributionGroupsService.getDistributionGroups().then(response=>{
      this.groups = response.data;
    });
  }

  populateForm() {
    if (this.smsData && this.smsForm) {
      this.smsForm.patchValue({
        id: this.smsData.id,
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

  onGroupSelected()
  {
    const formValue = this.smsForm.getRawValue();
    const groupId = formValue.groupId;
    if(!ObjectUtil.isNullOrUndefined(groupId))
    {
      const grp = CollectionUtil.findById(this.groups,groupId);
      if(grp){
        this.smsForm.controls['totalRecipient'].setValue(grp.contactCount);
      }
    }
  }

  onSubmit()
  {
    if (this.smsForm.valid)
    {
      const formValue = this.smsForm.getRawValue();
      console.log("formvalue before = ",formValue);
      formValue.phoneNos = ObjectUtil.standardizeNewlines(formValue.phoneNos);
      console.log("formvalue after = ",formValue);
      const smsData: any = {
        ...formValue,
        id: this.smsData?.id,
        createdAt: this.smsData?.createdAt,
        updatedAt: new Date()
      };
      this.smsSubmitted.emit(smsData);
    }
    else {
      console.log("--hereh herhe this.smsForm.invalid = ",this.smsForm.value);
      ObjectUtil.logInvalidFields(this.smsForm)
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

    // if (file.type !== 'text/plain') {
    //   this.messageService.add({ severity: 'error', summary: 'Invalid File Type', detail: 'Please select a .txt file.' });
    //   this.clearFile();
    //   return;
    // }

    // Use FileReader to read the file content
    const reader = new FileReader();

    reader.onload = (e: any) =>
    {
      //GET THE CURRENT CONTENT of the textbox
      const currentContent = this.smsForm.get('phoneNos')?.value || '';


      if (file.name.endsWith('.csv') || file.name.endsWith('.txt'))
      {
        const fileContent = e.target?.result as string;
        const newContent = currentContent + fileContent + '\r\n';
        this.smsForm.controls['phoneNos'].setValue(newContent);
      }
      else
      {
        // import('xlsx').then((xlsx) => {
        const data = new Uint8Array(e.target?.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the worksheet to a string (e.g., CSV format)
        const fileContent = XLSX.utils.sheet_to_csv(worksheet);
        const newContent = currentContent + fileContent + '\r\n';
        this.smsForm.controls['phoneNos'].setValue(newContent);
      }
      // const fileContent = e.target?.result as string;
      // this.smsForm.controls['phoneNos'].setValue(fileContent);
      // this.countContactsInTextBox();
    };

    reader.onerror = () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to read file.' });
      // this.clearFile();
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt'))
    {
      reader.readAsText(file);
    }
    else {
      reader.readAsArrayBuffer(file);
    }


  }

  // Clear the file and textarea content
  private clearFile() {
    // this.fileContent = '';
    this.smsForm.controls['phoneNos'].setValue('');
  }

  /**
   * Counts the number of lines (contacts) in the newly uploaded content.
   * Assumes each line represents a contact.
   * @param newContent The string content of the uploaded file.
   */
  // countContacts(newContent: string):number
  // {
  //   // Split the content by newline characters ('\n' or '\r\n')
  //   // and filter out any empty lines that might result from trailing newlines.
  //   const lines = newContent.split(/\r?\n/).filter(line => line.trim() !== '');

  //   // The first line is often a header row, so we subtract 1 from the count.
  //   // If you do NOT have a header row, remove the '- 1'.
  //   const newContacts = lines.length > 0 ? lines.length - 1 : 0;

  //   let contactCount += newContacts;

  //   console.log(`Uploaded ${newContacts} new contacts.`);
  //   console.log(`Total contacts in textbox: ${contactCount}`);
  // }

  // New function to read the entire textbox and count the lines
  // calculateLineCounts() {
  //   if (!this.fileContent) {
  //     this.totalLineCount = 0;
  //     this.contactCount = 0;
  //     return;
  //   }

  //   // 1. Split the entire textbox content by newline characters
  //   // \r?\n handles both Windows (\r\n) and Unix (\n) newlines
  //   const lines = this.fileContent.split(/\r?\n/);

  //   // 2. Filter out empty lines (which can result from trailing newlines or double-spacing)
  //   const nonBlankLines = lines.filter(line => line.trim() !== '');

  //   this.totalLineCount = nonBlankLines.length;

  //   // 3. Calculate contacts (assuming the very first line of the entire content is a header)
  //   // NOTE: If you have multiple uploads, this 'header' logic might need adjustment
  //   // depending on how you structure the appended content.
  //   this.contactCount = this.totalLineCount > 0 ? this.totalLineCount - 1 : 0;

  //   console.log(`Total non-blank lines in textbox: ${this.totalLineCount}`);
  //   console.log(`Estimated contacts (Lines - 1 Header): ${this.contactCount}`);
  // }

  countContactsInTextBox(content)
  {
    console.log("==countContactsInTextBox() called==");
    // const content = this.smsForm.value.phoneNos;
    console.log("==countContactsInTextBox() content == ",content);
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    console.log("==countContactsInTextBox() lines == ",lines);
    // const length = lines.length > 0 ? lines.length - 1 : 0;
    const length = lines.length;
    this.smsForm.controls['totalRecipient'].setValue(length);
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
