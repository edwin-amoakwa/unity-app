import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import {ApiResponse} from './core/ApiResponse';

export interface LoginPayload {
  username: string;
  userPassword: string;
}

export interface RequestPasswordPayload {
  username: string;
}



@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);


  async login(payload: LoginPayload): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(`${environment.baseUrl}/auth/login`, payload));
  }

  async requestPassword(payload: RequestPasswordPayload): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(`${environment.baseUrl}/auth/request-password`, payload));
  }

  async register(payload: any): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(`${environment.baseUrl}/auth/register`, payload));
  }

  // Sends verification PIN to the provided email
  async sendVerifyPin(payload: { email: string }): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(`${environment.baseUrl}/auth/send-verify-pin`, payload));
  }

  // Verifies the PIN for the provided email
  async verifyPin(payload: { email: string; pin: string }): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(`${environment.baseUrl}/auth/verify-pin`, payload));
  }
}
