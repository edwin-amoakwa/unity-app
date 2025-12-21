// Angular Import
import { Component, OnInit, inject } from '@angular/core';

// project import
import { Badge } from 'primeng/badge';
import { SentSmsChartComponent } from 'src/app/charts/sent-sms-chart/sent-sms-chart.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MonthlySmsStatsChartComponent } from '../charts/monthly-sms-stats-chart/monthly-sms-stats-chart.component';
import { UserSession } from '../core/user-session';
import { DashboardService } from './dashboard.service';
import { StaticDataService } from '../static-data.service';
import { SelectModule } from 'primeng/select';
import {RouterLink} from '@angular/router';
import {MerchantService} from '../merchant.service';

@Component({
  selector: 'app-dashboard',
  imports: [SentSmsChartComponent, SharedModule, MonthlySmsStatsChartComponent, Badge, SelectModule, RouterLink],
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

  // Summary data from API
  summary: any = {};
  smsStats:any = {};
  latestSms:any[] = [];

  totalSmsSent: number = 0;


  dateRanges = StaticDataService.dateRanges();

  chartDataFilter: {
    period: string;
    fromDate?: string | null;
    toDate?: string | null;
  } = {
    period: 'THIS_MONTH'
  };

  // Ensure reference changes so child OnChanges triggers when any field updates
  onFilterChange() {
    this.chartDataFilter = { ...this.chartDataFilter };
  }

  async ngOnInit() {
    try {
      const response = await this.dashboardService.getSummary();
      this.summary = response.data;

      const smsStatsResponse = await this.dashboardService.getSmsStats();
      this.smsStats = smsStatsResponse.data;

      this.totalSmsSent = (Object.values(this.smsStats) as number[]).reduce((sum, value) => sum + value, 0)

      const latestSmsResponse = await this.dashboardService.getLatestSms();
      this.latestSms = latestSmsResponse.data;

      if(this.merchant?.accountStatus == 'PENDING')
      {
        const response = await this.merchantService.getMerchant(this.merchant.id);
        this.merchant = response.data;
        if(this.merchant.accountStatus != 'PENDING')
        {
          localStorage.setItem(UserSession.merchant, JSON.stringify(this.merchant));
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    }
  }

  // public method
  ListGroup = [
    {
      name: 'Bajaj Finery',
      profit: '10% Profit',
      invest: '$1839.00',
      bgColor: 'bg-light-success',
      icon: 'ti ti-chevron-up',
      color: 'text-success'
    },
    {
      name: 'TTML',
      profit: '10% Loss',
      invest: '$100.00',
      bgColor: 'bg-light-danger',
      icon: 'ti ti-chevron-down',
      color: 'text-danger'
    },
    {
      name: 'Reliance',
      profit: '10% Profit',
      invest: '$200.00',
      bgColor: 'bg-light-success',
      icon: 'ti ti-chevron-up',
      color: 'text-success'
    },
    {
      name: 'ATGL',
      profit: '10% Loss',
      invest: '$189.00',
      bgColor: 'bg-light-danger',
      icon: 'ti ti-chevron-down',
      color: 'text-danger'
    },
    {
      name: 'Stolon',
      profit: '10% Profit',
      invest: '$210.00',
      bgColor: 'bg-light-success',
      icon: 'ti ti-chevron-up',
      color: 'text-success',
      space: 'pb-0'
    }
  ];

  profileCard = [
    {
      style: 'bg-primary-dark text-white',
      background: 'bg-primary',
      value: '$203k',
      text: 'Net Profit',
      color: 'text-white',
      value_color: 'text-white'
    },
    {
      background: 'bg-warning',
      avatar_background: 'bg-light-warning',
      value: '$550K',
      text: 'Total Revenue',
      color: 'text-warning'
    }
  ];
}
