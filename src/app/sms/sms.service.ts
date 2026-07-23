import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/ApiResponse';
import { } from './sms.model';
import {HttpUtils} from '../core/HttpUtils';

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private apiUrl = `${environment.baseUrl}/group-sms`;

  constructor(private http: HttpClient) {}

  async getSmsMessages(filters): Promise<ApiResponse<any[]>> {
    const urlParams = HttpUtils.toUrlParam(Object.assign({}, filters));
    return await firstValueFrom(this.http.get<ApiResponse<any[]>>(`${this.apiUrl}?${urlParams}`));
  }

  async getTemplateSMS(): Promise<ApiResponse<any[]>> {

    let params:any = {};
    params.templateSms = true;
    // pageNo = -1 tells the backend to skip pagination and return every template.
    params.pageNo = -1;
    return this.getSmsMessages(params);
  }

  async saveSmsMessage(sms: any): Promise<ApiResponse<any>> {
    if(sms.id)
    {
      return await firstValueFrom(this.http.put<ApiResponse<any>>(`${this.apiUrl}`, sms));
    }
    else
    {
      return await firstValueFrom(this.http.post<ApiResponse<any>>(`${this.apiUrl}`, sms));
    }

  }

  async deleteSmsMessage(id: string): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`));
  }

  async sendSmsMessage(id: string): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/send`,{}));
  }

  async duplicateSmsMessage(id: string): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/duplicate`,{}));
  }

  // async getApplications(): Promise<ApiResponse<any[]>> {
  //   return await firstValueFrom(this.http.get<ApiResponse<any[]>>(`${environment.baseUrl}/applications`));
  // }
  //
  // async getSenderIds(): Promise<ApiResponse<any[]>> {
  //   return await firstValueFrom(this.http.get<ApiResponse<any[]>>(`${environment.baseUrl}/sender-ids`));
  // }

  calculatePagesCount(messageText: string): number {
    return Math.ceil(messageText.length / 160);
  }
}
