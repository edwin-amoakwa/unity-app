import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// PrimNG imports
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// Project imports
import { FormView } from '../core/form-view';
import { NotificationService } from '../core/notification.service';
import { CollectionUtil } from '../core/system.utils';
import { MessageBox } from '../message-helper';
import { CardComponent } from '../theme/shared/components/card/card.component';
import { SmsFormComponent } from './sms-form/sms-form.component';
import { SmsService } from './sms.service';
import {ButtonToolbarComponent} from '../theme/shared/components/button-toolbar/button-toolbar.component';

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
    SmsFormComponent,
    ButtonToolbarComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.css']
})
export class SmsComponent implements OnInit {
  private smsService = inject(SmsService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  formView = FormView.listView();

  smsMessages: any[] = [];
  isLoading: boolean = false;
  // showDialog: boolean = false;
  selectedSms: any | null = null;

  ngOnInit() {
    this.loadSmsMessages();
  }

  async loadSmsMessages() {
    this.isLoading = true;
    try {
      const response = await this.smsService.getSmsMessages();
      this.smsMessages = response.data;
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading SMS messages:', error);
      this.notificationService.error('Failed to load SMS messages');
      this.isLoading = false;
      this.smsMessages = [];
    }
  }



  createNewMessage() {
    // this.selectedSms = null;
    this.selectedSms = {};
    this.selectedSms.smsMessageType = "SINGLE_SMS";
    this.selectedSms.phoneNumbersSource = "COPY_PASTE";
    this.selectedSms.smsNature = "ONE_TIME";
    this.formView.resetToCreateView();
  }

  openEditDialog(sms: any) {
    this.selectedSms = sms;
    this.formView.resetToCreateView();
  }

  async onSmsSubmitted(sms: any) {
    try {

        const response = await this.smsService.saveSmsMessage( sms);
        if(!response.success)
        {
          MessageBox.errorDetail(response.message,response.data)
           const errorMessage = response.message;
          this.notificationService.error(errorMessage);
          return
        }

        CollectionUtil.add(this.smsMessages, response.data);

        this.formView.resetToListView();


    } catch (error) {
      console.error('Error with SMS message:', error);
      const errorMessage = this.selectedSms ? 'Failed to update SMS message' : 'Failed to create SMS message';
      this.notificationService.error(errorMessage);
    }
  }

  async duplicateSms(sms: any) {
    try {

        const response = await this.smsService.duplicateSmsMessage(sms.id);
        if(!response.success)
        {
          MessageBox.errorDetail(response.message,response.data)
           const errorMessage = response.message;
          this.notificationService.error(errorMessage);
          return
        }

        // CollectionUtil.add(this.smsMessages, response.data);
        // this.formView.resetToListView();

        this.openEditDialog(response.data);

    } catch (error) {
      console.error('Error with SMS message:', error);
      const errorMessage = this.selectedSms ? 'Failed to Duplicate SMS message' : 'Failed to Duplicate SMS message';
      this.notificationService.error(errorMessage);
    }
  }

  deleteSms(sms: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this SMS message?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (sms.id) {
          try {
           const response = await this.smsService.deleteSmsMessage(sms.id);
           if(response.success)
           {
             CollectionUtil.remove(this.smsMessages, sms.id);
           }

          } catch (error) {
            console.error('Error deleting SMS message:', error);
            this.notificationService.error('Failed to delete SMS message');
          }
        }
      }
    });
  }

  initiateSms(sms: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to Send this SMS message?`,
      header: 'Confirm Send / Initiated',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (sms.id) {
          try {
            // await this.smsService.sendSmsMessage(sms.id);

            const response = await this.smsService.sendSmsMessage(sms.id);
            if(response.success)
            {
              CollectionUtil.add(this.smsMessages, response.data);
            }

          } catch (error) {
            console.error('Error deleting SMS message:', error);
            this.notificationService.error('Failed to Initiate/Send SMS message');
          }
        }
      }
    });
  }

  getStatusSeverity(dispatched: boolean): 'success' | 'warning' | 'danger' | 'info' {
    return dispatched ? 'success' : 'warning';
  }

  getSmsNatureSeverity(nature: any): 'success' | 'warning' | 'danger' | 'info' {
    switch (nature) {
      case 'ONE_TIME':
        return 'warning';
      case 'RECURRING':
        return 'info';
      default:
        return 'info';
    }
  }

  formatPhoneNumbers(phoneNos: string): string {
    if (!phoneNos) return '';
    const phones = phoneNos.split(',');
    if (phones?.length > 3) {
      return `${phones.slice(0, 3).join(', ')} +${phones.length - 3} more`;
    }
    return phones.join(', ');
  }

  formatScheduledTime(scheduledTime: Date | undefined): string {
    if (!scheduledTime) return 'Not scheduled';
    return new Date(scheduledTime).toLocaleString();
  }
}
