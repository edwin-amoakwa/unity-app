import {HttpInterceptorFn, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError, tap} from 'rxjs';
import {UserSession} from './user-session';
import {NotificationService} from './notification.service';

/**
 * HTTP Interceptor that adds merchantId to all outgoing requests and handles errors centrally
 */
export const RequestInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  let merchantId = localStorage.getItem(UserSession.MerchantId);
  let userId = localStorage.getItem(UserSession.UserID);

  let headers: any = {};

  if (merchantId) {
    headers.merchantId = merchantId;
  }

  if (userId) {
    headers.userId = userId;
  }

  // console.log(" http heaers",headers);
  const modifiedReq = req.clone({
    setHeaders: headers
  });

  return next(modifiedReq).pipe(
    tap(response => {
      // Check if the response is an HTTP response
      if (response instanceof HttpResponse) {
        // Log all successful HTTP responses
        console.log(`[HTTP Response] ${req.method} ${req.url} - Status: ${response.status}`, response);

        // Log the request body
        console.log(`[Request Body] ${req.method} ${req.url}`, req.body);

        if (response.body && (response.body as any).success) {
          let res: any = response.body;
          if (res.status == 201) {
            notificationService.success("Data saved successfully");
          } else if (res.status == 200) {
            if (res.method === "PUT") {
              notificationService.success("Record updated successfully.")
            } else if (res.method === "DELETE") {
              notificationService.success("Data deleted successfully.");
            } else if (res.method === "POST") {
              if (res.body.message) {
                notificationService.success(res.body.message);
              }
            }
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      // Log error responses
      console.log(`[HTTP Error Response] ${req.method} ${req.url} - Status: ${error.status}`, error);

      // Check if it's an HTTP error response
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error notification
      notificationService.error(errorMessage, 'Error');

      // Re-throw the error so components can still handle it if needed
      return throwError(() => error);
    })
  );
};
