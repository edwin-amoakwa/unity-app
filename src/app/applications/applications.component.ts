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
import { ApplicationService } from './application.service';
import { ApplicationFormComponent } from './application-form/application-form.component';
import {ApplicationType} from '../unity.model';

@Component({
  selector: 'app-applications',
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
    ApplicationFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  applications: any = [];
  isLoading: boolean = false;
  showDialog: boolean = false;
  selectedApplication: any | null = null;

  ngOnInit() {
    this.loadApplications();
  }

  async loadApplications() {
    this.isLoading = true;
    try {
      const response = await this.applicationService.getApplications();
      this.applications = response.data;
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading applications:', error);
      this.notificationService.error('Failed to load applications');
      this.isLoading = false;
      this.applications = [];
    }
  }

  openCreateDialog() {
    this.selectedApplication = null;
    this.showDialog = true;
  }

  openEditDialog(application: any) {
    this.selectedApplication = { ...application };
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedApplication = null;
  }

  async onApplicationSubmitted(application: any) {
    try {
      if (this.selectedApplication && this.selectedApplication.id) {
        // Update existing application
        const response = await this.applicationService.updateApplication(this.selectedApplication.id, application);
        const index = this.applications.findIndex(a => a.id === this.selectedApplication!.id);
        if (index > -1) {
          this.applications[index] = response.data;
        }
        this.notificationService.success('Application updated successfully');
        this.closeDialog();
      } else {
        // Create new application
        const response = await this.applicationService.createApplication(application);
        this.applications.push(response.data);
        this.notificationService.success('Application created successfully');
        this.closeDialog();
      }
    } catch (error) {
      console.error('Error with application:', error);
      const errorMessage = this.selectedApplication ? 'Failed to update application' : 'Failed to create application';
      this.notificationService.error(errorMessage);
    }
  }

  deleteApplication(application: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the application "${application.appName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (application.id) {
          try {
            await this.applicationService.deleteApplication(application.id);
            const index = this.applications.findIndex(a => a.id === application.id);
            if (index > -1) {
              this.applications.splice(index, 1);
            }
            this.notificationService.success('Application deleted successfully');
          } catch (error) {
            console.error('Error deleting application:', error);
            this.notificationService.error('Failed to delete application');
          }
        }
      }
    });
  }

  getApplicationTypeSeverity(type: ApplicationType | null): 'success' | 'warning' | 'danger' | 'info' {
    if (!type) return 'info';

    switch (type) {
      case ApplicationType.SMS:
        return 'success';
      default:
        return 'info';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length <= 8) return apiKey;
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  }
}
