import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
// Login Auth
import { AppAuthService } from '../../../../core/services/appauth.service';
import {  Router } from '@angular/router';
import { UserProfileService } from 'src/app/core/services/user.service';
import { AlertService } from '@sharedcommon/service/alert.service';
import { LoginEndpoint } from 'src/app/login/endpoint/signin.endpoint';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { BaseComponent } from '@sharedcommon/base/base.component';


@Component({
  selector: 'app-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss'],
  providers: [UserProfileService],
  animations: [
    trigger('collapseExpand', [
      state('open', style({
        height: '*',
        opacity: 1,
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        padding: '0'
      })),
      transition('open <=> closed', [
        animate('0.2s ease-in-out')
      ]),
    ]),
  ]
})

/**
 * Cover Component
 */
export class CoverComponent extends BaseComponent<any> {

  // Login Form
  loginForm!: UntypedFormGroup;
  otpForm!: UntypedFormGroup;
  // submitted = false;
  inProgress = false;
  fieldTextType!: boolean;
  returnUrl!: string;
  year: number = new Date().getFullYear();
  showNavigationArrows: any;

  constructor(
    injector: Injector,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private endPoint: LoginEndpoint,
    private appAuthService: AppAuthService,
    private alertsrvc : AlertService,
    private cookieSrvc: CookieStorageService) 
  { super(injector) }

  override ngOnInit(): void {
    this.cookieSrvc.clearCookieData();
    /**
     * Form Validatyion
     */
    
     this.loginForm = this.formBuilder.group({
      phone_number: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', Validators.required,]
    });


    this.getPics();

  }

    pics!: any[] ;
  
    getPics(){
      this.subsink.sink = this.appAuthService.getSliders().subscribe(
        Response =>{
          this.pics = Response.results; 
        },(error)=>{
        }
      )
    }

  getCurrentYear(): number {
    return new Date().getFullYear();
}

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  automateSend(e:any){
    if(e.length == 10){
      this.onSubmit();
    }
  }

  automatePassword(e:any){
    if(e.length == 10){
      const input = document.getElementById('password-input-one') as HTMLInputElement;
      if (input && !input.readOnly) {
        input.focus();
      }
    }
  }

  test(){
    this.loginForm.disable();
  }

  onSubmit() {
    if (this.loginForm.valid && this.inProgress == false) {
      this.submitted = true;
      this.inProgress = true;

      this.subsink.sink = this.endPoint.postNumber(this.loginForm.value).subscribe((Response)=>{
          this.alertsrvc.showSuccess("OTP Sent Successful",);
          this.submitted = false;
          this.inProgress = false;
          this.loginForm.disable();
          this.router.navigate(['/auth/otp/verify'], { queryParams: { mobileNum: this.loginForm.value.phone_number, } });
      }, (error)=>{
        this.submitted = false;
        this.inProgress = false;
        if (error.error && error.error.error.includes('User not found')) {
            this.alertsrvc.showError("No HealthO Pro User found with this mobile number", "");
        } else if (error.error && error.error.error.includes('soon')) {
            this.alertsrvc.showError("OTP Request too soon to send again",);
        } else {
            this.alertsrvc.showError(error.error.error || "An unexpected error occurred.");
        }
      })
    }
    else{
      this.submitted = true;
    }
  }


    /***/
    profiles: any ;
    /***/

    showOtpComponent = true;


  loginWithPassword(){
    if(this.loginForm.valid && this.inProgress == false && this.firstPassword!==""){
      this.submitted = true;
      this.inProgress = true;

      const model = {
        phone_number : this.loginForm.value.phone_number,
        password: this.firstPassword
      }

      this.subsink.sink = this.endPoint.LoginWithPassword(model).subscribe((response:any)=>{
        this.submitted = false;
        this.inProgress = false;


        if(response.hasOwnProperty('tenants')){
          if (response.tenants.length === 0) {
            this.alertsrvc.showError("You currently do not have access to any organization's resources");
          } else {
            if (response.tenants.length === 1) {
              if(response.tenants[0].is_account_disabled){
                this.profiles = response.tenants;
                this.showOtpComponent = false;
              }else{
                if(response.tenants[0].is_superadmin){
                  this.saveTenent(response.tenants[0])
                }else if(!response.tenants[0].is_superadmin && response.tenants[0].is_login_access){
                  this.saveTenent(response.tenants[0])
                }else{
                  this.profiles = response.tenants;
                  this.showOtpComponent = false;
                }
              }
            } else {
              response.tenants.forEach((tnt: any)=> tnt['loading']= false)
              this.profiles = response.tenants;
              this.showOtpComponent = false;
            }
          }
          this.profiles = response.tenants;
        }else{
          this.saveDoctor(response.doctors_data[0])
        }
      },   (error)=>{


        this.submitted = false;
        this.inProgress = false;
        if(error.error?.Error){
          this.alertsrvc.showError(error.error?.Error);
        }else{

        if(error.error && error.error.error){
          this.alertsrvc.showError(error.error?.error);
        }}

      },)
    } else{
      this.submitted = true;
    }
  }


  saveDoctor(doc:any){
    this.cookieSrvc.setCookieDataForDoctor(doc);
    this.router.navigate(['/dashboard']);
  }

  saveTenent(tnt: any) {
    if(!tnt.is_account_disabled){

      tnt['loading'] = true;
      if(tnt.is_superadmin){
        this.cookieSrvc.setCookieData(tnt);
        this.router.navigate(['/dashboard']);
      }else if(!tnt.is_superadmin && tnt.is_login_access){
        this.cookieSrvc.setCookieData(tnt);
        this.router.navigate(['/dashboard']);
      }
      else{
        this.alertsrvc.showError(`No Access to ${tnt.business_name}`,"")
      }
    }else{
      this.alertsrvc.showError(`${tnt.business_name} account suspended for violating privacy terms and conditions, please contact admin.`,"")
    }

  }



  /**
   * Password Hide/Show
   */
   toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  firstPassword: any = "";

  setPasswordInput(e:any, bool: boolean){
    if(bool){
      this.firstPassword = e.target.value;
    }
}


showNumberInput:boolean = !false;

toggleLoginSystem(){

  this.showNumberInput = !this.showNumberInput ;
  this.submitted = false;

      const input = document.getElementById('loginMobile') as HTMLInputElement;
  if (input && !input.readOnly) {
    input.focus();
  }
  


}

}
