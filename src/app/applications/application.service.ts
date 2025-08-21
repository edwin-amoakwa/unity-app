import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, throwError } from 'rxjs';
import { ApplicationModel, ApplicationType } from './application.model';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/applications`;

  getApplications(): Observable<ApiResponse<ApplicationModel[]>> {
    return this.http.get<ApiResponse<ApplicationModel[]>>(this.apiUrl).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to fetch applications. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  createApplication(application: Partial<ApplicationModel>): Observable<ApiResponse<ApplicationModel>> {
    return this.http.post<ApiResponse<ApplicationModel>>(this.apiUrl, application).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to create application. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  updateApplication(id: string, application: Partial<ApplicationModel>): Observable<ApiResponse<ApplicationModel>> {
    return this.http.put<ApiResponse<ApplicationModel>>(`${this.apiUrl}/${id}`, application).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to update application. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  deleteApplication(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to delete application. Please try again.';
        return throwError(() => new Error(message));
      })
    );
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
