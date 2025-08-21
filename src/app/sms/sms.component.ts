import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Project imports
import { CardComponent } from '../theme/shared/components/card/card.component';
import { NotificationService } from '../core/notification.service';
import { SmsService } from './sms.service';
import { SmsModel, SmsNature } from './sms.model';
import { SmsFormComponent } from './sms-form/sms-form.component';

@Component({
  selector: 'app-sms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
    SmsFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent implements OnInit {
  private smsService = inject(SmsService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  smsMessages: SmsModel[] = [];
  isLoading: boolean = false;
  showDialog: boolean = false;
  selectedSms: SmsModel | null = null;

  ngOnInit() {
    this.loadSmsMessages();
  }

  loadSmsMessages() {
    this.isLoading = true;
    this.smsService.getSmsMessages().subscribe({
      next: (response) => {
        this.smsMessages = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading SMS messages:', error);
        this.notificationService.error('Failed to load SMS messages');
        this.isLoading = false;
        this.smsMessages = [];
      }
    });
  }

  openCreateDialog() {
    this.selectedSms = null;
    this.showDialog = true;
  }

  openEditDialog(sms: SmsModel) {
    this.selectedSms = { ...sms };
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedSms = null;
  }

  onSmsSubmitted(sms: SmsModel) {
    if (this.selectedSms && this.selectedSms.id) {
      // Update existing SMS
      this.smsService.updateSmsMessage(this.selectedSms.id, sms).subscribe({
        next: (response) => {
          const index = this.smsMessages.findIndex(s => s.id === this.selectedSms!.id);
          if (index > -1) {
            this.smsMessages[index] = response.data;
          }
          this.notificationService.success('SMS message updated successfully');
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error updating SMS message:', error);
          this.notificationService.error('Failed to update SMS message');
        }
      });
    } else {
      // Create new SMS
      this.smsService.createSmsMessage(sms).subscribe({
        next: (response) => {
          this.smsMessages.push(response.data);
          this.notificationService.success('SMS message created successfully');
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error creating SMS message:', error);
          this.notificationService.error('Failed to create SMS message');
        }
      });
    }
  }

  deleteSms(sms: SmsModel) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this SMS message?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (sms.id) {
          this.smsService.deleteSmsMessage(sms.id).subscribe({
            next: () => {
              const index = this.smsMessages.findIndex(s => s.id === sms.id);
              if (index > -1) {
                this.smsMessages.splice(index, 1);
              }
              this.notificationService.success('SMS message deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting SMS message:', error);
              this.notificationService.error('Failed to delete SMS message');
            }
          });
        }
      }
    });
  }

  getStatusSeverity(dispatched: boolean): 'success' | 'warning' | 'danger' | 'info' {
    return dispatched ? 'success' : 'warning';
  }

  getSmsNatureSeverity(nature: SmsNature): 'success' | 'warning' | 'danger' | 'info' {
    switch (nature) {
      case SmsNature.TRANSACTIONAL:
        return 'success';
      case SmsNature.PROMOTIONAL:
        return 'info';
      case SmsNature.SERVICE_EXPLICIT:
        return 'warning';
      case SmsNature.SERVICE_IMPLICIT:
        return 'danger';
      default:
        return 'info';
    }
  }

  formatPhoneNumbers(phoneNos: string): string {
    if (!phoneNos) return '';
    const phones = phoneNos.split(',');
    if (phones.length > 3) {
      return `${phones.slice(0, 3).join(', ')} +${phones.length - 3} more`;
    }
    return phones.join(', ');
  }

  formatScheduledTime(scheduledTime: Date | undefined): string {
    if (!scheduledTime) return 'Not scheduled';
    return new Date(scheduledTime).toLocaleString();
  }
}
