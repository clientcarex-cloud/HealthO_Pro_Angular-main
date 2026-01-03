import { Component, Injector, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { DatepickerSectionComponent } from '@sharedcommon/components/datepicker-section/datepicker-section.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { LabTechnicianEndpoint } from 'src/app/labtechnician/endpoints/labtechnician.endpoint';
import { LabTechnician } from 'src/app/labtechnician/models/labtechnician.model';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { Observable, OperatorFunction, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { FileService } from '@sharedcommon/service/file.service';

@Component({
  selector: 'app-radiologists',
  templateUrl: './radiologists.component.html',
  styleUrl: './radiologists.component.scss'
})

export class RadiologistsComponent extends BaseComponent<LabTechnician> {

  constructor(
    injector: Injector,

    private formBuilder: UntypedFormBuilder,
    public printSrvc: PrintService,
    private fileSrvc: FileService,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    public capitalize: CaptilizeService,
    private patientEndpoint: PatientEndpoint,
    private masterEndpoint: MasterEndpoint,
    private staffEndpoint: StaffEndpoint,
    private endPoint: LabTechnicianEndpoint,
    private proEndpoint: ProEndpoint,
    ) { super(injector) }

  passkeyForm!: UntypedFormGroup;

  ages!: any;
  staffId!: number;
  departments: any;

  @ViewChild('editor') editorData: any;
  @ViewChild('wordReport') wordReportModal: any;
  @ViewChild('content') content!: any;
  @ViewChild('warningModal') warningModal!: any;


  private inputSubject: Subject<any> = new Subject<any>();

  public wordReportContent: string = '';
  public htmlData: string = "";
  public htmlHeader: string = "";
  activeButton: string = "pending";

  ultraDept: any;
  ultraText: any = '';

  showPreview: any = false;
  is_superadmin: boolean = false;
  canGivePrint: boolean = false;
  due_print: boolean = false;
  changesMade: boolean = false;
  pageLoading: boolean = false;

  show_letterhead: boolean = false ;

  print_permissons: any;

  count: number = 0;
  all_count: number = 0;
  patients: any = [];
  date: any = this.timeSrvc.getTodaysDate();
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  statusQuery!: any;
  page_size: any = 10;
  page_number: any = 1;
  query: string = '';
  sort: boolean = true;
  emergencyCount: any;

  patientRefDoctors: any = [];
  refDocQueryTerm: string = "";
  refDoctorQueryloading: boolean = false;


  setActiveButton(id: string) {
    this.activeButton = id;
  }

  setStatus(buttonId: any) {
    this.activeButton = buttonId;

    switch (this.activeButton) {
      case 'All':
        this.statusQuery = "&status_id=2,6,11,15,3,7,13,17,4,12,16,21";
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
    } else {
      this.subsink.sink = this.staffEndpoint.getStaffPatientsPermissions(staff.lab_staff_id).subscribe((data: any) => {

        if (data && data[0].permissions?.length != 0) {
          if (data[0].permissions?.includes(14)) {
            this.is_superadmin = true;
          }
          if (data[0].permissions?.includes(15)) {
            this.canGivePrint = true;
          }
          if (data[0].permissions?.includes(17)) {
            this.due_print = true;
          }
        }
      })

    }

    this.subsink.sink = this.proEndpoint.getAges().subscribe((data: any) => {
      this.ages = data.results;
    });

    this.subsink.sink = this.staffEndpoint.getStaffPrintControls(staff.lab_staff_id).subscribe((res: any) => {
      this.print_permissons = res[0];
    });

    // this.getDefaultDoctors();

    this.getLetterSettings();
  }


  getDefaultDoctors(){
    this.subsink.sink = this.masterEndpoint.getDefaultConsultingDoctors(2).subscribe((res: any)=>{
      if(res && res.length != 0){
        this.doc = res[0].consulting_doctor
      }
    })
  }

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
  bg_img: any ;

  getLetterSettings(){
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((set: any) => {
      this.settings['header_height'] = set[0].header_height;
      this.settings['footer_height'] = set[0].footer_height;
      this.settings['margin_left'] = set[0].margin_left;
      this.settings['margin_right'] = set[0].margin_right;
      this.settings['display_letterhead'] = set[0].display_letterhead;
      this.show_letterhead = set[0].display_letterhead;

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
    this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv') || false;

    this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data: any) => {
      this.departments = data;
      this.ultraDept = this.departments.filter((d: any) => d.department_flow_type == "Transcriptor" && d.is_active && d.name != 'Medical Examination')
      // this.ultraDept = preSelect
      let q = "";
      this.ultraDept.forEach((data: any) => q += data.id.toString() + ",")
      this.dept = this.ultraDept.length !== 0 ? q.replace(/,\s*$/, '') : '';
      this.ultraText = this.dept
  
      this.date = this.timeSrvc.getTodaysDate();

      if (this.ultraDept.length !== 0) {
        this.getData();
      }
    })



    this.statusQuery = "&status_id=2,6,11,15";

    this.passkeyForm = this.formBuilder.group({
      passkey: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    });

    this.inputSubject.pipe(
      debounceTime(500)  // Adjust the debounce time as neededd
    ).subscribe(value => {
      this.getTestDefaultParamters()
    });

  }

  getData() {

    this.patients = [];
    this.pageLoading = true;

    this.subsink.sink = this.endPoint.getLabTechnicians(
      this.page_size, this.page_number,
      this.statusQuery, this.query, this.dept,
      this.date, this.from_date, this.to_date, this.sort, this.refDocQueryTerm, true
    ).subscribe((data: any) => {
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data.results;

      data.referral_doctors.forEach((doc: any) => {
        doc.name += ', \n' + "" + doc.mobile_number
      })

      this.patientRefDoctors = data.referral_doctors

      this.getEmergencyCount();
    }, (error: any)=>{
      this.alertService.showInfo(error?.error?.Error || error?.error?.error);
    })
  }

  getRefDocs() {
    this.patientRefDoctors = [];
    this.refDoctorQueryloading = true;
    this.subsink.sink = this.endPoint.getLabTechniciansRef(
      this.page_size, this.page_number,
      this.statusQuery, this.query, this.dept,
      this.date, this.from_date, this.to_date, this.sort, '', true
    ).subscribe((data: any) => {
      this.patientRefDoctors = data;
      this.refDoctorQueryloading = false;
    }, (error) => {
      this.refDoctorQueryloading = false;
    })
  }

  selectRefDoc(e: any) {
    this.refDocQueryTerm = e && e != '' ? e.id : ''
    this.getData();
  }

  dept: string = "";

  selectDepartment(e: any) {
    let q = "";
    e.forEach((data: any) => q += data.id.toString() + ",")
    this.dept = e.length !== 0 ? q.replace(/,\s*$/, '') : this.ultraText;
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

  @ViewChild(DatepickerSectionComponent) dateSection!: any;

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
    this.page_number = 1 ;
    this.getData();
  }

  title!: string;
  reportTableData: any = [];
  patientName = "";
  isAuth: boolean = false;
  editedFixedData: any;
  patient: any;
  TestTemplates: any;
  routineTemplates: any;
  rtfContent: any = '' ; 
  getTemplates: boolean = false;
  fixedTestTemplates: any = [] ;
  fixedRoutineTemplates : any = [] ;

  openXl(content: any, data: any, type: string) {

    this.patient = data;
    this.patient['loading'] = false;
    data.LabPatientTestID.is_authorization ? this.isAuth = true : this.isAuth = false;

    this.title = `${data?.LabPatientTestID?.patient?.title} ${data?.LabPatientTestID?.patient?.name} | ${data.LabPatientTestID?.patient?.ULabPatientAge == 'DOB' ? data.LabPatientTestID?.patient.dob : data.LabPatientTestID?.patient.age} ${data.LabPatientTestID?.patient?.ULabPatientAge} | ${data.LabPatientTestID?.patient.gender} | ${data.LabPatientTestID?.name} | Ref Dr - ${data?.LabPatientTestID?.patient?.referral_doctor ? data?.LabPatientTestID?.patient?.referral_doctor : 'SELF'} | ${this.timeSrvc.decodeTimestamp(data.LabPatientTestID?.added_on)}`;

    if (type === "fixed") {

      this.subsink.sink = this.endPoint.getLabReports(data.LabPatientTestID.id).subscribe((dataFixed: any) => {
        if (dataFixed.length > 0) {
          this.reportTableData = dataFixed;
          this.editedFixedData = dataFixed;
          
          this.modalService.open(content, { size: 'xl', centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
        
          this.loadPatient(this.patient.id);
        } else {
          this.alertService.showError(`No Fixed Paramters availiable for the ${data.LabPatientTestID?.name}`)
        }

      }, (error) => {
        data.loading = false;
        this.alertService.showError(error)
      });


      this.getData();
    } else {
      this.subsink.sink = this.endPoint.getWordReport(data.LabPatientTestID.id).subscribe((reportdata: any) => {
        if (reportdata.length !== 0) {

          this.htmlData = reportdata[0]?.report || "Type Here";
          this.wordReportContent = reportdata[0].report;
          this.reportTableData = reportdata;
          this.htmlHeader = reportdata[0].header && reportdata[0].header != "" ? reportdata[0].header : "<div></div>";

          this.fullscreen = false;
          this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false, scrollable: false, backdrop: 'static', keyboard: false });

          this.loadPatient(this.patient.id);
          // if(!this.getTemplates){
          //   setTimeout(() => {
          //     this.getRoutineTestTemplates(data);
          //   }, 1000);
          // }

        } else {
          data.loading = false;
          this.alertService.showError(`There is no Report for this ${this.title}`);
        }
      });
      this.getData();
    }


    if(!this.patient.printed || (type=="word" && this.is_superadmin)){
      this.getRoutineTestTemplates(data,type === "fixed" ? 1 : 2) ;
      this.getPatientPastReports();
    }

    if(this.patient.printed){
      const model = {
        id: this.patient.id,
        review_count : ++this.patient.review_count,
        LabPatientTestID : this.patient.LabPatientTestID.id
      }

      this.updateReviewCount(model) ;
    }
  }

  loadPatient(id: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.getSpecificLabTechinican(id).subscribe((res: any) => {
        this.lab_remark = res?.lab_technician_remarks?.remark || "";
        this.doc = res?.consulting_doctor || null ;
        resolve(res);
      })
    })

  }


  getRoutineTestTemplates(data: any, type: any) {
    this.getTestReports(data, type).then((res: any) => {
      type == 1 ? this.fixedTestTemplates = res : this.TestTemplates = res;
    })

    if((type == 2)){
      const dept = this.departments.find((d: any) => d.name == data.LabPatientTestID.department).id ;
      this.getRoutineReports(dept, type).then((res: any) => {
        type == 1 ? this.fixedRoutineTemplates = res : this.routineTemplates = res;
      });
    }

    this.getTemplates = true;
  }

  getTestReports(data: any, type: any) {
    return new Promise((resolve, reject) => {
      this.subsink.sink = this.masterEndpoint.getGlobalTestReports(data.LabPatientTestID.LabGlobalTestId).subscribe((data: any) => {
        resolve(data.filter((d: any) => d.report_type == type))
      }, (error) => {
        resolve([])
      })
    })
  }

  getRoutineReports(dept: any, type: any) {
    return new Promise((resolve, reject) => {
      this.subsink.sink = this.masterEndpoint.getGlobalTestReportsWithDepartment(dept).subscribe((data: any) => {
        resolve(data.filter((d: any) => d.report_type == type));
      }, (error) => {
        resolve({});
      })
    })
  }

  pastReports : any = [] ;

  pastReports_loading : boolean = false ;
  getPatientPastReports(){

    this.pastReports_loading = true ;
    
    const mr_no = this.patient.LabPatientTestID.patient.mr_no ;
    const test_id = this.patient.LabPatientTestID.LabGlobalTestId ;
    this.pastReports = [] ;
    this.subsink.sink = this.endPoint.getPatientPastReports(mr_no, test_id).subscribe((res: any)=>{
      this.pastReports = res.reports.filter((rpt: any)=> rpt.visit_id != this.patient.LabPatientTestID.patient.visit_id).reverse();
      this.pastReports_loading = false ;
    },(error)=>{
      this.pastReports_loading = false ;
    })

  }

  openPastPastReportPDF(report: any){
    const title = `Visit-ID : ${report.visit_id}, MR No : ${this.patient?.LabPatientTestID?.patient?.mr_no}, ${this.patient?.LabPatientTestID?.patient?.title} ${this.patient?.LabPatientTestID?.patient?.name}, ${this.patient?.LabPatientTestID.name}`
    this.fileSrvc.openPdfInNewWindow(report.tests[0].base64_pdf, title)
  }

  reportModal(content: any, data: any, printStatus: boolean = false) {
    data.loading = true;
    this.fullScreen = false;
    data['printed'] = printStatus
    if (data.is_word_report) {
      this.openXl(content, data, "word");
    } else {
      this.openXl(content, data, "fixed");
    }
  }


  q_param: any = ""
  onReportValueChange(newValue: any, report: any) {

    newValue.preventDefault();

    const index = this.editedFixedData.findIndex((d: any) => d.id === report.id);
    if (index !== -1) {

      if (report.select) {

        function rearrangeString(selected: any, str: any) {
          // const str = "select**Normal**Abnormal**Neutral**";
          const parts = str.split('**').slice(1, -1); // Remove "Select" and the trailing empty string
          const index = parts.indexOf(selected);

          if (index !== -1) {
            parts.splice(index, 1); // Remove the selected element from its current position
            parts.unshift(selected); // Add the selected element to the beginning
          }

          return `select**${parts.join('**')}**`;
        }

        this.editedFixedData[index].value = rearrangeString(newValue.target.value, report.defVal)

      } else {

        report.value = newValue.target.value;
        this.editedFixedData[index].value = newValue.target.value;


        this.changesMade = true;
        this.q_param = newValue.target.value;
        this.inputSubject.next(this.q_param);

        if (!isNaN(newValue.target.value)) {
          if (report.normal_ranges) {
            if (
              (this.getFloatVal(report.normal_ranges.value_min) > newValue.target.value) ||
              (this.getFloatVal(report.normal_ranges.value_max) < newValue.target.value)) {
              this.editedFixedData[index].is_value_bold = true;
              report.is_value_bold = true;
            } else {
              this.editedFixedData[index].is_value_bold = false;
              report.is_value_bold = false;
            }
          }
        } else {
          report.is_value_bold = false;
        }
      }

    }

  }

  getFloatVal(num: any) {
    return parseFloat(num.replace(/,/g, ''))
  }

  onReportValueSelected(newValue: any, report: any) {

    const index = this.editedFixedData.findIndex((d: any) => d.id === report);
    if (index !== -1) {
      this.editedFixedData[index].value = newValue.item;

      this.changesMade = true;
      this.getTestDefaultParamters(newValue.item);
    }

  }

  checkFormula(parameter: any) {
    if (parameter.formula && parameter.formula !== '') {
      let formula = parameter.formula;

      // Replace placeholders in the formula with actual values
      this.editedFixedData.forEach((input: any) => {
        const escapedParameter = input.parameter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
        formula = formula.replace(new RegExp(`{${escapedParameter}}`, 'g'), input.value);
      });

      try {
        // Evaluate the formula and catch any errors
        const index = this.editedFixedData.findIndex((d: any) => d.id === parameter.id);

        let result = eval(formula) || '';
        try{
          parameter.value = this.getFloatVal(result.toFixed(2));
          this.editedFixedData[index].value = this.getFloatVal(result.toFixed(2));
        }catch(error){
          parameter.value = result;
          this.editedFixedData[index].value = result
        }

        if (!isNaN(parameter.value)) {
          if (parameter.normal_ranges) {
              if(
                (this.getFloatVal(parameter.normal_ranges.value_min) > parameter.value) || 
                (this.getFloatVal(parameter.normal_ranges.value_max) < parameter.value))
                {
              this.editedFixedData[index].is_value_bold = true;
              parameter.is_value_bold = true;
            } else {
              this.editedFixedData[index].is_value_bold = false;
              parameter.is_value_bold = false;
            }
          }
        }

      } catch (error) {
        // If there's an error, set the result to an empty string
        parameter.value = '';
        const index = this.editedFixedData.findIndex((d: any) => d.id === parameter.id);
        this.editedFixedData[index].value = '';
        console.error('Error evaluating formula:', error);
      }
    }
  }


  lab_remark: any = ""
  writeRemark(e: any) {
    this.lab_remark = e;
    this.changesMade = true;
  }



  openModalWarning(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop, backdrop: 'static', keyboard: false });
  }


  fullscreen: boolean = false;

  openFullScreen(content: any) {
    this.fullscreen = true;
    this.reportTableData = this.groupData(this.editedFixedData);
    this.modalService.open(content, { fullscreen: true })
  }


  fullScreen: any = false;

  handleFullscreenClick(e: any): any {
    this.htmlData = e;

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


  exitFullScreenClick(e: any): any {
    this.htmlData = e.data;
    this.wordReportContent = e.data;

    this.modalService.dismissAll();
    this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false, scrollable: true, backdrop: 'static', keyboard: false, });

  }

  handleExtractedContentChange(e: any) {
    this.wordReportContent = e.data;
    this.reportTableData[0].rtf_content_report = e.rtf_content
    this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv') || false;
    
    this.saveWordReport(e.boolVal, e.closeModal)
  }


  closeFullScreen(content: any) {
    this.fullscreen = false;
    this.reportTableData = this.groupData(this.editedFixedData);
    this.modalService.open(content, { size: 'xl', centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
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
  docLoading: boolean = false;
  searchTerm: any;

  getDoctorSearches(searchTerm: any, api: string): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }


    if (searchTerm && searchTerm.length > 1) {
      this.docLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.searchTerm = searchTerm
        this.subsink.sink = this.endPoint.getLabDoctors(searchTerm, api).subscribe((data: any) => {
          data.map((doc: any) => {
            doc.name += ", " + doc.mobile_number
          })
          this.refDoctors = data;
          this.docLoading = false;
        });
      }, 0);
    } else {
      this.searchTerm = null
      this.refDoctors = [];
      this.docLoading = false;
    }
  }

  doc: any = null;
  doctorSelected(e: any) {
    this.doc = e ? e : null
  }

  printTechnicianReport(model: any, data: any, showAlert: boolean, show_header: boolean, download: boolean) {

    if (this.canGivePrint) {
      this.subsink.sink = this.endPoint.printReport(model).subscribe((response: any) => {
        
        this.settings.display_letterhead = show_header ;

        if(!download){
          this.printSrvc.previewIframe(response.html_content, response.header, this.settings, this.bg_img, false);
        }else{
          this.fileSrvc.downloadFile(response?.link_pdf, `${this.title}.pdf`);
        }
        
        this.settings.display_letterhead = this.show_letterhead ;
        this.getData();
        if (this.patient) {
          this.patient['printLoading'] = false;
          this.stopPrintDownloadLoading();
        }
        data['printLoading'] = false;
        this.stopPrintDownloadLoading();
      }), (error: any) => {
        if (this.patient) {
          this.stopPrintDownloadLoading();
          this.patient['printLoading'] = false;
        }

        this.alertService.showError("Oops", "Failed to print the report");
        this.stopPrintDownloadLoading();
        data['printLoading'] = true;
      }
    } else {
      this.stopPrintDownloadLoading();
      data['printLoading'] = false;
      if (this.patient) {
        this.patient['printLoading'] = false;
      }

      if (showAlert) {
        this.alertService.showInfo("You Don't Have Access To Give Print.")
      }

    }
  }


  getTestNames(item: any): string {
    return item.tests.map((test: any) => test.testName).join(', ');
  }

  sendCreateReportStatus(patient: any) {
    patient.loading = true;
    if (patient.phlebotomist?.is_received) {
      const model = {
        lab_patient_test_id: patient.LabPatientTestID.id,
        created_by: this.staffId
      }
      this.subsink.sink = this.endPoint.getReportParams(model).subscribe((response: any) => {
        patient.LabPatientTestID.status_id = 'Processing'
        this.openXl(this.content, patient, response.type);

      }, (error) => {
        patient.loading = false;
        this.alertService.showError("In the set Up page, create a report and try again.", `No reports available for ${patient.LabPatientTestID.name}`)
      })
    } else {
      this.alertService.showError("", "Sample should be received to create report")
    }

  }


  sendUltraCreateReportStatus(patient: any) {
    const model = {
      lab_patient_test_id: patient.LabPatientTestID.id,
      created_by: this.staffId
    }
    this.subsink.sink = this.endPoint.getReportParams(model).subscribe((response: any) => {
      patient.LabPatientTestID.status_id = 'Processing'
      this.openXl(this.content, patient, response.type);

    }, (error) => {
      this.alertService.showError("In the set Up page, create a report and try again.", `No reports available for ${patient.LabPatientTestID.name}`)
    })

  }

  doReceive(data: any) {
    this.updateReceive(data);
  }

  getModel(details: any) {
    const model: any = {
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

  deleteFixedTestReport(test: any) {
    const model = {
      lab_patient_test_id: test.LabPatientTestID.id,
      last_updated_by: this.staffId
    }

    this.subsink.sink = this.endPoint.deleteTestReport(model).subscribe((Response) => {
      test.LabPatientTestID.status_id = "Sample Collected";
      this.alertService.showSuccess("Report Regenerated", `${test.LabPatientTestID.patient.name} | ${test.LabPatientTestID.name}`);
    }, (error) => {
      this.alertService.showError("oh-oh", error);
    })

  }

  saveLoading: boolean = false;
  saveAuthLoading: boolean = false;

  getTechnicianModal(save: any) {
    const technicianModel = {
      is_completed: this.isAuth ? false : true,
      LabPatientTestID: this.patient.LabPatientTestID.id,
      report_created_by: this.staffId,
      consulting_doctor: this.doc ? this.doc.id : null,
      is_report_finished: save,
      lab_technician_remarks: {
        remark: this.lab_remark,
        added_by: this.staffId,
      },
      id: this.patient.id,
    }

    return technicianModel
  }

  getPrintReportModel() {
    const details = {
      test_id: this.patient.LabPatientTestID.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    return details
  }

  onSubmit(save: boolean) {

    let count = 0;
    const totalReports = this.editedFixedData.length;
    save ? this.saveAuthLoading = true : this.saveLoading = true;

    const technicianModel = this.getTechnicianModal(save);

    if (!save) {
      technicianModel.is_completed = false;
    }

    this.subsink.sink = this.endPoint.postTechnican(technicianModel, this.patient.id).subscribe(() => {

      this.editedFixedData.forEach((report: any) => {
        this.subsink.sink = this.endPoint.updateLabTechnicians(report).subscribe(() => {
          count++;
          if (count === totalReports) {
            this.alertService.showSuccess(`Report Created`, `${this.title}`);
            this.lab_remark = "";

            this.modalService.dismissAll();

            if (this.due_print || this.patient.LabPatientTestID.patient.total_due == 0) {
              if (save) {
                this.saveAuthLoading = false;
                if (this.print_permissons && this.print_permissons?.radiology_print) {
                  this.printTechnicianReport(this.getPrintReportModel(), {}, false, this.settings.display_letterhead, false);
                } else {
                  this.getData();
                }

              } else {
                this.saveLoading = false;
                this.getData();
              }
            } else {
              this.getData();
            }

          }
        }, (error: any) => {
          if (count !== totalReports) {
            save ? this.saveAuthLoading = false : this.saveLoading = false;
            this.alertService.showError(`Failed`, `${this.title}`);
          }
        });
      });
    }, (error: any) => {
      save ? this.saveAuthLoading = false : this.saveLoading = false;
      this.getData();
      this.alertService.showError(error);
    });


  }

  onSubmitForFixed(event : any) {
    let count = 0;
    const totalReports = event.data.length;
    event.save ? this.saveAuthLoading = true : this.saveLoading = true;

    const technicianModel =this.getTechnicianModal(event.save);

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
            event.save ? this.saveAuthLoading = false : this.saveLoading = false;

            if (this.due_print || this.patient.LabPatientTestID.patient.total_due == 0) {

              if (event.save) {

                if (this.print_permissons && this.print_permissons?.technician_print) {
                  this.printTechnicianReport(this.getPrintReportModel(), {}, false, this.settings.display_letterhead, false);
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

    const technicianModel = this.getTechnicianModal(save);

    if (!save) {
      technicianModel.is_completed = false;
      this.saveLoading = true;
    } else {
      this.saveAuthLoading = true
    }

    this.subsink.sink = this.endPoint.postTechnican(technicianModel, this.patient.id).subscribe(() => {
      this.lab_remark = "";

      this.reportTableData[0].report = this.wordReportContent;

      this.subsink.sink = this.endPoint.updateWordReport(this.reportTableData[0]).subscribe((data: any) => {

        save ? this.saveAuthLoading = false : this.saveLoading = false;

        if (this.due_print || this.patient.LabPatientTestID.patient.total_due == 0) {
          if (save) {
            if (this.print_permissons && this.print_permissons?.radiology_print) {
              this.printTechnicianReport(this.getPrintReportModel(), {}, false, this.settings.display_letterhead, false);
            } else {
              this.getData();
            }
          }

        } else {
          this.getData();
        }

        if (closeModal) {
          this.fullscreen = false;
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

  
  print_with_header: boolean = false ;
  print_without_header: boolean = false ;

  download_with_header: boolean = false ;
  download_without_header: boolean = false ;

  printReportForEdit(data: any, showAlert: boolean, letterhead: boolean, download: boolean ) {

    const details = {
      test_id: data.LabPatientTestID.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
      pdf: download,
      lh : letterhead
    }

    data['printLoading'] = true;
    if(!download){
      if(letterhead) this.print_with_header = true 
      else this.print_without_header = true ;
    }else{
      if(letterhead) this.download_with_header = true 
      else this.download_without_header = true ;
    }

    if (this.canGivePrint) {
      if (this.due_print || data.LabPatientTestID.patient.total_due == 0) {
        this.printTechnicianReport(details, data, showAlert, letterhead, download)
      } else {
        data['printLoading'] = false;
        this.stopPrintDownloadLoading();
        this.alertService.showInfo("You Don't Have Access To Give Due Report Print.")
      }
    } else {
      data['printLoading'] = false;
      this.stopPrintDownloadLoading();
      this.alertService.showInfo("You Don't Have Access To Give Print.")
    }

  }

  stopPrintDownloadLoading(){
    this.print_with_header = false ;
    this.print_without_header = false ;
    this.download_with_header = false ;
    this.download_without_header = false;
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

  opened: boolean = false;

  withoutSpecChars(e: any) {
    return e.replace(/\n/g, '<br>')
  }

  checkBold(e: any, report: any, item: any) {
    const index = this.editedFixedData.findIndex((d: any) => d.id === report);
    if (index !== -1) {
      this.editedFixedData[index].is_value_bold = e;
      this.changesMade = true;
    }

    item.is_value_bold = e;
  }


  parameters: any = [];

  getTestDefaultParamters(q: any = this.q_param) {

    this.subsink.sink = this.masterEndpoint.getDefaultParamters(this.patient.LabPatientTestID.LabGlobalTestId, "all", 1, q).subscribe((res: any) => {
      if (res.length >= 1) {
        this.parameters = [];
        res.forEach((d: any) => {
          if (d.is_active) {
            this.parameters.push(d.parameter);
          }
        })
      }
    });

    this.reportTableData.forEach((param: any) => {
      if (param.parameters && param.parameters.length >= 1) {
        param.parameters.forEach((rpt: any) => {
          this.checkFormula(rpt)
        })
      }
    });


  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.parameters.filter((v: any) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );

  UpdatePrintControls(e: any) {
    this.print_permissons['radiology_print'] = e;
    this.subsink.sink = this.staffEndpoint.updatePrintControls(this.print_permissons).subscribe((res: any) => { }, (error) => { })
  };

  updateReviewCount(model: any){
    this.subsink.sink = this.endPoint.postTechnican(model, model.id).subscribe((res: any)=>{

    })
  }

  showError(){
    this.alertService.showInfo("You Don't Have Access To Give Prints.")
  }

}
