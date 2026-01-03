import { Component, Inject, Injector, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { Doctor } from '../../models/doctor.model';
import { DoctorEndpoint } from '../../endpoint/doctor.endpoint';
import { Router } from '@angular/router';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { ReferralComponent } from '../referral/referral/referral.component';
import {EditorConfig, ST_BUTTONS} from 'ngx-simple-text-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoginEndpoint } from 'src/app/login/endpoint/signin.endpoint';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent extends BaseComponent<Doctor> {

  scale: number = 1;
  zoomContent(e:any) {

    const contentContainer:any = document.querySelector('.st-editor-container .st-area');

    if (contentContainer) {
      contentContainer.style.transform = `scale(${e.target.value})`;
      contentContainer.style.transformOrigin = '0 0';
    }
  }

  config: EditorConfig = {
    placeholder: 'Type something...',
    buttons: ST_BUTTONS,
  };

  constructor(
    injector: Injector,
    public router: Router,
    private endPoint: DoctorEndpoint,
    private formBuilder: UntypedFormBuilder,
    public capital: CaptilizeService,
    private proEndpoint: ProEndpoint,
    private sanitizer: DomSanitizer,
    private loginEndpoint: LoginEndpoint
  ) { super(injector) }

  modelTitle?: string;
  spcztns?: any;
  docTypes?: any;
  genders: any;

  override ngOnInit(): void {
 
    // this.subsink.sink = this.loginEndpoint.getSpecilizations().subscribe((data: any) => {
    //   this.spcztns = data.results;
    // })

    // this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
    //   this.genders = data.results
    // })

    // this.subsink.sink = this.endPoint.getDoctorTypes().subscribe((data: any) => {
    //   this.docTypes = data.results;
    // })

  }

  getPro_User_id() {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
    const phone_number = currentUserObj ? currentUserObj.phone_number : null;
    const id = currentUserObj ? currentUserObj.user_id : null;
    return id;
  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({
      name: ['', Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['',],
      license_number: ['', Validators.required],
      geo_area: [''],
      added_on: [null],
      pro_user_id: this.getPro_User_id(),
      doctor_type_id: [null],
      specialization: ["", Validators.required]
    });
  }

  capitalizeName(type: string) {
    {
      if (type === 'name') {
        this.baseForm.value.name = this.baseForm.value.name.replace(/[^a-zA-Z\s]/g, '').toLowerCase().replace(/(^\w|[\s\-]\w)/g, (match: any) => match.toUpperCase());

      }
      else if (type === 'location') {
        this.baseForm.value.geo_area = this.baseForm.value.geo_area.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
      }
    }
  }

  captilizeName(e:any){
    e.target.value = this.capital.AutoNameWithoutDot(e.target.value.replace(/[^a-zA-Z\s]/g, ""));
    this.baseForm.get('name')?.setValue(this.capital.AutoNameWithoutDot(e.target.value))
  }

  getLabDoctorsType(num: number): object {
    return this.docTypes.find((doc: any) => doc.id === num);
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


  referralAmountForm!: UntypedFormGroup;

  initializeRefDoctorForm(){
    this.baseForm = this.formBuilder.group({
      name: ['', Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [''],
      license_number: [null],
      geo_area: ['', Validators.required],
      added_on: [null],
      doctor_type_id: 1,
      specialization: [""],
      employement_type: [null],
      gender: [1, Validators.required],
      role: [null],
      department: [null],
      shift: [null],
      // hospital:[""],
      branch: [null],
      signature_for_consulting: [null]
    });


    this.referralAmountForm = this.formBuilder.group({
      referral_amount: [null, Validators.required],
      is_percentage: [false]
    })
  }

  openDoctorModal(content: any){
    this.initializeRefDoctorForm()
    this.modalService.open(content, { size: "", centered: true, backdropClass: "light-blue-backdrop" });
  }

  resetAmount(){
    this.referralAmountForm.get('referral_amount')?.setValue(null);
  }

  validateAmount(e:any){
    function extractNumbers(input: string): number {
      const trimmedInput = input.trim(); // Remove leading and trailing whitespace
      const numberPattern = /^(\d+(\.\d+)?)/; // Match digits with optional decimal part
      const match = trimmedInput.match(numberPattern);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return 0;
      }
    }
    
    const input_number = extractNumbers(e.target.value);
    const percen = this.referralAmountForm.get('is_percentage')?.value
    
    if(percen){
      if(input_number > 100){
        this.referralAmountForm.get('referral_amount')?.setValue(100)
      }else if(input_number <= 0){
        this.referralAmountForm.get('referral_amount')?.setValue("")
      }else{
        // this.referralAmountForm.get('referral_amount')?.setValue(input_number)
      }
    }else{
      if(input_number <= 0){
        this.referralAmountForm.get('referral_amount')?.setValue("")
      }else{
        // this.referralAmountForm.get('referral_amount')?.setValue(input_number)
      }

    }
  }

  getModel() {
    const model: any = {
      name: this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      license_number: this.baseForm.get('license_number')?.value || null,
      geo_area: this.baseForm.get('geo_area')?.value || "",
      doctor_type_id: 1,
      gender: this.baseForm.get('gender')?.value,
    }

    return model;
  }


  @ViewChild(ReferralComponent) referralComponent!: any ;

  override saveApiCall(): void {
    if (this.baseForm.valid) {
      const model = this.getModel();
      this.endPoint.addDoctor(model).subscribe((response: any) => {
        this.alertService.showSuccess("Doctor Added", `${response.name}`,);
        this.baseForm.reset();
        this.submitted = false;

        // const refAmountMOdel = {
        //   is_percentage : this.referralAmountForm.get('is_percentage')?.value,
        //   referral_amount: this.referralAmountForm.get('referral_amount')?.value,
        //   referral_doctor: response.id
        // }

        // this.endPoint.postReferralAmount(refAmountMOdel).subscribe((data:any)=>{
        //   // this.alertService.showSuccess("Inc")
        //  
        //   this.modalService.dismissAll();
          
        // }, (error)=>{
        //   this.referralComponent.getData();
        //   this.modalService.dismissAll();
        //   this.alertService.showError("Oops","Error in Posting Referral Amount Please Try Again")
        // })
        this.referralComponent.getData();
        this.modalService.dismissAll();
        this.postDefaultDoctorManageAmount(response.id)

        // this.initializeForm(this.d_id);
  
      }, (error) => {

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
        if(error?.error?.Error && error?.error?.Error.includes('exists')){
          this.alertService.showError(error?.error?.Error, "");
          specificErrorHandled = true;
        }
        
        if (!specificErrorHandled) {
          this.alertService.showError("Adding doctor failed");
        }
    })
    }
    else {
      this.showErrors();
 
    }
  }
  


  postDefaultDoctorManageAmount(id:any){
    const model = {
      referral_doctor: id
    }

    this.endPoint.postDefaultRefAmount(model).subscribe((data:any)=>{
      this.alertService.showSuccess("Ref Amount Posted");

    },)
  }


  showErrors(){
    this.submitted = true;
        Object.keys(this.baseForm.controls).forEach(key => {
        const control = this.baseForm.get(key);
        if (control && !control.valid) {
          if(key=== 'mobile_number'){
            this.alertService.showError("",`Enter Valid Mobile Number`)
          }else if(key=== 'geo_area'){
            this.alertService.showError("",`Enter Valid Location`)
          }else{
            this.alertService.showError("",`Enter ${key}`)
          }
        }
      });
  }

  
  resetForm() {
    this.baseForm.reset();
    this.initializeForm();
  }


  getCurrentDateTimeString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // January is 0
    const date = now.getDate();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Format the date components as needed (e.g., add leading zeros)
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedDate = date < 10 ? '0' + date : date;
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    // Return the formatted string
    return `${year}-${formattedMonth}-${formattedDate} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  showDoc(id: any) {
    this.router.navigate(['/doctor/add/'], { queryParams: { d_id: id } });
  }









docRefQuery : any ="";
doctors: any ;

  getDocData(){
 
    this.subsink.sink = this.endPoint.getPaginatedReferralDoctors(
      "all", '1', this.docRefQuery,
        "", "", "", true, null
        ).subscribe((data:any)=>{
      this.doctors = data;
    })
  }

  timer:any 

  searchDocQuery(e: any) {
    this.docRefQuery = e.target.value.trim(); // Remove trailing spaces
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.docRefQuery.length > 2) {
        this.getDocData(); 
      }
    }, 500); // Adjust the delay as needed
  }
  





  
}
