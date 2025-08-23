import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/ApiResponse';
import { User } from '../unity.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/users`;

  async getUsers(): Promise<ApiResponse<User[]>> {
    return await firstValueFrom(this.http.get<ApiResponse<User[]>>(this.apiUrl));
  }

  async createUser(user: Partial<User>): Promise<ApiResponse<User>> {
    return await firstValueFrom(this.http.post<ApiResponse<User>>(this.apiUrl, user));
  }

  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    return await firstValueFrom(this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user));
  }

  async saveUser(user: any): Promise<ApiResponse<User>> {
    if(!user.id) {
      return await firstValueFrom(this.http.post<ApiResponse<User>>(this.apiUrl, user));
    }
    return await firstValueFrom(this.http.put<ApiResponse<User>>(`${this.apiUrl}`, user));
  }

  async deleteUser(id: string): Promise<ApiResponse<User>> {
    return await firstValueFrom(this.http.delete<ApiResponse<User>>(`${this.apiUrl}/${id}`));
  }
}
