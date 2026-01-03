import { Component, Injector, Input, } from '@angular/core';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
// import { AlertService } from '@sharedcommon/service/alert.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { ClientEndpoint } from 'src/app/client/clients.endpoint';

interface Organization {
  id: number;
  organization_name: string;
  phone_number: string;
  pin_code: string | null;
  address: string | null;
  geo_location: string | null;
  latitude: number | null;
  longitude: number | null;
  ip_address: string | null;
  website: string | null;
  referral_amount_per_patient: number | null;
  b_logo: string | null;
  b_letterhead: string | null;
  blue_verification: boolean;
  is_open_outsource: boolean;
  is_head_branch: boolean;
  is_active: boolean;
  pro_user_id: number;
  provider_type: number;
  country: number;
  city: number;
  state: number;
}

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
})

export class SetupComponent extends BaseComponent<Organization> {

  constructor(
    injector: Injector,
    private endPoint: SignUpEndpoint,
    private cookieSrvc: CookieStorageService,
    private capitalSrvc: CaptilizeService,
    private clientEndpoint: ClientEndpoint,
    private formBuilder: UntypedFormBuilder,) { super(injector) }

  @Input() organization: any = null;

  organizationForm!: UntypedFormGroup;
  countries!: any;
  states!: any;
  cities!: any;
  registries!: any;

  is_salogin: boolean = false;

  addss: any = {
    address: '',
    clinic_reg_no: '',
    is_head_branch: false,
    new: true
  }

  override ngOnInit(): void {

    this.is_salogin = this.cookieSrvc.is_sa_login()

    this.initializeForm();

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
      this.registries = data.results
    })

    if (this.organization == null) {
      this.subsink.sink = this.endPoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
        this.organization = data[0];
        if (this.organization.addresses == null || this.organization.addresses.length == 0) {
          this.organization.addresses.push(this.addss)
        }
        this.updateForm();
      })
    } else {
      if (this.organization.addresses == null || this.organization.addresses.length == 0) {
        this.organization.addresses.push(this.addss)
      }
      this.updateForm();
    }


  }

  override ngAfterViewInit(): void {

  }

  filteredStates() {
    return this.states?.filter((state: any) => state.country == this.organizationForm.value.country);
  }

  filteredCities() {
    return this.cities?.filter((city: any) => city.state == this.organizationForm.value.state);
  }

  getCountry(e: any) {
    this.organizationForm.get('country')?.setValue(e.target.value);
    this.organizationForm.get('state')?.setValue(null); // Reset state when country changes
    this.organizationForm.get('city')?.setValue(null); // Reset city when country changes
  }

  getState(e: any) {
    this.organizationForm.get('state')?.setValue(e.target.value);
    this.organizationForm.get('city')?.setValue(null); // Reset city when state changes
  }


  initializeForm() {
    this.organizationForm = this.formBuilder.group({
      organization_name: ['', Validators.required],
      phone_number: ['', Validators.required],
      pin_code: [''],
      adresses: [[]],
      address: [''],
      address2: [''],
      geo_location: [''],
      latitude: [null],
      longitude: [null],
      ip_address: [''],
      website: [''],
      referral_amount_per_patient: [null],
      b_logo: [''],
      b_letterhead: [''],
      blue_verification: [false],
      is_open_outsource: [false],
      is_head_branch: [false],
      is_active: [true],
      pro_user_id: [null],
      provider_type: [null],
      country: [null],
      city: [null],
      state: [null],
      gst: [null]
    });

  }

  updateForm() {

    this.organizationForm = this.formBuilder.group({
      organization_name: [this.organization.organization_name],
      phone_number: [this.organization.phone_number],
      pin_code: [this.organization.pin_code],
      address: [this.organization.address],
      address2: [this.organization.address2],
      geo_location: [this.organization.geo_location],
      latitude: [this.organization.latitude],
      longitude: [this.organization.longitude],
      ip_address: [this.organization.ip_address],
      website: [this.organization.website],
      referral_amount_per_patient: [this.organization.referral_amount_per_patient],
      b_logo: [this.organization.b_logo],
      b_letterhead: [this.organization.b_letterhead],
      blue_verification: [this.organization.blue_verification],
      is_open_outsource: [this.organization.is_open_outsource],
      is_head_branch: [this.organization.is_head_branch],
      is_active: [this.organization.is_active],
      pro_user_id: [this.organization.pro_user_id],
      provider_type: [this.organization.provider_type],
      country: [this.organization.country],
      city: [this.organization.city],
      state: [this.organization.state],
      addresses: [this.organization.addresses],
      gst: [this.organization?.gst || null]
    });
  }

  onFileChanged(event: any, name: any): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file).then((base64String: string) => {
        // Assign base64 string to form control
        this.organizationForm.get(name)?.setValue(base64String);
      });
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  clearLogo(name: any) {
    this.organizationForm.get(name)?.setValue(null)
  }

  addAddress() {

    const newAddss: any = {
      address: '',
      clinic_reg_no: '',
      is_head_branch: false,
      new: true
    }
    // this.organizationForm.get('addresses')?.setValue()
    this.organizationForm.value.addresses.push(newAddss)
  }

  addchanges: boolean = false;
  writeAddress(adrs: any, type: any, e: any) {
    this.addchanges = true;
    adrs[type] = e;
    if (type == 'address' && e == '') {
      adrs.clinic_reg_no = ''
    }

  }

  getModel() {

    const addss = this.organizationForm.get('addresses')?.value.filter((org: any) => org.address && org.address !== '')

    const model = {
      id: this.organization.id,
      organization_name: this.organizationForm.get('organization_name')?.value || null,
      phone_number: this.organizationForm.get('phone_number')?.value || null,
      provider_type: this.organizationForm.get('provider_type')?.value || null,
      address: this.organizationForm.get('address')?.value || null,
      address2: this.organizationForm.get('address2')?.value || null,
      state: this.organizationForm.get('state')?.value || null,
      city: this.organizationForm.get('city')?.value || null,
      country: this.organizationForm.get('country')?.value || null,
      website: this.organizationForm.get('website')?.value || null,
      pin_code: this.organizationForm.get('pin_code')?.value || null,
      gst: this.organizationForm.get('gst')?.value || null,
      b_logo: this.organizationForm.get('b_logo')?.value || null,
      b_letterhead: this.organizationForm.get('b_letterhead')?.value,
    }

    return model;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  handleFiles(files: FileList): void {
    const file = files[0];
    if (file) {
      this.readFile(file);
    }
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.organizationForm.get('b_logo')?.setValue(base64String);
    };
    reader.readAsDataURL(file);
  }


  onSubmit(): void {
    if (this.organizationForm.valid) {
      const model = this.getModel();

      if (!this.cookieSrvc.is_sa_login()) {
        this.subsink.sink = this.endPoint.updateBusinessProfile(model, this.organization.id).subscribe(
          (response: any) => {
            this.alertService.showSuccess('Updated', model.organization_name,);
          },
          (error: any) => {
            console.error(error);
            this.alertService.showError('Error updating organization');
          }
        );
      } else {
        this.subsink.sink = this.clientEndpoint.updateOrganizationDetails(model).subscribe(
          (response: any) => {
            this.alertService.showSuccess('Updated', model.organization_name,);
          },
          (error: any) => {
            console.error(error);
            this.alertService.showError('Error updating organization');
          }
        );
      }

    } else {
      this.alertService.showError('Please fill in all required fields');
    }

    if (this.addchanges) {
      const addss = this.organizationForm.get('addresses')?.value.filter((org: any) => org.address && org.address !== '');

      // const removeAds = this.organizationForm.get('addresses')?.value.filter((org:any)=> org.address == '');
      addss.forEach((ads: any) => {
        if (ads.new) {
          const model = {
            b_id: this.organization.id,
            address: ads.address,
            clinic_reg_no: ads.clinic_reg_no,
            is_head_branch: ads.is_head_branch
          }
          this.subsink.sink = this.endPoint.postBusinessAdress(model).subscribe((reponse: any) => {
            // this.alertService.showSuccess("Address Posted");
          }, (error) => {
            this.alertService.showError(error)
          })
        } else {
          this.subsink.sink = this.endPoint.updateBusinessAdress(ads).subscribe((reponse: any) => {

          }, (error) => {
            this.alertService.showError(error)
          })
        }
      })

    }

  }

  multipleAccess(content: any, e: any){
    if(e){
      this.openModal(content, { centered : true })
    }else{
      this.updateMultipleBranches(e) ;
    }

  }


  updateMultipleBranches(e: any){
    // const model: any = this.organization?.multiple_branches ;
    // model.multiple_branches['multiple_branches'] = e ;

    this.organization.multiple_branches.multiple_branches = e ;

    this.subsink.sink = this.clientEndpoint.updateMultipleBranches(this.organization.multiple_branches, this.organization.id).subscribe((res: any)=>{
      this.modalService.dismissAll() ;

      this.alertService.showSuccess("Branch Settings Updated.") ;
    }, (error)=>{
      this.alertService.showError(error?.error?.error || error?.error?.Error || error) ;
    })


  }

}
