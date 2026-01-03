import { Component, Injector, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';


@Component({
  selector: 'app-partnerships',
  templateUrl: './partnerships.component.html',
})

export class PartnershipsComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private endPoint: OutsourcingEndpoint
  ){ super(injector)}

  activeTab: any = 1;
  @ViewChild('company') company: any ;

  @ViewChild('outsource') outsource : any ;
  @ViewChild('referral') referral : any ;

  override ngOnInit(): void {

  }

  getSource(){
    if(this.activeTab == 1){
      if(this.outsource){
        this.outsource.getData() ;
      }
    }else{
      this.getRefer();
    }

  }

  getRefer(){
    if(this.referral){
      this.referral.getData();
    }
  }

  saveCompany(model: any){
    const temp = model.modal ;

    // temp['partners'] = model.partners && model.partners.length != 0 ? model.partners : [{ name : model.modal.name }] ;

    this.subsink.sink = this.endPoint.postCompany(model.modal).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.modal.name} saved.`);
      this.modalService.dismissAll();


      if(model.partners && model.partners.length != 0){
        model.partners.forEach(async (partner:any)=>{
          const partModel = {
            company : res.id,
            name : partner.name
          }

          this.postPartnerShips(partModel) ;
        })
      }else{
        this.postPartnerShips(
          { name : model.modal.name, company : res.id }
        )
      }

    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error ) ;
    })
  }

  postPartnerShips(model: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.postCompanyPartnership(model).subscribe((res: any)=>{
        this.company.getData();
        resolve(res)
      }, (error)=>{
        this.company.getData();
        resolve(error) ;
        this.alertService.showError(error?.error?.error || error?.error?.Error || error );
      })
    })

  }



}