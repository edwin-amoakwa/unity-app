import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { Tooltip } from 'primeng/tooltip';

import { NotificationService } from '../../core/notification.service';
import { DistributionGroupsService } from '../distribution-groups.service';
import {CollectionUtil, DateUtil} from '../../core/system.utils';

@Component({
  selector: 'app-group-contacts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    DialogModule,
    CalendarModule,
    Tooltip
  ],
  templateUrl: './group-contacts.component.html',
  styleUrls: ['./group-contacts.component.scss']
})
export class GroupContactsComponent implements OnInit, OnChanges {
  @Input() selectedGroup: any | null = null;
  @Input() loading = false;
  @Output() contactsChange = new EventEmitter<any[]>();

  contacts: any[] = [];
  contactForm!: FormGroup;
  showContactDialog = false;
  editingContact: any | null = null;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private distributionGroupsService: DistributionGroupsService
  ) {}

  ngOnInit(): void {
    this.initializeContactForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedGroup'] && this.selectedGroup?.id) {
      this.loadContacts();
    }
  }

  initializeContactForm(): void {
    this.contactForm = this.fb.group({
      id: [""],
      groupId: ["", [Validators.required]],
      mobileNo: ["", [Validators.required]],
      firstName: ["", [Validators.required, Validators.minLength(2)]],
      surname: ["", [Validators.required, Validators.minLength(2)]],
      otherNames: [""],
      birthDate: [""]
    });
  }

  async loadContacts(): Promise<void> {
    if (!this.selectedGroup?.id) return;

    try {
      const response = await this.distributionGroupsService.getGroupContacts(this.selectedGroup.id);
      this.contacts = response.data || [];
      this.contactsChange.emit(this.contacts);
    } catch (error) {
      this.notificationService.error('Failed to load contacts');
    }
  }

  openNewContactDialog(): void {
    this.editingContact = null;
    this.contactForm.patchValue({
      id: "",
      groupId: this.selectedGroup?.id || "",
      mobileNo: "",
      firstName: "",
      surname: "",
      otherNames: "",
      birthDate: ""
    });
    this.showContactDialog = true;
  }

  editContact(contact: any): void {
    this.editingContact = contact;
    this.contactForm.patchValue(contact);
    this.showContactDialog = true;
  }

  async saveContact(): Promise<void> {
    if (this.contactForm.valid) {
      try {
        const formValue = this.contactForm.value;
        formValue.birthDate = DateUtil.toDate(formValue.birthDate )
        const response = await this.distributionGroupsService.saveGroupContact(formValue);

        if (response.success) {
          CollectionUtil.add(this.contacts, response.data);
          this.contactsChange.emit(this.contacts);
          this.closeContactDialog();
          this.notificationService.success('Contact saved successfully');
        }
      } catch (error) {
        this.notificationService.error('An error occurred while saving the contact');
      }
    } else {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  async deleteContact(contact: any): Promise<void> {
    if (!contact.id) return;

    try {
      const response = await this.distributionGroupsService.deleteGroupContact(contact.id);
      if (response.success) {
        CollectionUtil.remove(this.contacts, contact.id);
        this.contactsChange.emit(this.contacts);
        this.notificationService.success('Contact deleted successfully');
      } else {
        this.notificationService.error(response.message || 'Failed to delete contact');
      }
    } catch (error) {
      this.notificationService.error('An error occurred while deleting the contact');
    }
  }

  closeContactDialog(): void {
    this.showContactDialog = false;
    this.editingContact = null;
    this.contactForm.reset();
  }

  isContactFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getContactFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getContactFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getContactFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  getContactFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      groupId: 'Group ID',
      mobileNo: 'Mobile Number',
      firstName: 'First Name',
      surname: 'Surname',
      otherNames: 'Other Names',
      birthDate: 'Birth Date'
    };
    return labels[fieldName] || fieldName;
  }
}
