import { HttpInterceptorFn } from '@angular/common/http';
import {UserSession} from './user-session';

/**
 * HTTP Interceptor that adds merchantId to all outgoing requests
 */
export const RequestInterceptor: HttpInterceptorFn = (req, next) => {

 let merchantId = localStorage.getItem(UserSession.MerchantId);


  let headers:any = {};

  if (merchantId) {
 headers.merchantId = merchantId;
  }

  // console.log(" http heaers",headers);
  const modifiedReq = req.clone({
    setHeaders: headers
  });

  return next(modifiedReq);
};
