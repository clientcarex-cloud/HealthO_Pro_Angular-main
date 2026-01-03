import { Component, Injector } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-add-market-executive',
  templateUrl: './add-market-executive.component.html',
})

export class AddMarketExecutiveComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private proEndpoint: ProEndpoint,
    private staffEndpoint: StaffEndpoint,
    private timeSrvc: TimeConversionService,
    private capitalSrvc: CaptilizeService,
    private route: ActivatedRoute,
  ) { super(injector) }


  currentStep : any = 1;

  activeTab: any ;
  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  genders: any;
  vehiclesTypes: any;
  fuelTypes: any;
  employmentTypes: any;
  paymentTypes: any;
  salaryTypes: any ;
  roles: any;
  picture: any;
  staff: any;

  override ngOnInit(): void {

    this.initializeBaseForm();

    this.getValues() ;

  }

  override ngAfterViewInit(): void {
    this.route.queryParams.subscribe(params => {
      this.staff = +params['s_id']
      if (this.staff) {
        this.loadStaff();
      } 
    })
  }

  getValues(){
    this.subsink.sink = this.proEndpoint.getStaffGender().subscribe((data: any) => {
      this.genders = data.results;
      if(this.staff ){
        try{
          this.baseForm.get('gender')?.setValue(this.staff?.gender ? this.genders.find((gen: any)=> gen.id == this.staff?.gender) : null)
        }catch(error){

        }
       
      }else{
        this.baseForm.get('gender')?.setValue(this.genders[0])
      }

    });

    this.subsink.sink = this.proEndpoint.getVehicleTypes().subscribe((data: any) => {
      this.vehiclesTypes = data;
    });

    this.subsink.sink = this.proEndpoint.getFuelTypes().subscribe((data: any) => {
      this.fuelTypes = data;
    });

    this.subsink.sink = this.proEndpoint.getPaymentsTypes().subscribe((data: any) => {
      this.paymentTypes = data;
    });

    this.subsink.sink = this.proEndpoint.getEmploymentTypes().subscribe((data: any) => {
      this.employmentTypes = data;
    });

    this.subsink.sink = this.proEndpoint.getSalaryTypes().subscribe((data: any) => {
      this.salaryTypes = data;
    });

    this.subsink.sink = this.staffEndpoint.getStaffRoles().subscribe((data: any) => {
      this.roles = data;
      this.baseForm.get('role')?.setValue(this.roles.find((role: any) => role.name.toLowerCase().includes("market")) || null)
    });
  }

  loadStaff() {
    this.subsink.sink = this.staffEndpoint.getSingleStaff(this.staff).subscribe((data: any) => {
      this.staff = data;
      this.updateInitializeForm(data);
    })
  }

  updateInitializeForm(data: any): void {
    this.baseForm.patchValue({
      title: [1],
      name: data.name ? data.name : "",
      mobile_number: data.mobile_number ? data.mobile_number : "",
      email: data.email ? data.email : "",
      is_active: data.is_active !== undefined ? data.is_active : false,
      date_of_birth: data.date_of_birth ? data.date_of_birth : "",
      CUser: data.CUser !== undefined ? data.CUser : null,
      employement_type: data.employement_type ? data.employement_type : null,
      gender: data.gender != undefined ? this.genders : 1,
      branch: data.branch ? data.branch : null,
      signature: data.signature || null,
      profile_pic: data.profile_pic || null,

      address: data?.lab_staff_personal_details?.address || null,
      date_of_joining: data?.lab_staff_job_details?.date_of_joining || null,

      extra_hours_pay: data?.lab_staff_job_details?.extra_hours_pay || null,
      salary_deduction: data?.lab_staff_job_details?.salary_deduction || null,

      city: data?.city || null,
      state: data?.state || null,
      pin_code: data?.pin_code || null,

      bank_name: data?.lab_staff_identification_details?.bank_name,
      ac_holder_name: data?.lab_staff_identification_details?.ac_holder_name,
      bank_account_no: data?.lab_staff_identification_details?.bank_account_no,
      bank_ifsc_code: data?.lab_staff_identification_details?.bank_ifsc_code,
      pan_card_no: data?.lab_staff_identification_details?.pan_card_no,
      salary_payment_mode: data?.lab_staff_identification_details?.salary_payment_mode,

      vehicle_type: data?.lab_staff_vehicle_details?.vehicle_type,
      fuel_type: data?.lab_staff_vehicle_details?.fuel_type,
      fuel_rate: data?.lab_staff_vehicle_details?.fuel_rate,
      vehicle_reg_no: data?.lab_staff_vehicle_details?.vehicle_reg_no,
      variable_mileage: data?.lab_staff_vehicle_details?.variable_mileage,
      vehicle_reg_img: data?.lab_staff_vehicle_details?.vehicle_reg_img,

      driving_license: data?.lab_staff_vehicle_details?.driving_license_img,


      shift_start_time: data?.lab_staff_job_details?.shift_start_time,
      shift_end_time: data?.lab_staff_job_details?.shift_end_time,
      incentive_rate: data?.lab_staff_job_details?.incentive_rate,
      commission_rate: data?.lab_staff_job_details?.commission_rate,
      payment_type: data?.lab_staff_job_details?.payment_type ||null

    });

    try{
      this.baseForm.get('gender')?.setValue(this.staff?.gender ? this.genders.find((gen: any)=> gen.id == this.staff?.gender) : null)
    }catch(error){

    }

    // this.setValues();
  }

  setValues() {
    // this.baseForm.get('vehicle_type')?.setValue(this.vehiclesTypes.find((type: any)=> type))
  }

  initializeBaseForm() {
    this.baseForm = this.formBuilder.group({
      name: ["", Validators.required],
      mobile_number: ["", Validators.required],
      email: [""],
      is_active: [false],
      date_of_birth: [null],
      CUser: [null],
      employement_type: [null, Validators.required],
      gender: [1],
      role: [null, Validators.required],
      department: [null],
      shift: [null],
      branch: [null],
      signature: [null],
      profile_pic: [null],
      is_superadmin: [false],
      address: [null],

      date_of_joining: [this.timeSrvc.getTodaysDate()],

      city: [null],
      state: [null],
      pin_code: [null],

      bank_name: [null],
      ac_holder_name: [null],
      bank_account_no: [null],
      bank_ifsc_code: [null],
      pan_card_no: [null],
      salary_payment_mode: [null],
      driving_license: [null],

      vehicle_type: [null],
      fuel_type: [null],
      fuel_rate: [null],
      vehicle_reg_no: [null],
      variable_mileage: [null],
      vehicle_reg_img: [null],

      shift_start_time: [null],
      shift_end_time: [null],
      incentive_rate: [null],
      commission_rate: [null],
      payment_type: [null],

      extra_hours_pay: [null],
      salary_deduction: [null]

    })

  }

  getModel() {
    const model: any = {

      name: this.baseForm.get('name')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value || "",
      is_active: true,
      date_of_birth: this.baseForm.get('date_of_birth')?.value || null,


      employement_type: this.baseForm.get('employement_type')?.value?.id || null,
      gender: this.baseForm.get('gender')?.value?.id || null,
      role: this.baseForm.get('role')?.value?.id || null,
      department: this.baseForm.get('department')?.value?.id || null,
      shift: this.baseForm.get('shift')?.value?.id || null,
      branch: this.baseForm.get('branch')?.value?.id || null,

      // signature : this.imageFile || null,
      profile_pic: this.baseForm.get('profile_pic')?.value || null,
      is_superadmin: this.baseForm.get('role')?.value?.name.toLowerCase().replace(" ", "").includes("superadmin"),


      lab_staff_personal_details: {
        city: this.baseForm.get('city')?.value,
        state: this.baseForm.get('state')?.value,
        pin_code: this.baseForm.get('pin_code')?.value,
        country: null,
        resume_upload: null,
        father_name: null,
        date_of_joining: this.baseForm.get('date_of_joining')?.value,
        blood_group: null,
        marital_status: null,
        address: this.baseForm.get('address')?.value,
      },

      lab_staff_identification_details: {
        bank_name: this.baseForm.get('bank_name')?.value,
        ac_holder_name: this.baseForm.get('ac_holder_name')?.value,
        bank_account_no: this.baseForm.get('bank_account_no')?.value,
        bank_ifsc_code: this.baseForm.get('bank_ifsc_code')?.value,
        pan_card_no: this.baseForm.get('pan_card_no')?.value,
        salary_payment_mode: this.baseForm.get('salary_payment_mode')?.value?.id,
        // driving_license: this.baseForm.get('driving_license')?.value,
        pf_account_no: null,
        passport_no: null,
        esi_account_no: null,

      },

      lab_staff_vehicle_details: {
        fuel_rate: this.baseForm.get('fuel_rate')?.value,
        vehicle_reg_no: this.baseForm.get('vehicle_reg_no')?.value,
        vehicle_type: this.baseForm.get('vehicle_type')?.value?.id,
        fuel_type: this.baseForm.get('fuel_type')?.value?.id,
        variable_mileage: this.baseForm.get('variable_mileage')?.value,
        vehicle_reg_img: this.baseForm.get('vehicle_reg_img')?.value,
        driving_license_img: this.baseForm.get('driving_license')?.value,
      },

      lab_staff_job_details: {
        date_of_joining: this.baseForm.get('date_of_joining')?.value,
        shift_start_time: this.baseForm.get('shift_start_time')?.value,
        shift_end_time: this.baseForm.get('shift_end_time')?.value,
        incentive_rate: this.baseForm.get('incentive_rate')?.value,
        commission_rate: this.baseForm.get('commission_rate')?.value,
        payment_type: this.baseForm.get('payment_type')?.value?.id,
        extra_hours_pay: this.baseForm.get('extra_hours_pay')?.value,
        salary_deduction: this.baseForm.get('salary_deduction')?.value,
      }

    }
    return model;
  }



  saveExecutive() {
    if (this.baseForm.valid) {
      const model = this.getModel();

      if (this.staff) {
        this.subsink.sink = this.staffEndpoint.updateStaff(this.staff.id, model).subscribe((res: any) => {
          this.alertService.showSuccess(`${model.name} Updated.`)
        }, (error: any) => {
          this.alertService.showError(error?.error?.Error);
        })
      } else {
        this.subsink.sink = this.staffEndpoint.postStaff(model)?.subscribe((res: any) => {
          this.alertService.showSuccess(`${model.name} Saved.`);
          this.baseForm.reset();
        }, (error: any) => {
          this.alertService.showError(error?.error?.Error);
        })
      }

    } else {
      this.showErrors();
    }
  }

  showErrors() {
    this.submitted = true;
    Object.keys(this.baseForm.controls).forEach(key => {
      const control = this.baseForm.get(key);
      if (control && !control.valid) {
        if (key === 'mobile_number') {
          this.alertService.showError("", `Enter Valid Mobile Number`)
        } else {
          this.alertService.showError("", `Enter ${key}`)
        }
      }
    });
  }


  // utilities

  handleImages(event: any, type: any): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file).then((base64String: string) => {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
          if (img.width > 4000 || img.height > 4000) {
            event.target.value = '';
            this.alertService.showError('Selected image exceeds maximum dimensions', "")
          } else {
            this.baseForm.get(type)?.setValue(base64String);
          }
        };
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

  clearLogo(bool: boolean, type: any) {
    this.baseForm.get(type)?.setValue(null)
  }

  formatString(e: any, val: any) {
    this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  openImage(content: any, image: any) {
    this.picture = image;
    this.openModal(content, { size: 'xl' });
  }

}
