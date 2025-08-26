import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Payment} from '../unity.model';
import { PaymentService } from './payment.service';
import {StaticDataService} from '../static-data.service';
import {NotificationService} from '../core/notification.service';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
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
    Tooltip
  ],
  providers: [MessageService],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);

  paymentForm!: FormGroup;
  payments: Payment[] = [];
  loading = false;
  editingPayment: Payment | null = null;
  showPaymentDialog = false;

  formOfPaymentOptions = StaticDataService.formsOfPayment();



  ngOnInit() {
    this.initializeForm();
    this.loadPayments();
  }

  private initializeForm() {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentRefNo: "",
      paymentNotes: [''],
      formOfPayment: [null, [Validators.required]]
    });
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


        const paymentData: Partial<Payment> = {
          ...formValue,
        };

        let response;
        if (this.editingPayment) {
          response = await this.paymentService.updatePayment(this.editingPayment.id!, paymentData);
        } else {
          response = await this.paymentService.createPayment(paymentData);
        }

        if (response.success) {
          this.closePaymentDialog();
          await this.loadPayments();
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

  editPayment(payment: Payment) {
    this.editingPayment = payment;
    this.paymentForm.patchValue({
      amount: payment.amount,
      paymentRefNo: payment.paymentRefNo,
      paymentNotes: payment.paymentNotes,
      formOfPayment: payment.formOfPayment,
      initiationSource: payment.initiationSource
    });
    this.showPaymentDialog = true;
  }

  async deletePayment(payment: Payment) {
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

  openNewPaymentDialog() {
    this.editingPayment = null;
    this.paymentForm.reset();
    this.showPaymentDialog = true;
  }

  closePaymentDialog() {
    this.showPaymentDialog = false;
    this.editingPayment = null;
    this.paymentForm.reset();
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
      formOfPayment: 'Form of Payment',
      initiationSource: 'Initiation Source'
    };
    return labels[fieldName] || fieldName;
  }
}
