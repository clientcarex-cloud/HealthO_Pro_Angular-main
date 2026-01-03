import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
})

export class AddCompanyComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private endPoint: OutsourcingEndpoint
  ) { super(injector) }


  @Output() saved = new EventEmitter () ;

  @Input() company: any = null ;

  collabsData: any = [
    {
      name: null, 
    }
   ];

  override ngOnInit(): void {

    this.baseForm = this.formBuilder.group({
      name : [null, Validators.required],
      address: [null, Validators.required],
      contact_person: [null, Validators.required],
      mobile_number: [null, Validators.required],
      email: [null, Validators.required],

      gstin:[null],
      pan_number: [null],

      po_number:[null],
      grn_number:[null],
      cin_number:[null],
      tin_number:[null],

    });

    if(this.company){
      this.baseForm.patchValue({
        name: this.company.name,
        address: this.company.address,
        contact_person: this.company.contact_person,
        mobile_number: this.company.mobile_number,

        email: this.company.email,
        gstin: this.company.gstin,

        pan_number: this.company.pan_number,

        po_number:this.company.po_number,
        grn_number:this.company.grn_number,
        cin_number:this.company.cin_number,
        tin_number:this.company.tin_number,
      });

      if(this.company?.partners && this.company?.partners.length != 0){
        this.collabsData = this.company?.partners ;
      }
    }
  }


  getCompanies(){
    let model: any = [] ;

    if(this.collabsData?.length != 0 ){
      this.collabsData.forEach((data: any)=>{
        if(data?.name && data.name != ''){
          const dataModel: any = {
            name : data.name ,
            company: null,
            id: null
          }
  
          if(this.company){
            dataModel['company'] = this.company.id
          }else{
            delete dataModel.company ;
          }

          if(data?.id){
            dataModel.id = data.id ;
          }else{
            delete dataModel.id ;
          }
  
          model.push(dataModel);
        }

      })
    }

    return model ;
  }

  getModel(){
    const model : any = {
      name: this.baseForm.get('name')?.value,
      address: this.baseForm.get('address')?.value,
      contact_person: this.baseForm.get('contact_person')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value,

      gstin: this.baseForm.get('gstin')?.value,
      pan_number: this.baseForm.get('pan_number')?.value,

      po_number:this.baseForm.get('po_number')?.value,
      grn_number:this.baseForm.get('grn_number')?.value,
      cin_number:this.baseForm.get('cin_number')?.value,
      tin_number:this.baseForm.get('tin_number')?.value,

      // partners: this.getCompanies() || []

    }
    
    if(this.company){
      model['id'] = this.company.id ;
    }

    return model ;
  }

  override saveApiCall(): void {
    if(this.baseForm.valid){
      const model = {
        modal: this.getModel() ,
        partners : this.getCompanies() || []
      }

      if(this.company){
        this.savePartnerships(model.partners);
      }

      this.saved.emit(model);
    }else{
      this.showBaseFormErrors() ;
    }
  }

  savePartnerships(partners: any){
    partners.forEach(async (partner: any)=>{
      if(partner?.id){
        await this.updatePartnerShips(partner);
      }else{
        await this.postPartnerShips(partner);
      }
    })
  }

  postPartnerShips(model: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.postCompanyPartnership(model).subscribe((res: any)=>{
        resolve(res)
      }, (error)=>{
        resolve(error) ;
        this.alertService.showError(error?.error?.error || error?.error?.Error || error );
      })
    })

  }

  updatePartnerShips(model: any){
    return new Promise((resolve, reject)=>{
    this.subsink.sink = this.endPoint.updateCompanyPartnership(model).subscribe((res: any)=>{
      resolve(res)
    }, (error)=>{
      resolve(error)
      this.alertService.showError(error?.error?.error || error?.error?.Error || error );
    })
  })
  }



  // utilities 

  writeName(event: any, item: any){
    item.name  = event ; 
  }

  addRow(index: any){

    if(this.collabsData[index].name){
      const model = {
        name : null,
      };
  
      this.collabsData.push(model)
    }else{
      this.alertService.showInfo("Enter details.");
    }
  }




}
