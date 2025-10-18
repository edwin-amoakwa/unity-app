import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NotificationSettingsService, NotificationSetting } from './notification-settings.service';
import { NotificationSettingsFormComponent } from './notification-settings-form/notification-settings-form.component';
import {CoreModule} from '../core/core.module';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CoreModule, ButtonModule, TableModule, TagModule, NotificationSettingsFormComponent],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  private service = inject(NotificationSettingsService);

  items: NotificationSetting[] = [];
  isLoading = false;
  error: string | null = null;

  listView = true;
  current: NotificationSetting | null = null;

  async ngOnInit() {
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

  edit(item: NotificationSetting) {
    this.current = item;
    this.listView = false;
  }

  async onSave(updated: NotificationSetting) {
    try {
      const resp = await this.service.saveNotificationSetting(updated);
      if (resp?.success) {
        await this.load();
        this.listView = true;
        this.current = null;
      }
    } catch (e) {
      console.error('Failed to save notification setting', e);
    }
  }

  onCancel() {
    this.listView = true;
    this.current = null;
  }
}
