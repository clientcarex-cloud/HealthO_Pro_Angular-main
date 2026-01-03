import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { LabTechnicianEndpoint } from 'src/app/labtechnician/endpoints/labtechnician.endpoint';
import { LabTechnician } from 'src/app/labtechnician/models/labtechnician.model';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PrintService } from '@sharedcommon/service/print.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-medfit',
  templateUrl: './medfit.component.html',
  styleUrl: './medfit.component.scss'
})
export class MedfitComponent extends BaseComponent<LabTechnician> {

  constructor(
    injector: Injector,
    private endPoint: LabTechnicianEndpoint,
    private proEndpoint: ProEndpoint,
    private formBuilder: UntypedFormBuilder,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    public capitalize: CaptilizeService,
    private patientEndpoint: PatientEndpoint,
    private masterEndpoint: MasterEndpoint,
    private staffEndpoint: StaffEndpoint,
    private printSrvc: PrintService) { super(injector) }

  @ViewChild('content') content!: any;
  @ViewChild('wordReport') wordReportModal: any;

  @Input() is_sourcing: boolean = false ;
  @Output() reportSaved: EventEmitter<any> = new EventEmitter<any>();

  passkeyForm!: UntypedFormGroup;
  pageNum!: number | null;
  ages!: any;
  staffId!: number;
  departments: any;

  changesMade: boolean = false;
  showPreview: boolean = false;
  public wordReportContent: string = '';


  is_superadmin: boolean = false;
  canGivePrint: boolean = false;
  due_print: boolean = false;

  print_permissons: any;

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
  count!: number;
  all_count!: number;
  patients!: any;
  date: any = this.timeSrvc.getTodaysDate();
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  statusQuery!: any;
  page_size: any = 10;
  page_number: any = 1;
  query: string = "";
  sort: boolean = true;
  emergencyCount: any;
  pageLoading!: boolean;
  bg_img: any ;
  activeButton: string = "All";
  defaultDept: any;
  all_departments: any = [];

  setStatus(buttonId: any) {
    this.activeButton = buttonId;

    switch (this.activeButton) {
      case 'All':
        this.statusQuery = "&status_id=2,6,11,15,3,7,13,17,4,12,16";
        break;
      case 'pending':
      case 'processing':
        this.statusQuery = "&status_id=2,6,11,15";
        break;

      case 'samplecollected':
        this.statusQuery = "&status_id=18,19,20";
        break;

      case 'emergency':
        this.statusQuery = "&status_id=11,15";
        break;

      case 'completed':
        this.statusQuery = `&status_id=3,7,13,17`;
        break;

      case 'reported':
        this.patients = [];
        this.statusQuery = "&status_id=3,4,12,13,16,17,7";
        break;

      case 'cancelled':
        this.patients = [];
        this.statusQuery = "&status_id=21";
        break;


    }

    this.page_number = 1;
    this.getData();
  }
  
  override ngAfterViewInit(): void {
    const staff = this.cookieSrvc.getCookieData()
    this.is_superadmin = staff.is_superadmin;
    if (this.is_superadmin) {
      this.canGivePrint = true;
      this.due_print = true;
    }

    if (!staff.is_superadmin) {
      this.subsink.sink = this.staffEndpoint.getStaffPatientsPermissions(staff.lab_staff_id).subscribe((data: any) => {

        if (data && data[0].permissions?.length != 0) {
          if (data[0].permissions?.includes(12)) {
            this.is_superadmin = true;
          }
          if (data[0].permissions?.includes(13)) {
            this.canGivePrint = true;
          }
          if (data[0].permissions?.includes(16)) {
            this.due_print = true;
          }
        }
      })
    }

    this.subsink.sink = this.staffEndpoint.getStaffPrintControls(staff.lab_staff_id).subscribe((res: any) => {
      this.print_permissons = res[0];
    })

    this.getDefaultDoctors();

    this.getLetterSettings();

  }

  getDefaultDoctors() {
    this.subsink.sink = this.masterEndpoint.getDefaultConsultingDoctors(1).subscribe((res: any) => {
      if (res && res.length != 0) {
        this.doc = res[0].consulting_doctor
      }
    })
  }

  getLetterSettings(){
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((set: any) => {
      this.settings['header_height'] = set[0].header_height;
      this.settings['footer_height'] = set[0].footer_height;
      this.settings['margin_left'] = set[0].margin_left;
      this.settings['margin_right'] = set[0].margin_right;
      this.settings['display_letterhead'] = set[0].display_letterhead;

      this.settings.display_page_no = set[0].display_page_no;
      this.bg_img = set[0]?.letterhead;

      if(set[0].letterhead && set[0].letterhead == ''){
        this.settings.letterhead = set[0].letterhead;
        this.bg_img = set[0].letterhead;
      }

    });
  }

  override ngOnInit(): void {

    const staffData = this.cookieSrvc.getCookieData();
    this.staffId = staffData.lab_staff_id;
    this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv');


    this.subsink.sink = this.proEndpoint.getAges().subscribe((data: any) => {
      this.ages = data.results;
    });

    this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data: any) => {
      this.all_departments = data;
      // this.departments = data.filter((d: any) => d.department_flow_type != "Transcriptor" && d.is_active)
      this.departments = data.filter((d: any) => d.name == "Medical Examination" && d.is_active)

      let q = "";
      this.departments.forEach((data: any) => q += data.id.toString() + ",")
      this.dept = this.departments.length !== 0 ? q.replace(/,\s*$/, '') : '';

      this.statusQuery = "&status_id=2,6,11,15,18,19,20,4,12,16,3,21";
      this.defaultDept = this.dept;
      this.getData();

    })

    this.pageNum = 1;

    this.passkeyForm = this.formBuilder.group({
      passkey: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    });

  }



  getData() {
    this.pageLoading = true;
    this.subsink.sink = this.endPoint.getLabTechnicians(
      this.page_size, this.page_number,
      this.statusQuery, this.query, this.dept,
      this.date, this.from_date, this.to_date, this.sort
    ).subscribe((data: any) => {
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data.results;

      this.patients.forEach((ptn: any) => {
        ptn['loading'] = false;
      })
      this.getEmergencyCount();
      // this.getLIMSIntegration();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error) ;
    })
  }

  dept: string = "";

  selectDepartment(e: any) {
    let q = "";
    e.forEach((data: any) => q += data.id.toString() + ",")
    this.dept = e.length !== 0 ? q.replace(/,\s*$/, '') : this.defaultDept;
    this.getData();
  }

  LIMSSelectData: any = [];

  getLIMSIntegration() {
    this.subsink.sink = this.endPoint.getTPAMetaInfo(

      this.date, this.from_date, this.to_date
    ).subscribe((data: any) => {
      data.forEach((d: any) => {
        d.added_on = this.timeSrvc.decodeTimestamp(d.added_on)
      })
      this.LIMSSelectData = data;
    })
  }

  selectPAtientTPA: any;
  @ViewChild('TPAModal') tpaModal: any;
  openLIMSIntegration(e: any, patientTest: any) {
    const selectedTPA = this.LIMSSelectData.find((tpa: any) => tpa.id == e.target.value);

    patientTest['tpaData'] = selectedTPA;
    this.selectPAtientTPA = selectedTPA;
  }

  openTPA(ptn: any) {

  }


  getEmergencyCount() {
    this.subsink.sink = this.endPoint.getLabTechnicians(
      1, 1,
      `&status_id=11,15,19,20`, this.query, this.dept,
      this.date, this.from_date, this.to_date, false
    ).subscribe((data: any) => {
      this.emergencyCount = data.count;
    })
  }

  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }

  searchQuery(e: any) {
    this.query = e;
    if (this.query && this.query !== "") {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.page_number = 1;
        this.getData();
      }, 800); // Adjust the delay as needed
    } else {
      this.page_number = 1;
      this.getData();
    }
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
    this.pageNum = 1;
    this.getData();
  }

  getULabPatientAge(id: number) {
    return this.ages.find((age: any) => age.id === id).name
  }


  title!: string;
  reportTableData: any = [];
  editedFixedData: any;
  isAuth: boolean = false;

  patient: any;
  htmlHeader: any = ""

  TestTemplates: any = [];
  routineTemplates: any = [];

  fixedTestTemplates: any = [];
  fixedRoutineTemplates: any = [];

  openXl(content: any, data: any, type: string) {
    this.patient = data;
    this.patient['loading'] = false;
    this.fullScreen = false;
    this.lab_remark = '' ;

    data?.LabPatientTestID?.is_authorization ? this.isAuth = true : this.isAuth = false;

    this.title = `${data?.LabPatientTestID?.patient?.title} ${data?.LabPatientTestID?.patient?.name} | ${data.LabPatientTestID?.patient?.ULabPatientAge == 'DOB' ? data.LabPatientTestID?.patient.dob : data.LabPatientTestID?.patient.age} ${data.LabPatientTestID?.patient?.ULabPatientAge} | ${data.LabPatientTestID?.patient.gender} | ${data.LabPatientTestID?.name} | Ref Dr - ${data?.LabPatientTestID?.patient?.referral_doctor ? data?.LabPatientTestID?.patient?.referral_doctor : 'SELF'} | ${this.timeSrvc.decodeTimestamp(data.LabPatientTestID?.added_on)}`;

    if (type === "fixed") {

      this.subsink.sink = this.endPoint.getLabReports(data.LabPatientTestID.id).subscribe((dataFixed: any) => {
        if (dataFixed.length > 0) {
          this.reportTableData = dataFixed;
          this.editedFixedData = dataFixed;
          dataFixed.loading = false;

          this.loadPatient(this.patient.id);

          this.modalService.open(this.content, { size: 'xl', centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
        } else {
          this.alertService.showError(`No Fixed Paramters availiable for the ${data.LabPatientTestID?.name}`)
        }

      }, (error) => {
        data.loading = false;
        this.alertService.showError(error)
      });

      this.getRoutineTestTemplates(data, 1)
      this.getData();
    } else {
      this.subsink.sink = this.endPoint.getWordReport(data.LabPatientTestID.id).subscribe((reportdata: any) => {
        if (reportdata.length !== 0) {
          reportdata.loading = false;
          this.wordReportContent = reportdata[0]?.report || "Type Here";
          this.reportTableData = reportdata;
          this.htmlHeader = reportdata[0].header;

          this.fullScreen = false;
          this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false, scrollable: false, backdrop: 'static', keyboard: false });
          this.getRoutineTestTemplates(data, 2)
        } else {
          data.loading = false;
          this.alertService.showError(`There is no Report for this ${this.title}`);
        }
      });
      this.getData();
    }
  }

  loadPatient(id: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.getSpecificLabTechinican(id).subscribe((res: any) => {
        this.lab_remark = res?.lab_technician_remarks?.remark || "";
        resolve(res);
      })
    })

  }

  loadPatientList(id: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.getSpecificLabTechinicanList(id).subscribe((res: any) => {
        resolve(res.results[0]);
      })
    })

  }

  getRoutineTestTemplates(data: any, type: any) {

    if((this.TestTemplates.length == 0 && type == 2) || (this.fixedTestTemplates.length == 0 && type == 1)){

      this.getTestReports(data , type).then((res: any)=>{
        type == 1 ? this.fixedTestTemplates = res : this.TestTemplates = res ;
      })
    }

    if((this.routineTemplates.length == 0 && type == 2) || (this.routineTemplates.length == 0 && type == 1)){
      const dept = this.departments.find((d: any) => d.name == data.LabPatientTestID.department).id ;

      this.getRoutineReports(dept, type).then((res: any)=>{
        type == 1 ? this.fixedRoutineTemplates = res : this.routineTemplates = res ;
      });

    }

  }
  

  getTestReports(data: any, type: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.masterEndpoint.getGlobalTestReports(data.LabPatientTestID.LabGlobalTestId).subscribe((data: any) => {
        resolve(data.filter((d: any) => d.report_type == type))
      }, (error)=>{
        resolve([])
      })
    })
  }

  getRoutineReports(dept: any, type: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.masterEndpoint.getGlobalTestReportsWithDepartment(dept).subscribe((data: any) => {
        resolve(data.filter((d: any) => d.report_type == type));
      }, (error)=>{
        resolve({});
      })
    })
  }
  

  reportModal(content: any, data: any, printStatus: boolean = false, access: boolean = true) {

    // if (!access) {
    //   this.alertService.showInfo("You don't have access to edit report.")
    //   return;
    // }

    data.loading = true;
    data['printed'] = printStatus;

    if (data.is_word_report) {
      this.lab_remark = data.lab_technician_remarks?.remark || ""
      this.openXl(content, data, "word");
    } else {
      this.lab_remark = data.lab_technician_remarks?.remark || ""
      this.openXl(content, data, "fixed");
    }
  }





  getFloatVal(num: any) {
    try {
      const floatNum = parseFloat(num.replace(/,/g, ''))
      return floatNum
    } catch (error) {
      return num
    }

  }


  lab_remark: any = ""
  writeRemark(e: any) {
    this.lab_remark = e;
    this.changesMade = true;
  }

  @ViewChild('warningModal') warningModal!: any;

  openModalWarning(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop, backdrop: 'static', keyboard: false });
  }

  fullScreen: any = false;

  handleFullscreenClick(e: any): any {
    this.wordReportContent = e;
    this.fullScreen = !this.fullScreen;
    this.modalService.dismissAll();
    if (this.fullScreen) {
      this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: true, centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
    } else {
      this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
    }

  }

  handleFullscreenClickIframe(e: any): any {
    this.reportTableData[0].rtf_content_report = e.rtf_content;
    this.fullScreen = !this.fullScreen;

    setTimeout(() => {
      this.modalService.dismissAll();
      if (this.fullScreen) {
        this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: true, centered: false, scrollable: false, backdrop: 'static', keyboard: false, });
      } else {
        this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false, scrollable: false, backdrop: 'static', keyboard: false, });
      }
    }, 500);

  }

  handleExtractedContentChange(e: any) {
    this.wordReportContent = e.data;
    this.reportTableData[0].rtf_content_report = e.rtf_content
    // this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv') || false;
    
    this.saveWordReport(e.boolVal, e.closeModal)
  }

  ToggleFullScreenForFixed(content: any, event: any) {
    this.modalService.dismissAll();
    this.fullScreen = !this.fullScreen;
    this.reportTableData = event ;
    this.modalService.open(content, { fullscreen: this.fullScreen, size: 'xl' , scrollable: true })
  }

  resetRemark() {
    this.lab_remark = '';
  }

  refDoctors: any = [];
  docLoading: boolean = false
  getDoctorSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.docLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.endPoint.getLabDoctors(searchTerm).subscribe((data: any) => {
          this.refDoctors = data;
          this.docLoading = false;
        });
      }, 0);
    } else {
      this.refDoctors = [];
      this.docLoading = false;
    }
  }

  doc: any = null;
  doctorSelected(e: any) {
    this.doc = e ? e : null
  }

  printTechnicianReport(model: any, printAccess = this.canGivePrint) {
    if (true) {
      this.subsink.sink = this.endPoint.printReport(model).subscribe((response: any) => {
  
        this.printSrvc.previewIframe(response.html_content, response.header, this.settings, this.bg_img, false);
        if(!this.is_sourcing){
          this.patient['loading'] = false;
          this.getData();
        }else{
          this.reportSaved.emit('')
        }
      }), (error: any) => {
        this.patient['loading'] = false;
        this.alertService.showError("Oops", "Failed to print the report")
      }
    } else {
      this.patient['loading'] = false;
    }

  }


  getTestNames(item: any): string {
    return item.tests.map((test: any) => test.testName).join(', ');
  }

  sendCreateReportStatus(patient: any, newTemplate: any) {
    patient.loading = true;
    if (patient.phlebotomist?.is_received) {
      const model: any = {
        lab_patient_test_id: patient.LabPatientTestID.id,
        created_by: this.staffId
      }

      if(newTemplate){
        this.modalService.dismissAll();
        model['template_id'] = newTemplate.id
      }
      
      this.subsink.sink = this.endPoint.getReportParams(model).subscribe((response: any) => {
        patient.LabPatientTestID.status_id = 'Processing' ; 
        
        this.openXl(this.content, patient, response.type);
        this.pageNum = null;
      }, (error) => {

        patient.loading = false;
        this.alertService.showError("In the set Up page, create a report and try again.", `No reports available for ${patient.LabPatientTestID.name}`)
      })
    } else {
      this.alertService.showError("", "Sample should be received to create report")
    }

  }
  
  


  sendUltraCreateReportStatus(patient: any, from_sourcing: boolean = false) {
    return new Promise((resolve, reject)=>{
      const model = {
        lab_patient_test_id: patient?.LabPatientTestID?.id || patient?.LabPatientTestID,
        created_by: this.staffId
      }
  
      this.subsink.sink = this.endPoint.getReportParams(model).subscribe((res: any) => {
        this.openXl(this.content, patient, res.type);
        resolve(res);
      }, (error) => {
        reject(error)
        this.alertService.showError("In the set Up page, create a report and try again.", `No reports available for ${patient.LabPatientTestID.name}`)
      })
    })
  }

  doReceive(data: any) {
    this.updateReceive(data);
  }

  getModel(details: any) {
    const model: any = {
      id: details.phlebotomist.id,
      is_received: true,
      LabPatientTestID: details.LabPatientTestID.id,
      received_by: this.staffId,
      received_at: `${this.timeSrvc.djangoFormat()}`
    }
    return model;
  }

  updateReceive(model: any) {

    const phlebotomist_model = this.getModel(model);

    this.subsink.sink = this.endPoint.PostPhlebotomistReceiveStatus(phlebotomist_model, model.phlebotomist.id).subscribe((Response) => {
      this.alertService.showSuccess("Sample Received", `${model.LabPatientTestID.patient.name} | ${model.LabPatientTestID.name}`);
      model.phlebotomist = Response;
    },
      (error) => {
        this.alertService.showError("oh-oh", error);
      }
    );
  }

  updateReceiveForSourcingPatientTest(details: any) {

    return new Promise((resolve, reject)=>{
      const model: any = {
        id: details.phlebotomist.id,
        is_received: true,
        LabPatientTestID: details.phlebotomist.LabPatientTestID,
        received_by: this.staffId,
        received_at: `${this.timeSrvc.djangoFormat()}`
      }
  
      this.subsink.sink = this.endPoint.PostPhlebotomistReceiveStatus(model, model.id).subscribe(async (Response) => {
  
        const labTech = {
          LabPatientTestID : model.LabPatientTestID,
          is_word_report: false,
          report_created_by: this.staffId,
          is_completed: false,
          is_report_generated: false,
          is_report_printed: false,
        }
  
        try {
          const response = await this.postTechnican(model);
          
          try{
            const report = await this.sendUltraCreateReportStatus(response) ;
            resolve(response)
          }catch(error){
            reject()
          }

        } catch (error) {
          reject()
        }

      },
        (error) => {
          this.alertService.showError("oh-oh", error);
        }
      );
    })
  }

  



  deleteFixedTestReport(test: any, access: boolean = false, newTemplate: any) {

    if (!access) {
      this.alertService.showInfo("You don't have access to edit report.")
      return;
    }

    const model = {
      lab_patient_test_id: test.LabPatientTestID.id,
      last_updated_by: this.staffId
    }

    this.subsink.sink = this.endPoint.deleteTestReport(model).subscribe((Response) => {
      this.getData();
      this.sendCreateReportStatus(test, newTemplate);
      this.alertService.showSuccess("Report Regenerated", `${test.LabPatientTestID.patient.name} | ${test.LabPatientTestID.name}`);
    }, (error) => {
      this.alertService.showError("oh-oh", error);
    })

  }

  saveLoading: boolean = false;
  saveAuthLoading: boolean = false;

  getTechnicianMOdel(save: any) {
    const technicianModel = {
      is_completed: this.isAuth ? false : true,
      LabPatientTestID: this.patient.LabPatientTestID.id,
      report_created_by: this.staffId,
      consulting_doctor: this.doc ? this.doc.id : null,
      is_report_finished: save,
      lab_technician_remarks: {
        remark: this.lab_remark,
        added_by: this.staffId,
      }
    }

    return technicianModel
  }

  getPrintReportModel() {
    const details = {
      test_id: this.patient.LabPatientTestID.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    return details;
  }

  onSubmitForFixed(event : any) {
    let count = 0;
    const totalReports = event.data.length;
    event.save ? this.saveAuthLoading = true : this.saveLoading = true;

    const technicianModel = this.getTechnicianMOdel(event.save);

    if (!event.save) {
      technicianModel.is_completed = false
    }

    this.subsink.sink = this.endPoint.postTechnican(technicianModel, this.patient.id).subscribe(() => {
      event.data.forEach((report: any) => {

        this.subsink.sink = this.endPoint.updateLabTechnicians(report).subscribe(() => {
          count++;
          if (count === totalReports) {
            this.alertService.showSuccess(`Report Created`, `${this.title}`);
            this.lab_remark = "";

            this.modalService.dismissAll();

            if(this.is_sourcing){ this.reportSaved.emit('') }

            event.save ? this.saveAuthLoading = false : this.saveLoading = false;

            if (this.due_print || this.patient.LabPatientTestID.patient.total_due == 0) {

              if (event.save) {

                if (this.print_permissons && this.print_permissons?.technician_print) {
                  this.printTechnicianReport(this.getPrintReportModel());
                } else {
                  this.getData();
                }
              }
            } else {
              this.getData();
            }
          }
        }, (error: any) => {
          if (count !== totalReports) {
            event.save ? this.saveAuthLoading = false : this.saveLoading = false;
            this.alertService.showError(`Failed`, `${this.title}`);
          }
        });
      });
    }, (error: any) => {
      event.save ? this.saveAuthLoading = false : this.saveLoading = false;
      this.getData();
      this.alertService.showError(error);
    });

  }


  saveWordReport(save: boolean, closeModal: boolean = true) {

    const technicianModel = this.getTechnicianMOdel(save);

    if (!save) {
      technicianModel.is_completed = false;
    }

    save ? this.saveAuthLoading = true : this.saveLoading = true;

    this.subsink.sink = this.endPoint.postTechnican(technicianModel, this.patient.id).subscribe(() => {
      this.lab_remark = "";

      this.reportTableData[0].report = this.wordReportContent;

      this.subsink.sink = this.endPoint.updateWordReport(this.reportTableData[0]).subscribe((data: any) => {

        if(this.is_sourcing){ this.reportSaved.emit('') }

        if (this.due_print || this.patient.LabPatientTestID.patient.total_due == 0) {
          if (save) {
            this.saveAuthLoading = false
            if (this.print_permissons && this.print_permissons?.technician_print) {
              this.printTechnicianReport(this.getPrintReportModel());
            } else {
              this.getData();
            }
          } else {
            this.saveLoading = false;
          }
        } else {
          this.getData();
        }

        if (closeModal) {
          this.modalService.dismissAll();
        }
        this.alertService.showSuccess(this.title, "Report " + (closeModal ? 'Created' : 'Saved'));
      }, (error) => {
        save ? this.saveAuthLoading = false : this.saveLoading = false;
        this.alertService.showError("Failed to update the report", error);
      });
    }, (error) => {
      save ? this.saveAuthLoading = false : this.saveLoading = false;
      this.alertService.showError(error);
    });

  }

  preview_loading: boolean = false;

  printReportForEdit(data: any, access = true, msg = "You don't have access to edit report.") {

    // if (!access) {
    //   this.alertService.showInfo(msg)
    //   return;
    // }

    if (this.patient) {
      this.patient['loading'] = true;
    }

    const details = {
      test_id: data.LabPatientTestID.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.printTechnicianReport(details)

    // if (this.due_print || data.LabPatientTestID.patient.total_due == 0) {
    //   this.printTechnicianReport(details)
    // } else {
    //   this.patient['loading'] = true;
    //   this.alertService.showInfo("You Don't Have Access To Give Due Report Print.")
    // }

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

  withoutSpecChars(e: any) {
    return e.replace(/\n/g, '<br>')
  }


  UpdatePrintControls(e: any) {
    this.print_permissons['technician_print'] = e;

    this.subsink.sink = this.staffEndpoint.updatePrintControls(this.print_permissons).subscribe((res: any) => {

    }, (error) => {

    })
  }

  showError() {
    this.alertService.showInfo("You Don't Have Access To Give Prints.")
  }













  // sourcing modules 

  postTechnican(model: any){

    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.postSourcingTechnican(model).subscribe((res: any)=>{
        this.alertService.showSuccess("Sample Received");

        this.loadPatientList(res.id).then((res: any)=>{
          resolve(res);
        }).catch((error: any)=>{
          reject()
        });
  
      }, (error)=>{
        reject()
        this.alertService.showError(error?.error?.error || error?.error?.Error || error);
      })
    })

  }


  openDraftReport(id: any){
    this.loadPatientList(id).then((res: any)=>{
      this.reportModal(null, res);
    })
  }


  printCertificate(data: any) {
    const details = {
      patient_id: data?.LabPatientTestID?.patient?.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.subsink.sink = this.endPoint.printReport(details, 'print_medical_certificate').subscribe((response: any) => {
      data['printLoading'] = false;
      this.printSrvc.printHeader(response.html_content, response?.header || '')
    }), (error: any) => {
      data['printLoading'] = false;
      this.alertService.showError("Oops", "Failed to print the report")
    }

  }
}
