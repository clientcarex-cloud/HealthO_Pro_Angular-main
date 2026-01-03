import { Component, EventEmitter, Output, ViewChild, Injector } from '@angular/core';

//Logout

import { AuthenticationService } from '../../core/services/auth.service';
import { AppAuthService } from '../../core/services/appauth.service';
import { Router } from '@angular/router';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { TopbarEndPoint } from '../endpoints/topbar.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';

import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AlertService } from '@sharedcommon/service/alert.service';
import { LoginEndpoint } from 'src/app/login/endpoint/signin.endpoint';

import { HttpErrorResponse } from '@angular/common/http';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AdminEndpoint } from 'src/app/login/endpoint/admin.endpoint';
import { ClientEndpoint } from 'src/app/client/clients.endpoint';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})

export class TopbarComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private authService: AuthenticationService,
    private timeSrvc: TimeConversionService,
    private appAuthService: AppAuthService,
    private router: Router,
    private cookieSrvc: CookieStorageService,
    private endPoint: TopbarEndPoint,
    private staffEndpoint: StaffEndpoint,
    private signupEndpoint: SignUpEndpoint,
    private formBuilder: FormBuilder,
    private loginEndPoint: LoginEndpoint,
    private adminEndpoint: AdminEndpoint,
    private clientEndpoint: ClientEndpoint,
    private alertsrvc: AlertService) { super(injector) }


  @Output() mobileMenuButtonClicked = new EventEmitter();
  @Output() branchChanged = new EventEmitter();
  @ViewChild('accSetup') accSetup: any ;
  @ViewChild('branchDrop') branchDrop: any ;


  organization: any;

  departments: any = [];
  is_sa: boolean = false;
  is_sa_login: boolean = false ;
  user: any ;
  element: any;
  mode: string | undefined;

  cookieValue: any;
  pageNum!: number | null;
  businessName: any = "";
  timer: any;


  override ngOnInit(): void {

    if (!this.cookieSrvc.is_sa_login()) {

      const data = this.cookieSrvc.getCookieData();
      if (data) {
        this.businessName = data.business_name;
        this.subsink.sink = this.staffEndpoint.getSingleStaff(data.lab_staff_id).subscribe((user: any) => {
          this.user = user ;
          
          this.is_sa = user.is_superadmin;

          this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
            this.organization = data[0];

            if(this.organization.multiple_branches && this.user?.branches && this.user.branches.length != 0 && this.user?.default_branch){
              this.user.branches = this.sortByIdsPriority(this.user.branches, this.user?.default_branch?.default_branch || [] ) ; 
            }

            if(this.organization.multiple_branches){
              if(this.user?.branches && this.user?.branches?.length != 0){
                if(this.user?.default_branch && this.user.default_branch?.default_branch?.length == 0){
                  this.alertService.showInfo("Select atleast one organization branch to get patient-related/dashboard data.");
                  
                  setTimeout(()=>{
                    this.branchDrop?.open() ;
                  })
                }
              }else{
                this.alertService.showInfo("You do not have access to any branch, so any patient-related and dashboard data cannot be displayed.");
              }
            }

            if (!data[0].business_data_status.is_data_imported) {
              this.openXL();
            }

          })

        })
      }

    }else{

      this.is_sa_login = true ;

      this.subsink.sink = this.adminEndpoint.getAdminDetails(this.cookieSrvc.getData('s_id')).subscribe((res: any)=>{
        this.user = res.user ;
      })
    }


  }

  loadStaff(){
    this.subsink.sink = this.staffEndpoint.getSingleStaff(this.user.id).subscribe((user: any) => {
      this.user = user ;

      if(this.organization.multiple_branches && this.user?.branches && this.user.branches.length != 0 && this.user?.default_branch){
        this.user.branches = this.sortByIdsPriority(this.user.branches, this.user?.default_branch?.default_branch || [] ) ; 
      }

      if(this.organization.multiple_branches){
        if(this.user?.branches && this.user?.branches?.length != 0){
          if(this.user?.default_branch && this.user.default_branch?.default_branch?.length == 0){
            this.alertService.showInfo("Select atleast one organization branch to get patient-related/dashboard data.");
            
            setTimeout(()=>{
              this.branchDrop?.open() ;
            })
          }
        }else{
          this.alertService.showInfo("You do not have access to any branch, so any patient-related and dashboard data cannot be displayed.");
        }
      }
      
    })
  }


  sortByIdsPriority(data: any, priorityIds: any) {
    return data.sort((a: any, b: any) => {
        const aPriority = priorityIds.indexOf(a.id);
        const bPriority = priorityIds.indexOf(b.id);

        // Add selected = true to items that are in priorityIds
        if (aPriority !== -1) a['selected']= true;
        if (bPriority !== -1) b['selected'] = true;

        // If both items are in the priority array, the one with a smaller index should come first
        if (aPriority !== -1 && bPriority !== -1) {
            return aPriority - bPriority;
        }

        // If only one item is in the priority array, that item should come first
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;

        // If neither is in the priority array, maintain their relative order
        return 0;
    });
  }

  defaultBranch(val: any){
    if(val == 'all'){
      let branches : any = [] ;
      this.user.branches.forEach((brn: any)=>{
        branches.push(brn.id) ;
      })

      this.user.default_branch.default_branch = branches ; 

      this.updateDefaultBranch(this.user.default_branch) ; 
    }else{
      if(!this.user.default_branch.default_branch.includes(val)){
        this.user.default_branch.default_branch.push(val) ; 
        this.updateDefaultBranch(this.user.default_branch) ; 
      }else{
        this.user.default_branch.default_branch = this.user.default_branch.default_branch.filter((b: any)=> b != val)
        this.updateDefaultBranch(this.user.default_branch) ; 
      }

    }
  }

  updateDefaultBranch(model: any){
    this.subsink.sink = this.endPoint.updateDefaultBranch(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Saved.");
      this.loadStaff() ;
      this.branchChanged.emit();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error ) ;
    })
  }

  copied_Data: any = [];

  openXL() {
    this.subsink.sink = this.staffEndpoint.getDepartmentsToCopy(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.departments = data;
      this.subsink.sink = this.staffEndpoint.getCopyBizData(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
        this.copied_Data = data;
        this.modalService.open(this.accSetup, { size: 'lg', backdrop: 'static', keyboard: false, scrollable: true })
      })
    })
  }

  select_depts: any = [];

  selectedDepartments(e: any, item: any) {
    if (e) {
      this.select_depts.push(item.name);
    } else {
      this.select_depts = this.select_depts.filter((d: any) => d !== item.name);
    }
  }

  checkCopiedOrNot(term: any) {
    return this.select_depts.find((d: any) => d == term)
  }

  selectAll(e: any) {
    if (e) {
      this.select_depts = []
      this.departments.forEach((d: any) => {
        this.select_depts.push(d.name);
      })
    } else {
      this.select_depts = []
    }
  }

  postDepartmentsForSetup(skip: boolean) {
    if (this.select_depts.length >= 1 || skip) {
      const model = {
        b_id: this.organization.id,
        client: this.cookieSrvc.getCookieData().client_id,
        departments_list: skip ? [] : this.select_depts
      }


      this.subsink.sink = this.staffEndpoint.postDepartmentsForCopy(model).subscribe((res: any) => {
        this.alertService.showSuccess(skip ? "Skipped Successful." : "Test Imported Successfully.");
        this.modalService.dismissAll();
      })
    } else {
      this.alertService.showInfo("Select Atleast One Department", "")
    }

  }

  override ngAfterViewInit() {
    // Check if ngOtpInput is available before calling setValue
    if (this.ngOtpInput) {
      this.ngOtpInput.setValue("");
    }
  }


  saveBid(business: any) {

    const currentUserString = localStorage.getItem('currentUser');
    if (currentUserString) {
      // Parse the string to get the object
      const currentUser = JSON.parse(currentUserString);

      // Update the b_id property
      currentUser.b_id = business.bid;

      const labStaff: any = localStorage.getItem('labStaff');
      const labStaffObj = JSON.parse(labStaff);
      labStaffObj.labStaff_id = business.profile.id

      localStorage.setItem('labStaff', JSON.stringify(labStaffObj))
      const labStafCheck: any = localStorage.getItem('labStaff');
      const labStaffCheckObj = JSON.parse(labStafCheck);


      // Store the updated object back in local storage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      this.router.navigate(['']);
      location.reload();
    }
  }

  searchData: any[] = [];
  searchLoading: boolean = false;

  selectFirstOption() {
    if (this.autoComplete) {
      this.onItemSelected(this.searchData[0])
    }
  }


  removeDigitsAfterPlus(inputString: string): string {
    // Find the index of the "+" symbol
    const plusIndex = inputString.indexOf("+");

    // If "+" symbol is found
    if (plusIndex !== -1) {
      // Return the substring before the "+" symbol
      return inputString.substring(0, plusIndex);
    } else {
      // If "+" symbol is not found, return the original string
      return inputString;
    }
  }

  getSearches(searchTerm: string): void {
    if (searchTerm !== "") {
      this.searchLoading = true;
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.subsink.sink = this.endPoint.getSearchResults(searchTerm).subscribe((data: any) => {
          // Consolidate patients with the same mr_no
          const uniquePatientsMap = new Map<string, any>();
          data.patients.forEach((patient: any) => {
            patient.name = patient.name + "+" + patient.mobile_number + patient.mr_no + patient.visit_id
            const existingPatient = uniquePatientsMap.get(patient.mr_no);
            if (!existingPatient || existingPatient.visit_count < patient.visit_count) {
              uniquePatientsMap.set(patient.mr_no, patient);
            }
          });

          // Transform the Map values back to an array
          const uniquePatients = Array.from(uniquePatientsMap.values());

          // Combine data from different sources
          this.searchData = [
            ...data.doctors.map((doctor: any) => ({ ...doctor, type: 'doctor' })),
            ...uniquePatients.map((patient: any) => ({ ...patient, type: 'patient' })),
            // Add lab tests with a 'type' property
            // Assuming 'lab_tests' is an array of lab test objects
            ...data.lab_tests.map((labTest: any) => ({ ...labTest, type: 'labTest' }))
          ];

          this.searchLoading = false;

        });
      }, 1000);
    } else {
      this.searchData = [];
    }
  }

  getClients(searchTerm: string): void {
    if(searchTerm.length > 2){
      this.searchLoading = true;
      this.timer = setTimeout(() => {
        this.subsink.sink = this.clientEndpoint.getClientsData(
          "all", 1, searchTerm, '', '', '', true
        ).subscribe((data: any) => {
          this.searchLoading = false;
          this.searchData = data;
        })
      }, 1000)
    }

  }

  showOrg(details: any){
    this.router.navigate(['/admin/client/org'], { queryParams: {org_id: details.id}});
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  capitalizeReturn(input: string) {
    return input.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
  }

  @ViewChild('auto_complete') autoComplete: any;

  onItemSelected(item: any, e = true): void {

    switch (item.type) {
      case 'doctor':
        this.autoComplete.clear();
        this.router.navigate(['/doctor/view/'], { queryParams: { d_id: item.id } });
        break;
      case 'patient':

        const url = this.router.createUrlTree(['/patient/patient_standard_view'], { queryParams: { patient_id: item.id } }).toString();

        if(item?.visit_count && item?.visit_count == 1){
          this.router.navigate(['/patient/patient_standard_view'], { queryParams: { patient_id: item.id }});
        }else{
          this.viewVisit(item);
        }
        this.autoComplete.clear();
        break;
      case 'labTest':
        this.router.navigate(['/setup/tweaks'], { queryParams: { g_id: item.id } })
        this.autoComplete.clear();
        break;
      default:

        this.autoComplete.clear();
        break;


    }
  }

  clearSearches() {
    this.searchData = [];
  }

  showStaff() {
    const data = this.cookieSrvc.getCookieData()
    this.router.navigate(['/staff/profile/'], { queryParams: { s_id: data.lab_staff_id } });
  }

  viewVisit(e: any) {
    this.router.navigate(['/patient/view_vist/'], { queryParams: { patient_id: e.mr_no } });
    this.autoComplete.clear();
  }

  showPatient(e: any) {
    this.router.navigate(['/patient/addpatients'], { queryParams: { patient_id: e.mr_no } });
    this.autoComplete.clear();
  }


  is24HoursBack(timestampStr: string): boolean {
    const todayOrNot = this.timeSrvc.decodeTimestamp(timestampStr);
    return todayOrNot.includes('Today')
  }




  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();

    if (window.screen.width <= 1024) {
      document.body.classList.toggle('menu');
      document.documentElement.setAttribute('data-sidebar-size', 'lg');
      document.body.classList.toggle('vertical-sidebar-enable');
    }
  }

  /**
   * Logout the user
   */
  logout() {
    this.appAuthService.logout();
    this.router.navigate(['/auth/signin']);
  }


  toggleFullscreen() {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullscreen = docEl.requestFullscreen || docEl.requestFullscreen || docEl.requestFullscreen || docEl.requestFullscreen;
    const exitFullscreen = doc.exitFullscreen || doc.exitFullscreen || doc.exitFullscreen;

    if (!doc.fullscreenElement && !doc.fullscreenElement && !doc.fullscreenElement && !doc.fullscreenElement) {
      requestFullscreen.call(docEl);
    } else {
      exitFullscreen.call(doc);
    }
  }


  loginForm!: UntypedFormGroup;

  initializePassword() {
    this.loginForm = this.formBuilder.group({
      phone_number: [this.user?.phone_number, [Validators.required, Validators.pattern('[0-9]{10}')]],
    });

    // Disable the phone_number control
    this.loginForm.get('phone_number')?.disable();
  }



  modalOpen(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.initializePassword();
    this.startCountdown()
    // this.ngOtpInput.otpForm?.disable()
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: true, backdropClass: backDrop, });
  }

  fieldTextType: boolean = false;
  secondfieldTextType: boolean = false;
  inProgress = false;

  otpShow: boolean = true;
  /**
 * Password Hide/Show
 */
  toggleFieldTextType(e: any) {

    if (e) {
      this.fieldTextType = !this.fieldTextType;
    } else {
      this.secondfieldTextType = !this.secondfieldTextType;
    }

  }


  onSubmit() {
    // if (this.loginForm.valid && this.inProgress == false) {
    if (true) {
      this.submitted = true;
      this.inProgress = true;

      this.subsink.sink = this.loginEndPoint.postNumberForPassword(this.loginForm.value).subscribe((Response) => {
        this.alertsrvc.showSuccess("OTP Sent Successful",);
        this.submitted = false;
        this.inProgress = false;
        this.otpShow = false;
        this.startCountdown();
        // let eleId=this.ngOtpInput.getBoxId(0);
        // this.ngOtpInput.focusTo(eleId);

        // this.router.navigate(['/auth/otp/verify'], { queryParams: { mobileNum: this.loginForm.value.phone_number, } });
      }, (error) => {
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
    else {
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
    this.subsink.sink = this.loginEndPoint.postNumberForPassword(this.loginForm.value)
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

  firstlengthWarn: boolean = false;
  secondlengthWarn: boolean = false;

  setPasswordInput(e: any, bool: boolean) {
    if (bool) {
      this.firstPassword = e.target.value;
      this.firstPassword.length < 8 ? this.firstlengthWarn = true : this.firstlengthWarn = false;

    } else {
      this.secondPassword = e.target.value;
      this.secondPassword.length < 8 ? this.secondlengthWarn = true : this.secondlengthWarn = false;
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
      // Passwords match and OTP is four digits long, proceed with sending OTP and password
      this.SetPasswordLoading = true;
      const model = {
        phone_number: this.user?.phone_number,
        otp: this.otp,
        password: this.secondPassword

      }

      this.subsink.sink = this.loginEndPoint.postPassword(model)
        .subscribe(
          response => {
            this.SetPasswordLoading = false;
            this.alertsrvc.showSuccess("Password successfully set")
            this.resetPasswordSet()
          },
          (error: HttpErrorResponse) => {
            this.SetPasswordLoading = false;
            this.alertsrvc.showError("Invalid OTP", "Oops !",)
          }
        );




    } else {
      // Display appropriate error message if passwords don't match or OTP length is invalid
      if (!passwordsMatch) {

        this.alertsrvc.showError("Passwords do not match");
        // You can display a message or set a flag to show an error to the user
      }
      if (!otpLengthValid) {
        this.alertsrvc.showError("OTP length is not valid");
        // You can display a message or set a flag to show an error to the user
      }
    }
  }



  resetPasswordSet() {
    this.firstPassword = "";
    this.secondPassword = "";
    this.otp = "";
    this.otpShow = true;
    this.SetPasswordLoading = false;
    this.modalService.dismissAll();
    // this.ngOtpInput.setValue("");

  }



}
