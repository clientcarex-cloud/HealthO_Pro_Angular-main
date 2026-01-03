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
  
    return this.endPoint.getSingleStaff(this.cookieSrvc.getCookieData().lab_staff_id).pipe(
      switchMap((res: any) => {
        this.cookieSrvc.setSuperadmin(res);
        
        // Check other conditions for non-superadmin users
        if (res.is_superadmin || (res.is_login_access && res.is_active)) {
          const data = this.cookieSrvc.getCookieData();
          return this.endPoint.getStaffMenuAccess(data.lab_staff_id).pipe(
            switchMap((data: any) => {
              if (data.results.length !== 0) {
                const accessItems = data.results[0].lab_menu;
                if (!accessItems.includes(6)) {
                  return this.proEndpoint.getMenus().pipe(
                    switchMap((menus: any) => {
                      const path = menus.find((menu: any) => menu.id === data.results[0].lab_menu[0]).link;
                      this.router.navigate([path]);
                      return of(false);
                    })
                  );
                }
                return of(accessItems.includes(6));
              }
              return of(true);
            })
          );
        }
  
        // User does not meet the required conditions, deny access
        this.alertSrvc.showError("", "Access Denied")
        this.router.navigate(['/auth/signin'], { queryParams: { returnUrl: state.url } });
        this.appAuthSrvc.logout();
        return of(false);
      })
    );
  }
  

}
