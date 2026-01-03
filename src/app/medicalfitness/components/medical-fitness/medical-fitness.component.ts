import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
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


@Component({
  selector: 'app-medical-fitness',
  templateUrl: './medical-fitness.component.html',
  styleUrl: './medical-fitness.component.scss'
})

export class MedicalFitnessComponent extends BaseComponent<LabTechnician> {

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
    private cdr: ChangeDetectorRef,
    private staffEndpoint: StaffEndpoint,
    public printSrvc: PrintService) { super(injector) }

  @ViewChild("myckeditor") ckeditor: any;


  passkeyForm!: UntypedFormGroup;
  pageNum!: number | null;
  ages!: any;
  staffId!: number;
  departments: any;
  changesMade: boolean = false;

  @ViewChild('editor') editorData: any;
  @ViewChild('wordReport') wordReportModal: any;

  private inputSubject: Subject<any> = new Subject<any>();

  public wordReportContent: string = '';
  public htmlData: string = "";
  public htmlHeader: string = "";

  activeButton: string = "pending";
  showPreview: any = false;
  organization: any;

  public onReady(editor: any) {
    this.editorData = editor;
  }

  public wordReportInput({ editor }: any) {
    this.wordReportContent = editor.getData();
    this.changesMade = true;
  }

  setActiveButton(id: string) {
    this.activeButton = id;
  }

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


  @ViewChild('content') content!: any;
  is_superadmin: boolean = true;

  override ngAfterViewInit(): void {

  }

  ultraDept: any;
  ultraText: any = '';

  override ngOnInit(): void {

    const staffData = this.cookieSrvc.getCookieData();
    this.staffId = staffData.lab_staff_id;
    this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv');

    this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data: any) => {
      this.departments = data;
      const preSelect = this.departments.filter((d: any) => d.name == "Medical Examination" && d.is_active)

      this.ultraDept = preSelect
      let q = "";
      preSelect.forEach((data: any) => q += data.id.toString() + ",")
      this.dept = preSelect.length !== 0 ? q.replace(/,\s*$/, '') : '';
      this.ultraText = this.dept;

      this.page_size = 10;
      this.page_number = 1;
      this.count = 1;
      this.all_count = 1;
      this.query = "";
      this.patients = [];

      this.date = this.timeSrvc.getTodaysDate();
      this.pageLoading = false ;
      if (preSelect.length !== 0) {
        this.getData();
      }
    })

    this.pageNum = 1;

    this.statusQuery = "&status_id=2,6,11,15";
    this.passkeyForm = this.formBuilder.group({
      passkey: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    });

    this.inputSubject.pipe(
      debounceTime(300)  // Adjust the debounce time as neededd
    ).subscribe(value => {
      this.getTestDefaultParamters()
    });

  }

  count!: number;
  all_count!: number;
  patients!: any;
  date: any = this.timeSrvc.getTodaysDate();
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  statusQuery!: any;
  page_size!: any;
  page_number!: any;
  query!: string;
  sort: boolean = true;
  emergencyCount: any;



  pageLoading: boolean = true ;

  getData() {

    this.patients = [];
    if(!this.pageLoading){
      this.subsink.sink = this.endPoint.getLabTechnicians(
        this.page_size, this.page_number,
        this.statusQuery, this.query, this.dept,
        this.date, this.from_date, this.to_date, this.sort, this.refDocQueryTerm, true
      ).subscribe((data: any) => {
  
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        this.patients = data.results;
  
        this.patients.forEach((ptn: any) => {
          ptn['loading'] = false;
        })
  
        data.referral_doctors.forEach((doc: any) => {
          doc.name += ', \n' + "" + doc.mobile_number
        })
  
        this.patientRefDoctors = data.referral_doctors
        this.getEmergencyCount();
      })
    }

  }

  patientRefDoctors: any = [];
  refDocQueryTerm: string = "";
  refDoctorQueryloading: boolean = false;

  getPatientDoctors(e: any) {
    // return this.refcomp
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

  dept: string = "";
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
      this.date = this.timeSrvc.getTodaysDate();
      this.from_date = "";
      this.to_date = "";
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
  patientName = "";
  isAuth: boolean = false;
  editedFixedData: any;
  patient: any;
  TestTemplates: any;
  routineTemplates: any;
  rtfContent: any = '' ; 
  getTemplates: boolean = false;

  openXl(content: any, data: any, type: string) {

    this.patient = data;
    this.patient['loading'] = false;
    data.LabPatientTestID.is_authorization ? this.isAuth = true : this.isAuth = false;

    this.title = `${data?.LabPatientTestID?.patient?.title} ${data?.LabPatientTestID?.patient?.name} | ${data.LabPatientTestID?.patient?.ULabPatientAge == 'DOB' ? data.LabPatientTestID?.patient.dob : data.LabPatientTestID?.patient.age} ${data.LabPatientTestID?.patient?.ULabPatientAge} | ${data.LabPatientTestID?.patient.gender} | ${data.LabPatientTestID?.name} | Ref Dr - ${data?.LabPatientTestID?.patient?.referral_doctor ? data?.LabPatientTestID?.patient?.referral_doctor : 'SELF'} | ${this.timeSrvc.decodeTimestamp(data.LabPatientTestID?.added_on)}`;

    if (type === "fixed") {

      this.subsink.sink = this.endPoint.getLabReports(data.LabPatientTestID.id).subscribe((dataFixed: any) => {
        if (dataFixed.length > 0) {
          this.reportTableData = this.groupData(dataFixed);
          this.editedFixedData = dataFixed;

          this.subsink.sink = this.endPoint.getSpecificLabTechinican(this.patient.id).subscribe((res: any) => {
            this.lab_remark = res?.lab_technician_remarks?.remark || "";
          })

          this.modalService.open(content, { size: 'xl', centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
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

        } else {
          data.loading = false;
          this.alertService.showError(`There is no Report for this ${this.title}`);
        }
      });
      this.getData();
    }
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
        this.editedFixedData[index].value = newValue.target.value;
        this.q_param = newValue.target.value;
        this.inputSubject.next(this.q_param);
      }

      this.changesMade = true;
    }

  }

  onReportValueSelected(newValue: any, report: any) {

    const index = this.editedFixedData.findIndex((d: any) => d.id === report);
    if (index !== -1) {
      this.editedFixedData[index].value = newValue.item;

      this.changesMade = true;
      this.getTestDefaultParamters(newValue.item);
    }

  }



  lab_remark: any = ""
  writeRemark(e: any) {
    this.lab_remark = e.target.value;
    this.changesMade = true;
  }

  @ViewChild('warningModal') warningModal!: any;

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
    this.htmlData = e;
    this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv');
    this.fullScreen = !this.fullScreen;
    this.modalService.dismissAll();
    if (this.fullScreen) {
      this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: true, centered: false, scrollable: false, backdrop: 'static', keyboard: false, });
    } else {
      this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false, scrollable: false, backdrop: 'static', keyboard: false, });
    }

  }


  exitFullScreenClick(e: any): any {
    this.htmlData = e.data;
    this.wordReportContent = e.data;
    this.modalService.dismissAll();
    this.modalService.open(this.wordReportModal, { size: 'xl', fullscreen: false, centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
  }


  handleExtractedContentChange(e: any) {
    this.wordReportContent = e.data;
    this.reportTableData[0].rtf_content_report = e.rtf_content;    
    this.saveWordReport(e.boolVal, e.closeModal)
  }

  closeFullScreen(content: any) {
    this.fullscreen = false;
    this.reportTableData = this.groupData(this.editedFixedData);
    this.modalService.open(content, { size: 'xl', centered: false, scrollable: true, backdrop: 'static', keyboard: false, });
  }


  resetRemark() {
    this.lab_remark = '';
  }


  printCertificate(data: any) {
    const details = {
      patient_id: data?.LabPatientTestID?.patient?.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.subsink.sink = this.endPoint.printReport(details, 'print_medical_certificate').subscribe((res: any) => {
      data['printLoading'] = false;
      // this.printSrvc.printer(response.html_content, false, false, 500)
      if(res?.html_content){
        this.printSrvc.printHeader(res.html_content, res.header);
      }

      if(res?.medical_examination_content) {
        this.printSrvc.printer(res.medical_examination_content, false, false, 100)
      }
    }), (error: any) => {
      data['printLoading'] = false;
      this.alertService.showError("Oops", "Failed to print the report")
    }

  }

  printTechnicianReport(model: any, data: any = {}) {

    this.subsink.sink = this.endPoint.printReport(model).subscribe((res: any) => {
      data['printLoading'] = false;
      // this.printSrvc.printHeader(response.html_content, response?.header || '');
      if(res?.html_content){
        this.printSrvc.printHeader(res.html_content, res.header);
      }

      if(res?.medical_examination_content) {
        this.printSrvc.printer(res.medical_examination_content, false, false, 100)
      }
    }), (error: any) => {
      data['printLoading'] = false;
      this.alertService.showError("Oops", "Failed to print the report")
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
        this.pageNum = null;
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
      this.pageNum = null;
    }, (error) => {

      this.alertService.showError("In the set Up page, create a report and try again.", `No reports available for ${patient.LabPatientTestID.name}`)
    });

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
      const res = Response;
      this.alertService.showSuccess("Sample Received", `${model.LabPatientTestID.patient.name} | ${model.LabPatientTestID.name}`);
      model.phlebotomist = res;
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
  doc: any = null;

  onSubmit(save: boolean) {

    let count = 0;
    const totalReports = this.editedFixedData.length;
    save ? this.saveAuthLoading = true : this.saveLoading = true;


    const model = this.getTechnicianModel(save);

    if (!save) {
      model.is_completed = false;
    }

    this.subsink.sink = this.endPoint.postTechnican(model, this.patient.id).subscribe(() => {
      this.editedFixedData.forEach((report: any) => {
        this.subsink.sink = this.endPoint.updateLabTechnicians(report).subscribe(() => {
          count++;
          if (count === totalReports) {

            this.alertService.showSuccess(`Report Created`, `${this.title}`);
            this.lab_remark = "";
            this.getData();

            const details = {
              test_id: this.patient.LabPatientTestID.id,
              client_id: this.cookieSrvc.getCookieData().client_id,
              printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
            }

            this.modalService.dismissAll();
            save ? this.saveAuthLoading = false : this.saveLoading = false;
            save ? this.printTechnicianReport(details) : null

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


  getTechnicianModel(save: any) {
    const model = {
      is_completed: this.isAuth ? false : true,
      LabPatientTestID: this.patient.LabPatientTestID.id,
      report_created_by: this.staffId,
      is_report_finished: save,
      consulting_doctor: this.doc ? this.doc.id : null,
      lab_technician_remarks: {
        remark: this.lab_remark,
        added_by: this.staffId,
      }
    };

    return model
  }

  saveWordReport(save: boolean, closeModal: boolean = true) {

    const model = this.getTechnicianModel(save);

    if (!save) {
      model.is_completed = false;
    }

    save ? this.saveAuthLoading = true : this.saveLoading = true;
    this.subsink.sink = this.endPoint.postTechnican(model, this.patient.id).subscribe(() => {
      this.lab_remark = "";

      this.reportTableData[0].report = this.wordReportContent;

      this.subsink.sink = this.endPoint.updateWordReport(this.reportTableData[0]).subscribe((data: any) => {

        const details = {
          test_id: data.LabPatientTestID,
          client_id: this.cookieSrvc.getCookieData().client_id,
          printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        };

        this.getData();

        save ? this.saveAuthLoading = false : this.saveLoading = false;
        save ? this.printTechnicianReport(details) : null;

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


  printReportForEdit(data: any) {
    const details = {
      test_id: data.LabPatientTestID.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }
    data['printLoading'] = true;
    this.printTechnicianReport(details, data)
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

      if (groupIndex === -1) {
        // If the group does not exist, create a new group
        let val = report.value.toLowerCase();
        let select: boolean = false;

        if (val.includes('select') && val.includes("**")) {
          val = report.value.split('**').slice(1, -1);
          select = true;
        }

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
            is_value_bold: report.is_value_bold
          }]
        });
      } else {

        let val = report.value.toLowerCase();
        let select: boolean = false;

        if (val.includes('select') && val.includes("**")) {
          val = report.value.split('**').slice(1, -1);
          select = true;
        }

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
          is_value_bold: report.is_value_bold
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
  openPreviewModal(e: boolean) {
    this.opened = !this.opened
    if (this.opened) {
      const preview = document.getElementById("previewofreport");
      preview?.classList.remove('previewofreport');
      preview?.classList.add('previewofreport-full');
    } else {
      const preview = document.getElementById("previewofreport");
      preview?.classList.remove('previewofreport-full');
      preview?.classList.add('previewofreport');
    }
  }

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

    })
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.parameters.filter((v: any) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );


}
