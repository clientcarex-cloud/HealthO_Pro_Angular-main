import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService } from 'src/app/core/services/user.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AdminEndpoint } from '../../endpoint/admin.endpoint';

@Component({
  selector: 'app-superlogin',
  templateUrl: './superlogin.component.html',
  styleUrl: './superlogin.component.scss',
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

export class SuperloginComponent extends BaseComponent<any> {


  loginForm!: UntypedFormGroup;
  otpForm!: UntypedFormGroup;
  inProgress = false;
  fieldTextType!: boolean;
  returnUrl!: string;
  showNavigationArrows: any;
  showNumberInput: boolean = !false;
  showOtpComponent = false;
  otpProgress: boolean = false;
  otp: any = '';

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '42px',
      'height': '42px',
      'padding': '5px',
      'border': '2px solid #ddd',
      'font-size': '16px',
      'margin-bottom': '25px',
      'fontFamily': "'DM Sans', sans-serif",
      'fontWeight': '900'
    }
  };

  constructor(
    injector: Injector,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private endPoint: AdminEndpoint,
    private cookieSrvc: CookieStorageService) { super(injector) }

  override ngOnInit(): void {
    this.cookieSrvc.clearCookieData();

    this.loginForm = this.formBuilder.group({
      phone_number: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', Validators.required,]
    });
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */

  onOtpChange(otp: any) {
    this.otp = otp;

    if (this.otp.length === 4) {
      this.confirmOtp();
    }
  }


  automateSend(e: any) {
    if (e.length == 10) {
      this.onSubmit();
    }
  }

  automatePassword(e: any) {
    if (e.length == 10) {
      const input = document.getElementById('password-input-one') as HTMLInputElement;
      if (input && !input.readOnly) {
        input.focus();
      }
    }
  }

  onSubmit() {
    if (this.loginForm.valid && this.inProgress == false) {
      this.submitted = true;
      this.inProgress = true;

      this.subsink.sink = this.endPoint.otpForAdmin(this.loginForm.value).subscribe((Response) => {

        this.alertService.showSuccess("OTP Sent Successful",);

        this.showOtpComponent = true ;
        this.submitted = false;
        this.inProgress = false;
        this.loginForm.disable();

      }, (error) => {

        this.submitted = false;
        this.inProgress = false;
        if (error.error && error.error.error.includes('User not found')) {
          this.alertService.showError("No HealthO Pro User found with this mobile number", "");
        } else if (error.error && error.error.error.includes('soon')) {
          this.alertService.showError("OTP Request too soon to send again",);
        } else {
          this.alertService.showError(error.error.error || "An unexpected error occurred.");
        }

      })
    }
    else {
      this.submitted = true;
    }
  }


  /***/
  profiles: any;
  /***/

  loginWithPassword() {
    if (this.loginForm.valid && this.inProgress == false && this.firstPassword !== "") {
      this.submitted = true;
      this.inProgress = true;

      const model = {
        phone_number: this.loginForm.value.phone_number,
        password: this.firstPassword
      }

      this.subsink.sink = this.endPoint.adminLogin(model).subscribe((res: any) => {
        this.submitted = false;
        this.inProgress = false;
        this.saveTenent(res);
      }, (error) => {
        this.submitted = false;
        this.inProgress = false;
        this.alertService.showError(error.error?.Error);
      },)
    } else {
      this.submitted = true;
    }
  }

  private getOTPModel() {
    const otpDetails = {
      phone_number: this.loginForm.get('phone_number')?.value,
      otp: this.otp,
    }
    return otpDetails;
  }

  confirmOtp(){
    if(this.otp && this.otp.length == 4){
      
      this.otpProgress = true;
      
      const model = {
        otp: this.otp,
        phone_number: this.loginForm.value.phone_number
      }

      this.subsink.sink = this.endPoint.adminLogin(model).subscribe((res: any)=>{
        
        this.otpProgress = false;

        this.saveTenent(res);
        

      }, (error: any)=>{
        this.otpProgress = false ;
        this.ngOtpInput.setValue('');
        this.otp = ""
        let eleId=this.ngOtpInput.getBoxId(0);
        this.ngOtpInput.focusTo(eleId);
        this.alertService.showError(error?.error?.Error)
      })
    }else{
      this.alertService.showInfo("Enter Four Digit OTP number.")
    }

  }

  saveTenent(tnt: any) {
    this.cookieSrvc.setSuperAdmin(tnt);
    setTimeout(()=>{
      this.router.navigate(['/admin/client']);
    }, 2000)
 
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  firstPassword: any = "";

  setPasswordInput(e: any, bool: boolean) {
    if (bool) {
      this.firstPassword = e.target.value;
    }
  }

  toggleLoginSystem() {

    this.showNumberInput = !this.showNumberInput;
    this.submitted = false;

    const input = document.getElementById('loginMobile') as HTMLInputElement;
    if (input && !input.readOnly) {
      input.focus();
    }
  }

}
