import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { FormBuilder, Validators } from '@angular/forms';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { FileService } from '@sharedcommon/service/file.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';

@Component({
  selector: 'app-leave-policy',
  templateUrl: './leave-policy.component.html',
  styleUrl: './leave-policy.component.scss'
})
export class LeavePolicyComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,

    private ProEndpoint: ProEndpoint,
    private endPoint: MarketExecutiveEndpoint,

    public timeSrvc: TimeConversionService,
    public capitalSrvc: CaptilizeService,
    private fileSrvc: FileService,
    private cookieSrvc: CookieStorageService

  ){ super(injector) }

  leavePolicy: any ;

  override ngOnInit(): void {
    this.subsink.sink = this.endPoint.getLeavePolicy().subscribe((res: any)=>{
      this.leavePolicy = res?.results[0];

    })  
  }

  setIsMonthly(e: any){
    this.leavePolicy.is_monthly = e.target.value == 'true' ;
  }

  setDays(e: any){
    this.leavePolicy.no_of_paid_leaves = e || 0;
  }

  override saveApiCall(): void {
    this.subsink.sink = this.endPoint.updateLeavePolicy(this.leavePolicy).subscribe((res: any)=>{
      this.alertService.showSuccess(`Saved.`);
      this.modalService.dismissAll();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error);
    })
  }



}
