import { Component, Injector, ViewChild, } from '@angular/core';
import { Result } from '../../model/results.model';
import { Phlebotomist } from '../../model/phlebotomist.model';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PhlebotomistEndpoint } from '../../endpoint/phlebotomist.endpoint';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { DatepickerSectionComponent } from '@sharedcommon/components/datepicker-section/datepicker-section.component';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-phlebotomists',
  templateUrl: './phlebotomists.component.html',
  styleUrls: ['./phlebotomists.component.scss']
})
export class PhlebotomistsComponent extends BaseComponent<Result> {

  constructor(
    private endPoint: PhlebotomistEndpoint,
    injector: Injector,
    public timeSrvc: TimeConversionService,
    public printSrvc: PrintService,
    private cookieSrvc: CookieStorageService,
    private patientEndpoint: PatientEndpoint,
    private staffEndpoint: StaffEndpoint
  ) {
    super(injector);
  }

  activeButton: string = "pending";

  setActiveButton(id: string) {
    this.activeButton = id;
  }

  
  // auto_print: any ;

  statusQuery: any;

  setStatus(buttonId: string) {
    this.activeButton = buttonId;

    switch (this.activeButton.toLowerCase()) {
        case 'all':
            this.statusQuery = "&status_id=1,5,10,14,18,19,20,21";
            break;
        case 'pending':
            this.statusQuery = "&status_id=1,5,10,14";
            break;
        case 'samplecollected':
            this.statusQuery = "&status_id=18,19,20";
            break;
        case 'emergency':
            this.statusQuery = "&status_id=10,14";
            break;
        case 'cancelled':
          this.statusQuery = "&status_id=21";
          break;
        default:
            break;
    }

    this.page_number = 1;
    this.getData();
}

  staffId!: number;
  departments: any ;
  defaultDept: any = '';
  print_permissons: any ;

  override ngOnInit(): void {
    this.statusQuery = "&status_id=1,5,10,14";

    this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data:any)=>{
      this.departments = data.filter((d: any) => d.department_flow_type != "Transcriptor" && d.is_active)

      const preSelect = this.departments.filter((d: any) => d.department_flow_type != "Transcriptor" && d.is_active)

      let q = "";
      preSelect.forEach((data: any) => q += data.id.toString() + ",")
      this.dept = preSelect.length !== 0 ? q.replace(/,\s*$/, '') : '';
      this.defaultDept = this.dept;
      const staffData = this.cookieSrvc.getCookieData();
      this.staffId = staffData.lab_staff_id;

      this.getData()
    }, (error)=>{
      
    })

    this.subsink.sink = this.staffEndpoint.getStaffPrintControls(this.cookieSrvc.getCookieData().lab_staff_id).subscribe((res: any)=>{      
      this.print_permissons = res[0];
    })

  }

  count!: number;
  all_count!: number;
  patients!: any;
  date: string = this.timeSrvc.getTodaysDate();
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  sort:any = true;

  page_size: any = 10;
  page_number: any = 1;
  query: string = "";
  emergencyCount: any ;
  dept:string = "";
  pageLoading: any;

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;
  getData() {
    this.pageLoading = true ;
    this.patients = [] ;
    this.subsink.sink = this.endPoint.getPhlebotomists(
      this.page_size, this.page_number,
      this.statusQuery, this.query, this.dept,
      this.date, this.from_date, this.to_date, this.sort
    ).subscribe((data: any) => {
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data.results;
      this.getEmergencyCount();
    })
  }



  selectDepartment(e:any){
    let q = "";
    e.forEach((data:any)=> q += data.id.toString()+",")
    this.dept = e.length!==0 ? q.replace(/,\s*$/, '') : this.defaultDept;
    this.getData();
  }

  getEmergencyCount(){
    this.subsink.sink = this.endPoint.getPhlebotomists(
      1, 1,
      `&status_id=10,14`, this.query, this.dept,
      this.date, this.from_date, this.to_date, false
    ).subscribe((data: any) => {
      this.emergencyCount = data.count;
    })
  }

  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }

  @ViewChild(DatepickerSectionComponent) dateSection!: any;

  searchQuery(e: any) {
    this.query = e;
    if(this.query && this.query !== ""){
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.page_number = 1;
        this.dateSection.clearAllDates();
  
        this.getData();
      }, 800); // Adjust the delay as needed
    }else{
      this.date = this.timeSrvc.getTodaysDate();
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();
    }

  }

  changePageNumber(e:any){
    
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

  collectPrint(data: any) {
    this.updateCollection(data);
  }

  getModel(details: any) {
    const model: any = {
      is_collected: true,
      LabPatientTestID: details.id,
      received_by: this.staffId,
      collected_by: this.staffId,
      collected_at: `${this.timeSrvc.djangoFormat()}`
    }
    return model;
  }

  getBarcodePDFModel(mrNum: any, sample: any, data: any) {
    const model = {
      phlebotomist : data.phlebotomist.id
    }
    return model;
  }

  printReport(data: any) {
    const model = {
      phlebotomist : data.phlebotomist.id
    }
    this.postSample(model);
  }

  printSample(mrNum: any, sample: any, model:any) {
    const sampleModel = this.getBarcodePDFModel(mrNum, sample, model);
    this.postSample(sampleModel);
  }

  postSample(model: any){
    this.subsink.sink = this.endPoint.PostBarcodePDF(model).subscribe((response: any) => {

      this.printSrvc.printBase64PDF(response.pdf_base64)

      model['loading'] = false;
    }, (error) => {
      model['loading'] = false;
      this.alertService.showError(error?.error?.error || error?.error?.Error || error );
    })
  }

  updateCollection(model: any) {
    model['loading'] = true;
    const phlebotomist_model = this.getModel(model);

    this.subsink.sink = this.endPoint.PostPhlebotomist(phlebotomist_model).subscribe((response: any) => {
      this.alertService.showSuccess("Sample Collected", `${model.patient.name} | ${model.name}`);
      this.getData();
      if(this.print_permissons?.phlebotomist_print){
        const modelPhle = {
          phlebotomist : response.id
        }
        this.postSample(modelPhle);
      }

    },
      (error) => {
        model.loading = false;
        this.alertService.showError("oh-oh", error?.error?.error || error?.error?.Error || error );
      }
    );
  }

  UpdatePrintControls(e: any){
    this.print_permissons['phlebotomist_print'] = e;
    this.subsink.sink = this.staffEndpoint.updatePrintControls(this.print_permissons).subscribe((res: any)=>{}, (error)=>{ })
  }

}
