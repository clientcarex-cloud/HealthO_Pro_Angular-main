import { Component, Injector, ViewChild, } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { Doctor } from '../../models/doctor.model';
import { DoctorEndpoint } from '../../endpoint/doctor.endpoint';
import { ActivatedRoute, Router } from '@angular/router';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { LoginEndpoint } from 'src/app/login/endpoint/signin.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { FileService } from '@sharedcommon/service/file.service';
import { StaffDetailsComponent } from 'src/app/staff/components/staff-details/staff-details.component';
import { StaffViewComponent } from 'src/app/staff/components/staff-view/staff-view.component';

@Component({
  selector: 'app-doctor-view',
  templateUrl: './doctor-view.component.html',
})
export class DoctorViewComponent extends BaseComponent<Doctor> {

  constructor(
    injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,

    public capital: CaptilizeService,
    public timeSrvc: TimeConversionService,
    private fileSrvc: FileService,

    private proEndpoint: ProEndpoint,
    private endPoint: DoctorEndpoint,
  ) { super(injector) }

  @ViewChild('staffDetails') staffDetails!: StaffDetailsComponent ;
  @ViewChild('staffView') staffView!: StaffViewComponent ;

  referralAmountForm !: UntypedFormGroup;
  

  // modelTitle?: string;
  spcztns?: any;
  docTypes?: any;
  departments!: any;
  genders!: any;
  pageNum!: number | null;
  doc!: any;
  shifts:any;
  branches:any;
  d_id!: number;
  HeadText = "";
  referrAmountObject : any;
  consultationDetails: any = [];

  imageFile!: string | null;

  override ngOnInit(): void {
    this.HeadText = " Add New Doctor";

    this.route.queryParams.subscribe(params => {
      this.d_id = +params['d_id']
      this.initializeForm(this.d_id);
      if(this.d_id === 1){this.HeadText = " Add Referral Doctor"}
      else if(this.d_id === 2){this.HeadText = " Add Consulting Doctor"};

      this.subsink.sink = this.endPoint.getSingleDoctor(this.d_id).subscribe((data:any)=>{

        this.doc = data;

        this.baseForm.get('name')?.setValue(this.doc.name?.toUpperCase());
        this.baseForm.get('license_number')?.setValue(this.doc?.license_number || null);
        this.baseForm.get('email')?.setValue(this.doc?.email || "");
        this.baseForm.get('mobile_number')?.setValue(this.doc?.mobile_number || "");
        this.baseForm.get('geo_area')?.setValue(this.doc?.geo_area || "");
        this.baseForm.get('signature_for_consulting')?.setValue(this.doc?.signature_for_consulting || null);
        this.baseForm.get('qualification')?.setValue(this.doc?.qualification) ;
        this.baseForm.get('shift_start_time')?.setValue( data.shift_start_time ? data.shift_start_time : null);
        this.baseForm.get('shift_end_time')?.setValue( data.shift_end_time ? data.shift_end_time : null);
        this.baseForm.get('avg_consulting_time')?.setValue( data.avg_consulting_time ? data.avg_consulting_time : null);
        this.baseForm.get('is_department_default')?.setValue(data?.is_department_default || false) ;

        this.imageFile = this.doc?.signature_for_consulting || null ;
        
        this.consultationDetails = data?.lab_doctors_consultation_details || [] ; 

        this.subsink.sink = this.endPoint.getDoctorLogin(this.doc.id)?.subscribe((res: any)=>{
          this.doc['lab_staff'] = res.lab_staff;
        })
      
        this.subsink.sink = this.endPoint.getSpecilizations().subscribe((data: any) => {
          this.spcztns = data?.results || data;
          if(this.doc && this.doc.specialization){
            this.baseForm.get('specialization')?.setValue(this.spcztns.find((spcl:any)=>spcl.name === this.doc.specialization))
          }
        })
    
        this.subsink.sink = this.endPoint.getDoctorTypes().subscribe((data: any) => {
          this.docTypes = data.results;
        })
      
        this.pageNum = null;
    
        this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
          this.departments = data;
          if(this.doc && this.doc.department){
            this.baseForm.get('department')?.setValue(this.departments.find((dept:any)=>dept.name === this.doc.department))
          }
        })
    
        this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
          this.genders = data.results;
          if(this.doc && this.doc.gender){
            this.baseForm.get('gender')?.setValue(this.genders.find((gender:any)=> gender.name === this.doc.gender).id)
          }
        })
    
        this.subsink.sink = this.endPoint.getShits().subscribe((data:any)=>{
          this.shifts = data;
          if(this.doc && this.doc.shift){
            this.baseForm.get('shift')?.setValue(data.find((shift:any) => shift.id === this.doc.shift))
          }
        })
    
        this.subsink.sink = this.endPoint.getBranches().subscribe((data:any)=>{
          this.branches = data;
          if(this.doc && this.doc.branch)
          this.baseForm.get('branch')?.setValue(this.branches.find((branch:any)=> branch.id === this.doc.branch))
          
        })
        // this.updateForm(data)


        this.HeadText = data.name?.toUpperCase()
      })
    })

  }

  getSpecializations(){
    this.subsink.sink = this.endPoint.getSpecilizations().subscribe((data: any) => { this.spcztns = data?.results || data })
  }

  getPro_User_id() {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
    const phone_number = currentUserObj ? currentUserObj.phone_number : null;
    const id = currentUserObj ? currentUserObj.user_id : null;
    return id;
  }
  initializeForm(id: number): void {
    const commonControls = {
      name: ['', Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [''],
      geo_area: ['', Validators.required],
      added_on: [null],
      doctor_type_id: this.d_id,
      gender: [1, Validators.required],
      role: [null],
      department: [null],
      shift: [null],
      shift_start_time: [null, Validators.required],
      shift_end_time: [null, Validators.required],
      avg_consulting_time: [null, Validators.required],
      branch: [null],
      signature_for_consulting: [null],
      qualification: [null],
      is_department_default: [false]
    };
  
    // Condition when d_id is 2
    if (this.d_id === 2) {
      this.baseForm = this.formBuilder.group({
        ...commonControls,
        license_number: [null, Validators.required],
        specialization: ["", Validators.required],
        employement_type: [null],
      });
  
    // Condition for other cases
    } else {
      this.baseForm = this.formBuilder.group({
        ...commonControls,
        license_number: [null],
        specialization: [""],
        employement_type: [null],
      });
  
      this.referralAmountForm = this.formBuilder.group({
        referral_amount: [null, Validators.required],
        is_percentage: [false]
      });
    }
  }  

  updateForm(data:any){

    this.baseForm.patchValue({
      name: data.name ? data.name?.toUpperCase() : "",
      mobile_number: data.mobile_number ? data.mobile_number : "",
      email: data.email ? data.email : "",
      license_number: data.license_number ? data.license_number : null,
      geo_area: data.geo_area ? data.geo_area : "",
      added_on: data.added_on ? data.added_on : "",
      pro_user_id: data.pro_user_id ? data.pro_user_id : this.getPro_User_id(),
      doctor_type_id : data.doctor_type_id ,
      specialization : data.specialization ? this.spcztns?.find((spcl:any)=>spcl.name === this.doc.specialization) : null,
      gender : data.gender ? this.genders?.find((gender:any)=> gender.name === this.doc.gender).id : null,
      department :  data.department ? this.departments?.find((dept:any)=>dept.name === this.doc.department) : null,
      shift :  null,
      employement_type:  null,
      role :data.role ? data.role : null,
      branch : null,
      date_of_birth: data.date_of_birth ? data.date_of_birth : "",
      signature_for_consulting: data.signature_for_consulting ? data.signature_for_consulting : null,

      shift_start_time: data.shift_start_time ? data.shift_start_time : null,
      shift_end_time: data.shift_end_time ? data.shift_end_time : null,
      avg_consulting_time: data.avg_consulting_time ? data.avg_consulting_time : null,

      is_department_default: data?.is_department_default || false
    })
  }



  
  onFileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
            if (img.width > 500 || img.height > 500) {
              event.target.value = '';
              this.alertService.showError('Selected image exceeds maximum dimensions 500x500 Pixels',"")
            } else {
              this.imageFile = base64String;
              this.baseForm.get('signature_for_consulting')?.setValue(base64String);
            }
        };
      });
    }
  }

  clearLogo(){
    this.imageFile = null;
    this.baseForm.get('signature_for_consulting')?.setValue(null)
  }

  selectDepartment(e: any){
    if(e == null || e == '') this.baseForm.get('is_department_default')?.setValue(false) ;
  }

  
  capitalizeName(type: string) {
    if (type === 'name') {
      this.baseForm.value.name = this.baseForm.value.name.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
    }
    else if (type === 'location') {
      this.baseForm.value.geo_area = this.baseForm.value.geo_area.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
    }
  }

  getLabDoctorsType(num: number): object {
    return this.docTypes.find((doc: any) => doc.id === num);
  }

  openXl(content: any, title: string, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    // this.modelTitle = title;
    if (title === "Add Consulting Doctor") {
      this.baseForm.get('doctor_type_id')?.setValue(this.getLabDoctorsType(2));
    } else if (title === "Add Ref. Doctor") {
      this.baseForm.get('doctor_type_id')?.setValue(this.getLabDoctorsType(1));
    }
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop });
  }

  getModel() {
    const model: any = {
      name: this.baseForm.get('name')?.value,
      email: this.baseForm.get('email')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      license_number: this.baseForm.get('license_number')?.value || null,
      geo_area: this.baseForm.get('geo_area')?.value || "",
      pro_user_id:  this.doc.pro_user_id ?  this.doc.pro_user_id : this.getPro_User_id(),
      doctor_type_id : this.doc.doctor_type_id ,
      specialization: this.baseForm.get('specialization')?.value?.id || "",
      gender: this.baseForm.get('gender')?.value || null,
      role: this.baseForm.get('role')?.value?.id || null,
      department: this.baseForm.get('department')?.value?.id || null,
      shift: this.baseForm.get('shift')?.value?.id || null,
      branch: this.baseForm.get('branch')?.value?.id || null,
      signature_for_consulting: this.imageFile || null,
      shift_start_time: this.baseForm.get("shift_start_time")?.value || null,
      shift_end_time:  this.baseForm.get("shift_end_time")?.value || null,
      avg_consulting_time:  this.baseForm.get("avg_consulting_time")?.value || null,
      qualification: this.baseForm.get('qualification')?.value || null,
      is_department_default: this.baseForm.get('is_department_default')?.value,

      lab_doctors_consultation_details: []
    }

    if(this.consultationDetails.length != 0){
      this.consultationDetails.forEach((item: any)=>{
        item.case_type = item?.case_type?.id || item.case_type
      })
    }

    model.lab_doctors_consultation_details = this.consultationDetails ;

    return model;
  }

  override saveApiCall(): void {
  
    if(this.doc.doctor_type_id === 2){
      if (this.baseForm.valid) {
        const model = this.getModel();

        this.subsink.sink = this.endPoint.updateDoctor(this.doc.id,model).subscribe(async (response: any) => {
          this.alertService.showSuccess("Details Updated", `${response.name}`);

          if(this.doc?.lab_staff){
            try{ await this.staffView.saveDoctor(response); }
            catch(error){ }
            
          }else{

            const staffModel  = this.doc?.lab_staff ? this.staffDetails?.saveDoctor(response) : this.staffDetails?.saveDoctor(response) ;

            try{ await this.postDoctorLogin(staffModel) }
            catch(error){ }
          }
          



          this.router.navigate(['/doctor/doctors'])
        }, (error) => {
          this.showDocErrors(error);
      })
      }
      else {
        this.showBaseFormErrors();
      }
    }else if(this.doc.doctor_type_id === 1){

      
      if (this.baseForm.valid && this.referralAmountForm.valid) {
        const model = this.getModel();
        this.endPoint.updateDoctor(this.doc.id,model).subscribe((response: any) => {
          this.alertService.showSuccess("Details Updated", `${response.name}`);
          // this.router.navigate(['/doctor/doctors'])

          if(this.referrAmountObject){
            const refAmountMOdel = {
              is_percentage : this.referralAmountForm.get('is_percentage')?.value,
              referral_amount: this.referralAmountForm.get('referral_amount')?.value,
              referral_doctor: response.id,
              id: this.referrAmountObject.id
            }
  
            this.endPoint.updateReferralAmount(refAmountMOdel).subscribe((data:any)=>{
              // this.alertService.showSuccess("Inc")
            }, (error)=>{
              this.alertService.showError("Oops","Error in Posting Referral Amount Please Try Again")
            })
          }else{
            const refAmountMOdel = {
              is_percentage : this.referralAmountForm.get('is_percentage')?.value,
              referral_amount: this.referralAmountForm.get('referral_amount')?.value,
              referral_doctor: response.id,

            }
  
            this.endPoint.postReferralAmount(refAmountMOdel).subscribe((data:any)=>{
              // this.alertService.showSuccess("Inc")
            }, (error)=>{
              this.alertService.showError("Oops","Error in Posting Referral Amount Please Try Again")
            })
          }

          this.router.navigate(['/doctor/doctors']) ;
          this.initializeForm(this.d_id);
          this.modalService.dismissAll();
        }, (error) => {
          this.showDocErrors(error);
      })
      }
      else {
        this.showBaseFormErrors();
        Object.keys(this.referralAmountForm.controls).forEach(key => {
          const control = this.referralAmountForm.get(key);
          if (control && !control.valid) {
            this.alertService.showError("",`Enter ${key}`)
          }
        });
      }
    }
  }


  new_specialization: any = "";

  saveSpecialization(){
    if(this.new_specialization && this.new_specialization.length >= 3){
      const model = {
        name : this.new_specialization,
        is_active : true
      }
      this.subsink.sink = this.endPoint.postSpecialization(model).subscribe((res: any)=>{
        this.alertService.showSuccess("Saved") ;
        this.modalService.dismissAll();
        this.getSpecializations();
        this.new_specialization = "";
      }, (error)=>{ this.showAPIError(error) })
    }else{
      this.alertService.showError("Enter atleast three characters.")
    }

    
  }


  async postDoctorLogin(model: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.postDoctorLogin(model).subscribe((data: any) => {
        // this.alertService.showSuccess("Login Created.");
        resolve({});
      },(error)=>{
        resolve({});
        this.showAPIError(error);
      })
    });
  }

  showDocErrors(error: any) {
    let specificErrorHandled = false;

    if (error?.error?.license_number && error?.error?.license_number[0]?.includes('exists')) {
      this.alertService.showError("Referral Doctor with this license number already exists", "");
      specificErrorHandled = true;
    }
    if (error?.error?.name && error?.error?.name[0]?.includes('exists')) {
      this.alertService.showError("Referral Doctor with this Name already exists", "");
      specificErrorHandled = true;
    }
    if (error?.error?.mobile_number && error?.error?.mobile_number[0]?.includes('exists')) {
      this.alertService.showError("Referral Doctor with this Mobile Number already exists", "");
      specificErrorHandled = true;
    }
    if (error?.error?.Error && error?.error?.Error.includes('exists')) {
      this.alertService.showError(error?.error?.Error, "");
      specificErrorHandled = true;
    }

    if (!specificErrorHandled) {
      this.alertService.showError("Adding doctor failed");
    }
  }

  resetForm() {
    this.baseForm.reset();
    this.initializeForm(this.d_id);
  }

  handleConsultingDetails(model: any) {
    if (model?.id) {
      const index = this.consultationDetails?.findIndex((item: any) => item?.id == model?.id);
      if (index !== -1) this.consultationDetails[index] = model;
    } else this.consultationDetails.push(model)

    this.modalService.dismissAll();
  }
  
  selected_consult: any  ;
  editConsultationDetails(item: any, content: any){
    this.selected_consult = item ;
    this.openModal( content, { size: '', centered: true }) ; 
  }

  editIsActive(item: any, val: any){
    item.is_active = val ;
  }
  
}