import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
})

export class AddSupplierComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder : FormBuilder,
    private cookieSrvc: CookieStorageService,
    private endPoint: PharmacyEndpoint,
    private proEndpoint: ProEndpoint
  ){ super(injector)}

  @Output() saved: EventEmitter<any> = new EventEmitter<any>() ;

  supplierTypes: any ;

  override ngOnInit(): void {
    this.initializeForm();
    this.getSupplieTypes();
  }

  getSupplieTypes(){
    this.subsink.sink = this.proEndpoint.getSupplierTypes().subscribe((data: any)=>{
      this.supplierTypes = data ;
      this.baseForm.get('supplier_type')?.setValue(data[0]);
    })
  }

  initializeForm(){
    this.baseForm = this.formBuilder.group({
      name : [null, Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      contact_person: [null, Validators.required],
      email: [null],
      address: [null],
      description: [''],
      supplier_type: [null, Validators.required]
    })
  }

  getModel(){
    const model: any = {
      name : this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      contact_person: this.baseForm.get('contact_person')?.value,
      email: this.baseForm.get('email')?.value,
      address: this.baseForm.get('address')?.value,
      description: this.baseForm.get('description')?.value,
      supplier_type: this.baseForm.get('supplier_type')?.value?.id,
      is_active: true,
      created_by: this.cookieSrvc.getCookieData().lab_staff_id
    }
    return model ;
  }


  override saveApiCall(): void {
    if(this.baseForm.valid){
      const model = this.getModel();

      this.subsink.sink = this.endPoint.postSupplier(model)?.subscribe((res: any)=>{
        this.alertService.showSuccess(`${model.name} saved.`);
        this.saved.emit(res);
      }, (error)=>{ this.showAPIError(error) });

    }else{
      this.showBaseFormErrors();
    }
  }




}
