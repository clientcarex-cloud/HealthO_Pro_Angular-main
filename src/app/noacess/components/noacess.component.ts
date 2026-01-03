import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AppAuthService } from 'src/app/core/services/appauth.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-noacess',
  standalone: true,
  imports: [],
  templateUrl: './noacess.component.html',
})
export class NoacessComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private router: Router,
    private endPoint: StaffEndpoint,
    private cookieSrvc: CookieStorageService,
    private authService: AppAuthService,
  ){ super(injector) }

  override ngOnInit(): void {
    const data = this.cookieSrvc.getCookieData();
    this.subsink.sink = this.endPoint.getStaffMenuAccess(data.lab_staff_id).subscribe((res: any)=>{
      if(res.results[0].lab_menu.length != 0){
        this.router.navigate(['/dashboard']);
      }
    })
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/signin']);
  }
}
