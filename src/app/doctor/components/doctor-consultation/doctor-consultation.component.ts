import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { HospitalEndpoint } from '../../endpoint/hospital.endpoint';
import { FormBuilder, Validators } from '@angular/forms';
import { DoctorEndpoint } from '../../endpoint/doctor.endpoint';

@Component({
  selector: 'app-doctor-consultation',
  templateUrl: './doctor-consultation.component.html',
})

export class DoctorConsultationComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private doctorEndpoint: DoctorEndpoint,
    private endPoint: HospitalEndpoint,
    private formBuilder: FormBuilder
  ){ super(injector) };

  @Input() doctor : any ;
  @Input() param : any ;
  @Output() saved: EventEmitter<any> = new EventEmitter();
  caseTypes: any ; 
  newCaseType: any = '' ;
  
  override ngOnInit(): void {
    this.getCaseTypes() ;
    this.initializeForm() ;

  }

  override ngOnDestroy(): void {
    this.param = null ;
  }

  getCaseTypes(){
    this.subsink.sink = this.endPoint.getCaseTypes().subscribe((data: any)=>{
      this.caseTypes = data.filter((d: any) => d.is_active) ; 
    })
  }


  initializeForm(){
    this.baseForm = this.formBuilder.group({
      case_type: [this.param ? this.param?.case_type : null, Validators.required],
      is_online: [this.param ? this.param?.is_online : false, Validators.required],
      consultation_fee: [this.param ? this.param?.consultation_fee : null, Validators.required],
    })
  }

  getModel(){
    const model : any = {
      labdoctors: this.doctor?.id,
      case_type : this.baseForm.get('case_type')?.value, 
      is_online : this.baseForm.get('is_online')?.value,
      consultation_fee : this.baseForm.get('consultation_fee')?.value,
      is_active: true
    }

    if(this.param) model['id'] = this.param.id ; 

    return model ; 
  }

  postDocConsultation(){
    if(this.baseForm?.valid){
      const model = this.getModel() ;

      this.saved.emit(model);
      // this.subsink.sink = this.doctorEndpoint.postDocCaseType(model).subscribe((res: any)=>{
      //   this.alertService.showSuccess("Saved.") ;
      //   this.modalService.dismissAll();
      // }, (error)=>{
      //   this.alertService.showError(error?.error?.Error || error?.error?.error || error )
      // })
    }else{
      this.showBaseFormErrors();
    }
  }

  postCaseType(button: any){
    if(this.newCaseType && this.newCaseType!=''){
      this.subsink.sink = this.endPoint.postCaseType({ name : this.newCaseType }).subscribe((res: any)=>{
        this.newCaseType = "";
        button.click() ;
        this.getCaseTypes() ;
        this.alertService.showSuccess(`${this.newCaseType} Case Type Added.`);
      }, (error)=> this.alertService.showError(error?.error?.Error || error?.error?.error || error ) )
    }else{ this.alertService.showError("Enter Case Type Name.") }
  }

  // utilities 

  setConsultationValue(val: boolean){
    this.baseForm.get('is_online')?.setValue(val) ;
  }
}
