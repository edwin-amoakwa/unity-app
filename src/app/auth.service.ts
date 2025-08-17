import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import {ApiResponse} from './core/ApiResponse';

export interface LoginPayload {
  username: string;
  userPassword: string;
}



@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);


  login(payload: LoginPayload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.baseUrl}/auth/login`, payload).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Login failed. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }
}
