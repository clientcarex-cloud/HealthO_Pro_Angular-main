import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { HIMSSetupEndpoint } from '../services-hims/hmis.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { FormBuilder, Validators } from '@angular/forms';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';


@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html'
})

export class AddServiceComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: HIMSSetupEndpoint,
    private cookieSrvc: CookieStorageService,
    private formBuilder: FormBuilder
  ){ super(injector) } ;

  @Input() departments: any = [] ;
  @Input() service: any = null ;
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  override ngOnInit(): void {

    this.baseForm = this.formBuilder.group({
      name : [this.service ? this.service.name : null , Validators.required],
      short_code: [this.service ? this.service.short_code : null],
      department: [this.service ? this.service.department : null, Validators.required],
      price: [this.service ? this.service.price : null, Validators.required],
      description: [this.service ? this.service.description : null]
    })
  }

  getModel(){
    const model = {
      name : this.baseForm.get('name')?.value,
      short_code : this.baseForm.get('short_code')?.value,
      department : this.baseForm.get('department')?.value?.id,
      price : this.baseForm.get('price')?.value,
      description : this.baseForm.get('description')?.value,
      is_active: true,
    }

    return model;
  }

  override saveApiCall(): void {
    if(this.baseForm.valid){
      const model: any = this.getModel() ;
      if(!this.service) this.post(model) ;
      else{
        model['id'] = this.service.id ; 
        model['created_by'] = this.service.created_by?.id || this.service.created_by ;
        model['last_updated_by'] = this.cookieSrvc.getCookieData()?.lab_staff_id ;
        this.update(model) ;
      }
    }else{
      this.submitted = true ;
      this.showBaseFormErrors() ;
    }
  }

  post(model: any){
    model['created_by'] = this.cookieSrvc.getCookieData()?.lab_staff_id ;
    this.subsink.sink = this.endPoint.PostHIMSService(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} saved.`) ;
      this.saved.emit({}) ;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error )
    })
  }

  update(model: any){
    this.subsink.sink = this.endPoint.updateHIMSService(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} updated.`) ;
      this.saved.emit({}) ;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error )
    })
  }
  
}
