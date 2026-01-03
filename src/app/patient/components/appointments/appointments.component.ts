import { Component, Injector, Input, ViewChild } from '@angular/core';
import { PatientsService } from '../../services/patients.service';
import { Patient } from '../../models/patients/patient.model';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PatientEndpoint } from '../../endpoints/patient.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { NgbDropdownConfig, } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerSectionComponent } from '@sharedcommon/components/datepicker-section/datepicker-section.component';
import { ProEndpoint } from '../../endpoints/pro.endpoint';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})

export class AppointmentsComponent extends BaseComponent<Patient> {


  @ViewChild('addAppointment') addAppointment: any;
  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;
  @ViewChild(DatepickerSectionComponent) dateSection!: any;

  @Input() fromPatientsPage: boolean = false ;

  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }

  updateBool: boolean = false;
  isCollapsed: boolean = true;
  new: boolean = true;
  pageLoading: boolean = false;
  years: boolean = false;
  selectedMessageType: any = null ;
  alertloading : boolean = false ;

  ptn: any;
  total: any;
  titles: any;
  genders: any;
  ages: any;
  departments: any;

  activeId: any = null;
  activeButton: string | null = 'all';
  activeClass: string = '';
  patientsLength: number = 0;
  dataPatients!: Patient[];


  currentDate!: Date;

  private statusQuery!: string;

  user_permissions: any = {
    sa: false,
    loading: false,
    permissions: []
  }

  msgTypes: any = [
    { id: 1, name : 'SMS'}, 
    { id: 2, name : 'WhatsApp' }
  ]

  selected_appointments: any = [] ;
  staffs: any = [];

  constructor(
    injector: Injector,
    config: NgbDropdownConfig,

    private router: Router,

    public service: PatientsService,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,

    private endPoint: PatientEndpoint,
    private proEndpoint: ProEndpoint,
    private signupEndpoint: SignUpEndpoint,
    ) {
    super(injector);
    config.autoClose = false;
  }

  getDate() {
    const today = new Date();
    return today;
  }

  override ngAfterViewInit(): void {

  }

  setStatus(buttonId: string) {
    this.activeButton = buttonId;

    switch (this.activeButton) {
      case 'all':
        this.statusQuery = ``;
        break;
      case 'checkin':
        this.statusQuery = `&appointment=check_in`;
        break;
      case 'cancelled':
        this.statusQuery = `&is_cancelled=true`;
        break;
      case 'missed':
        this.statusQuery = `&patient_null=true`;
        break;
      case 'paid':
        this.statusQuery = `&appointment=paid&status_id=3,7,13,17`;
        break;

      default:
        break;
    }

    this.patients = [];
    this.page_number = 1;
    this.date = this.timeSrvc.getTodaysDate();
    this.page_size = 10;
    this.getData();
  }

  healthCareRegistry: any = 1;
  navUrl: string = "/billing/addnewconsultation";


  override ngOnInit(): void {


    this.selectedMessageType = this.msgTypes[0] ;
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.patients = [];
    this.date = this.timeSrvc.getFormattedDate();
    this.getData();

    this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.healthCareRegistry = data[0].provider_type ;
      if(this.healthCareRegistry == 2){
        this.navUrl = "/billing/addnewconsultation";
      }else{
        this.navUrl = "/patient/addpatients" ;
      }
    })

    this.currentDate = new Date() || '';

    this.subsink.sink = this.proEndpoint.getTitle().subscribe((data: any) => {
      this.titles = data
    });

    this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
      this.genders = data.results.sort((a: any, b: any) => a.id - b.id);
    });

    this.subsink.sink = this.proEndpoint.getAges().subscribe((data: any) => {
      this.ages = data.results;
    });

  }


  // datePickerMaxDate: any;
  count!: number;
  all_count!: number;
  patients!: any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  page_size: any = 10;
  page_number: any = 1;
  query: string = "";
  sort: any = false;

  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }

  getData() {
    if (this.page_size > 49) {
      this.patients = [];
    }

    this.selected_appointments = [] ;
    this.pageLoading = true;

    if (this.activeButton == 'all' || this.activeButton == 'cancelled' || this.activeButton == 'missed') {
      this.subsink.sink = this.endPoint.getAppointments(
        this.page_size, this.statusQuery, this.page_number,
        this.query,
        this.date, this.sort
      ).subscribe((data: any) => {

        this.pageLoading = false;
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        this.patients = data.results;

      })
    } else {
      this.subsink.sink = this.endPoint.getPaginatedPatients(
        this.page_size, this.page_number, this.statusQuery, "", this.query, this.date, "", "", this.sort, ""
      ).subscribe((data: any) => {
        this.pageLoading = false;
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        this.patients = data.results;
      })
    }

  }

  emergencyCount: number = 0;

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData()
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  getRangeValue(e: any) {
    if (e.length !== 0) {
      if (e.includes("to")) {
        this.separateDates(e);
      } else {
        this.date = e;
        this.from_date = "";
        this.to_date = "";
        this.page_number = 1;
        this.getData();
      }
    }
    else {
      this.date = this.timeSrvc.getTodaysDate();
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();
    }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate;
    this.date = "";
    this.page_number = 1;
    this.getData();
  }

  concatenateShortCodes(item: any) {
    let shortForm = ''
    if (item.tests && item.tests.length > 0) {
      item.tests.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    if (item?.lab_tests?.lab_tests && item?.lab_tests?.lab_tests.length > 0) {
      item.lab_tests.lab_tests.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    // if (item.lab_tests && item.lab_tests.length > 0) {
    //   item.lab_tests.forEach((test: any) => {
    //     shortForm += test.name + ', '
    //   })
    // }

    if (item.services && item.services.length > 0) {
      item.services.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    if (item?.lab_packages && item?.lab_packages?.length > 0) {
      item.lab_packages.forEach((pkg: any) => {
        pkg.lab_tests.forEach((test: any) => {
          shortForm += test.name + ', '
        })
      })
    }

    return shortForm.slice(0, -2)
  }


  dept: string = "";
  i: number = 0;
  selectDepartment(e: any) {
    let q = "";
    e.forEach((data: any) => q += data.id.toString() + ",")
    this.dept = e.length !== 0 ? q.replace(/,\s*$/, '') : '';
    this.getData();
  }


  staffQuery: string = "";

  selectStaff(e: any) {
    this.staffQuery = e?.id
    this.getData();
  }

  testSearchBox(e: any) {
    this.service.onSearchTermUpdate(e)
  }

  // apt: boolean = false;
  // changed: boolean = false;
  // disableDates: any = [];


  checkEmergency(e: any) {
    return e.toLowerCase().includes("emergency") || e.toLowerCase().includes("urgent")
  }


  getPackagesLength(item: any[]) {
    let count = 0;
    if (item.length != 0) {
      item.forEach((pkg: any) => {
        if (pkg.lab_tests && pkg.lab_tests.length > 0) {
          count += pkg.lab_tests.length;
        }
      });
    }

    return count;
  }

  sendAlert(){
    if(this.selected_appointments.length != 0 && this.selectedMessageType){
      this.alertloading = true ;

      const model = {
        appointment_ids : this.selected_appointments,
        type: this.selectedMessageType.id
      }

      this.subsink.sink = this.endPoint.postForAlert(model).subscribe((res: any)=>{
        this.alertService.showSuccess("Message sent successful.") ;
        this.alertloading = false ;
        this.selected_appointments = [] ;
      }, (error)=>{
        this.alertloading = false ;
        this.alertService.showError(error?.error?.Error || error?.error?.error || error );
      })

    }else{
      if(this.selected_appointments.length == 0) this.alertService.showInfo("Select atleast one appointment.") ;
      if(!this.selectedMessageType) this.alertService.showInfo('Select Message Type')
    }
  }



  // utilities

  addOrRemoveApt(boolVal: boolean , id: number){
    if(boolVal){
      if(!this.selected_appointments.includes(id)) this.selected_appointments.push(id) ; 
    }else{
      if(this.selected_appointments.includes(id)) this.selected_appointments = this.selected_appointments.filter((item: any)=> item.id == id) ;
    }
  }

  selectAllAppointments(boolVal: boolean){
    this.selected_appointments = [] ;
    if(boolVal){
      this.patients.forEach((ptn: any)=>{
        this.selected_appointments.push(ptn.id);
      })
    }
  }

  isApppointmentSelected(id: number){ 
    return this.selected_appointments.includes(id);
  }

  MessageType(event: any){
    this.selectedMessageType = event && event != '' ? event : null
  }

  convertTime(timeString: any) {

    let [hours, minutes] = timeString.split(':').map(Number);
    let period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  viewVisit(e: any) {
    this.router.navigate(['/patient/view_vist/'], { queryParams: { patient_id: e.mr_no } });
  }

  addAsPatient(e: any = this.ptn) {
    this.modalService.dismissAll();
    let url = '';
    if(this.fromPatientsPage) url = this.navUrl ;
    else{ url = "/patient/addpatients" }
    this.router.navigate([this.navUrl], { queryParams: { apt_id: e.id } });
  }

  showPatient(ptn: any, view: any = null, apt: boolean = false) {
    if(!this.fromPatientsPage){
      this.updateBool = true;
      this.ptn = ptn;
      this.openXl(this.addAppointment, 'lg', true,)
    }
  }

  navPatient(details: any) {
    this.modalService.dismissAll();
    let url = '';
    if(this.fromPatientsPage) url = "/billing/patientbilling/" ;
    else{ url = "/patient/patient_standard_view/"}
    this.router.navigate([url], { queryParams: { patient_id: details.patient } });
  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop, backdrop: 'static', keyboard: false, });
  }


}
