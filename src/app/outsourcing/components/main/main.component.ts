import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { CookieService } from 'ngx-cookie-service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class PatientsMainComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private cookieSrvc: CookieStorageService,
    private endPoint: OutsourcingEndpoint
  ){ super(injector)}

  activeTab: any = 1 ;
  inProgress: boolean = false;
  ref_lab: any = null ;

  override ngOnInit(): void {

  this.inProgress = true ;

    this.subsink.sink = this.endPoint.getIsStaffRefLab(this.cookieSrvc.getCookieData().lab_staff_id)?.subscribe((res: any)=>{
      this.ref_lab = res ;
      this.activeTab = 3 ;
      this.inProgress = false ;
    }, (error)=>{
      this.inProgress = false ;
    });

  }



}
