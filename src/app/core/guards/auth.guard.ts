import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Auth Services
import { AuthenticationService } from '../services/auth.service';
import { AppAuthService } from '../services/appauth.service';
import { CookieStorageService } from '../services/cookie-storage.service';
import { Observable, } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AlertService } from '@sharedcommon/service/alert.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private authFackservice: AppAuthService,
        private cookieSrvc:  CookieStorageService,
        private alertSrvc: AlertService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

        
        const currentUser = this.cookieSrvc.getCookieData();
        if (currentUser && currentUser.access && currentUser.refresh) {
            return true;
        }

        const access = this.cookieSrvc.getAccess();
        const refresh = this.cookieSrvc.getRefresh();
    
        if (!access || !refresh) {
            this.cookieSrvc.clearCookieData();
            this.router.navigate(['/auth/signin'], { queryParams: { returnUrl: state.url } });

          return false;
        }

        return this.authFackservice.refreshLabSpark_token().pipe(
            map((user:any) => {
                if (user && user.access) {   
                    return true;
                }
                this.authFackservice.logout();           
                this.router.navigate(['/auth/signin'], { queryParams: { returnUrl: state.url } });

                return false;
            }),
            
            
            catchError(error => {
                this.authFackservice.logout();
                this.router.navigate(['/auth/signin'], { queryParams: { returnUrl: state.url } });
                this.alertSrvc.showError("error");
                return of(false);
            })
        );
    }
}
