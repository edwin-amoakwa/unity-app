// angular import
import {Component, inject, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import {DashboardService} from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-sent-sms-chart',
  imports: [NgApexchartsModule],
  templateUrl: './sent-sms-chart.component.html',
  styleUrl: './sent-sms-chart.component.scss'
})
export class SentSmsChartComponent implements OnInit, OnChanges{
  // public props
  // @ViewChild('chart') chart!: ChartComponent;
  // chartOptions!: Partial<ApexOptions>;
  chartOptions: any = {};

  dashboardService = inject(DashboardService);

  chartData: any = [];

  // Accept a dataFilter from parent to filter the chart data (e.g., date range)
  @Input() dataFilter: any;

  // constructor
  constructor() {

  }

  ngOnInit() {
    this.loadChartData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataFilter'] && !changes['dataFilter'].firstChange) {
      this.loadChartData();
    }
  }

  async loadChartData() {
    let response = await this.dashboardService.getSmsChart(this.dataFilter);
    this.chartData = response.data;

    // this.chartOptions.series[0].data = this.chartData;
    this.createChat();
    console.log("this.chartData", JSON.stringify(this.chartOptions, null, 2));
  }

  createChat()
  {
    this.chartOptions = {
      chart: {
        type: 'area',
        height: 400,
        stacked: true,
        sparkline: {
          enabled: false
        },
        background: 'transparent'
      },
      stroke: {
        curve: 'smooth',
        width: 1
      },
      series: this.chartData.series,
      xaxis: {
        type: 'category',
        categories: this.chartData?.labels,
        labels: {
          show: true,
          rotate: -45, // ✅ Optional: rotate if labels are long
          style: {
            colors: "#333", // optional styling
            fontSize: "12px"
          }
        }
      },
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
            formatter: () => 'Sent SMS '
          }
        },
        marker: {
          show: false
        }
      },
      colors: ['#673ab7']
    };
  }

}
