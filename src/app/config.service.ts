import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from './core/ApiResponse';



@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);

  createSenderId(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.baseUrl}/sms-sender-ids`, payload).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to create sender ID. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  deleteSenderId(senderId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.baseUrl}/sms-sender-ids/${senderId}`).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to delete sender ID. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  getSenderIds(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.baseUrl}/sms-sender-ids`).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to fetch sender IDs. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }
}
