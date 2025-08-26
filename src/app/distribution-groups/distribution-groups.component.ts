import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

// PrimNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../core/notification.service';
import { DistributionGroupsService } from './distribution-groups.service';
import {Tooltip} from 'primeng/tooltip';
import {CollectionUtil} from '../core/system.utils';
import {StaticDataService} from '../static-data.service';
import { GroupContactsComponent } from './group-contacts/group-contacts.component';
import {Textarea} from 'primeng/textarea';

@Component({
  selector: 'app-distribution-groups',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    CardModule,
    DialogModule,
    ToastModule,
    Tooltip,
    GroupContactsComponent,
    Textarea
  ],
  templateUrl: './distribution-groups.component.html',
  styleUrls: ['./distribution-groups.component.scss']
})
export class DistributionGroupsComponent implements OnInit {
  groups: any[] = [];
  groupForm!: FormGroup;
  showGroupDialog = false;
  showDetailsPanel = false;
  editingGroup: any | null = null;
  selectedGroup: any | null = null;
  loading = false;

  newFreeFormPhoneNos:string = '';

  groupTypeList = StaticDataService.groupTypes();

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private distributionGroupsService: DistributionGroupsService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadGroups();
  }

  initializeForm(): void {
    this.groupForm = this.fb.group({
      id: [""],
      groupType: ["", [Validators.required]],
      groupName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
  }

  async loadGroups(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.distributionGroupsService.getDistributionGroups();
      this.groups = response.data;
    } catch (error) {
      this.notificationService.error('Failed to load distribution groups');
    } finally {
      this.loading = false;
    }
  }

  async saveGroup(group: any): Promise<void> {
    try {

      const response = await this.distributionGroupsService.saveDistributionGroup(group);

        if (response.success) {
            CollectionUtil.add(this.groups, response.data)
      }

    } catch (error) {
      this.notificationService.error('An error occurred while saving the group');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.groupForm.valid) {
      const formValue = this.groupForm.value;
      await this.saveGroup(formValue);
      this.closeGroupDialog();
    } else {
      Object.keys(this.groupForm.controls).forEach(key => {
        this.groupForm.get(key)?.markAsTouched();
      });
    }
  }

  editGroup(group: any): void {
    this.editingGroup = group;
    this.groupForm.patchValue(group);
    this.showGroupDialog = true;
  }


  async mangeFreeFormContacts(operation: any): Promise<void> {

    let request:any = {};
    request.operation = operation;
    request.groupId = this.selectedGroup.id;
    request.phoneNos = this.newFreeFormPhoneNos;

    try {
      const response = await this.distributionGroupsService.mangeFreeFormNumbers(request);
      if (response.success) {
        CollectionUtil.add(this.groups, response.data);
        this.selectedGroup = response.data;
      } 
    } catch (error) {
      this.notificationService.error('An error occurred while updating the contact');
    }
  }


  async deleteGroup(group: any): Promise<void> {
    if (!group.id) return;

    try {
      const response = await this.distributionGroupsService.deleteDistributionGroup(group.id);
      if (response.success) {
        CollectionUtil.remove(this.groups, group.id);
      } else {
        this.notificationService.error(response.message || 'Failed to delete group');
      }
    } catch (error) {
      this.notificationService.error('An error occurred while deleting the group');
    }
  }

  openNewGroupDialog(): void {
    this.editingGroup = null;
    this.resetForm();
    this.showGroupDialog = true;
  }

  closeGroupDialog(): void {
    this.showGroupDialog = false;
    this.resetForm();
  }

  resetForm(): void {
    this.groupForm.reset({});
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.groupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.groupForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      groupType: 'Group Type',
      groupName: 'Group Name'
    };
    return labels[fieldName] || fieldName;
  }

  manageGroup(group: any): void {
    this.selectedGroup = group;
    this.showDetailsPanel = true;
  }

  backToList(): void {
    this.showDetailsPanel = false;
    this.selectedGroup = null;
  }
}
