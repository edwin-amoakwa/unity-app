import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NotificationSettingsService, NotificationSetting } from './notification-settings.service';
import { CoreModule } from '../core/core.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CoreModule, ButtonModule, TableModule, TagModule, ReactiveFormsModule, InputTextModule, InputSwitchModule],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  private service = inject(NotificationSettingsService);
  private fb = inject(FormBuilder);

  items: NotificationSetting[] = [];
  isLoading = false;
  error: string | null = null;

  listView = true;
  current: any = null;

  form!: FormGroup;

  async ngOnInit() {
    this.form = this.fb.group({
      id: [''],
      merchantId: [{ value: '', disabled: true }],
      notificationTypeName: [{ value: '', disabled: true }],
      recipientNumber: [''],
      recipientEmail: ['', [Validators.email]],
      recipientEmailCc: ['', [Validators.email]],
      recipientEmailBcc: ['', [Validators.email]],
      enabled: [false]
    });
    await this.load();
  }

  async load() {
    this.isLoading = true;
    this.error = null;
    try {
      const resp = await this.service.getNotificationSettings();
      this.items = resp?.data ?? [];
    } catch (e: any) {
      console.error('Failed to load notification settings', e);
      this.error = 'Failed to load notification settings';
      this.items = [];
    } finally {
      this.isLoading = false;
    }
  }

  edit(item: any) {
    this.current = item;
    this.form.reset();
    // Patch values including read-only display fields
    this.form.patchValue({
      id: item.id ?? '',
      merchantId: item.merchantId ?? '',
      notificationTypeName: item.notificationTypeName ?? '',
      recipientNumber: item.recipientNumber ?? '',
      recipientEmail: item.recipientEmail ?? '',
      recipientEmailCc: item.recipientEmailCc ?? '',
      recipientEmailBcc: item.recipientEmailBcc ?? '',
      enabled: !!item.enabled
    });
    this.listView = false;
  }

  async onSubmit() {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const payload: NotificationSetting = {
        id: raw.id,
        merchantId: raw.merchantId,
        recipientNumber: raw.recipientNumber,
        recipientEmail: raw.recipientEmail,
        recipientEmailCc: raw.recipientEmailCc,
        recipientEmailBcc: raw.recipientEmailBcc,
        enabled: raw.enabled
      };
      try {
        const resp = await this.service.saveNotificationSetting(payload);
        if (resp?.success) {
          await this.load();
          this.listView = true;
          this.current = null;
          this.form.reset();
        }
      } catch (e) {
        console.error('Failed to save notification setting', e);
      }
    } else {
      Object.keys(this.form.controls).forEach(k => this.form.get(k)?.markAsTouched());
    }
  }

  onCancel() {
    this.listView = true;
    this.current = null;
    this.form.reset();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
