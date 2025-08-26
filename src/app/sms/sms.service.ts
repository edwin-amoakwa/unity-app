import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/ApiResponse';
import {  } from './sms.model';

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private apiUrl = `${environment.baseUrl}/group-sms`;

  constructor(private http: HttpClient) {}

  async getSmsMessages(): Promise<ApiResponse<any[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<any[]>>(this.apiUrl));
  }

  async createSmsMessage(sms: Partial<any>): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(this.apiUrl, sms));
  }

  async updateSmsMessage(id: string, sms: Partial<any>): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, sms));
  }

  async deleteSmsMessage(id: string): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`));
  }

  async getApplications(): Promise<ApiResponse<any[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<any[]>>(`${environment.baseUrl}/applications`));
  }

  async getSenderIds(): Promise<ApiResponse<any[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<any[]>>(`${environment.baseUrl}/sender-ids`));
  }

  calculatePagesCount(messageText: string): number {
    return Math.ceil(messageText.length / 160);
  }
}
