import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { UserService } from './user.service';
import { StaticDataService } from '../static-data.service';
import { CollectionUtil } from '../core/system.utils';
import {NotificationService} from '../core/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    CardModule,
    DialogModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private notificationService = inject(NotificationService);

  users: any[] = [];
  userForm!: FormGroup;
  showUserDialog = false;
  editingUser: any | null = null;
  loading = false;

  // Password dialog properties
  passwordForm!: FormGroup;
  showPasswordDialog = false;
  currentUser: any | null = null;
  passwordLoading = false;

  // Dropdown options
  accountCategoryOptions: any[] = StaticDataService.accountCategories();
  accountStatusOptions: any[] = StaticDataService.accountStatuses();

  ngOnInit() {
    this.initializeForm();

    this.loadUsers();
  }

  initializeForm() {
    this.userForm = this.fb.group({
      accountName: ['', [Validators.required]],
      emailAddress: ['', [Validators.required, Validators.email]],
      phoneNo: ['', [Validators.required]],
      accountCategory: ['', [Validators.required]],
      accountStatus: ['', [Validators.required]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }


  async loadUsers() {
    try {
      this.loading = true;
      const response = await this.userService.getUsers();

      if (response.success) {
        this.users = response.data;
      } else {
        this.notificationService.error(response.message|| 'Failed to load users');
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: response.message || 'Failed to load users'
        // });
      }
    } catch (error: any) {
      this.notificationService.error( 'Failed to load users');
      // this.messageService.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: 'Failed to load users'
      // });
    } finally {
      this.loading = false;
    }
  }

  async saveUser(user: any) {
    try {
      const response = await this.userService.saveUser(user);
      if (response.success) {
        CollectionUtil.add(this.users, response.data);
        this.closeUserDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.editingUser ? 'User updated successfully' : 'User created successfully'
        });
      } else {
        this.notificationService.error(response.message || (this.editingUser ? 'Failed to update user' : 'Failed to create user'));
      }
    } catch (error: any) {
      const errorMessage = this.editingUser ? 'Failed to update user' : 'Failed to create user';
      this.notificationService.error(errorMessage);
    }
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const userData = this.userForm.value;
    if (this.editingUser) {
      userData.id = this.editingUser.id;
    }

    await this.saveUser(userData);
  }

  editUser(user: any) {
    this.editingUser = user;
    this.userForm.patchValue({
      accountName: user.accountName,
      emailAddress: user.emailAddress,
      phoneNo: user.phoneNo,
      accountCategory: user.accountCategory,
      accountStatus: user.accountStatus,
    });
    this.showUserDialog = true;
  }

  async deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete user "${user.accountName}"?`)) {
      try {
        this.loading = true;
        const response = await this.userService.deleteUser(user.id!);

        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User deleted successfully'
          });
          await this.loadUsers();
        } else {
          this.notificationService.error(response.message || 'Failed to delete user');
        }
      } catch (error: any) {
        this.notificationService.error('Failed to delete user');
      } finally {
        this.loading = false;
      }
    }
  }

  openNewUserDialog() {
    this.editingUser = null;
    this.resetForm();
    this.showUserDialog = true;
  }

  closeUserDialog() {
    this.showUserDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.userForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'accountName': 'Account Name',
      'emailAddress': 'Email Address',
      'phoneNo': 'Phone Number',
      'accountCategory': 'Account Category',
      'merchantName': 'Merchant Name',
      'merchantId': 'Merchant ID',
      'accountStatus': 'Account Status',
      'userCategory': 'User Category'
    };
    return labels[fieldName] || fieldName;
  }

  // Password dialog methods
  openPasswordDialog(user: any) {
    this.currentUser = user;
    this.resetPasswordForm();
    this.showPasswordDialog = true;
  }

  closePasswordDialog() {
    this.showPasswordDialog = false;
    this.resetPasswordForm();
    this.currentUser = null;
  }

  resetPasswordForm() {
    this.passwordForm.reset();
  }

  async updatePassword() {
    console.log(this.passwordForm.invalid);
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    const newPassword = this.passwordForm.value.newPassword;
    const confirmPassword = this.passwordForm.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      this.notificationService.error('Passwords do not match');
      return;
    }

    try {
      this.passwordLoading = true;
      const response = await this.userService.updatePassword(this.currentUser.id, newPassword);

      if (response.success) {
        this.closePasswordDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password updated successfully'
        });
      } else {
        this.notificationService.error(response.message || 'Failed to update password');
      }
    } catch (error: any) {
      this.notificationService.error('Failed to update password');
    } finally {
      this.passwordLoading = false;
    }
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getPasswordFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getPasswordFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getPasswordFieldLabel(fieldName)} must be at least 6 characters`;
      }
    }
    return '';
  }

  getPasswordFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'newPassword': 'New Password',
      'confirmPassword': 'Confirm Password'
    };
    return labels[fieldName] || fieldName;
  }
}
