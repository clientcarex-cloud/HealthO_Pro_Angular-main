
import { Component, Injector, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
// components 
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PatientOffcanvasComponent } from 'src/app/patient/components/patient-offcanvas/patient-offcanvas.component';
//models
import { AddPatientsModel } from 'src/app/patient/models/addPatient/addpatient.model';
// services 
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { FileService } from '@sharedcommon/service/file.service';
// Endpoints
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { LoyaltyCardEndpoint } from 'src/app/loyaltycard/loyaltycard.enpoint';
import { AddPatientEndpoint } from 'src/app/patient/endpoints/addpatient.endpoint';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { SharedPatientsService } from '../../services/sharedpatient.service';

@Component({
  selector: 'app-patient-page',
  templateUrl: './patient-page.component.html',
  styleUrls: ['./patient-page.component.scss'],
  animations: [
    trigger('collapseExpand', [
      state('open', style({
        height: '*',
        opacity: 1,
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        padding: '0'
      })),
      transition('open <=> closed', [
        animate('0.15s ease-in-out')
      ]),
    ]),
  ]
})

export class PatientPageComponent extends BaseComponent<AddPatientsModel> {

  model: any;
  addPatient!: UntypedFormGroup;
  discountGroup!: UntypedFormGroup;
  selectPrintForm!: UntypedFormGroup
  refundform!: UntypedFormGroup;

  currentDate: any;

  @ViewChild('auto_complete') auto_complete_box: any;
  @ViewChild('auto_complete_mobile') auto_complete_box_mobile: any;
  @ViewChild('paymentHistory') paymentHistory: any;
  @ViewChild('refundHistory') refundHistory: any;
  @ViewChild('PNDTForm') PNDTForm: any;
  @ViewChild('discountType') discountSelect_option: any;
  @ViewChild('activityModal') activityModal: any;

  @ViewChild('multiPrint') multiPrintModal: any;
  @ViewChild('file') fileImage: any;
  @ViewChild(PatientOffcanvasComponent) patientOffcanvas!: PatientOffcanvasComponent;

  inProgress: boolean = false;
  disableData!: boolean;
  years: boolean = false;
  homeSrvc: boolean = false;
  pageLoading: boolean = false;
  isCollapsed: boolean = true;

  checkRefundLimit: any;
  disableDiscount = false;
  searchLoading = false;
  docLoading: boolean = false;
  printReports: boolean = false;

  image: string | null = '';
  testTerm: any = ""
  remarkSave: any = "";
  printModalHeader!: string;
  messageStatus: boolean = false;
  timer: any;

  ptnId!: number;
  pendingId!: number;
  urgentId!: number;
  emeregencyId!: number;
  total_due: number = 0;
  patientTestsLength = 0;
  preTestsCost = 0;
  index = 0;

  totalRefund!: any;
  staffId: any;
  searchData: any;
  staffs: any;
  reports: any = [];
  departments!: any;
  refDoctors: any[] = [];
  titles: any;
  genders!: any[];
  all_actions: any = [] ;
  actions!: any[];
  discTypes!: any[];
  payModes!: any[];
  ages!: any[];
  ptn: any = [];
  status: any = [];
  all_status: any;
  emerStatus: any = [];
  tests_included: any = [];
  package_included: any = [];
  selectedTests: any = [];
  paymentHistoryTable: any = [];
  selected_tests_for_prints: any = [];
  refundList: any = [];
  printDepts!: any;

  attender_titles: any;
  consultingDoctors!: any;

  organization: any;

  support: any = {
    name: "",
    description: "",
    youtube_link: "",
    article_link: "",
    quick_steps: ""
  };
  user_permissions: any = {
    sa: false,
    number: 0,
    permissions: []
  }


  refundTests: any = [];
  refundPackages: any = [];
  cancelTestId!: any;
  cancelPackageId!: any;
  checkTestLimit: any = 0;
  multiPrintReports: any;
  filteredMultiPrints: any;

  constructor(
    injector: Injector,

    private route: ActivatedRoute,
    private router: Router,

    private formBuilder: UntypedFormBuilder,

    public timeSrvc: TimeConversionService,
    public capitalSrvc: CaptilizeService,
    private printSrvc: PrintService,
    private cookieSrvc: CookieStorageService,
    private fileSrvc: FileService,
    private sharedPatient: SharedPatientsService,

    private proEndpoint: ProEndpoint,
    private patientEndpoint: PatientEndpoint,
    private staffEndpoint: StaffEndpoint,
    private doctorEndpoint: DoctorEndpoint,
    private signUpEndpoint: SignUpEndpoint,
    private masterEndpoint: MasterEndpoint,
    private loyaltyCardEndpoint: LoyaltyCardEndpoint,
    private endPoint: AddPatientEndpoint,

  ) { super(injector) }

  printCard(e: any) {
    this.sharedPatient.printCard(e);
  }

  navigateBack() {
    window.history.back()
  }

  override ngAfterViewInit(): void {

    this.getSetting();

    this.subsink.sink = this.signUpEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.organization = data[0];
    });

    this.subsink.sink = this.endPoint.getDiscountTypes().subscribe((data: any[]) => {
      const activeDiscTypes = data.filter((d: any) => d.is_active);
      this.discTypes = activeDiscTypes;
      this.disableData = activeDiscTypes.length === 0;
    });
    

    this.subsink.sink = this.endPoint.getSupport().subscribe((data: any) => {
      this.support = data.results.find((item: any) => item.slug === "Patient_registration");
    });

    this.subsink.sink = this.proEndpoint.getActions().subscribe((data: any) => {
      this.all_actions = data.results;
      this.checkPatientReportsPrinting();
    });
  }

  override ngOnInit(): void {

    this.currentDate = new Date() || '';
    this.disableData = false;

    const staffData = this.cookieSrvc.getCookieData();
    this.staffId = staffData.lab_staff_id


    this.baseForm = this.formBuilder.group({
      bId: [null],
      title: [1, Validators.required],
      name: [this.ptn.name ? this.ptn.name : '', Validators.required],
      age: [null, Validators.required],
      dob: [null],
      gender: [1, Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      referral_doctor: [null],
      home_service: [{ is_required: false, added_on: this.sharedPatient.getDateTime(), patient: 23 }],
      lab_tests: [[]],
      lab_packages: [[]],
      lab_discount_type_id: [null],
      is_percentage_discount: [false],
      paid_amount: [""],
      pay_mode_id: 1,
      discount_amt: "",
      ULabPatientAge: [1],
      address: [''],
      attender_name: [""],
      attender_relationship_title: null,
      prescription_attach: null,
      is_discount_amt_by_ref_doc: false,

      email: ''
    });

    this.subsink.sink = this.proEndpoint.getAttenderTitles().subscribe((data: any) => {
      this.attender_titles = data.reverse();
    });

    this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data: any) => {
      this.departments = data;
    })

    this.selectPrintForm = this.formBuilder.group({
      action: [3]
    })

    this.discountGroup = this.formBuilder.group({
      discount_input: ["", [Validators.min(0), Validators.max(100)]]
    })

    this.subsink.sink = this.proEndpoint.getLabTestStatus().subscribe((data: any) => {

      const testsStatus = data.filter((d: any) => d.is_active);
      this.all_status = data.filter((d: any) => d.is_active);
      testsStatus.forEach((tests: any) => {
        if (tests.name === 'Pending') {
          const model = { id: tests.id, name: "General" }
          this.pendingId = tests.id;
          this.status.push(model);
        } else if (tests.name === 'Emergency (Pending)') {
          const model = { id: tests.id, name: "Emergency" }
          this.emeregencyId = tests.id;
          this.emerStatus.push(model);
          this.status.push(model);
        }
      })

    })

    this.subsink.sink = this.proEndpoint.getTitle().subscribe((data: any) => {
      this.titles = data;
    });

    this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
      this.genders = data.results;
    });


    this.subsink.sink = this.proEndpoint.getPayModes().subscribe((data: any) => {
      this.payModes = data.results.filter((method: any) => method.is_active);
    });

    this.subsink.sink = this.proEndpoint.getAges().subscribe((data: any) => {
      this.ages = data.results;
      this.baseForm.get('ULabPatientAge')?.setValue(this.ages.find((age: any) => age.name === "Years")?.id)
    });

    if (!staffData.is_superadmin) {
      this.user_permissions.sa = false;
      this.subsink.sink = this.staffEndpoint.getStaffPatientsPermissions(this.cookieSrvc.getCookieData().lab_staff_id).subscribe((data: any) => {

        if (data.length == 0) {
          this.user_permissions.permissions = [];
          this.alertService.showWarning("You Dont't Have Access to View Patient", "")
          this.router.navigate(['/patient/patients/']);
        } else {
          if (!data[0].permissions.includes(2)) {
            this.alertService.showWarning("You Dont't Have Access to View Patient", "")
            this.router.navigate(['/patient/patients/']);
          } else {
            this.user_permissions.permissions = data[0].permissions;
            this.user_permissions.number = parseFloat(data[0].number);
            if (!this.user_permissions.permissions.includes(3)) {
              this.baseForm.get('name')?.disable();
              this.baseForm.get('title')?.disable();
              this.baseForm.get('age')?.disable();
              this.baseForm.get('gender')?.disable();
              this.baseForm.get('mobile_number')?.disable();
              this.baseForm.get('address')?.disable();
              this.baseForm.get('attender_name')?.disable();
              this.baseForm.get('attender_relationship_title')?.disable();
              this.baseForm.get('prescription_attach')?.disable();
              this.baseForm.get('dob')?.disable();
              this.baseForm.get('ULabPatientAge')?.disable();
              this.baseForm.get('email')?.disable();
            }
          }
        }
      })
    } else {
      this.user_permissions.sa = true;
      this.user_permissions.number = 100;
    }

    this.patientReload();

  }


  resetPatientInvoiceDetails() {

    this.discountAmount = 0;
    this.totalAmount = 0;
    this.isDiscountApplied = false;
    this.discountGroup.get('discount_input')?.setValue("");
    this.payModesCount = 1;
    this.secondMode?.reset();
    this.selectedDiscount = {
      name: "",
      is_prcntg: false,
      number: 0,
      is_active: false,
      id: ""
    }
    this.remarkSave = "";
    this.patientTestsLength = 0;
    this.preTestsCost = 0;
    this.index = 0;
    this.selectedTests = [];
    this.dispDiscount = "0.00"
  }

  checkPatientReportsPrinting(){
    this.actions = this.all_actions ;
    if (!this.cookieSrvc.getCookieData().is_superadmin) {
      if (!this.user_permissions.permissions.includes(8)) {
        this.actions = this.actions.filter((act: any) => act.id != 2 && act.id != 7 && act.id != 5 && act.id!=8)
      } else {
        if (!this.user_permissions.permissions.includes(9)) {
          if (this.total_due !== 0) {
            this.actions = this.actions.filter((act: any) => act.id != 2 && act.id != 7 && act.id != 5 && act.id!=8);
          }
        }
      }
    }
  }

  patientReload(id: any = null) {

    if (id) {
      this.ptnId = id;
      this.getPatientData();
    } else {
      this.route.queryParams.subscribe(params => {
        this.ptnId = +params['patient_id'];
        this.getPatientData();
      })
    }
  }

  getPatientData() {

    this.subsink.sink = this.endPoint.getPatientDetails(this.ptnId).subscribe((data: any) => {

      this.resetPatientInvoiceDetails();
      this.ptn = data.results[0];

      this.totalRefund = this.ptn.invoice.total_refund;

      this.setBaseForm();

      this.image = this.ptn.prescription_attach || null;

      if(this.ptn?.referral_lab || this.ptn?.partner || this.ptn?.attender_name || this.ptn?.prescription_attach || this.ptn?.address ){
        this.isCollapsed = false ;
      }

      if(this.ptn?.partner){
        this.ptn.partner.name = `${this.ptn?.partner?.company?.name} / ${this.ptn?.partner?.name}`
      }

      if (this.ptn.referral_doctor) {
        this.doctorEndpoint.getSingleDoctor(this.ptn.referral_doctor).subscribe((data: any) => {
          this.baseForm.get('referral_doctor')?.setValue(data);
        })
      }

      if (this.ptn.ULabPatientAge === 4) {
        this.years = this.ptn.ULabPatientAge === 4;
        this.baseForm.get('age')?.clearValidators();
        this.baseForm.get('age')?.updateValueAndValidity();
      }

      this.disableGlobalTest = !this.is24HoursBack(this.ptn.added_on);

      this.setAmounts();
      this.setLabTests();
    });
  }

  patientTestReload() {

    this.route.queryParams.subscribe(params => {
      this.ptnId = +params['patient_id']
      if (this.ptnId) {
        this.subsink.sink = this.endPoint.getPatientDetails(this.ptnId).subscribe((data: any) => {

          this.ptn = data.results[0];
          this.patientTestsLength = 0;
          this.preTestsCost = 0;
          this.index = 0;
          this.selectedTests = [];

          this.disableGlobalTest = !this.is24HoursBack(this.ptn.added_on);
          this.total_paid = this.ptn.invoice.total_paid;

          if (parseFloat(this.ptn.invoice?.total_discount.replace(/,/g, '')) > 0) {
            this.disableDiscount = true;
          } else {
            this.discountGroup.get('discount_input')?.enable();
            this.disableDiscount = false;
          }

          this.setLabTests();

        });
      }
    })
  }

  reload() {
    this.route.queryParams.subscribe(params => {
      this.ptnId = +params['patient_id']
      if (this.ptnId) {
        this.subsink.sink = this.endPoint.getPatientDetails(this.ptnId).subscribe((data: any) => {

          this.ptn = data.results[0];

          this.selectedTests = [];
          this.totalRefund = this.ptn.invoice.total_refund;

          this.setBaseForm();

          if (this.ptn.referral_doctor) {
            this.doctorEndpoint.getSingleDoctor(this.ptn.referral_doctor).subscribe((data: any) => {
              this.baseForm.get('referral_doctor')?.setValue(data);
            })
          }

          if (this.ptn.ULabPatientAge === 4) {
            this.years = this.ptn.ULabPatientAge === 4;
            this.baseForm.get('age')?.clearValidators();
            this.baseForm.get('age')?.updateValueAndValidity();
          }

          this.disableGlobalTest = this.is24HoursBack(this.ptn.added_on);

          this.setAmounts();
          this.setLabTests();
        });
      }
    })
  }

  setAmounts(){

    this.total_paid = this.ptn.invoice.total_paid;

    if (parseFloat(this.ptn.invoice?.total_discount.replace(/,/g, '')) > 0) {
      this.disableDiscount = true;
    } else {
      this.discountGroup.get('discount_input')?.enable();
      this.disableDiscount = false;
    }
    
    this.total_due = parseFloat(this.ptn.invoice?.total_due || 0);
    if (this.total_due < 0) this.total_due = 0;

    this.checkRefundLimit = parseFloat(this.ptn.invoice?.total_paid.replace(/,/g, '')) - parseFloat(this.ptn.invoice?.total_refund.replace(/,/g, ''));
    if (this.checkRefundLimit <= 0) this.checkRefundLimit = 0;
    
    this.checkPatientReportsPrinting();
  }

  setLabTests(){
    if (this.ptn && this.ptn.lab_tests.lab_tests) {
      this.ptn.lab_tests.lab_tests.forEach((test: any) => {
        this.updateLabTest(test);
      });
    }

    if (this.ptn && this.ptn.lab_packages) {
      this.ptn.lab_packages.forEach((test: any) => {
        this.UpdateLabPackage(test);
      });
    }

    this.selectedTests = this.sharedPatient.sortByAddedOn(this.selectedTests);

  }

  setBaseForm(){
    this.baseForm.reset({
      bId: this.ptn.b_id,
      title: this.ptn.title ? this.ptn.title.id : null,
      name: this.ptn.name,
      age: this.ptn.age ? this.ptn.age : null,
      gender: this.ptn.gender,
      dob: this.ptn.dob ? this.ptn.dob : null,
      mobile_number: this.ptn.mobile_number,
      referral_doctor: null,
      home_service: { is_required: false, added_on: this.sharedPatient.getDateTime(), patient: 23 },
      lab_tests: [],
      lab_packages: [],
      lab_discount_type_id: this.ptn.invoice.dis,
      is_percentage_discount: false,
      pay_mode_id: 1,
      paid_amount: "",

      address: this.ptn.address ? this.ptn.address : "",

      ULabPatientAge: this.ptn.ULabPatientAge !== null ? this.ptn.ULabPatientAge : 1,
      attender_name: this.ptn.attender_name ? this.ptn.attender_name : "",
      attender_relationship_title: this.ptn.attender_relationship_title ? this.ptn.attender_relationship_title : null,
      prescription_attach: this.ptn.prescription_attach || null,
      is_discount_amt_by_ref_doc: this.ptn.is_discount_amt_by_ref_doc,

      email: this.ptn.email
    });
  }


  disableGlobalTest!: boolean;

  is24HoursBack(timestampStr: string): boolean {
    const todayOrNot = this.timeSrvc.decodeTimestamp(timestampStr);
    return todayOrNot.includes('Today')
  }

  removeDigitsAfterPlus(inputString: string): string {
    const plusIndex = inputString.indexOf("//++");
    if (plusIndex !== -1) {
      return inputString.substring(0, plusIndex);
    } else {
      return inputString;
    }
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
        this.subsink.sink = this.endPoint.getLabDoctors(searchTerm).subscribe((data: any) => {
          this.refDoctors = data.filter((d: any) => d.is_active && !d.is_duplicate);
          this.docLoading = false;
        });
      }, 0);
    } else {
      this.testTerm = null;
      this.refDoctors = [];
      this.docLoading = false;
    }
  }

  openRefundModal(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: true, backdropClass: backDrop, backdrop: 'static', keyboard: false });
  }


  getMaxRefundLimit(withTests: boolean = true) {
    const model: any = {
      patient_id: this.ptnId,
      test_package_ids: [],
      test_ids: []
    }

    if (withTests) {
      if (this.cancelTestId) {
        this.cancelTestId.forEach((test: any) => {
          model.test_ids.push(test.LabGlobalTestId)
        })
      }

      if (this.cancelPackageId) {
        this.cancelPackageId.forEach((test: any) => {
          model.test_package_ids.push(parseInt(test.id.replace("pkg", "")));
        })
      }
    }

    this.subsink.sink = this.endPoint.getRefundMaxList(model).subscribe((response: any) => {
      if (response.refund_max_limit >= 0) {
        this.refundform.get('refund_limit')?.setValue(response.refund_max_limit);
        this.refundform.get('refund')?.setValue(response.refund_max_limit);
      } else {
        this.refundform.get('refund_limit')?.setValue(0);
        this.refundform.get('refund')?.setValue(0);
      }

    })
  }

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

    this.checkPNDT();
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
    this.checkPNDT();
  }



  changeAges(e: any) {
    if (e.target.value == 4) {
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

  // DELETE TESTS FROM TABLE 
  deleteTest(index: number, test: any) {

    if (test.package) {
      const afterpackages = this.baseForm.value.lab_packages.filter((obj: any) => obj.LabGlobalPackageId !== test.package_id);
      this.baseForm.get('lab_packages')?.setValue(afterpackages)
      this.selectedTests.splice(index, 1);
      this.package_included = this.package_included.filter((t: any) => t !== test.id);
    } else {

      this.selectedTests.splice(index, 1);
      this.baseForm.get('lab_tests')?.setValue(this.baseForm.value.lab_tests.filter((t: any) => t.LabGlobalTestId !== test.LabGlobalTestId))

      this.tests_included = this.tests_included.filter((t: any) => t !== test.LabGlobalTestId);
      if (this.selectedTests.length === 0) {
        this.totalAmount = 0.00;
        this.total_paid = 0.00;
        this.validateDiscount();
        this.discountGroup.get('discount_input')?.setValue("");
      }
    }
    this.patientTestsLength = this.patientTestsLength - 1
    this.getTotalAmount();
  }


  updateLabTest(item: any) {

    const tempTest = {
      tempId: this.index,
      LabGlobalTestId: item.id,
      name: item.name,
      date: this.timeSrvc.decodeTimestamp(item.added_on),
      status: item.status_id,
      cost: item.price,
      cost_true: false,
      discount: '0',
      discountAmount: '0.00',
      total: item.status_id !== "Cancelled" ? item.price : item.price,
      added_on: this.timeSrvc.decodeTimestamp(item.added_on),
      added_time: item.added_on,
      canRemove: false,
      department: item.department ? item.department : "",
      sourcing_lab: item?.sourcing_lab || null
    }
    this.index = this.index + 1;
    if (item.status_id !== "Cancelled") {
      this.preTestsCost = this.preTestsCost + parseFloat(item.price)
    }

    this.selectedTests.push(tempTest);
    this.checkPNDT();
  }

  UpdateLabPackage(item: any) {
    let concelled = false;
    item.lab_tests.forEach((test: any) => {
      test.LabGlobalTestId = test.id;
      test['tempId'] = this.index;
      this.index = this.index + 1;
      if (test.status_id == 'Cancelled') {
        concelled = true;
      }
    })

    const tempTest = {
      id: item.id + "pkg",
      name: item.name,
      date: this.timeSrvc.decodeTimestamp(item.added_on),
      status: concelled ? 'Cancelled' : 'Pending',
      cost: item.offer_price,
      cost_true: false,
      total: item.offer_price,
      added_on: this.timeSrvc.decodeTimestamp(item.added_on),
      canRemove: false,
      department: "",
      package: true,
      package_tests: item.lab_tests,
      package_id: item.id,
      added_time: item.added_on,
    };


    if (tempTest.status != 'Cancelled') {
      this.preTestsCost = this.preTestsCost + parseFloat(item.offer_price)
    }
    this.selectedTests.push(tempTest);
  }

  getRefundList() {
    this.modalService.dismissAll();
    this.modalService.open(this.refundHistory, { size: 'xl', centered: false, scrollable: true });
  }

  openXl(content: any) {
    this.openAction();
  }

  openMultiPrint(content: any, type: string) {
    this.multiPrintReports = [];
    this.filteredMultiPrints = [];
    this.printDepts = [];

    this.ptn['printLoading'] = false;

    this.printModalHeader = `${this.ptn.name} | ${this.timeSrvc.decodeTimestamp(this.ptn.added_on)} | ${type}`

    this.selectedTests.forEach((test: any) => {
      if (!test?.package) {
        if (test.status.includes('Completed')) {
          test['packageTest'] = false;
          this.multiPrintReports.push(test);
          this.filteredMultiPrints = this.multiPrintReports

          const existingDept = this.printDepts.find((d: any) => d.name === test.department);
          if (!existingDept) {
            this.printDepts.push(this.departments.find((d: any) => d.name === test.department));
          }
        }
      }
      if (test.package) {
        test.package_tests.forEach((t: any) => {
          if (t.status_id.includes('Completed')) {
            t['packageTest'] = true
            this.multiPrintReports.push(t);
            this.filteredMultiPrints = this.multiPrintReports
            const existingDept = this.printDepts.find((d: any) => d.name === t.department);
            if (!existingDept) {
              this.printDepts.push(this.departments.find((d: any) => d.name === t.department));
            }
          }
        });
        this.filteredMultiPrints = this.multiPrintReports
      }
    })

    if (this.filteredMultiPrints.length !== 0) {
      this.selected_tests_for_prints = [];
      this.modalService.open(content, { size: 'lg', scrollable: true })
    } else {
      this.printReports = false;
      this.alertService.showInfo("No Reports Were Completed To Print.")
    }

  }

  getMatchingObjects() {

    // Step 1: Create a map of tempId to index in originalOrder
    let tempIdIndexMap: { [key: number]: number } = {};
    this.filteredMultiPrints.forEach((item: any, index: any) => {
      tempIdIndexMap[item.tempId] = index;
    });

    // Step 2: Sort the array based on the mapped indices
    this.selected_tests_for_prints.sort((a: any, b: any) => {
      return tempIdIndexMap[a.tempId] - tempIdIndexMap[b.tempId];
    });

    const matchingObjects = this.selected_tests_for_prints.map((test: any) => {
      // Check if the test is present in selectedTests
      let matchingTest = this.selectedTests.find((selectedTest: any) => selectedTest.tempId === test.tempId);

      // If not found in selectedTests, check in lab_packages
      if (!matchingTest) {
        this.selectedTests.forEach((selectedTest: any) => {
          if (selectedTest.package_tests) {
            const packageTest = selectedTest.package_tests.find((pkgTest: any) => pkgTest.tempId === test.tempId);
            if (packageTest) {
              matchingTest = { ...packageTest, package_id: selectedTest.package_id };
            }
          }
        });
      }

      return matchingTest;
    });

    return matchingObjects
  }


  printCompletedTests() {

    const testObjs = this.getMatchingObjects();
    if (testObjs.length != 0) {

      let count = 0;
      this.ptn['printLoading'] = true;
      testObjs.forEach((test: any) => {
        const model = {
          test_id: test.LabGlobalTestId,
          client_id: this.cookieSrvc.getCookieData().client_id,
          printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        }

        this.subsink.sink = this.endPoint.print_test_report(model).subscribe((response: any) => {
          count += 1;
          if (count == testObjs.length) {
            this.ptn['printLoading'] = false;
          }
          this.printSrvc.printHeader(response.html_content, response.header)
        }, (error) => {
          this.ptn['printLoading'] = false;
          this.alertService.showError(error)
        })
      });


    } else {
      this.alertService.showInfo("Select atleast one test.")
    }

  }

  printReport(test: any){
    const model = {
      test_id: test.LabGlobalTestId,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    test['printLoading'] = true;

    this.subsink.sink = this.endPoint.print_test_report(model).subscribe((res: any) => {
      test['printLoading'] = false;

      if(res?.html_content){
          // if(!res?.is_only_fixed){
          //   this.printSrvc.printHeader(res.html_content, res.header, false, 1000,  this.download_letterhead == '&lh=true');
          // }else{
          //   this.printSrvc.printTabular(res.header, res.html_content, res.footer, this.download_letterhead == '&lh=true')
          // }
        this.printSrvc.printHeader(res.html_content, res.header, false, 1000, this.download_letterhead == '&lh=true');
      }

      if(res?.medical_examination_content) {
        this.printSrvc.printer(res.medical_examination_content, false, false, 100)
      }
    }, (error) => {
      test['printLoading'] = false;
      this.alertService.showError(error?.error?.Error || error?.error?.error || error )
    })
  }

  async sendReports() {
    if (!this.messageStatus) {
      this.alertService.showInfo("Reports cannot be sent on WhatsApp since this service has been disabled by management.");
      return;
    }
  
    if (this.selected_tests_for_prints.length === 0) {
      this.alertService.showInfo("Select at least one test.");
      return;
    }
  
    this.ptn['printLoading'] = true;
    const testObj = this.getMatchingObjects();

    let test_ids = '';
  
    for (const test of testObj) {
      test_ids += test.LabGlobalTestId + ',';
    }

    test_ids = test_ids.slice(0, -1);

    this.subsink.sink = this.endPoint.PostReportsToWhatsApp(test_ids, this.cookieSrvc.getCookieData().client_id, this.download_letterhead).subscribe((res: any) => {
        this.alertService.showSuccess("Reports Sent to " + this.ptn.mobile_number);
        this.ptn['printLoading'] = false;
        this.modalService.dismissAll();
        if(res?.send_reports_type == 'Manual'){
          const anchorTag = document.createElement('a');
          anchorTag.setAttribute('target', '_blank');
          // anchorTag.setAttribute('rel', 'noopener noreferrer');
          anchorTag.setAttribute('href', `https://wa.me/91${this.ptn.mobile_number}?text=${encodeURIComponent(res.content)}`);
          anchorTag.click();
        }

      },
      (error) => {
        this.ptn['printLoading'] = false;
        this.alertService.showError(error?.error?.Error || error?.error?.error);
      }
    );


    
  }
  
  async sendEmail(){
    if (!this.messageStatus) {
      this.alertService.showInfo("Reports cannot be sent on WhatsApp since this service has been disabled by management.");
      return;
    }
  
    if (this.selected_tests_for_prints.length === 0) {
      this.alertService.showInfo("Select at least one test.");
      return;
    }
  
    this.ptn['emailLoading'] = true;
    const testObj = this.getMatchingObjects();

    let test_ids = '';
  
    for (const test of testObj) {
      test_ids += test.LabGlobalTestId + ',';
    }

    test_ids = test_ids.slice(0, -1);

    this.subsink.sink = this.endPoint.PostReportsToEmail(test_ids, this.cookieSrvc.getCookieData().client_id, this.download_letterhead).subscribe((res: any) => {
      this.ptn['emailLoading'] = false;  
      this.alertService.showSuccess("Reports Sent to " + this.ptn.email);
        this.modalService.dismissAll();
      }, (error) => {
        this.ptn['emailLoading'] = false;
        this.alertService.showError(error?.error?.Error || error?.error?.error || error);
      }
    );



  }

  newSessionReceiptPrint() {
    this.patientReload();
  }

  selectDeptForPrint(e: any) {
    if (e) {
      this.selected_tests_for_prints = [];
      this.filteredMultiPrints = this.multiPrintReports.filter((test: any) => test.department == e.name);
    } else {
      this.filteredMultiPrints = this.multiPrintReports;
    }
  }


  drop(event: CdkDragDrop<string[]>) {
    this.selected_tests_for_prints = [];
    moveItemInArray(this.filteredMultiPrints, event.previousIndex, event.currentIndex);
  }


  download_letterhead: any = '&lh=true' ; 

  toggleDownloadLetterhead(event : any){
    if(event){
      this.download_letterhead = '&lh=true' ;
    }else{
      this.download_letterhead = '&lh=false' ;
    }
  }

  returnDownloadLetterheadBoolValue(){
    if(this.download_letterhead == ''){
      return true ; 
    }else{
      return false ;
    }
  }

  printMultiplePrints(download: boolean, lh: any) {


    if (this.selected_tests_for_prints.length != 0) {

      this.ptn['printLoading'] = true;
      const testObj = this.getMatchingObjects();
      let test_ids = '';
      let count = 0
      testObj.forEach((test: any) => {
        test_ids += test.LabGlobalTestId + ','
        count += 1;
        if (count == testObj.length) {

          this.subsink.sink = this.endPoint.postAndGetMultiPrint(test_ids.slice(0, -1), this.cookieSrvc.getCookieData().client_id, this.ptnId, lh, download).subscribe((res: any) => {
            this.ptn['printLoading'] = false;
            if(!download){

              if(res?.html_content){
                // if(!res?.is_only_fixed){
                //   this.printSrvc.printHeader(res.html_content, res.header, false, 1000,  this.download_letterhead == '&lh=true');
                // }else{
                //   this.printSrvc.printTabular(res.header, res.html_content, res.footer, this.download_letterhead == '&lh=true')
                // }

                this.printSrvc.printHeader(res.html_content, res.header, false, 1000,  this.download_letterhead == '&lh=true');
              }

              if(res?.medical_examination_content) {
                this.printSrvc.printer(res.medical_examination_content, false, false, 100)
              }

            }else{
              if(res?.link_pdf){
                this.fileSrvc.downloadFile(res?.link_pdf, `${this.ptn.name}_${this.ptn.mobile_number}.pdf`);
              }
              
            }

          }, (error) => {
            this.alertService.showError(error?.error?.Error || error?.error?.error || error );
            this.ptn['printLoading'] = false;
          })
        }
      })
    } else {
      this.alertService.showInfo("Select atleast one test.")
    }
  }


  isTestSelectedForPrint(test: any): boolean {
    return this.selected_tests_for_prints.some((selectedTest: any) => selectedTest.tempId === test.tempId);
  }



  getMessageStatus() {
    this.subsink.sink = this.masterEndpoint.getMessagesDetails(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.messageStatus = data[0].is_whatsapp_active;
    }, (error) => {
      this.alertService.showError("Failed to get Message Details")
    })
  }

  actionChange(e: any) {
    this.selectPrintForm.get('action')?.setValue(parseInt(e.target.value));
    this.openAction();
  }

  openAction() {
    const actionValue = this.selectPrintForm.get('action')?.value;
  
    switch (actionValue) {
      case 2:
        this.printReports = true;
        this.openMultiPrint(this.multiPrintModal, "Print Reports");
        break;

      case 3:
        this.modalService.open(this.paymentHistory, { size: 'xl', centered: false, scrollable: true });
        break ;
  
      case 4:
        this.modalService.open(this.activityModal, { size: 'xl', scrollable: true });
        break;
  
      case 6:
        this.modalService.open(this.refundHistory, { size: 'xl', centered: false, scrollable: true });

        this.refundList = [];
        this.refundTests = [];
        this.refundPackages = [];
  
        this.selectedTests.forEach((test: any) => {
          if (!test.canRemove && test.status !== "Cancelled") {
            test.package ? this.refundPackages.push(test) : this.refundTests.push(test);
          }
        });
        break;
  
      case 7:
        this.printReports = false;
        this.openMultiPrint(this.multiPrintModal, "Multi Print");
        break;
  
      case 5:
        this.printReports = false;
        this.getMessageStatus();
        this.openMultiPrint(this.multiPrintModal, "Send Reports");
        break;
  
      case 8:
        this.printReports = false;
        this.openMultiPrint(this.multiPrintModal, "Download Reports");
        break;
  
      default:
        this.printReports = false;
        break;
    }
  }
  

  selectAllTests(e: any) {

    if (e.target.checked) {

      this.selected_tests_for_prints = [];

      this.filteredMultiPrints.forEach((item: any) => {
        this.Handle_print_report({ target: { checked: true } }, item);
      })

    } else {
      this.filteredMultiPrints.forEach((item: any) => {
        this.Handle_print_report({ target: { checked: false } }, item);
      })
    }

  }

  isTestSelectedForMultiPrint(test: any) {

  }

  Handle_print_report(e: any, item: any, pkg: boolean = false): void {

    const checkBoxValue = e.target.checked;
    if (checkBoxValue) {

      const model = {
        tempId: item.tempId,
        test_id: pkg ? item.id : item.LabGlobalTestId,
        client_id: this.cookieSrvc.getCookieData().client_id,
      };

      this.selected_tests_for_prints.push({ tempId: model.tempId });

    } else {
      const index = this.selected_tests_for_prints.findIndex((test: any) => test.tempId === item.tempId);
      if (index !== -1) {
        this.selected_tests_for_prints.splice(index, 1);
      }
    }
  }

  applyStatus(id: number, e: any) {
    const status_code = e.target.value
    const labTestsArray = this.baseForm.get('lab_tests')?.value;

    let count = 0;
    this.selectedTests.forEach((test: any) => {
      !test.canRemove ? count += 1 : null
    })

    if (this.selectedTests[id].department && (this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("ultrasound") || this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("radiology"))) {

      labTestsArray[count - id].status_id = parseInt(status_code) + 1;
      this.baseForm.get('lab_tests')?.setValue(labTestsArray);
    } else {
      labTestsArray[count - id].status_id = status_code;
      this.baseForm.get('lab_tests')?.setValue(labTestsArray);
    }

  }


  getStatuses(e: any): any {
    return this.sharedPatient.getStatuses(e, this.all_status);
  }


  changeStatus(id: number, e: any) {
    const status_code = e.target.value

    const model = {
      patient: this.ptnId,
      status_id: status_code,
      id: this.selectedTests[id].LabGlobalTestId
    }

    this.subsink.sink = this.endPoint.cancelTest(model).subscribe((response: any) => {
      this.alertService.showSuccess("Status Updated", this.selectedTests[id].name);
      this.patientTestReload();
    }, (error) => {
      this.alertService.showError("Oops", "Error in Updating the Status")
    })
  }

  getTotalTestsAmount(): string {
    let totalAmount = 0;
    if (this.patientTestsLength !== 0) {
      for (const test of this.selectedTests) {
        if (test.cost_true) {
          totalAmount += parseFloat(test.cost);
          this.tests_amt = totalAmount;
        }
      }
    } else {
      totalAmount = 0
      this.tests_amt = 0;
      this.totalAmount = 0
    }
    this.getTotalAmount();

    return (totalAmount + this.preTestsCost).toFixed(2); // Assuming you want to display the amount with two decimal places
  }

  tests_amt = 0 //used
  isPercentage = false;
  totalAmount: any = 0 //used
  discountAmount: any = 0;  //used
  isDiscountApplied: boolean = false; //used
  total_paid: number = 0;

  is_discount_percentage: boolean = false;
  discountPercentage: number = 0;

  selectedDiscount: any = {
    name: "",
    is_prcntg: false,
    number: 0,
    is_active: false,
  }

  dispDiscount: any = "";

  getTotalAmount(): any {

    let bill = 0;
    if (this.is_discount_percentage) {

      bill = this.tests_amt + this.total_due - parseFloat(((this.tests_amt + this.total_due) * (this.discountPercentage / 100)).toFixed(2));
      this.discountAmount = parseFloat(((this.tests_amt + this.total_due) * (this.discountPercentage / 100)).toFixed(2));
    } else {
      if (parseFloat(this.discountAmount) > this.tests_amt + this.total_due) {
        bill = 0
      } else {
        bill = this.tests_amt + this.total_due - this.discountAmount
      }
    }

    this.totalAmount = bill;

    const curr = bill.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });

    const decimalPart = this.discountAmount !== 0 ? this.discountAmount.toString().split('.')[1] : "0"
    const discountAmountFormatted = decimalPart ? this.discountAmount.toString().split('.')[0] + '.' + decimalPart.substring(0, 2) : this.discountAmount.toFixed(2);
    this.dispDiscount = this.discountAmount !== 0 ? discountAmountFormatted : "0.00"

    return curr;
  }


  getNetAmount() {
    const net = (this.preTestsCost + this.tests_amt) - (parseFloat(this.ptn?.invoice?.total_discount.replace(/,/g, '')) + parseFloat(this.dispDiscount.replace(/,/g, '')))

    // const roundedNet = (this.preTestsCost + this.tests_amt) - (parseFloat(this.ptn?.invoice?.total_discount.replace(/,/g, ''))) + parseFloat(this.dispDiscount.replace(/,/g, ''))
    // const netdecimalPart = net !== 0 ? net.toString().split('.')[1] : "0";
    // const netAmountFormatted = netdecimalPart ? roundedNet.toFixed(2) : net.toFixed(2);
    // this.netDisp = net !== 0 ? netAmountFormatted : "0.0
    return net.toFixed(2)
  }

  getDiscountAmount() {
    let disc;
    if (this.ptn?.invoice?.total_discount) {
      disc = (parseFloat(this.ptn?.invoice?.total_discount?.replace(/,/g, '')) + parseFloat(this.dispDiscount.replace(/,/g, '')))
    } else {
      disc = parseFloat(this.dispDiscount.replace(/,/g, ''))
    }

    const discdecimalPart = disc !== 0 ? disc.toString().split('.')[1] : "0";
    const discAmountFormatted = discdecimalPart ? disc.toString().split('.')[0] + '.' + discdecimalPart.substring(0, 2) : disc.toFixed(2);
    return disc !== 0 ? discAmountFormatted : "0.00"
  }

  getDue() {

    if (this.payModesCount === 1) {
      const paid = this.baseForm.get('paid_amount')?.value;

      const due = this.totalAmount - paid
      const curr = due.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });

      return due > 0 ? curr : "0.00"
    } else {
      const single_paid = parseFloat(this.baseForm.get('paid_amount')?.value)
      const double_paid = this.secondMode.get('paidAmount')?.value;

      const paid = (isNaN(single_paid) ? 0 : single_paid) + double_paid
      const due = this.totalAmount - paid
      const curr = due.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      return due > 0 ? curr : "0.00"
    }
  }

  getDiscountType(id: string) {
    return this.discTypes.find(type => type.id == id);
  }

  validateDiscount() {
    if (this.tests_amt + this.total_due !== 0) {
      this.isDiscountApplied = !this.isDiscountApplied;
      this.applyDiscount();
    } else {
      this.isDiscountApplied = false;
      this.selectedDiscount.is_active = false;
      this.selectedDiscount.name = "";
      this.selectedDiscount.is_prcntg = false;
      this.selectedDiscount.number = 0;
      this.selectedDiscount.id = ""

      this.discountAmount = 0;
      this.is_discount_percentage = true;
      this.discountPercentage = 0;
      this.alertService.showError("", "Discount cannot apply when Amount Due is Zero")
    }
  }

  applyDiscount() {

    if (this.isDiscountApplied) {

      this.checkPaymodes();

      this.discountGroup.get('discount_input')?.setValue("");
      const selectedDiscount = this.getDiscountType(this.discountSelect_option.nativeElement.value)

      if (selectedDiscount.is_percentage) {
        this.is_discount_percentage = true;
        this.discountPercentage = selectedDiscount.number

        this.selectedDiscount.id = selectedDiscount.id;
        this.selectedDiscount.name = selectedDiscount.name;
        this.selectedDiscount.is_prcntg = selectedDiscount.is_percentage;
        this.selectedDiscount.number = selectedDiscount.number;
        this.selectedDiscount.is_active = true;

        this.discountAmount = 0;
        this.getTotalAmount();
      } else {
        this.is_discount_percentage = false;
        this.discountPercentage = 0;

        this.discountAmount = selectedDiscount.number;
        this.selectedDiscount.id = selectedDiscount.id;
        this.selectedDiscount.name = selectedDiscount.name;
        this.selectedDiscount.is_prcntg = selectedDiscount.is_percentage;
        this.selectedDiscount.number = selectedDiscount.number;
        this.selectedDiscount.is_active = true;
        this.getTotalAmount();
      }
      this.alertService.showSuccess("Discount Applied", this.getDiscountType(this.discountSelect_option.nativeElement.value).name)
    } else {
      this.selectedDiscount.is_active = false;
      this.selectedDiscount.name = "";
      this.selectedDiscount.is_prcntg = false;
      this.selectedDiscount.number = 0;

      this.discountAmount = 0;
      this.is_discount_percentage = true;
      this.discountPercentage = 0;
      this.getTotalAmount();
    }
  }

  getDisLimit() {
    const input_number = this.discountGroup.get('discount_input')?.value;
    return this.sharedPatient.getDisLimit(input_number, this.isPercentage, this.user_permissions, this.tests_amt, this.preTestsCost, this.ptn) ;
  }


  validDis(e: any) {
    if (!this.isPercentage) {
      this.discountGroup.get('discount_input')?.setValue(e)
    } else {
      this.alertService.showError("")
      this.discountGroup.get('discount_input')?.setValue(e)
    }

    this.changeDiscount();
  }

  checkPaymodes() {
    if (this.payModesCount == 2) {
      this.baseForm.get('paid_amount')?.setValue("");
      this.secondMode.get('paidAmount')?.setValue("");
    } else {
      this.baseForm.get('paid_amount')?.setValue("");
    }
  }

  validatorsInput(e: any, inputElement: any): void {

    this.checkPaymodes();

    function extractNumbers(input: string): number {
      const trimmedInput = input.trim(); // Remove leading and trailing whitespace
      // const numberPattern = /^0*(\d+(\.\d+)?)/; // Match digits with optional decimal part, ignoring leading zeros
      const numberPattern = /^0*(\d+)/; // Match digits only, ignoring leading zeros and decimals
      const match = trimmedInput.match(numberPattern);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return 0;
      }
    }

    const input_number = extractNumbers(e.target.value);
    this.discountGroup.get('discount_input')?.setValue(input_number);

    if (this.isPercentage) {
      if (input_number < this.user_permissions.number) {
        if (input_number <= 0) {
          this.discountGroup.get('discount_input')?.setValue("");

        } else if (input_number >= 100) {
          this.discountGroup.get('discount_input')?.setValue(100);
        }
      } else {
        if (!this.cookieSrvc.getCookieData().is_superadmin) {
          this.alertService.showInfo("Maximum Percentage Discount Limit is Reached", "")
        }

        this.discountGroup.get('discount_input')?.setValue(this.user_permissions.number);
      }
    } else {

      const discLimit = (this.tests_amt + this.preTestsCost - parseFloat(this.ptn.invoice?.total_discount.replace(/,/g, '')) - parseFloat(this.ptn.invoice?.total_paid.replace(/,/g, '')) + parseFloat(this.ptn.invoice?.total_refund.replace(/,/g, ''))) * (this.user_permissions.number / 100);

      if (input_number < discLimit) {
        if (input_number <= 0) {
          this.discountGroup.get('discount_input')?.setValue("");
        } else if (input_number > this.tests_amt + this.total_due) {
          this.discountGroup.get('discount_input')?.setValue(this.tests_amt + this.total_due);
        }
      } else {
        this.discountGroup.get('discount_input')?.setValue(discLimit);
      }

    }

    this.changeDiscount();

    setTimeout(() => {
      const valueLength = inputElement.value.length;
      if (valueLength && inputElement) {
        inputElement.setSelectionRange(valueLength, valueLength); // Set cursor to the end
      }
    });


  }

  togglePercentage(checked: any): void {
    this.isPercentage = checked.target.value === "%";
    this.is_discount_percentage = false;
    this.discountAmount = 0;
    this.discountGroup.get('discount_input')?.setValue("");
    this.getTotalAmount();
  }

  changeDiscount(isPercentage: boolean = this.isPercentage): void {
    this.isDiscountApplied = false;
    if (this.selectedDiscount.number !== 0) {
      this.applyDiscount();
    }

    if (this.tests_amt + this.total_due !== 0) {
      let discount = this.discountGroup.value.discount_input;
      if (isPercentage) {
        this.is_discount_percentage = true;
        this.discountPercentage = discount;
        this.discountAmount = (this.totalAmount * discount) / 100;
        this.getTotalAmount();
      } else {
        this.is_discount_percentage = false;
        this.discountAmount = discount;
        if (!this.discountAmount) {
          this.discountAmount = 0.00
        }
        this.getTotalAmount();
      }
    } else {
      this.discountGroup.get('discount_input')?.setValue("");
      this.alertService.showError("", "Discount cannot apply when Amount Due is Zero");
    }
  }

  HandlePayModeChange(e: any) {
    if (this.payModesCount === 1) {
      this.baseForm.get('paid_amount')?.setValue("");
    } else {
      this.baseForm.get('paid_amount')?.setValue("");
      this.extraPayModes = [];
      this.extraPayModes = this.payModes.filter((m: any) => m.is_active && this.baseForm.get('pay_mode_id')?.value != m.id);
      this.secondMode.get('paymode')?.setValue(this.getSecondModes());
      this.secondMode.get('paidAmount')?.setValue("");
    }
  }

  validatePaid(e: any) {

    const input_number = e.target.value.replace(/[^\d.]/g, '');
    e.target.value = e.target.value.replace(/[^\d.]/g, '');
    if (this.payModesCount === 1) {

      if (this.baseForm.get('pay_mode_id')?.value == 1) {
        if (input_number < 0) {
          this.baseForm.get('paid_amount')?.setValue("");
        }
      } else {
        if (input_number < 0) {
          this.baseForm.get('paid_amount')?.setValue("");
        }

        if (input_number > this.totalAmount) {
          this.baseForm.get('paid_amount')?.setValue(this.totalAmount);
        }
      }
    } else {

      const secondModeAmount = this.secondMode.get('paidAmount')?.value;

      if (input_number < 0) {
        this.baseForm.get('paid_amount')?.setValue("");
      }

      if (input_number > this.totalAmount - secondModeAmount && secondModeAmount) {
        this.baseForm.get('paid_amount')?.setValue(this.totalAmount - secondModeAmount);
      }

      if (input_number > this.totalAmount && !secondModeAmount) {
        this.baseForm.get('paid_amount')?.setValue(this.totalAmount);
        this.add_remove_paymode(false);
        this.alertService.showInfo("Maximum Amount Entered in First Payment Mode")
      }
    }
  }

  showReturn(): any {
    return { bool: this.baseForm.get('paid_amount')?.value > this.totalAmount, val: (this.baseForm.get('paid_amount')?.value - this.totalAmount).toFixed(0) }
  }


  validateRefund(e: any) {
    this.refundform.get('refund')?.setValue(e)
  }

  // Temp function 

  add_remove_paymode(e: any) {
    if (this.totalAmount !== 0) {
      if (e) {
        const amt = this.baseForm.get('paid_amount')?.value
        if (amt < this.totalAmount) {
          this.payModesCount = 2;
          this.initializeSecondPaymentMode();
          this.extraPayModes = this.payModes.filter((m: any) => m.is_active && this.baseForm.get('pay_mode_id')?.value !== m.id);
        } else {
          this.alertService.showInfo("Maximum Amount Entered in First Payment Mode")
        }

      } else {
        this.payModesCount = 1;
        this.secondMode.reset();
      }
    } else {
      this.alertService.showInfo("Cant't add another payment mode when Amount Due is Zero")
    }

  }
  payModesCount: number = 1;
  secondMode!: UntypedFormGroup;
  extraPayModes: any;

  initializeSecondPaymentMode() {
    this.secondMode = this.formBuilder.group({
      paymode: [this.getSecondModes()],
      paidAmount: [""]
    })
  }

  getSecondModes() {
    const mode = this.payModes.filter((m: any) => m.is_active && this.baseForm.get('pay_mode_id')?.value != m.id)
    return mode[0].id
  }

  validateSecondModePaid(e: any) {
    const input_number = this.sharedPatient.extractNumbers(e.target.value);
    const firstModeAmount = this.baseForm.get('paid_amount')?.value;

    if (input_number < 0) {
      this.secondMode.get('paidAmount')?.setValue("");
    }

    if (input_number > this.totalAmount - firstModeAmount) {
      this.secondMode.get('paidAmount')?.setValue(this.totalAmount - firstModeAmount);
    }

    if (input_number > this.totalAmount && !firstModeAmount) {
      this.baseForm.get('paid_amount')?.setValue(this.totalAmount);
      this.baseForm.get('pay_mode_id')?.setValue(this.secondMode.get('paymode')?.value);
      this.add_remove_paymode(false);
      this.alertService.showInfo("Maximum Amount Entered in First Payment Mode");
      const input = document.getElementById('first_paid_input') as HTMLInputElement;
      if (input && !input.readOnly) {
        input.focus();
      }
    }
  }

  paidAmountCheck(): boolean {
    return this.sharedPatient.paidAmountCheck(this.payModesCount, this.baseForm.get('paid_amount')?.value, this.secondMode?.get('paidAmount')?.value)
  }

  remarkInput(e: any) {
    this.remarkSave = e;
  }

  private getPatientModel(): AddPatientsModel {
    const model: any = {
      title: this.baseForm.get('title')?.value,
      name: this.baseForm.get('name')?.value,
      age: this.timeSrvc.calculateAge(this.years, this.baseForm.value.dob, this.baseForm.value?.age || this.ptn.age),
      dob: this.baseForm.get('dob')?.value || null,
      gender: this.baseForm.get('gender')?.value,
      attender_name: this.baseForm.get('attender_name')?.value || null,
      attender_relationship_title: this.baseForm.get('attender_relationship_title')?.value || null,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value,
      area: "",
      address: this.baseForm.get('address')?.value || "",
      mr_no: "MR123456",
      visit_id: "V12345",
      
      referral_doctors: this.baseForm.get('referral_doctors')?.value?.id || "",
      lab_discount_type_id: 1,
      paid_amount: this.baseForm.get('paid_amount')?.value || 0,
      pay_mode_id: this.baseForm.get('pay_mode_id')?.value || null,
      discount_amt: this.discountAmount || 0,
      is_percentage_discount: false,
      lab_tests: this.baseForm.get('lab_tests')?.value,
      lab_packages: this.baseForm.get('lab_packages')?.value,
      ULabPatientAge: parseInt(this.baseForm.get('ULabPatientAge')?.value),
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,

    };

    return model;
  }

  private updateModel(): any {
    const model: any = { 
      id: this.ptnId,
      mr_no: this.ptn?.mr_no,
      client: this.cookieSrvc.getCookieData().client_id,
      visit_id: this.ptn?.visit_id,
      name: this.baseForm.get('name')?.value,
      age: this.timeSrvc.calculateAge(this.years, this.baseForm.value.dob, this.baseForm.value?.age || this.ptn.age),
      dob: this.baseForm.get('dob')?.value || null,
      attender_name: this.baseForm.get('attender_name')?.value || '',
      attender_relationship_title: this.baseForm.get('attender_relationship_title')?.value || null,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value,
      area: "",
      address: this.baseForm.get('address')?.value || "",
      prescription_attach: this.image,
      added_on: this.ptn.added_on,
      title: this.baseForm.get('title')?.value,
      gender: this.baseForm.get('gender')?.value,
      referral_doctor: this.baseForm.get('referral_doctor')?.value?.id || null,
      department: null,
      last_updated_by: this.staffId,
      lab_tests: this.baseForm.get('lab_tests')?.value,
      lab_packages: this.baseForm.get('lab_packages')?.value,
      ULabPatientAge: parseInt(this.baseForm.get('ULabPatientAge')?.value),
      lab_discount_type_id: this.isDiscountApplied ? parseInt(this.selectedDiscount.id) : null,

      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,

      is_discount_amt_by_ref_doc: this.baseForm.get('is_discount_amt_by_ref_doc')?.value || false,

      // referral_lab: this.ptn.referral_lab?.value?.id || null,
      partner: this.ptn?.partner?.id || null,
    };

    return model;
  }


  private getPaymentModel(patient: any, details: any, pay: boolean = true): any {
    if (pay) {
      const due = this.totalAmount;
      const paying = this.baseForm.get('paid_amount')?.value || 0;

      details.lab_discount_type_id = this.selectedDiscount.id !== "" ? this.selectedDiscount.id : null;
      details.pay_mode_id = this.baseForm.get('pay_mode_id')?.value || null;
      details.discount_amt = this.discountAmount;
      details.is_percentage_discount = this.isDiscountApplied || this.isPercentage;
      details.client_id = this.cookieSrvc.getCookieData().client_id;
    


      if (paying >= due) {
        details.paid_amount = due || 0;
      } else {
        details.paid_amount = this.baseForm.get('paid_amount')?.value || 0;
      }

      let model: any = {
        patient: patient.id,
        remarks: this.remarkSave || "",
        created_by: this.staffId,
        printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        discount_type: this.isDiscountApplied ? this.selectedDiscount.id : null,
        client_id: details.client_id,
        is_discount_amt_by_ref_doc: this.baseForm.get('is_discount_amt_by_ref_doc')?.value || false,
        payments: [
          {
            pay_mode: details.pay_mode_id,
 
            paid_amount: Number(details.paid_amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }
        ]
      };

      if (this.payModesCount == 1) {
        model.payments = [
          {
            pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
            paid_amount: paying > due ? due : this.baseForm.get('paid_amount')?.value
          }
        ]
      } else {
        model.payments = [
          {
            pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
            paid_amount: this.baseForm.get('paid_amount')?.value
          }, {
            pay_mode: this.secondMode.get('paymode')?.value,
            paid_amount: this.secondMode.get('paidAmount')?.value,
          }
        ]
      }

      if (!this.isDiscountApplied && this.discountGroup.get('discount_input')?.value !== "") {
        model.discount_amt = this.discountGroup.get('discount_input')?.value !== "" ? details.discount_amt : "";
      }


      model['payment_for'] = 3 ;
      return model;
    } else {
      let model: any = {
        patient: patient.id,
        remarks: this.remarkSave || "",
        created_by: this.staffId,
        printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        discount_type: this.isDiscountApplied ? this.selectedDiscount.id : null,
        client_id: this.cookieSrvc.getCookieData().client_id,
        is_discount_amt_by_ref_doc: this.baseForm.get('is_discount_amt_by_ref_doc')?.value || false,
        payments: [
          {
            pay_mode: 1,
            paid_amount: 0,
          },

        ]
      };

      if (!this.isDiscountApplied && this.discountGroup.get('discount_input')?.value !== "") {
        model.discount_amt = this.discountGroup.get('discount_input')?.value !== "" ? this.discountAmount : "";
      }

      model['payment_for'] = 3 ;
      return model;

    }
  }

  private getPatientReceipt(ptn: any, ptnModel: any, pay: boolean = true, next: boolean = false) {
    const model = this.getPaymentModel(ptn, ptnModel, pay);

    this.subsink.sink = this.endPoint.getReceipt(model).subscribe((response: any) => {
      this.dataSaving(false);

      if (this.setting?.apr) {
        this.printSrvc.printRcpts(response.html_content);
      }

      if (next) {
        this.router.navigate(['/patient/addpatients/']);
      } else {
        this.patientReload();
      }

    }, (error: any) => {
      this.dataSaving(false);
      this.alertService.showError("Failed to get receipt information", "Payment Failed. Please Try Again",);
    })
  }


  dataSaving(bool: boolean) {
    if (bool) {
      this.inProgress = true;
      this.baseForm.disable();
      this.discountGroup.disable();
    } else {
      this.inProgress = false;
      this.baseForm.enable();
      this.discountGroup.enable();
    }
  }

  savePayment() {
    if (this.tests_amt + this.total_due !== 0) {
      if (this.payModesCount === 2) {
        const basePaidAmount = this.baseForm.get('paid_amount')?.value;
        const secondPaidAmount = this.secondMode.get('paidAmount')?.value;

        if (!!basePaidAmount && !!secondPaidAmount) {
          this.saveApiCall()
        } else {
          this.alertService.showError("One of the payment fields is empty, at least one rupee, or pick just one payment")
        }

      } else {

        const paidAmount = this.baseForm.get('paid_amount')?.value;
        if (!!paidAmount) {
          this.saveApiCall()
        } else {
          this.alertService.showError("One of the payment fields is empty, at least one rupee, or pick just one payment")
        }
      }
    } else {
      this.saveAndNext();
      this.alertService.showInfo("New Bil Cannot Be Issue, Because Due Amount Was Zero");
    }

  }

  override saveApiCall(): void {
    if (this.baseForm.valid) {

      if (!this.ptnId) {
        const model: AddPatientsModel = this.getPatientModel();

        this.subsink.sink = this.endPoint.addPatient(model).subscribe((response: any) => {
          const res = response;
          this.getPatientReceipt(res, model);
          this.alertService.showSuccess("Patient added", `Visit id: ${this.ptn?.visit_id}`);
        },
          (error) => {
            this.serverErrors(error);
          }
        );
      } else {
        const model = this.updateModel();
        this.dataSaving(true);
        this.subsink.sink = this.endPoint.updatePatient(model, this.ptnId).subscribe((response: any) => {
          this.alertService.showSuccess("Details updated", `${model.name} | ${model.mr_no} | ${model.visit_id}`);
          this.getPatientReceipt(response, model);

        }, (error) => {
          this.dataSaving(false);
          this.serverErrors(error);
        })
      }
    } else {
      this.showBaseFormErrors();
    }
  }

  saveAndNext(): void {

    if (this.baseForm.valid) {
      const model = this.updateModel()
      this.dataSaving(true);
      this.subsink.sink = this.endPoint.updatePatient(model, this.ptnId).subscribe((response: any) => {

        this.alertService.showSuccess("Details updated", `${model.name} | ${model.mr_no} | ${model.visit_id}`);

        if (this.isDiscountApplied || this.discountGroup.get('discount_input')?.value > 0) {
          this.getPatientReceipt(response, model, false, true);
        } else {
          this.dataSaving(false);
        }

        this.patientReload();
      }, (error) => {
        this.dataSaving(false);
        this.serverErrors(error);

      })
    } else {
      this.showBaseFormErrors();
    }
  }

  serverErrors(error: any) {
    this.sharedPatient.serverErrors(error, this.baseForm.value.name);
  }

  resetBaseForm() {
    this.selectedTests = [];

    this.baseForm.reset({
      bId: null,
      title: 'Mr.',
      name: this.ptn.name ? this.ptn.name : '',
      age: this.years ? '' : null,
      gender: 1,
      dob: this.years ? null : '',
      mobile_number: '',
      referral_doctor: null,
      home_service: { is_required: false, added_on: this.sharedPatient.getDateTime(), patient: 23 },
      lab_tests: [],
      lab_discount_type_id: null,
      is_percentage_discount: false
    });

    this.discountAmount = 0;
    this.totalAmount = 0;

    this.isDiscountApplied = false;
    this.remarkSave = ""
  }

  print_patient_report(id: any, receipt: any) {

    const model = {
      patient_id: this.ptnId,
      client_id: this.cookieSrvc.getCookieData().client_id,
      receipt_id: id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    receipt['loading'] = true;
    this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
      receipt['loading'] = false;
      this.printSrvc.printRcpts(response.html_content);
    }, (error: any) => {
      receipt['loading'] = false;
      this.alertService.showError(error);
    })

  }

  test() {
    this.dataSaving(true)
  }

  invoiceLoading: boolean = false;
  print_patient_invoice() {

    this.invoiceLoading = true;
    const model = {
      patient_id: this.ptnId,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.subsink.sink = this.endPoint.getPatientPrintInvoice(model).subscribe((response: any) => {
      this.invoiceLoading = false;
      this.printSrvc.printInvoice(response.html_content);
    }, (error: any) => {
      this.invoiceLoading = false;
      this.alertService.showError(error);
    })

  }

  saveRefund() {
    this.patientReload() ;
    this.getRefundList();
  }


  // PNDT FORM 
  showPNDT: boolean = false;

  checkPNDT() {
    this.showPNDT = this.sharedPatient.checkPNDT(this.selectedTests, this.baseForm.get('gender')?.value) ;
  }

  openPNDTModal(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: true, backdropClass: backDrop, backdrop: 'static', keyboard: false });
  }


  ptn_pndt_model: any = null;

  openPNDT(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.ptn_pndt_model = this.updateModel();
    this.ptn_pndt_model.referral_doctor = this.baseForm.value?.referral_doctor ;
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: true, backdropClass: backDrop, backdrop: 'static', keyboard: false });
  }


  getConsultingDocs(searchTerm: any) {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }

    if (searchTerm) {
      this.subsink.sink = this.doctorEndpoint.getPaginatedConsultingDoctors(
        "all", 1, searchTerm, "", "", "", false
      ).subscribe((data: any) => {
        this.consultingDoctors = data;
      })
    }
  }

  print_patient_refund_slip(refund: any) {
    this.sharedPatient.print_patient_refund_slip(refund, this.ptnId) ;
  }

  // utilities 

  writeAddress(e: any){
    this.baseForm.get('address')?.setValue(e);
    this.isCollapsed = true;
  }

  writeTitleAddress(e: any){
    this.baseForm.get('attender_relationship_title')?.setValue(e.attender_relationship_title);
    this.baseForm.get('attender_name')?.setValue(this.capitalSrvc.AutoName(e.attender_name));
  }

  getFloatVal(num: any) {
    return parseFloat(num.replace(/,/g, ''))
  }

  isActionIn(actions: any[]): boolean {
    const actionValue = this.selectPrintForm.get('action')?.value;
    return actions.includes(actionValue);
  }

  capitalizeName(e: any, type: any) {
    const cleanedInput = e.target.value.replace(/[^a-zA-Z.\s]/g, ''); // Remove all characters except spaces, dots, and letters
    this.baseForm.get(type)?.setValue(cleanedInput.toUpperCase())
  }

  // AUTO CAPTILIZE THE NAME
  capitalize(e: any, type: string) {
    if (!/\d$/.test(e)) {
      const cleanedInput = e.replace(/[^a-zA-Z.\s]/g, '');
      const capitalizedInput = this.capitalSrvc.AutoName(cleanedInput);
      this.baseForm.get(type)?.setValue(capitalizedInput.toUpperCase());
    }
  }

  validNumberField(event: any, type: string) {
    this.baseForm.get(type)?.setValue(event.target.value.replace(/[.e]/gi, ''))
  }

  getMultiPaymodes(payModes: any) {
    return this.sharedPatient.getMultiPaymodes(payModes);
  }

  getMultiPaymodesAmount(payModes: any) {
    return this.sharedPatient.getMultiPaymodesAmount(payModes);
  }

  setting: any = {
    aprremark: true,
    apr: true,
    count: 1
  }


  getSetting() {
    this.setting.apr = this.cookieSrvc.getSetting().apr;
    this.setting.aprremark = this.cookieSrvc.getSetting().aprremark;
    this.setting.count = 0; // Initialize count to 0

    this.setting.apr = this.cookieSrvc.getSetting().apr
    if (!this.setting.apr) {
      this.setting.count += 1;
    }

    if (!this.setting.aprremark) {
      this.setting.count += 1;
    }
  }

  setAutoPrint(type: any, e: boolean) {
    if (type == 2) {
      this.cookieSrvc.setSetting(this.cookieSrvc.getSetting().api, e, this.setting.aprremark);
      this.getSetting();
    } else {
      this.cookieSrvc.setSetting(this.cookieSrvc.getSetting().api, this.setting.apr, e);
      this.getSetting();
    }
  }


  getNextPrint() {
    if (this.paidAmountCheck()) {
      return this.setting.apr ? '& Print' : 'Now'
    } else {
      return this.setting.api ? 'Print' : 'Next'
    }
  }

  activeId: any = 0;

  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }


  getTitleName(id: any) {
    return this.titles.find((t: any) => t.id == this.baseForm?.value?.title)?.name
  }

  // utilities 

  closeCanvas() {
    this.patientOffcanvas.closeCanvas();
  }

  toggleMoreOptions(e: boolean) {
    this.isCollapsed = e;
  }

  clearPrescription() {
    if (this.fileImage && this.fileImage.nativeElement) {
      this.fileImage.nativeElement.value = '';
      this.image = null
      this.baseForm.get('prescription_attach')?.setValue(null)
    }
  }

  onFileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        this.image = base64String;
        this.baseForm.get('prescription_attach')?.setValue(base64String);
      });
    }
  }

  placeBreak(str: any) {
    return str.replace('\n', '<br/>')
  }

}