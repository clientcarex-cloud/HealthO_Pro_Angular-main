import { Component, EventEmitter, Injector, input, Input, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { ProEndpoint } from '../../endpoints/pro.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { FormBuilder, Validators } from '@angular/forms';
import { PatientEndpoint } from '../../endpoints/patient.endpoint';
import { Router } from '@angular/router';
import { AddPatientEndpoint } from '../../endpoints/addpatient.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { HIMSSetupEndpoint } from 'src/app/setup_hims/components/services-hims/hmis.endpoint';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrl: './add-appointment.component.scss'
})

export class AddAppointmentComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private router: Router,
    private formBuilder: FormBuilder,

    private proEndpoint: ProEndpoint,
    private addpatientEndpoint: AddPatientEndpoint,
    private endPoint: PatientEndpoint,
    private himsEndpoint: HIMSSetupEndpoint,

    private timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService

  ){ super(injector) }

  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  @Input() ptn: any ;
  @Input() updateBool: any = false;
  @Input() new: boolean = true ;
  @Input() disableDates: any = [];

  @Input() titles: any;
  @Input() genders: any;
  @Input() ages: any;

  timer: any;
  slots: any;
  currentDate!: Date;

  apt: boolean = false;
  changed: boolean = false;
  years: boolean = false;
  inProgress: boolean = false;
  isLoading: boolean = false;
  docLoading: boolean = false;
  searchLoading: boolean = false;

  remarks: any = "";
  testTerm: any = "";
  appointments: any = [];
  refDoctors: any = [];
  tests_included: any = [];
  searchData: any = [];
  caseType: any = [];

  override ngOnInit(): void {
    
    this.currentDate = new Date() || '';
    this.initializeForm();

    this.baseForm.get('ULabPatientAge')?.setValue(this.ages.find((age: any) => age.name === "Years")?.id)

    if(this.ptn) this.showPatient(this.ptn, true);

    this.getAllCOnsultingDoctors();
  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({

      title: [1, Validators.required],
      name: ['', Validators.required],
      age: [null, Validators.required],
      dob: [null],
      gender: [1, Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      referral_doctor: [],
   
      home_service: [false],
      ULabPatientAge: [1],
      address: [''],

      lab_discount_type_id: [null],
      is_percentage_discount: [false],
      paid_amount: [null],
      pay_mode_id: [1],
      discount_amt: 0,
      attender_name: [""],
      attender_relationship_title: 3,
      prescription_attach: [null],
      lab_packages: [[]],
      is_discount_amt_by_ref_doc: [false],

      consulting_doctor: [null, Validators.required],
      appointment_date: [this.timeSrvc.getTodaysDate(), Validators.required],
      appointment_time: [null, Validators.required],

      appointment_type_id: [1],

      case_type: [null, Validators.required],
      lab_tests: [[]],


    });
  }

  showPatient(ptn: any, view: any = null, apt: boolean = false) {

    this.updateBool = true;
    this.ptn = ptn;
    this.new = false;
    this.apt = apt;
    view ? this.ptn['ptn_id'] = view.id : this.ptn['id'] = ptn.id;
    view ? ptn.patient ? this.ptn['view'] = true : this.ptn['view'] = false : this.ptn['view'] = false;
    // this.router.navigate(['/patient/patient_standard_view/'], { queryParams: {patient_id: details.id}});

    this.baseForm.patchValue({
      bId: ptn.b_id,
      title: ptn.title ? this.titles.find((t: any) => t.name == ptn.title).id : null,
      name: ptn.name,
      age: ptn.age ? ptn.age : null,
      gender: ptn.gender,
      dob: ptn.dob ? ptn.dob : null,
      mobile_number: ptn.mobile_number,
      referral_doctor: null,
      lab_packages: [],
      lab_tests: ptn.tests,
      pay_mode_id: 1,
      paid_amount: "",
      address: ptn.address ? ptn.address : "",
      ULabPatientAge: ptn.ULabPatientAge !== null ? ptn.ULabPatientAge : 1,
      attender_name: ptn.attender_name ? ptn.attender_name : "",
      attender_relationship_title: ptn.attender_relationship_title ? ptn.attender_relationship_title : 3,
      consulting_doctor: ptn?.consulting_doctor,
      appointment_date: ptn.appointment_date,
      appointment_time: ptn?.appointment_time.replace(":00", ""),

      appointment_type_id : ptn?.appointment_type_id
    });

    if(ptn?.appointment_type_id == 1){
      const model = ptn?.consultation_details[0] ;
      model['name'] = `${model.case_type?.name} - ${model?.is_online ? 'Online' : 'Walk-In'}`;

      this.baseForm.get('case_type')?.setValue(ptn?.consultation_details[0]);
        
      if(this.ptn?.consulting_doctor.lab_doctors_consultation_details && this.ptn?.consulting_doctor?.lab_doctors_consultation_details.length > 0){
        this.ptn?.consulting_doctor?.lab_doctors_consultation_details.forEach((item: any)=>{
          item['name'] = `${item.case_type?.name} - ${item?.is_online ? 'Online' : 'Walk-In'}`
        })

        this.caseType = this.ptn?.consulting_doctor?.lab_doctors_consultation_details ;
      }

    }else if(ptn?.appointment_type_id == 2){
      this.baseForm.get('lab_tests')?.setValue(ptn?.services)
    }

    this.disableDates = this.getDatesBetween(ptn.appointment_date, this.timeSrvc.getTodaysDate())
    this.getLabDoctorAvai(ptn.appointment_date, true);
    this.setappointmentTypeId(ptn?.appointment_type_id, false) ;
    this.changed = false;
  }

  getAppointments(event: any){
    if(event.length > 2){
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.isLoading = true
        this.subsink.sink = this.endPoint.getAppointments(
          "all", "", 1,
          event, "", true
        ).subscribe((data: any) => {
  
          this.appointments = data;
  
          this.appointments.forEach((item: any)=>{
            item['dispName'] = `${item.name}, ${item.mobile_number}`
          })
          this.isLoading = false;
        })
      }, 400)
    }
  }

  selectedPreviousAppointment(event: any){
    this.baseForm.get('name')?.setValue(event.name);
    this.baseForm.get('age')?.setValue(event.age);
    this.baseForm.get('gender')?.setValue(event.gender);
    this.baseForm.get('mobile_number')?.setValue(event.mobile_number);
    this.baseForm.get('title')?.setValue(this.titles.find((d: any)=> d.name == event.title).id)
  }

  getDoctorSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.testTerm = searchTerm;
      this.docLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.addpatientEndpoint.getLabDoctors(searchTerm, "lab_get_consulting_doctors").subscribe((data: any) => {
          this.refDoctors = data.filter((d: any) => d.is_active);
          this.refDoctors.map((d: any) => d.name += ", " + d.mobile_number)
          this.docLoading = false;
        });
      }, 0);
    } else {
      this.testTerm = null;
      this.refDoctors = [];
      this.docLoading = false;
    }
  }

  getAllCOnsultingDoctors(){
    this.docLoading = true
    this.subsink.sink = this.addpatientEndpoint.getLabDoctors('', "lab_get_consulting_doctors").subscribe((data: any) => {
      this.refDoctors = data.filter((d: any) => d.is_active);
      this.refDoctors.map((d: any) => {
        // d.name += ", " + d.mobile_number
        d.name = `${d.name} - ${d.mobile_number}`
        if(d.department) d.name += `, Dept. of ${d.department}`;
      })
      this.docLoading = false;
    });
  }



  doctorSelected(e: any) {
    if (e && e != '') {
      if (e.shift_start_time && e.shift_end_time && e.avg_consulting_time) {

        this.caseType = e?.lab_doctors_consultation_details || [] ;

        if(e?.lab_doctors_consultation_details && e?.lab_doctors_consultation_details.length > 0){
          e?.lab_doctors_consultation_details.forEach((item: any)=>{
            item['name'] = `${item.case_type?.name} - ${item?.is_online ? 'Online' : 'Walk-In'}`
          })
        }

        this.getLabDoctorAvai();
        this.baseForm.get('appointment_time')?.setValue(null);
        this.slots = null;

      } else {
        let missingFields = [];

        if (!e.shift_start_time) {
          missingFields.push('Shift start time');
        }
        if (!e.shift_end_time) {
          missingFields.push('Shift end time');
        }
        if (!e.avg_consulting_time) {
          missingFields.push('Average consulting time');
        }

        setTimeout(() => {
          this.baseForm.get('consulting_doctor')?.setValue(null);
        }, 100)
        let errorMessage = `${e.name} Doctor's data following fields are missing: ${missingFields.join(', ')}`;
        this.alertService.showInfo(errorMessage);
      }
    }

  }

  getLabDoctorAvai(date: any = this.baseForm.get('appointment_date')?.value, pushSlot: boolean = false) {


    this.subsink.sink = this.addpatientEndpoint.getDocAvail(
      this.baseForm.get('consulting_doctor')?.value?.id,
      date
    ).subscribe((res: any) => {
      this.slots = res.time_slots;
      if (pushSlot) {
        this.slots.push(this.ptn?.appointment_time.replace(":00", ""))
      }
    })
  }

  getSearches(searchTerm: string): void {
    // Trim leading spaces from the searchTerm
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }

    if (searchTerm) {
      this.testTerm = searchTerm;
      this.searchLoading = true;
      clearTimeout(this.timer);

      this.searchData = []; // Initialize an empty array
      this.timer = setTimeout(() => {

        if(this.baseForm?.value?.appointment_type_id == 3){
          this.subsink.sink = this.addpatientEndpoint.getTestsSearchResults(searchTerm).subscribe((testData: any) => {
            this.searchLoading = false;
            this.searchData = [ ...testData.filter((labTest: any) => !this.tests_included.includes(labTest.id))]
          });
        }else if(this.baseForm?.value?.appointment_type_id == 2){
          this.subsink.sink = this.himsEndpoint.getServices(
            "all", 1, searchTerm, "").subscribe((testData: any) => {
            this.searchLoading = false;
            this.searchData = [ ...testData.filter((labTest: any) => !this.tests_included.includes(labTest.id))]
          });
        }
      }, 500);



    } else {
      // Reset relevant variables if searchTerm is empty
      this.testTerm = null;
      this.searchData = [];
      this.searchLoading = false;
    }
  }

  getPatientModel() {
    const model: any = {
      title: this.baseForm.get('title')?.value,
      name: this.baseForm.get('name')?.value,
      age: this.calculateAge(),
      dob: this.baseForm.get('dob')?.value || null,
      gender: this.baseForm.get('gender')?.value,
      attender_name: this.baseForm.get('attender_name')?.value || '',
      attender_relationship_title: this.baseForm.get('attender_relationship_title')?.value || "",
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: "",
      area: "",
      address: this.baseForm.get('address')?.value || "",
      consulting_doctor: this.baseForm.get('consulting_doctor')?.value?.id || null,
      client: parseInt(this.cookieSrvc.getCookieData().client_id),
      lab_tests: this.baseForm.get('lab_tests')?.value,
      lab_packages: this.baseForm.get('lab_packages')?.value,
      ULabPatientAge: parseInt(this.baseForm.get('ULabPatientAge')?.value),
      created_by: this.cookieSrvc.getCookieData().lab_staff_id || "",
      payment_remarks: this.baseForm.get('payment_remarks')?.value,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,

      appointment_time: this.baseForm.get('appointment_time')?.value,
      appointment_date: this.baseForm.get('appointment_date')?.value,

      appointment_type_id: this.baseForm.get('appointment_type_id')?.value

    };

    if(model.appointment_type_id == 1){
      model['case_type']= [this.baseForm.get('case_type')?.value?.id] ; 
      model.lab_tests = [] ;
    }else {

      if (this.baseForm.get('lab_tests')?.value && this.baseForm.get('lab_tests')?.value.length != 0) {
        let listArr: any = [];
        this.baseForm.get('lab_tests')?.value.forEach((test: any) => listArr.push(test.id) )
        model.lab_tests = listArr

        if(model.appointment_type_id == 3){
          model.lab_tests = listArr ;
        }else{
          model['services'] = listArr ;
          delete model.lab_tests ;
        }
      }
    
    }

    if(model.appointment_type_id == 3){

    }
    
    return model
  }

  resetForm() {
    this.baseForm.reset();
    this.initializeForm();
    this.submitted = false;
    this.testTerm = "";
    this.tests_included = [];
    this.modalService.dismissAll();
    this.changed = false;
  }

  saveAppointment() {

    const type = this.baseForm?.value?.appointment_type_id ;

    if (this.baseForm.valid && (type == 1 || ((type == 2 || type == 3) && this.baseForm?.value?.lab_tests?.length != 0))) {

      if (!this.updateBool) {
        const model = this.getPatientModel();

        this.inProgress = true;

        this.subsink.sink = this.addpatientEndpoint.postAppointMent(model).subscribe((data: any) => {
          this.inProgress = false;
          // this.baseForm.reset();
          // this.initializeForm();
          this.saved.emit({})
          this.alertService.showSuccess(`${model.name}'s appointment booked.`);
          this.modalService.dismissAll();
        }, (error) => {
          this.inProgress = false;
          this.alertService.showError(error?.error?.error || error?.error?.Error || error)
        })
      } else {
        this.updateAppointment();
      }

    } else {
      this.submitted = true;
      this.showBaseFormErrors() ;
      if((type == 2 || type == 3) && this.baseForm?.value?.lab_tests?.length == 0){
        this.alertService.showError(`Select atleast one ${type == 2 ? 'service' : 'test' }`)
      }
      
    }

  }

  updateAppointment(cancel: boolean = false) {
    const model = this.getPatientModel();
    model['id'] = this.ptn.id;
    this.inProgress = true;

    if (cancel) {
      model['is_cancelled'] = true;
      model['reason_of_cancellation'] = this.remarks;
    }

    this.subsink.sink = this.addpatientEndpoint.updateAppointMent(model).subscribe((data: any) => {
      this.inProgress = false;
      // this.getData();
      this.saved.emit({})
      this.alertService.showSuccess(`${model.name}'s appointment booked at ${this.timeSrvc.decodeTimestamp(data.appointment_time)}`);
      this.modalService.dismissAll();
    }, (error) => {
      this.inProgress = false;
      this.alertService.showError(error?.error?.error || error?.error?.Error || error)
    })
  }


  // utilities 

  changeTitle(e: any) {
    if (e.target.value === "2" || e.target.value === "3" || e.target.value === 2 || e.target.value === 3) {
      this.baseForm.get('gender')?.setValue(2);
      if (e.target.value === "2" || e.target.value === 2) {
        this.baseForm.get('attender_relationship_title')?.setValue(3);
      }
    } else if (e.target.value === 1 || e.target.value === "1" || e.target.value === 4 || e.target.value === "4" || e.target.value === 7 || e.target.value === "7" || e.target.value === 6 || e.target.value === "6") {
      this.baseForm.get('gender')?.setValue(1);
    } else if (e.target.value === 5 || e.target.value === "5") {
      this.baseForm.get('gender')?.setValue(2);
    }

  }

  changeGender(e: any) {
    if (this.baseForm.value.title !== '7' && this.baseForm.value.title !== '6' && this.baseForm.value.title !== '5') {
      if (e.target.value === 2 || e.target.value === "2") {

        if (this.baseForm.value.title !== '7') {
          this.baseForm.get('title')?.setValue(2);
        }

      } else if (e.target.value === 1 || e.target.value === "1") {
        if (this.baseForm.value.title !== '7') {
          this.baseForm.get('title')?.setValue(1);
        }

      }
    }
  }

  changeAges(e: any) {
    if (e.target.value == 4 || e.target.value == "4") {
      this.years = true;
      this.baseForm.get('age')?.clearValidators();
      this.baseForm.get('age')?.updateValueAndValidity();
      this.baseForm.get('dob')?.setValidators(Validators.required);
      this.baseForm.get('dob')?.updateValueAndValidity();
    } else {
      this.years = false;
      this.baseForm.get('age')?.setValidators(Validators.required);
      this.baseForm.get('age')?.updateValueAndValidity();
      this.baseForm.get('dob')?.clearValidators();
      this.baseForm.get('dob')?.updateValueAndValidity();
    }
  }

  calculateAge(): number {
    function getAge(dateOfBirth: string) {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    }

    if (this.years) {
      return getAge(this.baseForm.value.dob);
    }
    else {
      return this.baseForm.value.age;
    }
  }

  convertTime(timeString: any) {
    let [hours, minutes] = timeString.split(':').map(Number);
    let period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  setappointmentTypeId(id: any, removeLabTest: boolean = true){
    this.baseForm.get('appointment_type_id')?.setValue(id);

    if(removeLabTest) this.baseForm.get('lab_tests')?.setValue([]);
    this.tests_included = [] ;
    this.searchData = [] ;
    this.testTerm = "" ;

    const consultingDoctor = this.baseForm.get('consulting_doctor') ;
    if(id == 2){
      consultingDoctor?.clearValidators();
    }else{
      consultingDoctor?.setValidators(Validators.required);
    }

    const caseTypeControl = this.baseForm.get('case_type');
    if (id == 1) {
      caseTypeControl?.setValidators(Validators.required);
    } else {
      caseTypeControl?.clearValidators();
    }

    caseTypeControl?.updateValueAndValidity();
  }

  getDatesBetween(startDateStr: any, endDateStr: any) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    let dateArray = [];
    let currentDate = new Date(startDate);

    currentDate.setDate(currentDate.getDate() + 1); // Start from the day after the start date

    while (currentDate < endDate) {
      dateArray.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return dateArray;
  }

  viewVisit(e: any) {
    this.router.navigate(['/patient/view_vist/'], { queryParams: { patient_id: e.mr_no } });
  }

  addAsPatient(e: any = this.ptn) {
    this.modalService.dismissAll();
    this.router.navigate(['/patient/addpatients'], { queryParams: { apt_id: e.id } });
  }

  navPatient(details: any) {
    this.modalService.dismissAll();
    this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: details.patient } });
  }

}
