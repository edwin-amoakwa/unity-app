// angular import
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {CardComponent} from '../theme/shared/components/card/card.component';

// primeng imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';

// project import
import { ConfigService } from '../config.service';
import { NotificationService } from '../core/notification.service';
import { ApplicationService } from '../applications/application.service';

export enum SenderIdStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}

export interface SenderIdModel {
  senderId: string;
  idStatus: SenderIdStatus;
  idStatusName: string;
  appName: string;
  merchantId: string;
}

@Component({
  selector: 'sender-id',
  imports: [CardComponent, ReactiveFormsModule, CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, DropdownModule],
  templateUrl: './sender-id.component.html',
  styleUrls: ['./sender-id.component.scss']
})
export class SenderIdComponent implements OnInit {
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);
  private applicationService = inject(ApplicationService);
  private formBuilder = inject(FormBuilder);

  senderIdForm: FormGroup;
  senderIds: any[] = [];
  isLoading: boolean = false;

  // Application dropdown properties
  applications: any[] = [];

  constructor() {
    this.senderIdForm = this.formBuilder.group({
      senderId: ['', [Validators.required, Validators.maxLength(11)]],
      applicationId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSenderIds();
    this.loadApplications();
  }

  async loadSenderIds() {
    this.isLoading = true;
    try {
      const response = await this.configService.getSenderIds();
      this.senderIds = response.data.map(item => ({
        senderId: item.senderId,
        idStatus: item.idStatus as SenderIdStatus,
        idStatusName: item.idStatusName,
        merchantId: item.merchantId
      }));
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading sender IDs:', error);
      this.notificationService.error('Failed to load sender IDs');
      this.isLoading = false;
      // Fallback to empty array for now
      this.senderIds = [];
    }
  }

  async loadApplications() {
    try {
      const response = await this.applicationService.getApplications();
      this.applications = response.data || [];
    } catch (error) {
      console.error('Error loading applications:', error);
      this.notificationService.error('Failed to load applications');
      this.applications = [];
    }
  }

  async onSubmit() {
    if (this.senderIdForm.valid) {
      this.isLoading = true;
      const formValues = this.senderIdForm.value;
      const payload = {
        senderId: formValues.senderId,
        applicationId: formValues.applicationId
      };

      try {
        const response = await this.configService.createSenderId(payload);
        const newSenderId: any = {
          senderId: response.data.senderId,
          idStatus: response.data.idStatus as SenderIdStatus,
          idStatusName: response.data.idStatusName,
          appName: response.data.appName,
          merchantId: response.data.merchantId
        };

        this.senderIds.push(newSenderId);
        this.senderIdForm.reset();
        this.isLoading = false;
        this.notificationService.success('Sender ID created successfully');
      } catch (error: any) {
        console.error('Error creating sender ID:', error);
        this.notificationService.error(error.message || 'Failed to create sender ID');
        this.isLoading = false;
      }
    }
  }

  async deleteSenderId(sender: SenderIdModel) {
    this.isLoading = true;
    try {
      await this.configService.deleteSenderId(sender.senderId);
      const index = this.senderIds.findIndex(s => s.senderId === sender.senderId);
      if (index > -1) {
        this.senderIds.splice(index, 1);
      }
      this.isLoading = false;
      this.notificationService.success('Sender ID deleted successfully');
    } catch (error: any) {
      console.error('Error deleting sender ID:', error);
      this.notificationService.error(error.message || 'Failed to delete sender ID');
      this.isLoading = false;
    }
  }
}
