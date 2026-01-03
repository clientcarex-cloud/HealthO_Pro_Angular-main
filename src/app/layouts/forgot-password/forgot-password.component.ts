import { Component, OnInit, EventEmitter, Output, ViewChild, AfterViewInit, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppAuthService } from 'src/app/core/services/appauth.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { TopbarEndPoint } from '../endpoints/topbar.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { NgbDropdownModule, NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoginEndpoint } from 'src/app/login/endpoint/signin.endpoint';
import { AlertService } from '@sharedcommon/service/alert.service';
import { NgOtpInputModule } from 'ng-otp-input';
import { CommonModule } from '@angular/common';
import { SimplebarAngularModule } from 'simplebar-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@sharedcommon/shared.module';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    NgOtpInputModule,
    CommonModule,
    RouterModule,
    NgbDropdownModule,
    NgbNavModule,
    SimplebarAngularModule,
    TranslateModule,
    SharedModule,
    AutocompleteLibModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {


  constructor(
    private authService: AuthenticationService, 
    private appAuthService: AppAuthService, 
    private router: Router, 
    private cookieSrvc: CookieStorageService,
    private endPoint: TopbarEndPoint, 
    private staffEndpoint: StaffEndpoint, 
    private signupEndpoint: SignUpEndpoint,
    public modalService: NgbModal,
  private formBuilder: FormBuilder,
  private loginEndPoint: LoginEndpoint,
  private alertsrvc : AlertService ) 
    { }

    @Input() phoneNumber: any = "";

  fieldTextType: boolean = false;
  secondfieldTextType: boolean = false;
  submitted = false;
  inProgress = false;

  loginForm!: UntypedFormGroup;


  ngOnInit(): void {
    
    this.initializePassword();
  }


  initializePassword(){
    this.loginForm = this.formBuilder.group({
      phone_number: [this.phoneNumber, [Validators.required, Validators.pattern('[0-9]{10}')]],
    });

    // Disable the phone_number control
    this.loginForm.get('phone_number')?.disable();
  }


  otpShow: boolean = true;
  /**
 * Password Hide/Show
 */
  toggleFieldTextType(e:any) {

    if(e){
      this.fieldTextType = !this.fieldTextType;
    }else{
      this.secondfieldTextType = !this.secondfieldTextType;
    }
  
  }
  

  onSubmit() {
    // if (this.loginForm.valid && this.inProgress == false) {
      if(true){
      this.submitted = true;
      this.inProgress = true;

      this.loginEndPoint.postNumberForPassword(this.loginForm.value).subscribe((Response)=>{
          this.alertsrvc.showSuccess("OTP Sent Successful",);
          this.submitted = false;
          this.inProgress = false;
          this.otpShow = false;
          this.startCountdown();
          // let eleId=this.ngOtpInput.getBoxId(0);
          // this.ngOtpInput.focusTo(eleId);
          
          // this.router.navigate(['/auth/otp/verify'], { queryParams: { mobileNum: this.loginForm.value.phone_number, } });
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

  otp: string = '';

  onOtpChange(otp: any) {
    this.otp = otp;
    if (this.otp.length === 4) {
      const input = document.getElementById('password-input-one') as HTMLInputElement;
      if (input && !input.readOnly) {
        input.focus();
      }
    }
  }

  countdown: any = 60;
  resendDisabled: boolean = true;
  countdownInterval: any;

  startCountdown() {
    this.resendDisabled = true; // Disable the resend button
    this.countdown = 60; // Reset the countdown value to 120 seconds

    this.countdownInterval = setInterval(() => {
        this.countdown--; // Decrement the countdown value
        if (this.countdown <= 0) {
            clearInterval(this.countdownInterval); // Stop the countdown when it reaches or goes below 0
            this.resendDisabled = false; // Enable the resend button
        }
    }, 1000); // Update the countdown every second
}


  onResendOTP() {
    // const phoneNumber = this.loginForm.value.phone_number;
    this.loginEndPoint.postNumberForPassword(this.loginForm.value)
      .subscribe(
        response => {
          this.alertsrvc.showSuccess("Resend OTP Successful",)
          this.startCountdown();
          
        },
        error => {
          this.alertsrvc.showError(error, "Oops !",)
        }
      );
  }

firstPassword: any = "";
secondPassword: any = "";

  firstlengthWarn : boolean = false ;
  secondlengthWarn : boolean = false ;
  firstDigitWarn: boolean = false;
  firstCapitalWarn: boolean = false;
  firstSpecialCharWarn: boolean = false;

  setPasswordInput(e:any, bool: boolean){
    if(bool){
      this.firstPassword = e.target.value;
      this.firstPassword.length < 8 ? this.firstlengthWarn = true : this.firstlengthWarn = false ;
      const hasCapital = /[A-Z]/.test(this.firstPassword);

      // Check for at least one special character
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.firstPassword);

      // Check for at least one digit
      const hasDigit = /\d/.test(this.firstPassword);

      // Update warnings based on checks
      this.firstCapitalWarn = !hasCapital;
      this.firstSpecialCharWarn = !hasSpecialChar;
      this.firstDigitWarn = !hasDigit;
    }else{
      this.secondPassword = e.target.value ;
      this.secondPassword.length < 8 ? this.secondlengthWarn = true : this.secondlengthWarn = false ;
    }

  }

  SetPasswordLoading: boolean = false;
  sendOTPassword() {
    // Check if both passwords are not blank
    const passwordsNotBlank = this.firstPassword.trim() !== '' && this.secondPassword.trim() !== '';

    if (!passwordsNotBlank) {
        // Display an error message if either of the passwords is blank
        this.alertsrvc.showError("Passwords cannot be blank");
        return; // Exit the method if passwords are blank
    }

    // Check if both passwords meet the minimum length requirement
    const passwordsLengthValid = this.firstPassword.length >= 8 && this.secondPassword.length >= 8;

    if (!passwordsLengthValid) {
        // Display an error message if either of the passwords is not at least 8 characters long
        this.alertsrvc.showError("Passwords must be at least 8 characters long");
        return; // Exit the method if passwords are not long enough
    }

    // Check if passwords match and if OTP is four digits long
    const passwordsMatch = this.firstPassword === this.secondPassword;
    const otpLengthValid = this.otp.length === 4;

    if (passwordsMatch && otpLengthValid) {
        // Check for password complexity requirements
        const hasCapital = /[A-Z]/.test(this.secondPassword);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.secondPassword);
        const hasDigit = /\d/.test(this.secondPassword);

        if (!hasCapital || !hasSpecialChar || !hasDigit) {
            // Display an error message if the password does not meet complexity requirements
            this.alertsrvc.showError("Password must contain at least one capital letter, one special character, and one digit");
            return; // Exit the method if password complexity requirements are not met
        }

        // Passwords match, OTP is four digits long, and password complexity requirements are met
        // Proceed with sending OTP and password
        this.SetPasswordLoading = true;
        const model = {
            phone_number: this.phoneNumber,
            otp: this.otp,
            password: this.secondPassword
        };

        this.loginEndPoint.postPassword(model)
            .subscribe(
                response => {
                    this.SetPasswordLoading = false;
                    this.alertsrvc.showSuccess("Password successfully set");
                    this.resetPasswordSet();
                },
                error => {
                    this.SetPasswordLoading = false;
                    this.alertsrvc.showError(error, "Oops !");
                }
            );

    } else {
        // Display appropriate error message if passwords don't match or OTP length is invalid
        if (!passwordsMatch) {
            this.alertsrvc.showError("Passwords do not match");
        }
        if (!otpLengthValid) {
            this.alertsrvc.showError("OTP length is not valid");
        }
    }
}




resetPasswordSet(){
  this.firstPassword = "";
  this.secondPassword = "";
  this.otp = "";
  this.otpShow = true;
  this.SetPasswordLoading =  false;
  this.modalService.dismissAll();
  // this.ngOtpInput.setValue("");

}

}
