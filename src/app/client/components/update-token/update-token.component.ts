import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { ClientEndpoint } from '../../clients.endpoint';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-token',
  templateUrl: './update-token.component.html',
})

export class UpdateTokenComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private endPoint: ClientEndpoint
  ){ super(injector) }


  @Input() org: any = null ;
  whatsAppSecretKey : any = null ;

  override ngOnInit(): void {

    this.subsink.sink = this.endPoint.getWAToken(this.org.id)?.subscribe((res: any)=>{
      if(res.length != 0){
        this.whatsAppSecretKey = res[0];
      }
    });

    this.baseForm = this.formBuilder.group({
      secret_key: [null],
      phone_id: [null],
      is_active: true,
    });

  }


  override saveApiCall(): void {
    if(this.baseForm.valid){
      if(this.whatsAppSecretKey){
        this.updateToken();
      }else{
        this.postToken();
      }

    }else{
      this.showBaseFormErrors();
    }
  }

  postToken(){
    this.subsink.sink = this.endPoint.postWhatsAppToken(this.baseForm?.value, this.org?.id).subscribe((res: any)=>{
        this.alertService.showSuccess("Token Updated.");
        this.modalService.dismissAll();
    }, (error)=>{
      this.alertService.showError(error?.error?.error || error?.error?.Error || error);
    })
  }

  updateToken(){
    const model = this.baseForm?.value ;

    model['id'] = this.whatsAppSecretKey.id ;

    this.subsink.sink = this.endPoint.updateWhatsAppToken(model, this.org?.id).subscribe((res: any)=>{
        this.alertService.showSuccess("Token Updated.");
        this.modalService.dismissAll();
    }, (error)=>{
      this.alertService.showError(error?.error?.error || error?.error?.Error || error);
    })
  }

}
