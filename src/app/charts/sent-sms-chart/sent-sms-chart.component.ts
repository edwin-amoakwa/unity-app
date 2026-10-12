// angular import
import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

// third party
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-sent-sms-chart',
  imports: [NgApexchartsModule],
  templateUrl: './sent-sms-chart.component.html',
  styleUrl: './sent-sms-chart.component.scss'
})
export class SentSmsChartComponent implements OnInit, OnChanges, OnDestroy {
  chartOptions: any = {};

  dashboardService = inject(DashboardService);

  chartData: any = {};

  // Accept a dataFilter from parent to filter the chart data (e.g., date range)
  @Input() dataFilter: any;

  private themeObserver?: MutationObserver;

  private static readonly STATUS_COLOR: Record<string, string> = {
    SENT: '--success',
    FAILED: '--danger',
    REJECTED: '--warning'
  };

  ngOnInit() {
    this.loadChartData();
    this.themeObserver = new MutationObserver(() => this.createChart());
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataFilter'] && !changes['dataFilter'].firstChange) {
      this.loadChartData();
    }
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  async loadChartData() {
    try {
      const response = await this.dashboardService.getSmsChart(this.dataFilter);
      this.chartData = response.data ?? {};
    } catch (error) {
      console.error('Error loading SMS chart:', error);
      this.chartData = {};
    }
    this.createChart();
  }

  private token(name: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  createChart() {
    const status = this.dataFilter?.smsStatus ?? 'SENT';
    const color = this.token(SentSmsChartComponent.STATUS_COLOR[status] ?? '--success', '#1e9e57');
    const axis = this.token('--chart-axis', '#6a7591');
    const grid = this.token('--chart-grid', '#eaeef4');
    const font = this.token('--font-sans', 'sans-serif');
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const series = this.chartData?.series ?? [];
    const points = Math.max(0, ...series.map((x: any) => x?.data?.length ?? 0));

    this.chartOptions = {
      chart: {
        type: 'area',
        height: 320,
        fontFamily: font,
        toolbar: { show: false },
        zoom: { enabled: false },
        // Disabled to avoid the ApexCharts runMaskReveal race (null node)
        // when the chart re-renders after its async data load.
        animations: { enabled: false },
        background: 'transparent'
      },
      series,
      colors: [color],
      stroke: { curve: 'straight', width: 2 },
      fill: { type: 'solid', opacity: 0.1 },
      markers: { size: points <= 16 ? 5 : 0, strokeWidth: 2, strokeColors: this.token('--surface', '#ffffff'), hover: { size: 6 } },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: { borderColor: grid, strokeDashArray: 0, xaxis: { lines: { show: false } } },
      xaxis: {
        type: 'category',
        categories: this.chartData?.labels ?? [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        tickAmount: points > 8 ? 8 : undefined,
        labels: { rotate: 0, hideOverlappingLabels: true, style: { colors: axis, fontSize: '12px' } }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: { style: { colors: axis, fontSize: '12px' }, formatter: (v: number) => Math.round(v).toLocaleString() }
      },
      tooltip: {
        theme: dark ? 'dark' : 'light',
        x: { show: true },
        y: { title: { formatter: () => 'Messages: ' } },
        marker: { show: false }
      }
    };
  }
}
