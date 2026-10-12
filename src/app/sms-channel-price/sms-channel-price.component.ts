import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CardComponent } from '../theme/shared/components/card/card.component';
import { PageHeaderComponent } from '../theme/shared/components/page-header/page-header.component';
import { MerchantService } from '../merchant.service';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-sms-channel-price',
  standalone: true,
  imports: [CommonModule, TableModule, CardComponent, PageHeaderComponent],
  templateUrl: './sms-channel-price.component.html',
  styleUrls: ['./sms-channel-price.component.scss']
})
export class SmsChannelPriceComponent implements OnInit {
  private merchantService = inject(MerchantService);
  private notificationService = inject(NotificationService);

  // false when embedded in another page, e.g. merchant profile
  @Input() showHeader = true;

  loading: boolean = false;
  prices: any[] = [];

  async ngOnInit() {
    await this.loadPrices();
  }

  async loadPrices() {
    this.loading = true;
    try {
      const res = await this.merchantService.getPriceList();
      this.prices = res?.data || [];
    } catch (e) {
      console.error('Failed to load price list', e);
      this.notificationService.error('Failed to load price list');
      this.prices = [];
    } finally {
      this.loading = false;
    }
  }
}
