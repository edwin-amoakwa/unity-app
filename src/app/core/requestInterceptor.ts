import { HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP Interceptor that adds merchantId to all outgoing requests
 */
export const RequestInterceptor: HttpInterceptorFn = (req, next) => {

 let merchantId = localStorage.getItem('merchantId');


  let headers:any = {};

  if (merchantId) {
 headers.merchantId = merchantId;
  }

  const modifiedReq = req.clone({
    setHeaders: headers
  });

  return next(modifiedReq);
};
