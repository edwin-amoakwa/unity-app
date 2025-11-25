import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from './core/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/merchants/price-list`;

  async getPriceList(): Promise<ApiResponse<any[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<any[]>>(this.apiUrl));
  }
}
