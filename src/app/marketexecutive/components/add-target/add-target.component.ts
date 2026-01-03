import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';

@Component({
  selector: 'app-add-target',
  templateUrl: './add-target.component.html',
  styleUrl: './add-target.component.scss'
})

export class AddTargetComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private staffEndpoint: StaffEndpoint,
    private proEndPoint: ProEndpoint,
    public timeSrvc: TimeConversionService,
    private endPoint: MarketExecutiveEndpoint
  ) { super(injector) };

  @Input() updateModel: any  = null;
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  staffs: any;
  pageLoading: boolean = false;
  targetTypes: any;

  override ngOnInit(): void {

    this.baseForm = this.formBuilder.group({
      labstaff: [null, Validators.required],
      assigned_areas: [null, Validators.required],

      target_type: [null, Validators.required],

      target_revenue: [0, Validators.required],
      no_of_referrals: [null, Validators.required],

      from_date: [this.timeSrvc.getTodaysDate(), Validators.required],
      to_date: [null, Validators.required]
    })

    this.staffs = [];
    this.getData();

    this.subsink.sink = this.proEndPoint.getTargetTypes().subscribe((data: any) => {
      this.targetTypes = data;

      this.baseForm.get('target_type')?.setValue(data[1]);

      if(this.updateModel){
        this.baseForm.get('target_type')?.setValue(this.updateModel.target_type)
      }

      // if(this.updateModel.target_revenue){
      //   this.baseForm.get('target_revenue')?.setValue(this.updateModel.target_revenue)
      // }

      // if(this.updateModel.no_of_referrals){
      //   this.baseForm.get('no_of_referrals')?.setValue(this.updateModel.no_of_referrals)
      // }
    });

    if(this.updateModel){
      const model = {
        id: this.updateModel.labstaff.id,
        name: this.updateModel.labstaff
      }

      this.baseForm.get('labstaff')?.setValue(model);
      this.baseForm.get('from_date')?.setValue(this.updateModel.from_date);
      this.baseForm.get('to_date')?.setValue(this.updateModel.to_date);
      this.baseForm.get('assigned_areas')?.setValue(this.updateModel.assigned_areas);
      this.baseForm.get('no_of_referrals')?.setValue(this.updateModel.no_of_referrals || 0);
      this.baseForm.get('target_revenue')?.setValue(this.updateModel?.target_revenue || 0);
    }

  }

  getData() {
    this.staffs = [];
    this.pageLoading = true;
    this.subsink.sink = this.staffEndpoint.getPaginatedStaff(
      "all", 1, '', true, '&role=MarketingExecutive'
    ).subscribe((data: any) => {
      this.pageLoading = false;
      this.staffs = data;

      this.staffs.forEach((staff: any)=>{
        staff.name = `${staff.name} | Ph no: ${staff.mobile_number}`
      })
    })
  }


  getModel() {
    const model = {
      labstaff: this.baseForm.get('labstaff')?.value?.id,

      from_date: this.baseForm.get('from_date')?.value,
      to_date: this.baseForm.get('to_date')?.value,
      
      assigned_areas: this.baseForm.get('assigned_areas')?.value,

      target_type: this.baseForm.get('target_type')?.value?.id,

      no_of_referrals: this.baseForm.get('no_of_referrals')?.value || 0,
      target_revenue: this.baseForm.get('target_revenue')?.value || 0
    }

    return model
  }


  override saveApiCall(): void {

    if (this.baseForm.valid) {
      const model: any = this.getModel();

      this.subsink.sink = this.endPoint.postTarget(model).subscribe((res: any)=>{
        this.saved.emit();
        this.alertService.showSuccess(`Target Assigned.`);
        this.modalService.dismissAll();

      }, (error)=>{
        this.alertService.showError(error?.error?.Error);
      })
    } else {
      this.showBaseFormErrors()
    }
  }

  override updateApiCall(): void {
    if(this.baseForm.valid){
      const model: any =  this.getModel();

      model['id'] = this.updateModel.id;

      this.subsink.sink = this.endPoint.updateTarget(model).subscribe((res: any)=>{
        this.saved.emit();
        this.alertService.showSuccess(`Details Updated.`);
        this.modalService.dismissAll();

      }, (error)=>{
        this.alertService.showError(error?.error?.Error);
      })

    }else {
      this.showBaseFormErrors()
    }
  }


  // utilities  

  changeTargetType(e: any) {
    const targetTypeId = e?.id; // Assuming e is the selected target type object

    this.baseForm.get('target_type')?.setValue(e && e != '' ? e : null);
  
    if(targetTypeId == 1){
      this.baseForm.get('no_of_referrals')?.setValue(0);
    }else if(targetTypeId == 2){
      this.baseForm.get('target_revenue')?.setValue(0);
    }

  }


}
