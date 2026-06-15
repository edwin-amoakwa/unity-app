import {HttpInterceptorFn, HttpErrorResponse, HttpResponse, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError, tap} from 'rxjs';
import {UserSession} from './user-session';
import {NotificationService} from './notification.service';

/**
 * Public auth endpoints that must be called WITHOUT an Authorization header.
 * The backend derives the current user/merchant from the JWT for everything else.
 */
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/request-password',
  '/auth/send-verify-pin',
  '/auth/verify-pin'
];

/**
 * HTTP Interceptor that attaches the JWT bearer token to outgoing requests
 * (except the public auth endpoints) and handles errors centrally.
 */
export const RequestInterceptor: HttpInterceptorFn = (req:HttpRequest<any>, next) => {

  let notificationsService = inject(NotificationService);
  let router = inject(Router);

  const isPublicAuth = PUBLIC_AUTH_PATHS.some(path => req.url.includes(path));
  const token = UserSession.getToken();

  // Attach the bearer token to every protected request.
  const modifiedReq = (token && !isPublicAuth)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(modifiedReq).pipe(
    tap(httpEvent => {
      // Check if the response is an HTTP response
      if (httpEvent instanceof HttpResponse) {
        // Log all successful HTTP responses
        // console.log(`[HTTP Response] ${req.method} ${req.url} - Status: ${httpEvent.status}`, httpEvent);

        // Log the request body
        // console.log(`[Request Body] ${req.method} ${req.url}`, req.body);
        // console.log(`[Request response] ${req.method} ${req.url}`, req.body);

        let response: any = httpEvent;

        if (httpEvent.body && (httpEvent.body as any).success) {

          // console.log("response --> ",response)
          if (response.status == 201) {
            notificationsService.success("Data saved successfully");
          } else if (response.status == 200) {
            if (req.method === "PUT") {
              notificationsService.success("Record updated successfully.")
            } else if (req.method === "DELETE") {
              notificationsService.success("Data deleted successfully.");
            } else if (req.method === "POST") {
              if (response.body.message) {
                notificationsService.success(response.body.message);
              }
            }
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      // Auth failure: clear session and send the user back to login.
      if (error.status === 401) {
        UserSession.logout();
        router.navigate(['/login']);
      }

      // Log error responses
      // console.log(`[HTTP Error Response] ${req.method} ${req.url} - Status: ${error.status}`, error);

      // Check if it's an HTTP error response
      if (error.error && error.error.message) {
        errorMessage = error.error.message;

        if(error.error.errors)
        {
          const validationErrors = error.error.errors;
          validationErrors.forEach(error => {
            notificationsService.error(error.message, 'Error');
          })
        }

      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error notification
      notificationsService.error(errorMessage, 'Error');

      // Re-throw the error so components can still handle it if needed
      return throwError(() => error);
    })
  );
};
