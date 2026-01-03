import { Component, Injector, Input, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { Router } from '@angular/router';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import { LabtechnicianComponent } from 'src/app/labtechnician/components/labtechnician/labtechnician.component';
import { LabTechnicianEndpoint } from 'src/app/labtechnician/endpoints/labtechnician.endpoint';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileService } from '@sharedcommon/service/file.service';

@Component({
  selector: 'app-sourcing-patients',
  templateUrl: './patients.component.html',
})

export class PatientsComponent extends BaseComponent<any> {


  @ViewChild('labTechnician') labTechnician!: LabtechnicianComponent ;
  @Input() ref_lab : any = null ;

  total:any;
  isCollapsed: boolean = true;
  activeId: any = null;

  activeButton: string | null = 'all';
  activeClass: string = '';

  patientsLength:number = 0;
  dataPatients!: any;
  pageLoading:boolean = false;

  settings: any = {
    header_height: 0,
    footer_height: 0,
    margin_left: 45,
    margin_right: 45,
    display_page_no: false,
    display_letterhead: false,
    letterhead: '#fff',
    font: null
  };

  bg_img: any = "#fff";

  show_letterhead: boolean = false;

  toggleAccordionnn(id: any): void {
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
    private router : Router,
    private signupEndpoint: SignUpEndpoint,
    private labtechnicianEndpoint: LabTechnicianEndpoint,
    private endPoint: OutsourcingEndpoint,
    private printSrvc: PrintService,
    private cookieSrvc: CookieStorageService,
    public timeSrvc: TimeConversionService,
    private spinner: NgxSpinnerService,
    private fileSrvc: FileService
  ){
    super(injector);
		config.autoClose = false;
  }

  getDate(){
    const today = new Date();
    return today;
  }

  private statusQuery! : string;

  selected_patient: any = null ;


  departments: any ;
  staffs: any = [];
  b_id: any ;
  collabs: any;

  count!: number ;
  all_count!: number;
  patients!:any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any; 
  page_size: any = 10;
  page_number : any = 1;
  query:string = "";
  sort : any = false;
  sourcing_lab: any = "";

  override ngAfterViewInit(): void {

    if(!this.ref_lab){
      this.getCollabs();
    }else{
      this.ref_lab['organizationName'] = this.ref_lab?.organization_name || this.ref_lab?.partner?.organization_name ; 
      this.selectCollab(this.ref_lab);
      this.setLetterheadSettings([this.ref_lab?.letterhead_settings])
    }
  }

  override ngOnInit(): void {   
    this.date = this.timeSrvc.getTodaysDate();
    this.b_id = this.cookieSrvc.getCookieData().b_id;
  }



  getCollabs(){
    this.subsink.sink = this.endPoint.getPartnerships(
      '','intiator=', this.b_id, 'all', '1', true
    ).subscribe((res: any)=>{
      this.collabs = res;

      this.collabs.forEach((collab: any)=>{
        collab['organizationName'] = collab.partner.organization_name ;
      })

      // this.collabs = this.collabs.filter((collab: any) => collab.initiator == this.b_id);

    });
  }


  selectCollab(e: any){
    if(e && e!=''){
      this.sourcing_lab = null ;
      
      setTimeout(()=>{
        
      this.sourcing_lab = e;
      
      this.date = this.timeSrvc.getTodaysDate() ;
      this.from_date = "" ;
      this.to_date = "" ;
      this.query = "";
      this.sort = false ;
      this.patients = [];
      this.pageLoading = true;

      this.subsink.sink = this.endPoint.getSourcingPatients(
        this.sourcing_lab.id,
        this.query, this.page_size, this.page_number,
          this.date, this.from_date, this.to_date, this.sort
          ).subscribe((data:any)=>{
          
        this.pageLoading = false;
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        this.patients = data.results ;
  
      }, (error: any)=>{

        this.pageLoading = false;
        this.sourcing_lab.id = null;
        this.alertService.showError(error?.error?.Error);
        
      })

      }, 100)

    }else{
      this.sourcing_lab = null;
      this.date = this.timeSrvc.getTodaysDate() ;
      this.from_date = "" ;
      this.to_date = "" ;
      this.query = "";
      this.sort = false ;
      this.patients = [];
    }
  }
  
  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }

  

  getData(){
    this.patients = [];
    this.pageLoading = true;
    this.subsink.sink = this.endPoint.getSourcingPatients(
      this.sourcing_lab.id,
      this.query, this.page_size, this.page_number,
        this.date, this.from_date, this.to_date, this.sort
        ).subscribe((data:any)=>{
        
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data.results ;

    }, (error: any)=>{
      this.pageLoading = false;
      this.alertService.showError(error?.error?.Error)
    })
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e:any){
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData()
  }

  onPageChange(e:any){
    this.page_number=e;
    this.getData();
  }

  getRangeValue(e:any){
    if(e.length !== 0){
      if(e.includes("to")){
        this.separateDates(e);
      }else{
        this.date = e;
        this.from_date = "";
        this.to_date = "" ;
        this.page_number = 1;
        this.getData();
      }}
      else{
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
    this.to_date = endDate ;
    this.date = "";
    this.page_number = 1;
    this.getData();
  }

  concatenateShortCodes(item:any) {
    let shortForm = ''
    if(item.lab_tests.lab_tests.length > 0){
      item.lab_tests.lab_tests.forEach((test:any)=>{
        shortForm += test.name + ', '
      })
    }

    if(item.lab_packages.length > 0){
      item.lab_packages.forEach((pkg:any)=>{
        pkg.lab_tests.forEach((test:any)=>{
          shortForm += test.name + ', '
        })
      })
    }

    return shortForm.slice(0, -2)
  }
  

  showPatient(details: any){
    this.router.navigate(['/patient/patient_standard_view/'], { queryParams: {patient_id: details.id}});
  }



  openXl(content: any, sz:string = 'lg', cntrd:boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop});
  }

  checkEmergency(e:any){
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
  

  viewVisit(e: any) {
    this.router.navigate(['/patient/view_vist/'], { queryParams: { patient_id: e.mr_no } });
  }

  addVisitPatient(e:any){
    this.router.navigate(['/patient/addpatients'], { queryParams: {patient_id: e.mr_no}});
  }

  printReport(item: any, test: any, show_header: boolean, download : boolean){
    if(this.sourcing_lab?.is_referral_lab && this.sourcing_lab?.initiator != null){
      this.printLabReport(item, test, show_header)
    }else{
      this.printSourcingReport(item, test, show_header, download);
    }
  }


  printSourcingReport(patient: any, test: any, show_header: boolean, download: boolean){
  
    this.spinner.show();

    test['printLoading'] = true ;

    this.subsink.sink = this.endPoint.getTestReport(this.sourcing_lab.id, patient.id, test.id, show_header).subscribe((res: any)=>{
    
      if(!download){
        if(!(this.ref_lab && this.ref_lab?.letterhead_settings)){
          this.printSrvc.printHeader(res.html_content, res.header, false);
        }else{
          this.settings.display_letterhead = show_header;
          this.printSrvc.previewIframe(res.html_content, res.header, this.settings, this.bg_img, false);
        }
      }else{
        this.fileSrvc.downloadFile(res?.link_pdf, `${patient.name}.pdf`);
      }

      setTimeout(() => test['printLoading'] = false , 900);

    }, (error)=>{
      test['printLoading'] = false ;
      this.alertService.showError(error?.error?.error || error?.error?.Error || error)
    })
  }




  printLabReport(patient: any, test: any, show_header: boolean){
  
    test['printLoading'] = true ;
    
    const details = {
      test_id: test.technician.LabPatientTestID.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.subsink.sink = this.labtechnicianEndpoint.printReport(details).subscribe((res: any) => {
      this.printSrvc.printHeader(res.html_content, res.header, false, 1000, );
      // this.settings.display_letterhead = show_header;
      // this.printSrvc.previewIframe(res.html_content, res.header, this.settings, this.bg_img, false);

      setTimeout(() => {
        test['printLoading'] = false ;
      }, 900);
    }), (error: any) => {
      test['printLoading'] = false ;
      this.alertService.showError("Oops", "Failed to print the report")
    }


  }

  


  // utilities /

  setLetterheadSettings(set: any){
    if(set && set!= ""){
      this.settings['header_height'] = set[0].header_height;
      this.settings['footer_height'] = set[0].footer_height;
      this.settings['margin_left'] = set[0].margin_left;
      this.settings['margin_right'] = set[0].margin_right;
      this.settings['display_letterhead'] = set[0].display_letterhead;
  
      this.show_letterhead = set[0].display_letterhead;
  
      this.settings.display_page_no = set[0].display_page_no;
      this.bg_img = set[0]?.letterhead;
  
      if (set[0].letterhead && set[0].letterhead == '') {
        this.settings.letterhead = set[0].letterhead;
        this.bg_img = set[0].letterhead;
      }
    }
  }

  async createReport(item: any){
    item['isLoading'] = true ;
    try{
      const reponse  = await this.labTechnician.updateReceiveForSourcingPatientTest(item) ;
      item['isLoading'] = false ;
      this.getData();
    }catch(error){
      item['isLoading'] = false ;
      this.getData();
    }
  }

  async draftReport(item: any){
    // this.labTechnician.openDraftReport(item.technician.id);
    item['isLoading'] = true ;
    try{
      const response = await this.labTechnician.loadPatientList(item.technician.id);
      this.labTechnician.reportModal(null, response);
      item['isLoading'] = false ;
      this.getData();
    }catch(error){
      item['isLoading'] = false ;
      this.getData();
    }
  }

  reportSaved(e: any){
    this.getData();
  }

}