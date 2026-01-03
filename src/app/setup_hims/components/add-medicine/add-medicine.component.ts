import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { HIMSSetupEndpoint } from '../services-hims/hmis.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PharmacyEndpoint } from '../services-hims/pharmacy.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';

@Component({
  selector: 'app-add-medicine',
  templateUrl: './add-medicine.component.html',
})
export class AddMedicineComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: PharmacyEndpoint,
    private proEndpoint: ProEndpoint,
    private masterEndpoint: MasterEndpoint,
    private cookieSrvc: CookieStorageService,
    private formBuilder: FormBuilder
  ){ super(injector) } ;

  @Input() departments: any = [] ;
  @Input() medicine: any = null ;
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  typeForm: any ; // Type Form for categories
  categories: any ;
  operational_types: any ;

  override ngOnInit(): void {

    this.baseForm = this.formBuilder.group({
      name : [this.medicine ? this.medicine.name : null , Validators.required],
      short_code: [this.medicine ? this.medicine.short_code : null],
      category: [this.medicine ? this.medicine.category : null, Validators.required],
      operation_type: [this.medicine ? this.medicine.operation_type : null, Validators.required],
      composition: [this.medicine ? this.medicine.composition : null],
      // quantity: [this.medicine ? this.medicine.quantity : 0],
      discount: [this.medicine ? this.medicine?.discount : null, Validators.required ],
      price: [this.medicine ? this.medicine.price : ''],
      tax: [this.medicine ? this.medicine.tax : 0, Validators.required ],
      hsn_number: [this.medicine ? this.medicine.hsn_number : '' ]
    });

    this.typeForm = this.formBuilder.group({
      name: [null, Validators.required]
    })

    this.getPharmacyDiscountTaxs();
    this.getCategories();
    this.getOperationalType();
  }

  pharmacy__dis_tax: any ;

  getPharmacyDiscountTaxs(){
    this.subsink.sink = this.masterEndpoint.getPharmacyDisTax().subscribe((res: any)=>{
      this.pharmacy__dis_tax = res[0];
      if(!this.medicine){
        this.baseForm.get('discount')?.setValue(this.pharmacy__dis_tax.discount_percentage);
        this.baseForm.get('tax')?.setValue(this.pharmacy__dis_tax.tax_percentage);
      }
    })
  }

  getOperationalType(){
    this.subsink.sink = this.proEndpoint.getOperationalTypes().subscribe((data: any) => {
      this.operational_types = data;
      if(!this.medicine) this.baseForm.get('operation_type')?.setValue(data[0]);
    })
  }

  getCategories(){
    this.subsink.sink = this.endPoint.getCategory().subscribe((data: any) => {
      this.categories = data;
      if(!this.medicine) this.baseForm.get('category')?.setValue(data[0]);
    })
  }

  getModel(){
    const model = {
      name : this.baseForm.get('name')?.value,
      short_code : this.baseForm.get('short_code')?.value,
      category: this.baseForm.get('category')?.value?.id,
      operation_type: this.baseForm.get('operation_type')?.value?.id,
      composition: this.baseForm.get("composition")?.value,
      // quantity: this.baseForm.get('quantity')?.value,
      discount: this.baseForm.get('discount')?.value,
      price: this.baseForm.get('price')?.value,
      tax: this.baseForm.get('tax')?.value,
      hsn_number: this.baseForm.get('hsn_number')?.value,
      is_active: true,
    }

    return model;
  }

  override saveApiCall(): void {
    if(this.baseForm.valid){
      const model: any = this.getModel() ;
      if(!this.medicine) this.post(model) ;
      else{
        model['id'] = this.medicine.id ; 
        model['created_by'] = this.medicine.created_by?.id || this.medicine.created_by ;
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
    this.subsink.sink = this.endPoint.postMedicine(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} saved.`) ;
      this.saved.emit(res) ;
    }, (error)=>{
      this.showAPIError(error)
    })
  }

  update(model: any){
    this.subsink.sink = this.endPoint.updateMedicine(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} updated.`) ;
      this.saved.emit({}) ;
    }, (error)=>{
      this.showAPIError(error)
    })
  }
  
  saveCategory(modal: any){
    if(this.typeForm.valid){
      this.subsink.sink = this.endPoint.postCategory(this.typeForm.value)?.subscribe((res:any)=>{
        modal.dismiss('Cross click');
        this.getCategories();
        this.typeForm.reset();
      },(error)=>{ this.showAPIError(error)});
    }
  }

}
