import { Component, TemplateRef, Injector, ViewChild } from '@angular/core';
import { NgbdSortableHeader, SortEvent } from '@sharedcommon/directives/sortable.directive';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { DoctorAuthorization } from '../../models/drauth.model';
import { DrAuthsService } from '../../services/drauth.service';
import { DrAuthsEndpoint } from '../../endpoints/drauth.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import * as ClassicEditor from 'ckeditor4-angular'
import { DatepickerSectionComponent } from '@sharedcommon/components/datepicker-section/datepicker-section.component';

@Component({
  selector: 'app-drauthorization',
  templateUrl: './drauthorization.component.html',
  styleUrls: ['./drauthorization.component.scss'],
  providers: [DrAuthsService]
})
export class DrauthorizationComponent extends BaseComponent<DoctorAuthorization> {


  patientTestList!: any[];

  
  ckEditorConfig: any = { 
    readOnly: true,
    height: '70vh',
    toolbar: [
     
    ] 
  };

  drAuthData!: any[];

  all_patients!: any[];
  staffId!: any;

  public editor = ClassicEditor;
  @ViewChild('editor') editorData: any;
 
  @ViewChild('wordReport') wordReportModal: any;
  public wordReportContent: string = '';
  public htmlData: string = "";

  public onReady(editor: any) {
    this.editorData = editor;
  }

  public wordReportInput( { editor }: any ) {
    this.wordReportContent = editor.getData();
  }

  constructor(
    injector: Injector,
    private endPoint: DrAuthsEndpoint,
    public service: DrAuthsService, 
    public timeSrvc : TimeConversionService,
    private cookieSrvc : CookieStorageService
  ) { super(injector) }

  pageNum! : number;

  override ngOnInit(): void {
    const staffData = this.cookieSrvc.getCookieData();
    this.staffId = staffData.lab_staff_id
    
    this.statusQuery = "&status_id=4,12,16";
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.patients = [];
    this.date = this.timeSrvc.getTodaysDate();
    this.getData()

  }

  count!: number;
  all_count!: number;
  patients!: any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  statusQuery!: any;
  page_size!: any;
  page_number!: any;
  query!: string;
  sort: boolean =false;
  emergencyCount = 0;

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  pageLoading: boolean = false;

  getData() {
    this.pageLoading= true;
    this.subsink.sink = this.endPoint.getDrAuth(
      this.page_size, this.page_number,
      this.statusQuery, this.query,
      this.date, this.from_date, this.to_date, this.sort
    ).subscribe((data: any) => {
      this.pageLoading= false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data.results;
      this.getEmergencyCount()
    })
  }

  getEmergencyCount(){
    this.subsink.sink = this.endPoint.getDrAuth(
      1, 1, `&status_id=4,12,16`, '',
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
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // this.date = "";
      // this.from_date = "";
      // this.to_date = "";
      // this.dateSection.clearAllDates();
      this.page_number = 1;
      this.getData();

    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    if(this.page_size == this.all_count){
      this.page_number = 1
    }
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
    this.pageNum = 1;
    this.getData();
  }


  findMatchingIds(number: number = 4, data: any[] = this.patientTestList): any[] {
    const matchingObjects: any[] = [];
    const patientIds: number[] = [];

    // Find the object with the matching id
    const matchedObject = data.find(item => item.id === number);
    if (matchedObject) {
      matchingObjects.push(matchedObject);
      patientIds.push(matchedObject.patient);

      // Find other objects with the same patient id
      for (const item of data) {
        if (item.patient === matchedObject.patient && item.id !== number) {
          matchingObjects.push(item);
        }
      }
    }

    return matchingObjects;
  }

  getPatientId(id: number) {
    const data = this.findMatchingIds(id);
    return data[0].patient;
  }

  getPatientDepartment(id: number) {
    const data = this.findMatchingIds(id);
    return data[0].department;
  }

  getPatientTests(id: number, data = this.all_patients) {
    const item = data.find(item => item.id === id);
    return item?.lab_tests;
  }

  getNameById(id: number, data = this.all_patients): string | undefined {
    const item = data.find(item => item.id === id);
    return item?.name;
  }

  getAdded_or_Updated_time(id: number, data = this.all_patients) {
    const item = data.find(item => item.id === id);
    return this.timeSrvc.decodeTimestamp(item?.added_on);
  }

  getShortCodes(id:any){

  }

  concatenateShortCodes(data: any) {
    return data.map((test: any) => test.short_code).join(', ');
  }

  activeButton: string = "all";

  setActiveButton(buttonId: any) {
    this.activeButton = buttonId;
  
    switch (this.activeButton) {
      case 'all':
      case 'pending':
        this.statusQuery = "&status_id=4,12,16";
        break;
  
      case 'emergency':
        this.statusQuery = "&status_id=12,16";
        break;

      case 'cancelled':
        this.statusQuery = "&status_id=21";
        break;
      case 'reported':
          this.statusQuery = "&status_id=3,13,17";
          break;
  
      default:
        // Handle default case if needed
        break;
    }
  
    this.page_number = 1;
    this.getData();
  }
  

  getModelTitle(data: any): string {
    return `PID: ${data.PID} | ${data.Name} | ${data.Age} Years | ${data.Gender} | ${data.Test}`;
  }

  title: string = "";
  reportTableData:any = [];
 
  techId:any;
  patient: any ;
  all_pages!: any;
  htmlHeader:any = '';
  openXl(content: TemplateRef<any>, data:any) {

    this.title = ` ${data.patient.name} | ${data.patient.age} ${data.patient?.ULabPatientAge} | ${data.patient.gender} | ${data.name}`
    this.patient = data;


    if(data.labtechnician.is_word_report){
      this.subsink.sink = this.endPoint.getLabWordReports(data.id).subscribe((data:any) => {
        this.htmlData = data[0].report
        this.htmlHeader = data[0].header;
        this.all_pages = [""];

        this.modalService.open(this.wordReportModal, { size: 'xl', centered: false ,  scrollable: false });

      });
    }else{
      this.subsink.sink = this.endPoint.getLabReports(data.id).subscribe((data:any) => {
          if(data.length == 0){
            this.alertService.showError(`No reports available for ${this.patient?.name}`, "")
          }else{
            this.reportTableData = this.groupData(data);
            this.modalService.open(content, { size: 'xl', centered: false, scrollable: true });
          }

      });
    }
  }


  fullScreen: any = false;

  handleFullscreenClick(e:any):any{
    this.fullScreen = !this.fullScreen;
    this.modalService.dismissAll();
    if(this.fullScreen){
      this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: true, centered: false,  scrollable: true,  backdrop : 'static',  keyboard : false, });
    }else{
      this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false,  scrollable: true,  backdrop : 'static',  keyboard : false, });
    }
  }

  exitFullScreenClick(e:any):any{
    this.modalService.dismissAll();
    this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false,  scrollable: true,  backdrop : 'static',  keyboard : false, });

  }

  patient_remark: string = '';
  openRemark(content: TemplateRef<any>, data:any) {
    this.patient_remark = '';
    this.patient_remark = data.lab_technician_remarks?.remark;
    this.title = ` ${data.patient.name} | ${data.patient.age} ${data.patient?.ULabPatientAge} | ${data.patient.gender} | ${data.name}` ;
    this.patient_remark && this.patient_remark!=="" ? this.modalService.open(content, {  centered: true }) : null;
  }

  withoutSpecChars(e: any) {
    return e.replace(/\n/g, '<br>')
  }

  test() {

  }

  saveLoading: boolean = false;

  sendAuthorization(){
    const technicianModel = {
      is_completed: true,
      LabPatientTestID: this.patient.id,
      report_created_by: this.staffId,
      id: this.patient.labtechnician.id,
      lab_technician_remarks:{
        remark : this.patient_remark || null
      }
    }

    this.saveLoading = true ;
    this.subsink.sink = this.endPoint.postTechnican(technicianModel, this.patient.labtechnician.id).subscribe((Response)=>{

    }, (error)=>{
      this.alertService.showError(error)
    })

    const model = {
      is_authorized: true,
      is_passKey_used: true,
      LabPatientTestID: this.patient.id,
      added_by: this.staffId
  }

  this.subsink.sink = this.endPoint.postAuthorization(model).subscribe((Response)=>{
    this.alertService.showSuccess("Authorized", this.title);
    this.modalService.dismissAll();
    this.getData();
    this.saveLoading = false ;
  },(error)=>{
    this.saveLoading = false ;
    this.alertService.showError(error)
  })
  }


  insertPrint(content: any) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'width: 221mm;border: 1px solid #ccc;box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);margin: 20px auto;height: 80vh;');
    const printPage = document.getElementById('report');
    printPage!.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(content);
    }
  }





  groupData(data: any): any {
    const groupedData: any = [];

    // Sort data by ordering
    data.sort((a: any, b: any) => a.ordering - b.ordering);

    let blankGroupCounter = 0;
    let currentBlankGroup = `blank_${blankGroupCounter}`;

    for (const report of data) {
      let groupname = report.group;

      if (groupname == null) {
        report.group = "";
        groupname = "";
      }

      // If group name is blank, use the current blank group identifier
      if (groupname === "") {
        groupname = currentBlankGroup;
      } else {
        // Reset the blank group identifier when encountering a named group
        currentBlankGroup = `blank_${++blankGroupCounter}`;
      }

      const groupIndex = groupedData.findIndex((group: any) => group.groupname === groupname);

      let val = typeof report?.value === 'string' ? report.value.toLowerCase() : report?.value || '';
      let select: boolean = false;
      

      if (typeof val === 'string' && val.includes('select') && val.includes("**")) {
        val = report.value.split('**').slice(1, -1);

        select = true;
      }

      if (groupIndex === -1) {

        // If the group does not exist, create a new group
        groupedData.push({
          groupname: groupname,
          parameters: [{
            id: report.id,
            parameter: report.parameter,

            value: select ? val[0] : report.value,
            select: select,
            defVal: report.value,
            selectOptions: val,

            units: report.units,
            method: report.method,
            referral_range: report.referral_range,
            added_on: report.added_on,
            LabGlobalTestID: report.LabGlobalTestID,
            LabPatientTestID: report.LabPatientTestID,
            is_value_bold: report.is_value_bold,
            normal_ranges: report.normal_ranges,
            formula: report.formula
          }]
        });
      } else {

        // If the group already exists, push the parameter to its parameters array
        groupedData[groupIndex].parameters.push({
          id: report.id,
          parameter: report.parameter,

          value: select ? val[0] : report.value,
          select: select,
          defVal: report.value,
          selectOptions: val,

          units: report.units,
          method: report.method,
          referral_range: report.referral_range,
          added_on: report.added_on,
          LabGlobalTestID: report.LabGlobalTestID,
          LabPatientTestID: report.LabPatientTestID,
          is_value_bold: report.is_value_bold,
          normal_ranges: report.normal_ranges,
          formula: report.formula
        });
      }
    }

    // Replace temporary unique blank group identifiers with empty strings
    groupedData.forEach((group: any) => {
      if (group.groupname.startsWith("blank_")) {
        group.groupname = "";
      }
    });

    return groupedData;
  }


}
