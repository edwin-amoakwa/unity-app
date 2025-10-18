import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimNG imports
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';


// Project imports
import { FormView } from '../core/form-view';
import { NotificationService } from '../core/notification.service';
import { CollectionUtil } from '../core/system.utils';
import { CardComponent } from '../theme/shared/components/card/card.component';
import { ApplicationType } from '../unity.model';
import { ApplicationService } from './application.service';
import { ButtonToolbarComponent } from '../theme/shared/components/button-toolbar/button-toolbar.component';
import {CoreModule} from '../core/core.module';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonToolbarComponent,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  formView = FormView.listView();

  applications: any = [];
  isLoading: boolean = false;
  selectedApplication: any | null = null;

  applicationForm!: FormGroup;
  applicationTypes = [
    { label: 'SMS', value: ApplicationType.SMS },
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadApplications();
  }

  private initializeForm() {
    this.applicationForm = this.fb.group({
      id: [''],
      appName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      applicationType: [null, [Validators.required]],
      callBackUrl: [''],
      allowedIpAddresses: [''],
      enableIpRestriction: [false]
    });
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
    this.applicationForm.reset();
    this.formView.resetToCreateView();
  }

  openEditDialog(application: any) {
    this.selectedApplication = { ...application };
    this.applicationForm.reset();
    this.applicationForm.patchValue({
      id: application.id ?? '',
      appName: application.appName ?? '',
      applicationType: application.applicationType ?? null,
      callBackUrl: application.callBackUrl ?? '',
      allowedIpAddresses: application.allowedIpAddresses ?? '',
      enableIpRestriction: !!application.enableIpRestriction
    });
    this.formView.resetToCreateView();
  }

  openDetailView(application: any) {
    this.selectedApplication = { ...application };
    this.formView.resetToDetailView();
  }

  onSubmit() {
    if (this.applicationForm.valid) {
      const formValue = this.applicationForm.value;
      this.saveApplication(formValue);
    } else {
      Object.keys(this.applicationForm.controls).forEach(key => this.applicationForm.get(key)?.markAsTouched());
    }
  }

  onCancel() {
    this.applicationForm.reset();
    this.formView.resetToListView();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.applicationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.applicationForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      appName: 'Application Name',
      applicationType: 'Application Type',
      callBackUrl: 'Callback URL',
      allowedIpAddresses: 'Allowed IP Addresses',
      enableIpRestriction: 'Enable IP Restriction'
    };
    return labels[fieldName] || fieldName;
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
    }
  }

  async renewApiKey(application: any) {
    try {
      const response = await this.applicationService.renewApiKey(application.id);
      if (response.success) {
        // Update the application in the list
        // const index = this.applications.findIndex(a => a.id === application.id);
        // if (index > -1) {
        //   this.applications[index] = { ...this.applications[index], ...response.data };
        // }
        // // Update selected application if it's the same
        // if (this.selectedApplication?.id === application.id) {
        //   this.selectedApplication = { ...this.selectedApplication, ...response.data };
        // }
        this.selectedApplication = response.data;
        CollectionUtil.add(this.applications, response.data);

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



  getApplicationTypeSeverity(type: ApplicationType | null): 'success' | 'warning' | 'danger' | 'info' {
    if (!type) return 'info';

    switch (type) {
      case ApplicationType.SMS:
        return 'success';
      default:
        return 'info';
    }
  }



  maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length <= 8) return apiKey;
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  }
}
