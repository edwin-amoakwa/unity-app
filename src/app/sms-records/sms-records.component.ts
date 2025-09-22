import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// Project imports
import { NotificationService } from '../core/notification.service';
import { CardComponent } from '../theme/shared/components/card/card.component';
import { SmsRecordsService } from './sms-records.service';
import {StaticDataService} from '../static-data.service';
import {ConfigService} from '../config.service';

export interface SmsRecord {
  mobileNo: string;
  senderId: string;
  application: string;
  receipient: string;
  smsText: string;
  smsProvider: any;
  smsProviderLabel: string;
  smsStatus: any;
  smsStatusLabel: string;
  finalStatus: any;
  finalStatusLabel: string;
  internalStatus: string;
  externalId: string;
  providerStatus: string;
  processingNo: string;
  actualCost: number;
  buyPrice: number;
  margin: number;
  pageCount: number;
  deliveredTime: Date;
  responseRawResponse: string;
  requestRawResponse: string;
  institutionId: string;
  institutionName: string;
  callBackUrl: string;
  feedBackReceived: boolean;
  urlReached: boolean;
  feedbackRequestCount: number;
  batchId: string;
  createdDate: Date;
  modifiedDate: Date;
}

@Component({
  selector: 'app-sms-records',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DropdownModule,
    InputTextModule
  ],
  templateUrl: './sms-records.component.html',
  styleUrls: ['./sms-records.component.scss']
})
export class SmsRecordsComponent implements OnInit {
  private smsRecordsService = inject(SmsRecordsService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  smsRecords: SmsRecord[] = [];
  isLoading: boolean = false;

  // Filter options
  finalStatusOptions: any[] = StaticDataService.smsFinalStatus();
  senderIdOptions: any[] = [];

  // Filter values
  selectedFinalStatus: any = null;
  selectedSenderId: string = '';

  ngOnInit() {
    this.loadSmsRecords();
    this.loadFilterOptions();
  }

  async loadSmsRecords() {
    this.isLoading = true;
    try {
      const response = await this.smsRecordsService.getSmsRecords();
      this.smsRecords = response.data || [];
    } catch (error) {
      console.error('Error loading SMS records:', error);
      this.notificationService.error('Failed to load SMS records');
      this.smsRecords = [];
    } finally {
      this.isLoading = false;
    }
  }

  async loadFilterOptions() {
    try {



      // Load sender ID options
      const senderIdResponse = await this.configService.getSenderIds();
      this.senderIdOptions = senderIdResponse.data || [];
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }

  onFilterChange() {
    this.loadSmsRecords();
  }

  clearFilters() {
    this.selectedFinalStatus = null;
    this.selectedSenderId = '';
    this.loadSmsRecords();
  }

  getFinalStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  }

  getSmsStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  }

  formatDateTime(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  formatCurrency(amount: number): string {
    if (amount == null || amount === undefined) return '$0.00';
    return `$${amount.toFixed(3)}`;
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
