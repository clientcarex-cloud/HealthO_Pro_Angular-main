import { Component, Injector } from '@angular/core';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { error } from 'console';

@Component({
  selector: 'app-requests-labs',
  templateUrl: './requests-labs.component.html',
  styleUrl: './requests-labs.component.scss'
})
export class RequestsLabsComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private endPoint: OutsourcingEndpoint,
    private cookieSrvc: CookieStorageService,
    private signupEndpoint: SignUpEndpoint
  ){ super(injector) }

  b_id !: number;
  collabs: any = [];

  override ngOnInit(): void {
    this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      this.b_id = data[0].id;
      this.getData();
    });
  }

  getData(){
    this.subsink.sink = this.endPoint.getPartnerships(
      '', null ,null, 'all', 1, false
    ).subscribe((res: any)=>{
      this.collabs = res.filter((r: any)=> !r.is_active);
    });
  }

  acceptCollab(model: any){

    model['is_active'] = true ; 

    this.subsink.sink = this.endPoint.updateCollab(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Collaboration Accepted");
      this.modalService.dismissAll();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || {})
    })

  }

  deleteCollab(model: any){
    this.subsink.sink = this.endPoint.deleteCollab(model.id).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model?.partner?.name || ''} Collabortion request cancelled.`);
      this.getData();
    }, (error)=>{
      this.alertService.showError(error)
    })
  }
}
