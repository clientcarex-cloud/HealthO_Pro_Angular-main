import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppAuthService } from 'src/app/core/services/appauth.service';
import { first } from 'rxjs/operators';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpResponseBase } from '@angular/common/http';
import { AlertService } from '@sharedcommon/service/alert.service';
import { BusinessEndpoint } from '../../endpoint/business.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-otp-screen',
  templateUrl: './otp-screen.component.html',
  styleUrls: ['./otp-screen.component.scss']
})
export class OtpScreenComponent implements OnInit {

  resendDisabled: boolean = false;
  countdown: number = 60; // Initial countdown value in seconds
  countdownInterval: any; // Interval reference
  phNumber!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appAuth: AppAuthService,
    private bsnsEndpoint: BusinessEndpoint,
    public alertSrvc: AlertService,
    private cookieSrvc: CookieStorageService
  ) { }

  ngOnInit() {
    if(this.cookieSrvc.getAccess() && this.cookieSrvc.getRefresh()){
      this.router.navigate(['/dashboard'])  
    }else{     
      this.route.queryParams.subscribe(params => {
        this.phNumber = params['mobileNum'];
        if(this.phNumber){
          this.startCountdown();
          this.getPics();
        }else{
          this.router.navigate(['/auth/signin/'])
        }
      });
    }


    // this.saveDoctor(this.test[0])

  }

  pics!: any[];

  getPics() {
    this.appAuth.getSliders().subscribe(
      Response => {
        this.pics = Response.results;
      },
    )
  }

  otp!: string;
  showOtpComponent = true;

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


  onOtpChange(otp: any) {
    this.otp = otp;
    if (this.otp.length === 4) {
      this.confirmLabSparkOtp();
    }
  }

  setVal(val: any) {
    this.ngOtpInput.setValue(val);
  }

  startCountdown() {
    this.resendDisabled = true; // Disable the resend button
    this.countdown = 60; // Reset the countdown value to 120 seconds

    this.countdownInterval = setInterval(() => {
      this.countdown--; // Decrement the countdown value
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval); // Stop the countdown when it reaches 0
        this.resendDisabled = false; // Enable the resend button
      }
    }, 1000); // Update the countdown every second
  }

  private getOTPModel() {
    const otpDetails = {
      phone_number: this.phNumber,
      otp: this.otp,
    }
    return otpDetails;
  }

  getCurrentYear(): number {
    const currentDate = new Date();
    return currentDate.getFullYear();
  }

  /***
   * 
   * API REQUEST TO VALIDATE OTP AND SAVE ACCESS AND REFRESH TOKENS
   */


  onResendOTP() {
    // const phoneNumber = this.loginForm.value.phone_number;
    this.appAuth.resendOTP(this.phNumber)
      .subscribe(
        response => {
          this.alertSrvc.showSuccess(response.message, "Successful",)
          this.startCountdown();
        },
        error => {
          this.alertSrvc.showError(error, "Oops !",)
        }
      );
  }

  /***/
  profiles: any = [];

  otpProgress: boolean = false;
  confirmLabSparkOtp() {
    if (this.otp && this.otp.length === 4) {
      this.otpProgress = true;
      
      this.appAuth.validateOTP(this.getOTPModel()).pipe(first()).subscribe((response: any) => {

        this.otpProgress = false ;

        if(response.hasOwnProperty('tenants')){
          if (response.tenants.length === 0) {
            this.alertSrvc.showError("You currently do not have access to any organization's resources");
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

      }, (error) => {
        this.otpProgress = false ;
        this.ngOtpInput.setValue('');
        this.otp = ""
        let eleId=this.ngOtpInput.getBoxId(0);
        this.ngOtpInput.focusTo(eleId);

        if(error.error && error.error.error.includes('Invalid')){
          this.alertSrvc.showError("Wrong OTP",);
        }else{
          this.alertSrvc.showError(error.error.error)
        }

      })
    } else {
      this.alertSrvc.showError("Enter 4 digit OTP")
    }
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
        this.alertSrvc.showError(`No Access to ${tnt.business_name}`,"")
      }
    }else{
      this.alertSrvc.showError(`${tnt.business_name} account suspended for violating privacy terms and conditions, please contact admin.`,"")
    }

  }



  saveDoctor(doc:any){
    this.cookieSrvc.setCookieDataForDoctor(doc);
    // this.alertSrvc.showError("")
    this.router.navigate(['/dashboard']);
  }




}
