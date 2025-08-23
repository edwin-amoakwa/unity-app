import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import {ApiResponse} from './core/ApiResponse';

export interface LoginPayload {
  username: string;
  userPassword: string;
}



@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);


  async login(payload: LoginPayload): Promise<ApiResponse<any>> {
    return await firstValueFrom(this.http.post<ApiResponse<any>>(`${environment.baseUrl}/auth/login`, payload));
  }
}
