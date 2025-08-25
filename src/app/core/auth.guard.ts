import { Injectable } from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {UserSession} from './user-session';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  // Array of routes that should always allow routing without any check
  private allowedRoutes: string[] = [
    'login',
    'password-reset'
  ];

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // const currentRoute = route.url.join('/');
    const currentRoute = state.url.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

    // console.log(state);
    // console.log(state.url);
    // console.log(route);
    // console.log(route.url, currentRoute);
    //
    // console.log(this.allowedRoutes);
    // console.log(localStorage.getItem(UserSession.SessionId));
    // console.log(this.allowedRoutes.includes(currentRoute))

    // Check if current route is in the allowed routes array
    if (this.allowedRoutes.includes(currentRoute)) {
      return true;
    }

    const sessionId = localStorage.getItem(UserSession.SessionId);

    if (sessionId) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
