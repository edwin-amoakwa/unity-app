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
import {CollectionUtil} from '../core/system.utils';
import {FormView} from '../core/form-view';

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

  formView = FormView.listView();

  applications: any = [];
  isLoading: boolean = false;
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
    this.formView.resetToCreateView();
  }

  openEditDialog(application: any) {
    this.selectedApplication = { ...application };
    this.formView.resetToCreateView();
  }

  openDetailView(application: any) {
    this.selectedApplication = { ...application };
    this.formView.resetToDetailView();
  }

  async saveApplication(application: any) {
    try {
      const response = await this.applicationService.saveApplication(application);
      if (response.success) {
        CollectionUtil.add(this.applications, response.data);
        this.formView.resetToListView();
      }
    } catch (error) {
      console.error('Error with application:', error);
      const errorMessage = this.selectedApplication ? 'Failed to update application' : 'Failed to create application';
      this.notificationService.error(errorMessage);
    }
  }

  async renewApiKey(application: any) {
    try {
      const response = await this.applicationService.renewApiKey(application.id);
      if (response.success) {
        // Update the application in the list
        const index = this.applications.findIndex(a => a.id === application.id);
        if (index > -1) {
          this.applications[index] = { ...this.applications[index], ...response.data };
        }
        // Update selected application if it's the same
        if (this.selectedApplication?.id === application.id) {
          this.selectedApplication = { ...this.selectedApplication, ...response.data };
        }
        this.notificationService.success('API Key renewed successfully');
      }
    } catch (error) {
      console.error('Error renewing API key:', error);
      this.notificationService.error('Failed to renew API key');
    }
  }

  async toggleApplicationStatus(application: any) {
    try {
      const response = application.activeStatus
        ? await this.applicationService.disableApplication(application.id)
        : await this.applicationService.enableApplication(application.id);

      if (response.success) {
        this.selectedApplication = response.data;
        CollectionUtil.add(this.applications, response.data);

        const action = application.activeStatus ? 'disabled' : 'enabled';
        this.notificationService.success(`Application ${action} successfully`);
      }
    } catch (error) {
      console.error('Error toggling application status:', error);
      this.notificationService.error('Failed to update application status');
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
          CollectionUtil.remove(this.applications, application.id);
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
      currency: 'GHS'
    }).format(price);
  }

  maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length <= 8) return apiKey;
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  }
}
