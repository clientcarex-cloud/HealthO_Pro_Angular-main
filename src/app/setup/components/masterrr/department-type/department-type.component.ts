import { Component, Injector } from '@angular/core';
import { UntypedFormBuilder, Validators, } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { GlobalTestService } from 'src/app/setup/services/labtest.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { AddPatientEndpoint } from 'src/app/patient/endpoints/addpatient.endpoint';
import { mode } from 'crypto-js';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

interface Department {
  id: number;
  name: string;
  is_active: boolean;

}

@Component({
  selector: 'app-department-type',
  templateUrl: './department-type.component.html',
})

export class DepartmentTypeComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,

    private formBuilder: UntypedFormBuilder,

    private addpatientEndpoint: AddPatientEndpoint,
    private endPoint: MasterEndpoint,
    public proEndpoint: ProEndpoint,
    private staffEndpoint: StaffEndpoint,

    public service: GlobalTestService,
    public capitalSrvc: CaptilizeService ) { super(injector) }

  inProgress: boolean = false;
  sort: boolean = false;

  depts!: any[];
  staffs: any = [] ;

  pageNum!: number | null;
  deptFlows: any;

  override ngOnInit(): void {
    this.pageNum = null;
    this.getData(true);
    this.initializeForm();
    
    this.subsink.sink = this.proEndpoint.getDeptFlowType().subscribe((data: any) => {
      this.deptFlows = data;
    });


  }


  getAllDoctors(){
    this.docLoading = true ;
    this.subsink.sink = this.addpatientEndpoint.getLabDoctors(
      "", 'lab_get_consulting_doctors'
    ).subscribe((data: any) => {
      this.getAllStaffs();
      this.doctors = data ;
      this.docLoading = false;
    });
  }

  getAllStaffs(){
    this.consDocLoading = true ;
    this.subsink.sink = this.staffEndpoint.getAllStaff().subscribe((res: any)=>{
      this.staffs = res;
      this.consDocLoading = false ;
    })
  }

  changeSorting() {
    this.sort = !this.sort
    this.depts.reverse()
  }

  getData(call: boolean = false) {
    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
      
      call ? this.getAllDoctors() : null ;

      data.sort((a: any, b: any) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      this.depts = data
    })

  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({
      name: ['', Validators.required],
      is_active: [true, Validators.required],
      department_flow_type: [null, Validators.required]
    });
  }

  formatString(e: any, val: string = 'any') {
    if (val === 'name') { this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e)); }
  }

  openXl(content: any, sz: string = 'sm', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop });
  }

  getModel() {
    const model = {
      name: this.baseForm.get('name')?.value,
      is_active: this.baseForm.get('is_active')?.value,
      department_flow_type: this.baseForm.get('department_flow_type')?.value?.id,
    }
    return model;
  }


  activeDept: any = {
    id: "",
    show: true
  };

  toggleEditMode(dept: any) {
    dept.editMode = !dept.editMode;
    this.activeDept = dept.editMode ? dept : '';
  }

  displayEdit(dept: any, isHover: boolean) {
    if (!dept.editMode) {
      dept.showEditButton = isHover;
    }
  }

  changeDepartmentName(event: any, dept: any) {
    // Handle changes to department name
  }

  cancelEdit(dept: any) {
    dept.editMode = false;
    this.activeDept = '';
    this.getData();
  }

  saveDepartmentName(dept: any) {
    if (dept.name && dept.name !== "") {
      const model = {
        id: dept.id,
        name: dept.name,
        is_active: dept.is_active
      }

      this.subsink.sink = this.endPoint.updateDepartment(model).subscribe((Response: any) => {
        this.inProgress = false;
        this.alertService.showSuccess("Department Updated", model.name);
        this.getData();
      }, (error) => {
        this.inProgress = false;
        this.alertService.showError(error);

      })
    } else {
      this.alertService.showError("Department Name should not be blank")
    }
  }


  saveDepartment() {
    if (this.baseForm.valid) {
      const model = this.getModel();
      this.inProgress = true;
      this.endPoint.postDepartment(model).subscribe((Response: any) => {
        this.inProgress = false;
        this.alertService.showSuccess("Department Added", model.name);
        this.baseForm.reset();
        this.initializeForm();
        this.getData();
        this.modalService.dismissAll();
      }, (error) => {
        this.inProgress = false;
        this.alertService.showError(error)
      })
    } else {
      this.submitted = true;
      this.showBaseFormErrors();
    }
  }

  updateDepartment(data: any) {
    data.is_active = !data.is_active;
    this.inProgress = true;

    const model = {
      id: data.id,
      is_active: data.is_active,
      name: data.name
    }
    this.endPoint.updateDepartment(model).subscribe((Response: any) => {
      this.inProgress = false;
      this.alertService.showSuccess("Department Updated", data.name);
    }, (error) => {
      this.inProgress = false;
      this.alertService.showError(error);
      this.getData();
    })
  }

  defaultSelected(item: any, event: any, is_doc: boolean){
    const model: any = {
      department : item.id,
      doctor: null,
      lab_technician: null
    }

    if(item.defaults){
      if(is_doc){
        model.doctor = event?.id || null ; 
        model.lab_technician = item?.defaults?.lab_technician?.id || null
      }else{
        model.doctor = item?.defaults?.doctor?.id || null;
        model.lab_technician = event?.id || null ; 
      }
    }else{
      if(is_doc) model.doctor = event?.id || null ; 
      else model.lab_technician = event?.id || null ; 
    }


    if(item.defaults){
      model['id'] = item.defaults.id ;
      this.updateDocTech(model) ;
    }else{

      this.postDocTech(model);
    }
  }

  updateDocTech(model: any){
    this.subsink.sink = this.endPoint.updateDepartmentDoctorLabTechnician(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Updated.");
      this.getData();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error)
    })
  }



  postDocTech(model: any){
    this.subsink.sink = this.endPoint.postDepartmentDoctorLabTechnician(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Updated.");
      this.getData();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error)
    })
  }


  doctors: any = [] ;
  testTerm: any = "" ;
  timer: any ;
  docLoading: boolean = false;
  consDocLoading: boolean = false ;
  getDoctorSearches(searchTerm: any, is_referral: boolean = false): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.testTerm = searchTerm;

      if(is_referral) this.docLoading = true; else this.consDocLoading = true ;

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        
        this.subsink.sink = this.addpatientEndpoint.getLabDoctors(
          searchTerm, 
          is_referral ? 'lab_get_referral_doctors' : 'lab_get_consulting_doctors'
        ).subscribe((data: any) => {
          this.doctors = data ;
          this.docLoading = false;
          this.consDocLoading = false ;
        });

      }, 500);
    } else {
      this.testTerm = null;
      this.docLoading = false;
      this.consDocLoading = false ;
      this.doctors = [];
    }
  }
}
