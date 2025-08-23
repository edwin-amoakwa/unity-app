import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UserSession } from './user-session';
import { NotificationService } from './notification.service';

/**
 * HTTP Interceptor that adds merchantId to all outgoing requests and handles errors centrally
 */
export const RequestInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  let merchantId = localStorage.getItem(UserSession.MerchantId);

  let headers: any = {};

  if (merchantId) {
    headers.merchantId = merchantId;
  }

  // console.log(" http heaers",headers);
  const modifiedReq = req.clone({
    setHeaders: headers
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

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
