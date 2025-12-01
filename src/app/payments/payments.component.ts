import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

// PrimNG imports
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';

import { Tooltip } from 'primeng/tooltip';
import { NotificationService } from '../core/notification.service';
import { PaymentService } from './payment.service';
import { FormView } from '../core/form-view';
import { CardComponent } from '../theme/shared/components/card/card.component';
import { ButtonToolbarComponent } from '../theme/shared/components/button-toolbar/button-toolbar.component';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    TableModule,
    CardModule,
    TextareaModule,
    DialogModule,
    ToastModule,
    Tooltip,
    CardComponent,
    ButtonToolbarComponent,
    SelectButtonModule
  ],
  providers: [MessageService],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);
  private configService = inject(ConfigService);

  formView = FormView.listView();

  paymentForm!: FormGroup;
  payments: any[] = [];
  loading = false;
  editingPayment: any | null = null;
  showPaymentDialog = false;

  paymentChannels: any[] = [];

  // Pay mode selectbutton state
  paymentModeOptions = [
    { label: 'Pay Online', value: 'ONLINE' },
    { label: 'Pay Offline', value: 'OFFLINE' }
  ];
  selectedPaymentMode: 'ONLINE' | 'OFFLINE' = 'ONLINE';
  offlineDetailsHtml: string | null = null;
  loadingOfflineDetails = false;

  // Calculated final amount after 20% tax is deducted
  finalAmount: number = 0;

  ngOnInit() {
    this.initializeForm();
    this.loadPayments();
    this.loadPaymentChannels();
  }

  private initializeForm() {
    this.paymentForm = this.fb.group({
      id: null,
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentRefNo: "",
      paymentNotes: [''],
      paymentChannel: [null, [Validators.required]],
      mobileNo: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      ]
    });

    // Recalculate final amount whenever the amount changes
    this.paymentForm.get('amount')?.valueChanges.subscribe((val) => {
      this.updateFinalAmount(val);
    });

    // Also recompute when the payment channel (and thus tax rate) changes
    this.paymentForm.get('paymentChannel')?.valueChanges.subscribe(() => {
      const currentAmount = this.paymentForm.get('amount')?.value;
      this.updateFinalAmount(currentAmount);
    });

    // Initial calculation in case an amount is pre-filled (e.g., edit mode)
    const initialAmount = this.paymentForm.get('amount')?.value;
    this.updateFinalAmount(initialAmount);
  }

  private async loadPaymentChannels() {
    try {
      const resp = await this.configService.getPaymentChannels();

        this.paymentChannels = resp.data;

    } catch (e) {
      this.paymentChannels = [];
      this.notificationService.error('Failed to load payment channels');
    }
  }

  async onPaymentModeChange() {
    if (this.selectedPaymentMode === 'OFFLINE' && this.offlineDetailsHtml === null && !this.loadingOfflineDetails) {
      try {
        this.loadingOfflineDetails = true;
        const resp = await this.configService.getOfflinePaymentDetails();
        if (resp.success ) {
          this.offlineDetailsHtml = resp.data as any;
        } else {
          this.offlineDetailsHtml = '<p>No offline payment details available.</p>';
        }
      } catch (e) {
        this.offlineDetailsHtml = '<p>Failed to load offline payment details.</p>';
        this.notificationService.error('Failed to load offline payment details');
      } finally {
        this.loadingOfflineDetails = false;
      }
    }
  }

  async loadPayments() {
    try {
      this.loading = true;
      const response = await this.paymentService.getPayments();
      if (response.success) {
        this.payments = response.data || [];
      }
    } catch (error) {
      this.notificationService.error('Failed to load payments');
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.paymentForm.valid) {
      try {
        this.loading = true;
        const formValue = this.paymentForm.value;
        formValue.paymentChannelId = formValue.paymentChannel.id;
        const response = await this.paymentService.savePayment(formValue);
        if (response.success) {
          this.paymentForm.reset();
          await this.loadPayments();
          this.formView.resetToListView();
        }
      } catch (error) {
        this.notificationService.error(`Failed to ${this.editingPayment ? 'update' : 'create'} payment`);
      } finally {
        this.loading = false;
      }
    } else {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
    }
  }

  editPayment(payment: any) {
    this.editingPayment = payment;
    this.paymentForm.reset();
    this.paymentForm.patchValue(payment);
    this.formView.resetToCreateView();
  }

  async deletePayment(payment: any) {
    if (payment.id && confirm('Are you sure you want to delete this payment?')) {
      try {
        this.loading = true;
        const response = await this.paymentService.deletePayment(payment.id);
        if (response.success) {
          await this.loadPayments();
        }
      } catch (error) {
        this.notificationService.error('Failed to delete payment');
      } finally {
        this.loading = false;
      }
    }
  }

  openCreate() {
    this.editingPayment = null;
    this.paymentForm.reset();
    this.formView.resetToCreateView();
  }

  backToList() {
    this.formView.resetToListView();
    this.editingPayment = null;
    this.paymentForm.reset();
  }

  // Kept for backward compatibility with legacy dialog flow
  closePaymentDialog() {
    this.showPaymentDialog = false;
  }

  resetForm() {
    this.paymentForm.reset();
    this.editingPayment = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      amount: 'Amount',
      paymentRefNo: 'Payment Reference No',
      paymentNotes: 'Payment Notes',
      paymentChannel: 'Payment Channel',
      initiationSource: 'Initiation Source',
      mobileNo: 'Mobile Number'
    };
    return labels[fieldName] || fieldName;
  }

  private updateFinalAmount(amount: any) {
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      this.finalAmount = 0;
      return;
    }
    const taxRate = this.selectedTaxRate; // dynamic tax rate based on selected channel
    const tax = num * taxRate;
    const final = num - tax;
    // Round to 2 decimal places
    this.finalAmount = Math.round(final * 100) / 100;
  }

  // Convenience getter: currently selected payment channel object
  get selectedChannel(): any | null {
    const value = this.paymentForm?.get('paymentChannel')?.value;
    if (!value) return null;
    if (typeof value === 'object') return value;
    // If the control stores an id/code, try to resolve from list
    return (
      this.paymentChannels.find(
        (ch: any) => ch?.id === value || ch?.code === value || ch?.channelName === value
      ) || null
    );
  }

  // Normalized tax rate as a fraction (e.g., 0.2 for 20%)
  get selectedTaxRate(): number {
    const rateRaw = this.selectedChannel?.taxRate;
    if (rateRaw === undefined || rateRaw === null) return 0;
    const rateNum = typeof rateRaw === 'string' ? parseFloat(rateRaw) : Number(rateRaw);
    if (isNaN(rateNum) || rateNum < 0) return 0;
    // If the API returns percentage (e.g., 20) convert to fraction
    return rateNum > 1 ? rateNum / 100 : rateNum;
  }
}
