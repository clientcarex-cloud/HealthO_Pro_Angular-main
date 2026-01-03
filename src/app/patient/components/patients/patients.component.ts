import { Component, Injector, Input } from '@angular/core';
import { PatientsService } from '../../services/patients.service';
import { Patient } from '../../models/patients/patient.model';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PatientEndpoint } from '../../endpoints/patient.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { NgbDropdownConfig, } from '@ng-bootstrap/ng-bootstrap';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { HospitalEndpoint } from 'src/app/doctor/endpoint/hospital.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
})

export class PatientsComponent extends BaseComponent<Patient> {

  @Input() patientStatuses: any = ['all', 'pending', 'processing', 'emergency', 'completed', 'cancelled']

  @Input() allName: any = "All" ;

  @Input() is_cms: boolean = false;

  @Input() viewAppointmentsOption: boolean = false ;
  @Input() estimatePrice : boolean = true ;
  @Input() addPatientOption: boolean = true ;
  @Input() shiftReportOption: boolean = true ;

  @Input() showTests: boolean = true;
  @Input() showServices: boolean = false;
  @Input() showDocCons: boolean = false;
  @Input() showMeds: boolean = false;
  @Input() showRooms: boolean = false;

  @Input() showNavBar: boolean = true;
  @Input() showDeptFilter: boolean = true;

  @Input() showAppointmentColumn: boolean = false; // used in prescription page 
  @Input() addPrescription: boolean = false;

  @Input() extraStatusQuery: string = "";

  @Input() routeUrl: string = "/patient/patient_standard_view/";
  @Input() addText = "Add New Patient" ;

  selectedPatient: any = null;
  selectedConsultation: any = null;


  total: any;
  isCollapsed: boolean = true;
  activeId: any = null;
  typeId: any = 1;
  activeButton: string | null = 'all';
  pageLoading: boolean = false;
  b_id: any;

  orderStatus: any = {
    all: false,
    pending: false,
    processing: false,
    emergency: false,
    completed: false,
    cancelled: false
  };

  toggleAccordionnn(id: any, type: any): void {
    this.typeId = type;
    this.activeId = this.activeId === id ? null : id;
  }

  setStatus(buttonId: string) {
    this.activeButton = buttonId;

    switch (this.activeButton) {
      case 'all':
        this.statusQuery = `&status_id=1,2,4,5,6,10,11,14,15,16,18,21,12,13,3`;
        break;
      case 'pending':
        this.statusQuery = `&status_id=1,10,12,14,16`;
        break;
      case 'processing':
        this.statusQuery = `&status_id=2,4,6,15`;
        break;
      case 'completed':
        this.statusQuery = `&status_id=3,7,13,17`;
        break;
      case 'cancelled':
        this.statusQuery = `&status_id=21`;
        break;
      case 'emergency':
        this.statusQuery = `&status_id=10,11,12,13,19`;
        break;
      default:
        break;
    }

    this.page_number = 1;
    this.getData();
  }

  constructor(
    injector: Injector,
    config: NgbDropdownConfig,
    private router: Router,
    private endPoint: PatientEndpoint,
    private hospitalEndpoint: HospitalEndpoint,
    private staffEndpoint: StaffEndpoint,
    private cookieSrvc: CookieStorageService,
    public service: PatientsService,
    public timeSrvc: TimeConversionService,
    private printSrvc: PrintService
  ) {
    super(injector);
    config.autoClose = false;
  }

  getDate() {
    const today = new Date();
    return today;
  }

  private statusQuery!: string;
  departments: any;
  staffs: any = [];
  user_permissions: any = {
    sa: false,
    loading: false,
    permissions: []
  }

  override ngAfterViewInit(): void {
    this.patientStatuses.forEach((status: any) => {
      this.orderStatus[status] = true;  // Set each status as a property with the value `true`
    });

    if (this.user_permissions.sa) {
      this.user_permissions.loading = true;

      this.subsink.sink = this.staffEndpoint.getAllStaff().subscribe((res: any) => {
        this.user_permissions.loading = false;
        this.staffs = res;
      })
    }

  }

  override ngOnInit(): void {
    this.b_id = this.cookieSrvc.getCookieData().b_id;

    this.statusQuery = `&status_id=1,2,4,5,6,10,11,14,15,16,18,21,12,13,3`;
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.patients = [];
    this.date = this.timeSrvc.getFormattedDate();
    this.getData();

    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
      this.departments = data.filter((d: any) => d.is_active)
    });


    if (!this.cookieSrvc.getCookieData().is_superadmin) {

      this.subsink.sink = this.staffEndpoint.getStaffPatientsPermissions(this.cookieSrvc.getCookieData().lab_staff_id).subscribe((data: any) => {

        if (data.length == 0) {
          this.user_permissions.permissions = [];
        } else {
          this.user_permissions.permissions = data[0].permissions;
        }
      })
    } else {
      this.user_permissions.sa = true
    }

  }

  count!: number;
  all_count!: number;
  patients!: any;
  date: string = this.timeSrvc.getTodaysDate();
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
    this.patients = [];

    this.pageLoading = true;

    
    this.subsink.sink = this.endPoint.getPaginatedPatients(
      this.page_size, this.page_number,
      this.statusQuery, this.dept, this.query,
      this.date, this.from_date, this.to_date, this.sort, this.staffQuery, this.extraStatusQuery
    ).subscribe((data: any) => {

      this.patients = data?.results || data;
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;

      if(!this.addPrescription) this.getEmergencyCount();
      
    }, (error) => {
      this.alertService.showError('Unable to fetch patients data.', error?.error?.Error || error?.error || error );
    })
  }

  emergencyCount: number = 0;

  getEmergencyCount() {
    this.subsink.sink = this.endPoint.getPaginatedPatients(
      1, 1,
      `&status_id=10,11,12,13,19`, this.dept, this.query,
      this.date, this.from_date, this.to_date, false
    ).subscribe((data: any) => {
      this.emergencyCount = data.count;
    })
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.page_size = 10;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData();
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
        // this.page_size = 10;
        this.getData();
      }
    }
    else {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      // this.page_size = 10;
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
    if (item.lab_tests.lab_tests.length > 0) {
      item.lab_tests.lab_tests.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    if (item.lab_packages.length > 0) {
      item.lab_packages.forEach((pkg: any) => {
        pkg.lab_tests.forEach((test: any) => {
          shortForm += test.name + ', '
        })
      })
    }

    return shortForm.slice(0, -2)
  }

  concatenateMedicines(item: any) {
    let shortForm = ''
    if (item.medicines.medicines.length > 0) {
      item.medicines.medicines.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    return shortForm.slice(0, -2)
  }

  concatenateRooms(item: any) {
    let shortForm = ''
    if (item.booked_rooms.rooms.length > 0) {
      item.booked_rooms.rooms.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    return shortForm.slice(0, -2)
  }

  concatDoctors(item: any) {
    let shortForm = ''
    if (item.doctor_consultation?.consultations?.length > 0) {
      item.doctor_consultation?.consultations?.forEach((test: any) => {
        shortForm += test.consultation.labdoctors.name + ', '
      })
    }

    return shortForm
  }

  concatServices(item: any) {
    let shortForm = ''
    if (item.services.services?.length > 0) {
      item.services.services?.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    return shortForm
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
    if(e){
      this.staffQuery = `&labstaff_id=${e?.id}`;
    }else{
      this.staffQuery = '';
    }

    this.getData();
  }


  testSearchBox(e: any) {
    this.service.onSearchTermUpdate(e)
  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop });
  }

  checkEmergency(e: any) {
    return e.toLowerCase().includes("emergency") || e.toLowerCase().includes("urgent")
  }


  getPackagesLength(item: any[]) {
    let count = 0;
    item.forEach((pkg: any) => {
      if (pkg.lab_tests && pkg.lab_tests.length > 0) {
        count += pkg.lab_tests.length;
      }
    });
    return count;
  }

  addPatient(){
    if(this.is_cms){

      if(this.addText.includes("Out")){
        this.router.navigate(['/billing/addnewconsultation'], { queryParams: { type: 2 } });
      }else if(this.addText.includes("In")){
        this.router.navigate(['/billing/addnewconsultation'], { queryParams: { type: 1 } });
      }else if(this.addText.includes("New")){
        this.router.navigate(['/billing/addnewconsultation']);
      }

    }else{
      this.router.navigate(['/patient/addpatients']);
    }
  }

  showPatient(details: any) {
    const url = this.is_cms ? '/billing/patientbilling/' : '/patient/patient_standard_view/'
    this.router.navigate([this.routeUrl], { queryParams: { patient_id: details.id } });
  }

  viewVisit(e: any) {
    this.router.navigate(['/patient/view_vist/'], { queryParams: { patient_id: e.mr_no } });
  }

  addVisitPatient(e: any) {
    this.router.navigate(['/patient/addpatients'], { queryParams: { patient_id: e.mr_no } });
  }

  printPrescription(model: any, onlyContent: boolean = false) {

    this.subsink.sink = this.hospitalEndpoint.postPrintPrescription(model).subscribe((res: any) => {
      if (res?.html_content) {
        // this.printSrvc.printHeader(res.html_content, res.header, false, 1000)
        if(onlyContent){
          this.printSrvc.printHeader('', res.header, false, 1000)
        }else{
          this.printSrvc.printHeader(res.html_content, res.header, false, 1000)
        }
        // this.printSrvc.printer(res?.html_content, false, false, 300);
        this.modalService.dismissAll();
      }
    }, (error) => {
      this.showAPIError(error);
    })

  }
}
