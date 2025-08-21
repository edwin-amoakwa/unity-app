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
import { ApplicationModel } from '../applications/application.model';

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
  applications: ApplicationModel[] = [];

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

  loadSenderIds() {
    this.isLoading = true;
    this.configService.getSenderIds().subscribe({
      next: (response) => {
        this.senderIds = response.data.map(item => ({
          senderId: item.senderId,
          idStatus: item.idStatus as SenderIdStatus,
          idStatusName: item.idStatusName,
          merchantId: item.merchantId
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sender IDs:', error);
        this.notificationService.error('Failed to load sender IDs');
        this.isLoading = false;
        // Fallback to empty array for now
        this.senderIds = [];
      }
    });
  }

  loadApplications() {
    this.applicationService.getApplications().subscribe({
      next: (response) => {
        this.applications = response.data || [];
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.notificationService.error('Failed to load applications');
        this.applications = [];
      }
    });
  }

  onSubmit() {
    if (this.senderIdForm.valid) {
      this.isLoading = true;
      const formValues = this.senderIdForm.value;
      const payload = {
        senderId: formValues.senderId,
        applicationId: formValues.applicationId
      };

      this.configService.createSenderId(payload).subscribe({
        next: (response) => {
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
        },
        error: (error) => {
          console.error('Error creating sender ID:', error);
          this.notificationService.error(error.message || 'Failed to create sender ID');
          this.isLoading = false;
        }
      });
    }
  }

  deleteSenderId(sender: SenderIdModel) {
    this.isLoading = true;
    this.configService.deleteSenderId(sender.senderId).subscribe({
      next: () => {
        const index = this.senderIds.findIndex(s => s.senderId === sender.senderId);
        if (index > -1) {
          this.senderIds.splice(index, 1);
        }
        this.isLoading = false;
        this.notificationService.success('Sender ID deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting sender ID:', error);
        this.notificationService.error(error.message || 'Failed to delete sender ID');
        this.isLoading = false;
      }
    });
  }
}
