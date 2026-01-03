import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieStorageService } from '../core/services/cookie-storage.service';
import { AppAuthService } from '../core/services/appauth.service';
import { AlertService } from '@sharedcommon/service/alert.service';
import { ProEndpoint } from '../patient/endpoints/pro.endpoint';
import { StaffEndpoint } from '../staff/endpoint/staff.endpoint';

@Injectable({
  providedIn: 'root'
})
export class PageGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieSrvc: CookieStorageService,
    private appAuthSrvc: AppAuthService,
    private endPoint: StaffEndpoint,
    private alertSrvc: AlertService,
    private proEndpoint: ProEndpoint
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  
    const access = this.cookieSrvc.getAccess();
    const refresh = this.cookieSrvc.getRefresh();
  
    if (!access || !refresh) {
      this.appAuthSrvc.logout();
      return false;
    }
  
    return this.endPoint.pageQuardAuth(this.cookieSrvc.getCookieData().lab_staff_id, 3).pipe(
      switchMap((res: any)=>{
        this.cookieSrvc.setSuperadmin(res);

        if(res.can_access){
          return of(true);
        }else{
          this.router.navigate([res.route]);
          return of(false);
        }
      })
    )
  }
  

}
