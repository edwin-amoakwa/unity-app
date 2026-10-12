// Angular Import
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

// project import
import { SelectModule } from 'primeng/select';
import { SentSmsChartComponent } from 'src/app/charts/sent-sms-chart/sent-sms-chart.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { averageSmsPrice, smsCapacity, SmsPriceEstimate } from '../core/sms-pricing';
import { UserSession } from '../core/user-session';
import { MerchantService } from '../merchant.service';
import { StaticDataService } from '../static-data.service';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [SentSmsChartComponent, SharedModule, SelectModule, RouterLink],
  templateUrl: './dashboard.component.html',
  standalone: true,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private merchantService = inject(MerchantService);

  merchant = UserSession.getMerchant();
  user = UserSession.getUser();
  currentDate = new Date();

  summary: any = {};
  smsStats: any = {};
  latestSms: any[] = [];

  price: SmsPriceEstimate = { rate: 0, channelCount: 0 };
  smsCovered = 0;

  canSendSms = UserSession.allowRoute('send-sms');
  canAddFunds = UserSession.allowRoute('add-funds');
  canViewRecords = UserSession.allowRoute('sms-records');

  dateRanges = StaticDataService.dateRanges();

  chartStatuses = [
    { id: 'SENT', label: 'Sent' },
    { id: 'FAILED', label: 'Failed' },
    { id: 'REJECTED', label: 'Rejected' }
  ];

  chartDataFilter: {
    period: string;
    fromDate?: string | null;
    toDate?: string | null;
    smsStatus?: string | null;
  } = {
    period: 'THIS_MONTH',
    smsStatus: 'SENT'
  };

  // Ensure reference changes so child OnChanges triggers when any field updates
  onFilterChange() {
    this.chartDataFilter = { ...this.chartDataFilter };
  }

  setChartStatus(status: string) {
    this.chartDataFilter.smsStatus = status;
    this.onFilterChange();
  }

  statusLabel(status?: string | null): string {
    return this.chartStatuses.find((s) => s.id === status)?.label ?? 'Sent';
  }

  share(value?: number): string {
    const total = this.smsStats?.total ?? 0;
    if (!total) {
      return '–';
    }
    return `${(((value ?? 0) / total) * 100).toFixed(1)}% of total`;
  }

  private async loadPricing() {
    let priceList: any[] = [];
    try {
      priceList = (await this.merchantService.getPriceList()).data ?? [];
    } catch (error) {
      console.error('Error loading SMS price list:', error);
    }
    this.price = averageSmsPrice(priceList, this.summary?.unitPrice);
    this.smsCovered = smsCapacity(this.summary?.creditBalance, this.price.rate);
  }

  async ngOnInit() {
    try {
      const response = await this.dashboardService.getSummary();
      this.summary = response.data ?? {};
      await this.loadPricing();

      const smsStatsResponse = await this.dashboardService.getSmsStats();
      this.smsStats = smsStatsResponse.data ?? {};

      const latestSmsResponse = await this.dashboardService.getLatestSms();
      this.latestSms = latestSmsResponse.data ?? [];

      if (this.merchant?.accountStatus == 'PENDING') {
        const merchantResponse = await this.merchantService.getMerchant(this.merchant.id);
        this.merchant = merchantResponse.data;
        if (this.merchant.accountStatus != 'PENDING') {
          localStorage.setItem(UserSession.merchant, JSON.stringify(this.merchant));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    }
  }
}
