import { Component, OnInit, ElementRef, ViewChild, Injector } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { UserProfileService } from 'src/app/core/services/user.service'
import { HttpErrorResponse } from '@angular/common/http'
import { AppAuthService } from 'src/app/core/services/appauth.service'
import { AlertService } from '@sharedcommon/service/alert.service'
import { Router } from '@angular/router'
import { CaptilizeService } from '@sharedcommon/service/captilize.service'
import { SignUpEndpoint } from '../../endpoint/signup.endpoint'
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { BaseComponent } from '@sharedcommon/base/base.component'
import { NG_ENV } from 'angular-server-side-configuration/ng-env';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
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
export class SignupComponent extends BaseComponent<any> {

  createUser!: UntypedFormGroup;
  termForm!: UntypedFormGroup;
  @ViewChild('termsCheckbox') checkbox!: ElementRef;

  // submitted: boolean = false;
  userTypeValue: any = ''
  ages!: any[];
  isCollapsed: boolean = true;

  resendDisabled: boolean = false
  inProgress: boolean = false

  fullName!: string;
  mobileNum!: number | string;

  // form data 
  categories: any[] = [];
  countries!: any;
  states!: any;
  cities!: any;
  registries!: any;

  constructor(
    injector: Injector,
    private formBuilder: UntypedFormBuilder,
    private userService: UserProfileService,
    private alertsrvc: AlertService,
    private authenticate: AppAuthService,
    private router: Router,
    public capitalizeSrvc: CaptilizeService,
    private endPoint: SignUpEndpoint
  ) { super(injector) }

  override ngOnInit() {
    
    this.getLocation();
    this.getUserTypeData()

    this.createUser = this.formBuilder.group({
      full_name: [null, Validators.required],
      phone_number: [
        '',
        [Validators.required, Validators.pattern('[0-9]{10}')]
      ],
      user_type: ['', Validators.required],
      organization_name: null,
      HealthcareRegistryType: null,
      country: null,
      state: null,
      // city: null
    })

    this.termForm = this.formBuilder.group({
      terms: [false, Validators.required]
    })

    this.getPics();

    this.subsink.sink = this.endPoint.getCountries().subscribe((data: any) => {
      this.countries = data
    });

    this.subsink.sink = this.endPoint.getStates().subscribe((data: any) => {
      this.states = data
    })

    this.subsink.sink = this.endPoint.getCities().subscribe((data: any) => {
      this.cities = data
    })

    this.subsink.sink = this.endPoint.getHealthCareRegistry().subscribe((data: any) => {
      this.registries = data
    })

    this.filteredCities()
  }

  validName(e: any) {
    this.createUser.get('full_name')?.setValue(e);
  }

  pics: any[] = [];

  getPics() {
    this.subsink.sink = this.authenticate.getSliders().subscribe(
      Response => {
        this.pics = Response.results;
      }, (error) => {
      }
    )
  }

  getUserTypeData(): any {
    this.subsink.sink = this.authenticate.getUserTypeDatas().subscribe(data => {
      this.categories = data.results
    })
  }

  getUserType() {
    return this.createUser.value.user_type;
  }

  categoryChange(category: any) {
    this.createUser.value.user_type = category.id
  }

  showAdditional(e: any) {

    this.createUser.get('user_type')?.setValue(e.target.value);
    if (this.createUser.value.user_type === 3) {

      this.submitted = false;
      this.createUser.get('HealthcareRegistryType')?.setValidators(Validators.required);
      this.createUser.get('country')?.setValidators(Validators.required);
      this.createUser.get('state')?.setValidators(Validators.required);
      // this.createUser.get('city')?.setValidators(Validators.required);

      this.createUser.get('HealthcareRegistryType')?.updateValueAndValidity();
      this.createUser.get('country')?.updateValueAndValidity();
      this.createUser.get('state')?.updateValueAndValidity();
      // this.createUser.get('city')?.updateValueAndValidity();

    } else {
      this.submitted = false;
      this.createUser.get('HealthcareRegistryType')?.clearValidators();
      this.createUser.get('country')?.clearValidators();
      this.createUser.get('state')?.clearValidators();
      this.createUser.get('city')?.clearValidators();

      this.createUser.get('HealthcareRegistryType')?.updateValueAndValidity();
      this.createUser.get('country')?.updateValueAndValidity();
      this.createUser.get('state')?.updateValueAndValidity();
      this.createUser.get('city')?.updateValueAndValidity();
    }

  }

  descriptionCall(e: any) {
    this.capitalizeSrvc.capitalizeReturnDesc(e.target.value)
  }



  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  checkTerms() {
    this.checkbox.nativeElement.classList.toggle('border-danger', !this.termForm.value.terms);
  }

  getModel() {
    const user_type = parseInt(this.createUser.get('user_type')?.value);
    let model: any;
    if (user_type === 3) {
      model = {
        full_name: this.createUser.get('full_name')?.value,
        phone_number: this.createUser.get('phone_number')?.value,
        user_type: user_type,
        organization_name: user_type === 3 ? this.capitalizeSrvc.AutoName(this.createUser.get('organization_name')?.value) || "" : "",
        HealthcareRegistryType: user_type === 3 ? this.createUser.get('HealthcareRegistryType')?.value || null : null,
        country: user_type === 3 ? this.createUser.get('country')?.value || null : null,
        state: user_type === 3 ? this.createUser.get('state')?.value || null : null,
        // city: user_type === 3 ? this.createUser.get('city')?.value || null : null,
        latitude: this.lat || "",
        longitude: this.lng || "",
      };
    } else {
      model = {
        full_name: this.createUser.get('full_name')?.value,
        phone_number: this.createUser.get('phone_number')?.value,
        user_type: user_type,
        latitude: this.lat || "",
        longitude: this.lng || "",
      }
    }

    model.full_name = this.capitalizeSrvc.AutoName(model.full_name);

    return model;
  }


  showTemp(){
    this.alertService.showInfo("We disabled this account creation feature for a short while.")
  }

  onSubmit() {
    if (this.termForm.value.terms) {
      const createUSerModel = this.getModel();

      if (createUSerModel.user_type !== 3) {
        this.inProgress = true;
        this.createUser.disable();
        const model = this.getModel()
        this.subsink.sink = this.endPoint.createUser(model).subscribe(
          response => {
            this.createUser.enable();
            this.alertsrvc.showSuccess('OTP Sent successfull to XXXXXX' +  this.createUser.value.phone_number.toString().slice(-4) )
            this.inProgress = false
            this.router.navigate(['/auth/otp/verify'], {
              queryParams: { mobileNum: this.createUser.value.phone_number }
            })
          }, (error: any) => {
            this.inProgress = false;
            if(error?.error?.Error){
              this.alertsrvc.showError(error.error.Error);
            }else if (error?.error?.phone_number[0].includes("exists")) {
              this.alertsrvc.showInfo("HealthO Pro user with mobile number already exists" )
            } else if (error?.error?.error) {
              this.alertsrvc.showError(error.error?.error)
            } else {
              this.alertsrvc.showInfo('Something Went Wrong', error)
            }

          }
        )
      } else {
        // && createUSerModel.city 
        if (this.createUser.value.full_name && createUSerModel.organization_name && createUSerModel.country && createUSerModel.state && createUSerModel.HealthcareRegistryType) {

          this.inProgress = true;
          this.createUser.disable();
          // Send the form data to the backend API
          const model = this.getModel()
          this.subsink.sink = this.endPoint.createUser(model).subscribe(
            response => {
              // Handle the successful API response here
              this.alertsrvc.showSuccess(
                'OTP Sent successfull to XXXXXX' +
                this.createUser.value.phone_number.toString().slice(-4)
              )
              this.inProgress = false
              this.router.navigate(['/auth/otp/verify'], {
                queryParams: { mobileNum: this.createUser.value.phone_number }
              })
            },(error: any) => {

              this.inProgress = false;
              this.createUser.enable();

              if(error?.error?.Error){
                if(error.error.Error.includes('duplicate') && error.error.Error.includes('organization_name')){
                  this.alertService.showInfo(`Same Organization with name ${this.createUser.value.organization_name} already exists.`)
                }else{
                  this.alertsrvc.showError(error.error.Error)
                }

              }else if (error?.error?.organization_name) {
                this.alertsrvc.showInfo(error.error.organization_name)
              }else if (error?.error?.phone_number[0].includes("exists")) {
                this.alertsrvc.showInfo("HealthO Pro user with mobile number already exists" )
              } else if (error?.error?.error) {
                this.alertsrvc.showError(error.error?.error)
              } else {
                this.alertsrvc.showInfo('Something Went Wrong','Oops !')
              }

            }
          )
        } else {

          !this.createUser.value.full_name ? this.alertsrvc.showError("Enter Name") : null;

          !createUSerModel.HealthcareRegistryType ? this.alertsrvc.showError("Select Healthcare Registry Type") : null;
          !createUSerModel.country ? this.alertsrvc.showError("Select Country") : null;
          !createUSerModel.state ? this.alertsrvc.showError("Select State") : null;
          this.submitted = true;
        }
      }

    } else {
      this.alertsrvc.showError("Enter details and accept terms and conditions");
      this.submitted = true;
      this.inProgress = false;
      this.checkTerms();
    }
  }

  filteredStates() {
    return this.states?.filter((state: any) => state.country == this.createUser.value.country);
  }

  filteredCities() {
    return this.cities?.filter((city: any) => city.state == this.createUser.value.state);
  }

  getCountry(e: any) {
    this.createUser.get('country')?.setValue(e.target.value);
    this.createUser.get('state')?.setValue(null); // Reset state when country changes
    this.createUser.get('city')?.setValue(null); // Reset city when country changes
  }

  getState(e: any) {
    this.createUser.get('state')?.setValue(e.target.value);
    this.createUser.get('city')?.setValue(null); // Reset city when state changes
  }

  showStates = 'All'
  public lat: any;
  public lng: any;

  // public ngOnInit(): void {
  //   this.getLocation();
  // }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          this.lat = latitude;
          this.lng = longitude;
          // You can do something with the latitude and longitude here
        },
        (error) => {
          console.error(error.message);
          // Handle error getting the location
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

  }

}
