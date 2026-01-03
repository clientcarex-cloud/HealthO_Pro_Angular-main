import { Component, Injector, Input, input, ViewChild, } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { Doctor } from '../../models/doctor.model';
import { DoctorEndpoint } from '../../endpoint/doctor.endpoint';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { LoginEndpoint } from 'src/app/login/endpoint/signin.endpoint';
import { FileService } from '@sharedcommon/service/file.service';
import { HospitalEndpoint } from '../../endpoint/hospital.endpoint';
import { StaffDetailsComponent } from 'src/app/staff/components/staff-details/staff-details.component';

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.scss']
})

export class DoctorDetailsComponent extends BaseComponent<Doctor> {

  constructor(
    injector: Injector,
    private router: Router,
    private fileSrvc: FileService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    public capital: CaptilizeService,
    private endPoint: DoctorEndpoint,
    private proEndpoint: ProEndpoint,
    private staffEndpoint: StaffEndpoint,
  ) { super(injector) }

  @Input() hideTitle: boolean = false;
  @Input() hideExecutive: boolean = true;
  @Input() showRefer: boolean = false;
  @Input() doc_details: any = null;

  @ViewChild('staffDetails') staffDetails!: StaffDetailsComponent ;

  referralAmountForm!: UntypedFormGroup;

  modelTitle?: string;
  spcztns?: any;
  docTypes?: any;
  departments!: any;
  genders!: any;
  pageNum!: number | null;

  doc!: any;
  shifts: any;
  branches: any;
  d_id!: number;
  HeadText = "";

  caseTypes: any = [];
  staffs: any;

  override ngAfterViewInit(): void {
    const input = document.getElementById('docName') as HTMLInputElement;
    if (input && !input.readOnly) {
      input.focus();
    }

    if (this.doc_details) {

      this.baseForm.get('name')?.setValue(this.doc_details.name);
      this.baseForm.get('mobile_number')?.setValue(this.doc_details?.mobile_number || null);
      this.baseForm.get('geo_area')?.setValue(this.doc_details?.address_at_end || null);
      this.baseForm.get('marketing_executive')?.setValue(this.doc_details?.lab_staff || null);
      this.baseForm.get('gender')?.setValue(1); // or any default value

    }
  }

  override ngOnInit(): void {

    this.HeadText = "Add New Doctor";
    this.pageNum = null;

    // this.subsink.sink = this.loginEndpoint.getSpecilizations().subscribe((data: any) => this.spcztns = data.results)
    this.getSpecializations()
    this.subsink.sink = this.endPoint.getDoctorTypes().subscribe((data: any) => this.docTypes = data.results)
    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => this.departments = data)
    this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => this.genders = data.results)
    this.subsink.sink = this.endPoint.getShits().subscribe((data: any) => this.shifts = data)
    this.subsink.sink = this.endPoint.getBranches().subscribe((data: any) => this.branches = data)

    this.route.queryParams.subscribe(params => {
      this.d_id = +params['d_id'];

      this.initializeForm(this.d_id);

      if (this.d_id === 1) { this.HeadText = "Add Referral Doctor"; this.getExecutives(); }
      else if (this.d_id === 2) { this.HeadText = "Add Consulting Doctor" }
    })

    
  }

  getSpecializations(){
    this.subsink.sink = this.endPoint.getSpecilizations().subscribe((data: any) => { this.spcztns = data?.results || data })
  }

  getExecutives() {
    this.subsink.sink = this.staffEndpoint.getPaginatedStaff(
      'all', 1, '', true, '&role=MarketingExecutive'
    ).subscribe((data: any) => {
      this.staffs = data?.results || data;
      this.staffs.forEach((staff: any) => {
        staff.name = `${staff.name} | Ph no: ${staff.mobile_number}`
      })
    })
  }

  initializeForm(id: number) {
    const commonControls = {
      name: ['', Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [''],
      geo_area: ['', Validators.required],
      added_on: [null],
      doctor_type_id: this.d_id,
      gender: [1, Validators.required],
      marketing_executive: [null],
      branch: [null],
      signature_for_consulting: [null]
    };

    if (!this.hideTitle) {
      if (this.d_id == 2) {
        this.baseForm = this.formBuilder.group({
          ...commonControls,
          qualification: [null],
          license_number: [null],
          specialization: ["",],
          employement_type: [null],
          role: [null],
          department: [null],
          shift: [null],
          shift_start_time: [null, Validators.required],
          shift_end_time: [null, Validators.required],
          avg_consulting_time: [null, Validators.required],
          is_department_default: [false]
        });
      } else {
        this.baseForm = this.formBuilder.group({
          ...commonControls,
          license_number: [null],
          specialization: [""],
          employement_type: [null],
          role: [null],
          department: [null],
          shift: [null]
        });

        this.referralAmountForm = this.formBuilder.group({
          referral_amount: [null, Validators.required],
          is_percentage: [false]
        });
      }
    } else {
      this.baseForm = this.formBuilder.group({
        name: ['', Validators.required],
        mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        geo_area: ['', Validators.required],
        gender: [1, Validators.required],
        doctor_type_id: 1,
        marketing_executive: [null]
      });
    }
  }

  selectDepartment(e: any) {
    if (e == null || e == '') this.baseForm.get('is_department_default')?.setValue(false);
  }

  openXl(content: any, title: string, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modelTitle = title;
    if (title === "Add Consulting Doctor") {
      this.baseForm.get('doctor_type_id')?.setValue(this.getLabDoctorsType(2));
    } else if (title === "Add Ref. Doctor") {
      this.baseForm.get('doctor_type_id')?.setValue(this.getLabDoctorsType(1));
    }
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop });
  }

  getModel() {

    this.capitalizeName('name');
    this.capitalizeName('location');
    
    const model: any = {
      name: this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      license_number: this.baseForm.get('license_number')?.value || null,
      geo_area: this.baseForm.get('geo_area')?.value || "",
      // pro_user_id: this.getPro_User_id(),
      doctor_type_id: !this.hideTitle ? this.d_id : 1,
      specialization: this.baseForm.get('specialization')?.value?.id || "",
      gender: this.baseForm.get('gender')?.value || null,
      role: this.baseForm.get('role')?.value?.id || null,
      department: this.baseForm.get('department')?.value?.id || null,
      shift: this.baseForm.get('shift')?.value?.id || null,
      branch: this.baseForm.get('branch')?.value?.id || null,
      signature_for_consulting: this.imageFile || null,
      shift_start_time: this.baseForm.get("shift_start_time")?.value || null,
      shift_end_time: this.baseForm.get("shift_end_time")?.value || null,
      avg_consulting_time: this.baseForm.get("avg_consulting_time")?.value || null,
      marketing_executive: this.baseForm.get('marketing_executive')?.value?.id || null,
      qualification: this.baseForm.get('qualification')?.value,
      is_department_default: this.baseForm.get('is_department_default')?.value
    }

    return model;
  }

  override saveApiCall(bool: boolean = false) {

    if (this.d_id === 2) {
      if (this.baseForm.valid) {
        const model = this.getModel();

        this.subsink.sink = this.endPoint.addDoctor(model).subscribe(async (response: any) => {
          this.alertService.showSuccess("Doctor Added", `${response.name}`,);

          const staffModel  = this.staffDetails?.saveDoctor(response) ;
          try{
            await this.postDoctorLogin(staffModel) ;
          }catch(error){

          }

          this.baseForm.reset();
          this.submitted = false;
          !this.hideTitle ? this.router.navigate(['/doctor/doctors']) : this.modalService.dismissAll();
          this.initializeForm(this.d_id);
          this.modalService.dismissAll();

        }, (error) => {
          this.showDocErrors(error)
        })
      }
      else {
        this.showBaseFormErrors()
      }
    } else if (this.d_id === 1) {
      if (this.baseForm.valid && this.referralAmountForm.valid) {
        const model = this.getModel();
        this.subsink.sink = this.endPoint.addDoctor(model).subscribe((response: any) => {
          this.alertService.showSuccess("Doctor Added", `${response.name}`,);
          this.baseForm.reset();
          this.submitted = false;

          const refAmountMOdel = {
            is_percentage: this.referralAmountForm.get('is_percentage')?.value,
            referral_amount: this.referralAmountForm.get('referral_amount')?.value,
            referral_doctor: response.id
          }

          this.endPoint.postReferralAmount(refAmountMOdel).subscribe((data: any) => {

          }, (error) => {
            this.alertService.showError("Oops", "Error in Posting Referral Amount Please Try Again")
          })

          !this.hideTitle ? this.router.navigate(['/doctor/doctors']) : this.modalService.dismissAll();
          this.initializeForm(this.d_id);
          this.modalService.dismissAll();
        }, (error) => {

          this.showDocErrors(error)
        })
      }
      else {
        this.showBaseFormErrors()
        Object.keys(this.referralAmountForm.controls).forEach(key => {
          const control = this.referralAmountForm.get(key);
          if (control && !control.valid) {
            this.alertService.showError("", `Enter ${key}`)
          }
        });
      }
    } else {
      if (this.baseForm.valid) {
        const model = this.getModel();
        if (bool) {
          model['pro_user_id'] = this.matchedDoc[0].id
        }
        this.subsink.sink = this.endPoint.addDoctor(model).subscribe((response: any) => {
          this.alertService.showSuccess("Doctor Added", `${response.name}`,);
          this.baseForm.reset();
          this.submitted = false;
          !this.hideTitle ? this.router.navigate(['/doctor/doctors']) : this.modalService.dismissAll();
          this.initializeForm(this.d_id);
          this.modalService.dismissAll();
          this.postDefaultDoctorManageAmount(response.id)

        }, (error) => {
          this.showDocErrors(error)
        })
      } else {
        this.showBaseFormErrors()
      }
    }
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

  postDefaultDoctorManageAmount(id: any) {
    const model = {
      referral_doctor: id
    }
    this.subsink.sink = this.endPoint.postDefaultRefAmount(model).subscribe((data: any) => {
      // this.alertService.showSuccess("Ref Amount Posted");
    },)
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

  resetForm() {
    this.baseForm.reset();
    this.initializeForm(this.d_id);
  }

  test() {
    console.log(this.staffDetails.saveDoctor(this.getModel()));
  }

  docRefQuery: any = "";
  doctors: any;

  getDocData() {
    this.subsink.sink = this.endPoint.getPaginatedReferralDoctors(
      "all", '1', this.docRefQuery,
      "", "", "", true, null
    ).subscribe((data: any) => {
      this.doctors = data;
    })
  }

  timer: any;
  mobile_number_query: any = "";

  docMobileNum(num: any) {
    this.mobile_number_query = num;
    this.SearchForDoctor();
  }

  searchDocQuery(e: any) {
    this.docRefQuery = e.target.value.trim(); // Remove trailing spaces
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.docRefQuery.length > 2) {
        this.getDocData();
        if (this.mobile_number_query.toString().length == 10 && this.docRefQuery && this.docRefQuery.length > 2) {
          this.SearchForDoctor();
        }

      }
    }, 500); // Adjust the delay as needed
  }


  matchedDoc: any = [];

  SearchForDoctor() {
    // this.subsink.sink = this.endPoint.searchForDoctor(
    //   "all", '1', this.docRefQuery,
    //   this.mobile_number_query
    //     ).subscribe((data:any)=>{
    //   this.matchedDoc = data;
    // })
  }


  // utilities 
  imageFile!: string | null;
  onFileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        this.imageFile = base64String;
        this.baseForm.get('signature_for_consulting')?.setValue(base64String);
      });
    }
  }

  returnFileName(fileInput: any) {
    return fileInput!.files[0]!.name || ''
  }

  clearLogo() {
    this.imageFile = null;
    this.baseForm.get('signature_for_consulting')?.setValue(null)
  }

  capitalizeName(type: string) {
    {
      if (type === 'name') {
        this.baseForm.value.name = this.baseForm.value.name.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
      }
      else if (type === 'location') {
        this.baseForm.value.geo_area = this.baseForm.value.geo_area.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
      } else if (type === 'hospital') {
        this.baseForm.value.hospital = this.baseForm.value.hospital.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
      }
    }
  }

  captilizeName(e: any) {
    e.target.value = this.capital.AutoNameWithoutDot(e.target.value.replace(/[^a-zA-Z\s]/g, ""));
    this.baseForm.get('name')?.setValue(this.capital.AutoNameWithoutDot(e.target.value))
  }

  getLabDoctorsType(num: number): object {
    return this.docTypes.find((doc: any) => doc.id === num);
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
}