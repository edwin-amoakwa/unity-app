import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/ApiResponse';
import { Payment } from '../unity.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/payments`;

  async getPayments(): Promise<ApiResponse<Payment[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<Payment[]>>(this.apiUrl));
  }

  async createPayment(payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return await firstValueFrom(this.http.post<ApiResponse<Payment>>(this.apiUrl, payment));
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return await firstValueFrom(this.http.put<ApiResponse<Payment>>(`${this.apiUrl}/${id}`, payment));
  }

  async deletePayment(id: string): Promise<ApiResponse<Payment>> {
    return await firstValueFrom(this.http.delete<ApiResponse<Payment>>(`${this.apiUrl}/${id}`));
  }
}
