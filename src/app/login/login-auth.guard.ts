import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppAuthService } from '../core/services/appauth.service';
import { environment } from 'src/environments/environment';
import { CookieStorageService } from '../core/services/cookie-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuard implements CanActivate {

  constructor(
    private cookieSrvc: CookieStorageService,
    private router: Router,
    private authservice: AppAuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree {
    const currentUser: any = this.cookieSrvc.getCookieData();

    if ((this.cookieSrvc.getAccess() && this.cookieSrvc.getRefresh())) {
      return false;
    }
    // Tokens are not present, allow access to login, OTP verify, and sign-up components
    return true;
  }
}

