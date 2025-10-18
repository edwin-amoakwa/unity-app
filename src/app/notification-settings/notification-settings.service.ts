import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../core/ApiResponse';
import {environment} from '../../environments/environment';

export interface NotificationSetting {
  id?: string;
  merchantId?: string;
  recipientNumber?: string;
  recipientEmail?: string;
  recipientEmailCc?: string;
  recipientEmailBcc?: string;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationSettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/notifications/config`;

  async getNotificationSettings(): Promise<ApiResponse<any[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<any[]>>(this.apiUrl));
  }

  async saveNotificationSetting(setting: NotificationSetting): Promise<ApiResponse<any>> {
    if (!setting.id) {
      return await firstValueFrom(this.http.post<ApiResponse<any>>(this.apiUrl, setting));
    }
    return await firstValueFrom(this.http.put<ApiResponse<any>>(`${this.apiUrl}`, setting));
  }

  async deleteNotificationSetting(id: string): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`));
  }
}
