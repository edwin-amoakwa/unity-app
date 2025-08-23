import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/applications`;

  async getApplications(): Promise<ApiResponse<any[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<any[]>>(this.apiUrl));
  }

  async createApplication(application: Partial<any>): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(this.apiUrl, application));
  }

  async updateApplication(id: string, application: Partial<any>): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, application));
  }

  async deleteApplication(id: string): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`));
  }

  private generateApiKey(): string {
    const prefix = 'sk_test_';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
