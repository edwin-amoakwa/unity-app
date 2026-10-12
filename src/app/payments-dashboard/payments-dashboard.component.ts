import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { averageSmsPrice, smsCapacity, SmsPriceEstimate } from '../core/sms-pricing';
import { UserSession } from '../core/user-session';
import { MerchantService } from '../merchant.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PaymentService } from '../payments/payment.service';

interface PaymentTotals {
  amount: number;
  count: number;
}

@Component({
  selector: 'app-payments-dashboard',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './payments-dashboard.component.html'
})
export class PaymentsDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private paymentService = inject(PaymentService);
  private merchantService = inject(MerchantService);

  merchant = UserSession.getMerchant();
  currentDate = new Date();

  canAddFunds = UserSession.allowRoute('add-funds');

  loading = true;
  error = '';

  summary: any = {};
  payments: any[] = [];
  recent: any[] = [];

  approved: PaymentTotals = { amount: 0, count: 0 };
  approvedThisMonth: PaymentTotals = { amount: 0, count: 0 };
  pending: PaymentTotals = { amount: 0, count: 0 };
  rejected: PaymentTotals = { amount: 0, count: 0 };
  lastApproved: any = null;

  price: SmsPriceEstimate = { rate: 0, channelCount: 0 };
  smsCovered = 0;

  async ngOnInit() {
    if (!this.canAddFunds) {
      this.loading = false;
      return;
    }
    try {
      const [summaryResponse, paymentsResponse, priceList] = await Promise.all([
        this.dashboardService.getSummary(),
        this.paymentService.getPayments(),
        this.merchantService.getPriceList().then((r) => r.data ?? []).catch((error) => {
          console.error('Error loading SMS price list:', error);
          return [];
        })
      ]);
      this.summary = summaryResponse.data ?? {};
      this.payments = paymentsResponse.data ?? [];
      this.price = averageSmsPrice(priceList, this.summary?.unitPrice);
      this.smsCovered = smsCapacity(this.summary?.creditBalance, this.price.rate);
      this.computeTotals();
    } catch (error) {
      console.error('Error loading payments dashboard:', error);
      this.error = "We couldn't load your payments. Refresh the page to try again.";
    } finally {
      this.loading = false;
    }
  }

  private computeTotals() {
    const now = new Date();
    const sorted = [...this.payments].sort((a, b) => this.time(b) - this.time(a));
    this.recent = sorted.slice(0, 10);

    for (const p of sorted) {
      const amount = Number(p.amount) || 0;
      const status = this.status(p);
      if (status === 'APPROVED') {
        this.add(this.approved, amount);
        const d = new Date(p.createdDate);
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
          this.add(this.approvedThisMonth, amount);
        }
        this.lastApproved ??= p;
      } else if (status === 'REJECTED') {
        this.add(this.rejected, amount);
      } else {
        this.add(this.pending, amount);
      }
    }
  }

  private add(t: PaymentTotals, amount: number) {
    t.amount += amount;
    t.count += 1;
  }

  private time(p: any): number {
    const t = new Date(p?.createdDate).getTime();
    return isNaN(t) ? 0 : t;
  }

  status(p: any): string {
    return (p?.paymentStatus ?? 'PENDING').toString().toUpperCase();
  }

  private static readonly LABEL: Record<string, string> = { APPROVED: 'Approved', REJECTED: 'Rejected', PENDING: 'Pending' };
  private static readonly PILL: Record<string, string> = { APPROVED: 'pill-approved', REJECTED: 'pill-rejected-pay', PENDING: 'pill-pending' };
  private static readonly ICON: Record<string, string> = { APPROVED: 'pi-check', REJECTED: 'pi-times', PENDING: 'pi-clock' };

  statusLabel(p: any): string {
    return PaymentsDashboardComponent.LABEL[this.status(p)] ?? p?.paymentStatusName ?? 'Pending';
  }

  statusClass(p: any): string {
    return PaymentsDashboardComponent.PILL[this.status(p)] ?? 'pill-pending';
  }

  statusIcon(p: any): string {
    return PaymentsDashboardComponent.ICON[this.status(p)] ?? 'pi-clock';
  }
}
