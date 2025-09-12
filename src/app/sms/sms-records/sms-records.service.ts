import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/ApiResponse';
import { SmsRecord } from './sms-records.component';

@Injectable({
  providedIn: 'root'
})
export class SmsRecordsService {
  private apiUrl = `${environment.baseUrl}/sms-records`;

  constructor(private http: HttpClient) {}

  async getSmsRecords(): Promise<ApiResponse<SmsRecord[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<SmsRecord[]>>(this.apiUrl));
  }

}
