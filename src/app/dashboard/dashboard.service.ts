import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/ApiResponse';
import {HttpUtils} from '../core/HttpUtils';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/dashboard`;

  async getSummary(): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.get<ApiResponse<any>>(`${this.apiUrl}/summary`));
  }

  async getSmsChart(dataFilter?: any): Promise<ApiResponse<any>> {

    let params = HttpUtils.toUrlParam(dataFilter);
    console.log(params, dataFilter);
    return await firstValueFrom(
      this.http.get<ApiResponse<any>>(`${this.apiUrl}/sent-sms?${params}`)
    );
  }

  async getMonthlySMS(): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.get<ApiResponse<any>>(`${this.apiUrl}/monthly-sms-stats`));
  }

  async getSmsStats(): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.get<ApiResponse<any>>(`${this.apiUrl}/sms-stats`));
  }

  async getLatestSms(): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.get<ApiResponse<any>>(`${this.apiUrl}/latest-sms`));
  }
}
