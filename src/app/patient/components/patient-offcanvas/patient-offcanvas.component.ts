import { ChangeDetectorRef, Component, Injector, Input, ViewChild,EventEmitter, Output } from '@angular/core';
import { PatientEndpoint } from '../../endpoints/patient.endpoint';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppSelectComponent } from '@sharedcommon/components/select-component/app-select.component';
import { ProEndpoint } from '../../endpoints/pro.endpoint';


let CanvaWidth : any = 100;

@Component({
  selector: 'app-patient-offcanvas',
  templateUrl: './patient-offcanvas.component.html',
  styleUrl: './patient-offcanvas.component.scss',
  animations: [
    trigger('offCanvasWidthChange', [
      state('off', style({
        width: '0',
      })),
      state('on', style({
        width: 22 + 'vw',
      })),
      transition('off <=> on', [
        animate('0.2s ease-in-out'),
      ]),
    ]),
  ]
})

export class PatientOffcanvasComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private patientEndpoint: PatientEndpoint,
    private proEndpoint: ProEndpoint,
    private router: Router,
    config: NgbDropdownConfig,
    public timeSrvc: TimeConversionService,
    private cdr: ChangeDetectorRef

  ) {
    super(injector);
    config.autoClose = false;
  }

  @Input() offCanvas: boolean = false;
  @Input() offCanvasWidth: number = 0;
  @Input() autoClosePage: boolean = false;
  @Input() is_billing: boolean = false ;

  @Output() patientSelected: EventEmitter<any> = new EventEmitter<any>() ;

  departments: any;
  filtered: boolean = false;

  testStatus: any;

  override ngOnInit(): void {


    this.statusQuery = ``;
    this.page_size = 100;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.patients = [];    

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.datePickerMaxDate = today;
  }


  open() {
    
    this.offCanvas = true;
    this.offCanvasWidth = 22;
    CanvaWidth = 22;
    this.cdr.detectChanges();  // Trigger change detection
    if(this.patients.length === 0){
      this.setToday();
      this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data: any) => {
        this.departments = data.filter((d:any)=> d.is_active)
      })
  
      this.subsink.sink = this.proEndpoint.getTestStatus().subscribe((data:any)=>{
        this.testStatus = data.filter((d:any)=> d.is_active)
      })
    }
  }

  openSM() {
    
    this.offCanvas = true;
    this.offCanvasWidth = 87;
    CanvaWidth = 87;
    this.cdr.detectChanges();  // Trigger change detection
    if(this.patients.length === 0){
      this.setToday();
      this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data: any) => {
        this.departments = data.filter((d:any)=> d.is_active)
      })
  
      this.subsink.sink = this.proEndpoint.getTestStatus().subscribe((data:any)=>{
        this.testStatus = data.filter((d:any)=> d.is_active)
      })
    }
  }


  @ViewChild('myDrop') myDrop!: NgbDropdown;

  closeCanvas() {
    this.offCanvas = false;
    this.offCanvasWidth = 0;
    this.myDrop.close();
  }

  shakeCanvas() {
    // Toggle between hover and closed states rapidly to create a jerk effect
    const interval = setInterval(() => {
      this.openHover();
      setTimeout(() => {
        this.closeCanvas();
        clearInterval(interval);
      }, 300); // Adjust the duration of each state to control the speed of the jerk
    }, 200); // Adjust the interval between each toggle to control the frequency of the jerk
  }
  

  mouseHover: boolean = false;
  openHover() {
    this.mouseHover = true;
    this.offCanvas = true;
    this.offCanvasWidth = 22;
  }

  hoverClose() {
    this.mouseHover = false;
    this.closeCanvas();
  }

  statusQuery: any;
  datePickerMaxDate: any;
  count!: number;
  all_count!: number;
  patients!: any;
  date: string = this.timeSrvc.getTodaysDate();
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  page_size: any = 100;
  page_number!: any;
  query!: string;
  sort: any = false;
  pageLoading: boolean = false

  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }

  dept: string = "";

  selectDepartment(e: any) {
    let q = "";
    e.forEach((data: any) => q += data.id.toString() + ",")
    this.dept = e.length !== 0 ? q.replace(/,\s*$/, '') : '';

    this.getData();
  }

  selectTest(e:any){
    let q = "&status_id=";
    e.forEach((data: any) => q += data.id.toString() + ",")
    this.statusQuery = e.length !== 0 ? q.replace(/,\s*$/, '') : '';

    this.getData();
  }

  getData() {
    this.pageLoading = true;
    this.checkFilters();
    this.patients = [] ;
    this.subsink.sink = this.patientEndpoint.getPaginatedPatients(
      this.page_size, this.page_number,
      this.statusQuery, this.dept, this.query,
      this.date, this.from_date, this.to_date, this.sort
    ).subscribe((data: any) => {

      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data?.results || data;
    })
  }

  loadMore() {
    if (this.all_count > this.patients.length) {
      this.page_size = this.page_size + 100;
      this.getData();
    } else if (this.all_count == this.patients.length) {
      this.page_size = this.all_count;
      this.alertService.showError("No More Patients to Show")
    } else if (this.all_count < this.patients.length) {
      this.page_size = this.all_count;
      this.getData();
    }
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();

    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
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
      this.date = "";
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


  concatenateShortCodes(item:any) {
    let index = 0 ;
    let shortForm = ''
    item.lab_tests.lab_tests.forEach((test:any)=>{
      shortForm += test.name + ', ';
      index = index + 1 ;
    })

    item.lab_packages.forEach((pkg:any)=>{
      pkg.lab_tests.forEach((test:any)=>{
        shortForm += test.name + ', ';
        index = index + 1 ;
      })
    })

    if(this.is_billing){
      item.doctor_consultation?.consultations?.forEach((doc:any)=>{
        index = index + 1 ;
      })
  
      item.services?.services?.forEach((doc:any)=>{
        index = index + 1 ;
      })
    }


    return index
  }



  SR_start_date: any;
  SR_end_date: any;
  SR_staff: any;
  SR_template: any;
  title: string = "";
  viewPrintLoading: boolean = false;
  printLoading: boolean = false;

  setToday() {

    this.SR_start_date = "";
    this.SR_end_date = "";
    this.from_date = "";
    this.to_date = "";
    this.date =  this.timeSrvc.getTodaysDate();
    this.filtered = true;

    this.getData();
  }

  setYesterday() {

    this.SR_start_date = "";
    this.SR_end_date = "";
    this.from_date = "";
    this.to_date = "";
    this.date =  this.timeSrvc.getYesterdayDate() ;

    this.page_size = 100;
    this.filtered = true;
    this.getData();
  }

  setSevenDays() {

    this.date = "" ;

    this.SR_start_date = this.timeSrvc.getLast7Days()?.startDate;
    this.SR_end_date = this.timeSrvc.getLast7Days()?.endDate;

    this.from_date = this.timeSrvc.getLast7Days()?.startDate;
    this.to_date = this.timeSrvc.getLast7Days()?.endDate;
    this.page_size = 100;

    this.getData();

  }

  set_shiftReport_start_date(e: any) {
  
    this.SR_start_date = "";
    this.SR_end_date = "";
    this.from_date = "";
    this.to_date = "";
    this.date =  "" ;

    this.SR_start_date = e.srcElement.value;

    this.from_date = e.srcElement.value;
    this.to_date = "";

    this.page_number = 1 ;
    this.patients = [] ;

    this.alertService.showInfo("Select End Date.") ;

  }

  set_shiftReport_end_date(e: any) {
    this.SR_end_date = e.srcElement.value;
    this.to_date = e.srcElement.value;
    this.page_size = 100;

    this.filtered = true ;
    
    this.getData();
  }

  checkFilters() {
    if (this.dept !== "" || this.from_date !== "" || this.to_date !== "" || this.date !== "" || this.statusQuery !== '' ) {
      this.filtered = true ;
    } else {
      this.filtered = false;
    }
  }

  @ViewChild(AppSelectComponent) selectComp!: AppSelectComponent;
  @ViewChild('selectStatus') selectStatus!: AppSelectComponent;
  
  // @ViewChildren('filterDrop') filterDrop: any;
  clearDates(call: boolean = false) {

    this.SR_start_date = "";
    this.SR_end_date = "";
    this.from_date = "";
    this.to_date = "";
    this.page_size = 100;
    if(call) this.getData();
  }

  clearAllFilters() {
    this.selectComp.clearAll();
    this.selectStatus.clearAll();
    this.SR_start_date = "";
    this.SR_end_date = "";
    this.from_date = "";
    this.to_date = "";
    this.date =  this.timeSrvc.getTodaysDate();
    this.page_size = 100;
    this.page_number = 1 ;
    this.getData();
  }

  showPatientEvent = new EventEmitter<any>();
  showPatient(details: any) {
    this.autoClosePage ? this.closeCanvas() : null;
    // this.patientSelected.emit(details.id);
    const url = this.is_billing ? '/billing/patientbilling/' : '/patient/patient_standard_view/'
    this.router.navigate([url], { queryParams: { patient_id: details.id } });
  }

}
