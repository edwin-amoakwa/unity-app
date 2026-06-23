import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
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
import {DatePicker} from 'primeng/datepicker';
import {DateUtil} from '../core/system.utils';
import {Pager} from '../core/pager';
import * as FileSaver from 'file-saver';



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
    SelectModule,
    InputTextModule,
    DatePicker
  ],
  templateUrl: './sms-records.component.html',
  styleUrls: ['./sms-records.component.scss']
})
export class SmsRecordsComponent implements OnInit {
  private smsRecordsService = inject(SmsRecordsService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  smsRecords: any[] = [];
  isLoading: boolean = false;

  pager: any = {
    pageNo: 1,
    pageSize: 10,
    totalRecords: 0
  }

  // Index of the first row shown, used to keep the paginator in sync
  first: number = 0;

  // Filter options
  smsStatusList: any[] = StaticDataService.smsFinalStatus();
  senderIdOptions: any[] = [];
  filterParam:any = {}

  ngOnInit() {
    // The table is in lazy mode, so it fires onLazyLoad on init and loads the records.
    this.loadFilterOptions();
  }

  async loadSmsRecords(event?: any) {
    this.isLoading = true;
    try {

      const filters = this.buildFilters();

      if (event) {
        console.log("event>>>", event);
        const pageParam = Pager.createPagerNg(event);
        this.pager.pageNo = pageParam.pageNo;
        this.pager.pageSize = pageParam.pageSize;
        this.first = event.first ?? 0;
      }
      filters.pageNo = this.pager.pageNo;
      filters.pageSize = this.pager.pageSize;
      filters.totalRecords = this.pager.totalRecords;

      const response = await this.smsRecordsService.getSmsRecords(filters);
      this.smsRecords = response.data || [];

      const pager: any = response.pager;
      if (pager) {
        // this.pager.totalRecords = pager.totalRecords;
        // this.pager.totalRecords = pager.totalRecords;
        this.pager.totalRecords = pager?.totalRecords ?? this.smsRecords.length;
      }
      // this.pager.totalRecords = pager?.totalRecords ?? this.smsRecords.length;

    } catch (error) {
      console.error('Error loading SMS records:', error);
      this.notificationService.error('Failed to load SMS records');
      this.smsRecords = [];
    } finally {
      this.isLoading = false;
    }
  }

  private buildFilters(): any {
    const filters = Object.assign({}, this.filterParam);
    filters.fromDateTime = DateUtil.toLocalDateTimeString(this.filterParam.fromDateTime);
    filters.toDateTime = DateUtil.toLocalDateTimeString(this.filterParam.toDateTime);
    return filters;
  }

  async loadFilterOptions() {
    try {



      // Load sender ID options
      const senderIdResponse = await this.configService.getSenderIdsApprovedList();
      this.senderIdOptions = senderIdResponse.data || [];
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }

  doSearch() {
    this.resetToFirstPage();
    this.loadSmsRecords();
  }

  clearFilters() {
    this.filterParam = {}
    this.resetToFirstPage();
    this.loadSmsRecords();
  }

  private resetToFirstPage() {
    this.pager.pageNo = 1;
    this.pager.totalRecords = 0
    this.first = 0;
  }

  getFinalStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warn';
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  }

  async downloadFileAsExcel()
  {
    this.isLoading = true;
    try {
      // pageNo = -1 returns every matching record, download=true makes the API
      // respond with a ready-made Excel file instead of JSON.
      const filters = this.buildFilters();
      filters.pageNo = -1;
      filters.download = true;

      const blob = await this.smsRecordsService.downloadSmsRecords(filters);
      FileSaver.saveAs(blob, `SMS_Records_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error('Error downloading SMS records:', error);
      this.notificationService.error('Failed to download SMS records');
    } finally {
      this.isLoading = false;
    }
  }

  getSmsStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'warn';
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
    if (amount == null || amount === undefined) return '0.00';
    return `${amount.toFixed(3)}`;
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
