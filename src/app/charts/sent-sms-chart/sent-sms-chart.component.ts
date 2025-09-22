// angular import
import {Component, inject, OnInit, ViewChild} from '@angular/core';

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import {DashboardService} from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-sent-sms-chart',
  imports: [NgApexchartsModule],
  templateUrl: './sent-sms-chart.component.html',
  styleUrl: './sent-sms-chart.component.scss'
})
export class SentSmsChartComponent implements OnInit{
  // public props
  // @ViewChild('chart') chart!: ChartComponent;
  chartOptions!: Partial<ApexOptions>;

  dashboardService = inject(DashboardService);

  chartData: any = [];

  // constructor
  constructor() {
    this.chartOptions = {
      chart: {
        type: 'area',
        // height: 95,
        stacked: true,
        sparkline: {
          enabled: true
        },
        background: 'transparent'
      },
      stroke: {
        curve: 'smooth',
        width: 1
      },
      series: [
        {
          data: this.chartData
        }
      ],
      tooltip: {
        theme: 'light',
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: () => 'Ticket '
          }
        },
        marker: {
          show: false
        }
      },
      colors: ['#673ab7']
    };
  }

  ngOnInit() {
    this.loadChartData();
  }

  async loadChartData() {
    let response = await this.dashboardService.getSentSms();
    this.chartData = response.data;
    
  }

}
