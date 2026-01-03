import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';

@Component({
  selector: 'app-addtask',
  templateUrl: './addtask.component.html',
})

export class AddtaskComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,

    private endPoint: MarketExecutiveEndpoint,
    private staffEndpoint: StaffEndpoint,
    private proEndPoint: ProEndpoint,
    private doctorEndpoint: DoctorEndpoint,

    public capitalSrvc : CaptilizeService,
    private timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,

  ) { super(injector) }

  @Input() assign: boolean = false; 
  @Input() refDoctor: any ;
  @Output() saved = new EventEmitter();

  staffs!:any;
  date: string = "";
  timer:any; 
  visitTypes: any ;
  visitStatuses: any ;
  pageLoading: boolean = false;

  override ngOnInit(): void {

    this.date = this.timeSrvc.getTodaysDate();

    this.baseForm = this.formBuilder.group({
      date: [this.timeSrvc.getTodaysDate(), Validators.required],
      name: [null, Validators.required],
      visit_type: [null, Validators.required],
      mobile_number: [null],
      address: [null, Validators.required],
      lab_staff: [null],
      status: [null]
    });

    if(!this.assign){
      const model = {
        id: this.cookieSrvc.getCookieData().lab_staff_id ,
        name: this.cookieSrvc.getCookieData().lab_staff_name
      };

      this.baseForm.get('lab_staff')?.setValue(model);
    }else{
      this.staffs = [];
      this.getData();
    }

    this.subsink.sink = this.proEndPoint.getVisitsTypes().subscribe((data: any)=>{
      this.visitTypes = data ;
    });

    this.subsink.sink = this.proEndPoint.getVisitsStatues().subscribe((data: any)=>{
      this.visitStatuses = data ;

      this.baseForm.get('status')?.setValue(data.find((d: any)=> d.name == 'Pending'));
    });

  }

  override ngAfterViewInit(): void {
    if(this.refDoctor){
      this.subsink.sink = this.doctorEndpoint.getSingleDoctor(this.refDoctor)?.subscribe((res: any)=>{
        this.doctorSelected(res);
      })
    }

  }

  getData(){
    this.staffs = [];
    this.pageLoading = true;
    this.subsink.sink = this.staffEndpoint.getPaginatedStaff(
      "all", 1, '', true, '&role=MarketingExecutive'
        ).subscribe((data:any)=>{
      this.pageLoading = false;
      this.staffs = data ;

      this.staffs.forEach((staff: any)=>{
        staff.name = `${staff.name} | Ph no: ${staff.mobile_number}`
      })
    })
  }


  getModel(){
    const model = {
      date: this.baseForm.get('date')?.value, 
      name : this.baseForm.get('name')?.value, 
      mobile_number: this.baseForm.get('mobile_number')?.value,
      address: this.baseForm.get('address')?.value,
      
      visit_type: this.baseForm.get('visit_type')?.value?.id,
      status: 1,

      lab_staff: this.baseForm.get('lab_staff')?.value?.id,
    }

    return model
  }

  saveTask(close: boolean ): any {
    if(this.baseForm.valid){
      const model: any = this.getModel();

      this.subsink.sink = this.endPoint.postVisit(model).subscribe((res: any)=>{
        this.saved.emit()
        this.alertService.showSuccess(`${model?.name} Visit Saved.`);
        if(close){
          this.modalService.dismissAll();
        }else{
          this.baseForm.get('name')?.setValue(null);
          this.baseForm.get('mobile_number')?.setValue(null) ;
          this.baseForm.get('address')?.setValue(null) ;
          this.baseForm.get('visit_type')?.setValue(null) ;
        }
      }, (error)=>{
        this.alertService.showError(error?.error?.Error);
      })
    }else{
      this.showBaseFormErrors();
    }
  }


  // utilities 
  docLoading: boolean = false;
  refDoctors: any = [] ;

  getDoctorSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.docLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.doctorEndpoint.getLabDoctors(searchTerm).subscribe((data: any) => {
          this.refDoctors = data;
          this.refDoctors.map((d:any) => d['displayName'] = `${d.name}, ${d.mobile_number}`)
          this.docLoading = false;
        });
      }, 400);
    } else {
      this.refDoctors = [];
      this.docLoading = false;
    }
  }


  doctorSelected(doctor: any){
    // this.baseForm.patchValue({
    //   date: [this.timeSrvc.getTodaysDate(), Validators.required],
    //   name: [null, Validators.required],
    //   visit_type: [null, Validators.required],
    //   mobile_number: [null],
    //   address: [null, Validators.required],
    //   lab_staff: [null],
    //   status: [null]
    // });

    this.baseForm.get('name')?.setValue(doctor.name) ;
    this.baseForm.get('mobile_number')?.setValue(doctor.mobile_number);
    this.baseForm.get('address')?.setValue(doctor.geo_area);

    this.baseForm.get('visit_type')?.setValue(this.visitTypes[0]);

    this.baseForm.get('lab_staff')?.setValue(doctor?.marketing_executive || null);
  }



}
