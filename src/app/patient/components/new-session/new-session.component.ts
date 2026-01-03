import { Component, ViewChild, Injector, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AddPatientsModel } from '../../models/addPatient/addpatient.model';
import { GlobalTestModel } from '../../models/addPatient/globaltest.model';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AddPatientEndpoint } from '../../endpoints/addpatient.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { ActivatedRoute } from '@angular/router';
import { Payment } from '../../models/patients/payment.model';
import { Router } from '@angular/router';
import { PrintService } from '@sharedcommon/service/print.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from '../../endpoints/pro.endpoint';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { PatientEndpoint } from '../../endpoints/patient.endpoint';
import { PatientOffcanvasComponent } from '../patient-offcanvas/patient-offcanvas.component';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { OutsourcingEndpoint } from 'src/app/outsourcing/outsourcing.endpoint';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
})
export class NewSessionComponent extends BaseComponent<AddPatientsModel> {


  model: any;
  addPatient!: UntypedFormGroup;
  discountGroup!: UntypedFormGroup;


  @ViewChild('input-container') itemTemplate: any;
  @Output() sessionCreated = new EventEmitter<any>();

  inProgress: boolean = false;
  currentDate!: Date;
  years: boolean = false;
  imp: boolean = true;
  visitId: string = "";
  selectedTests: any = [];
  formattedDate!: string;
  homeSrvc: boolean = false;
  headText!: string;

  tests: GlobalTestModel[] = []
  refDoctors: any[] = [];
  titles!: any[];
  genders!: any[];

  discTypes: any = [];
  payModes!: any[];
  ages!: any[];
  isCollapsed: boolean = true;
  staffId!: any;
  payText!: string;
  status: any = [];
  pendingId!: number;
  urgentId!: number;
  emeregencyId!: number;
  disableDiscount: boolean = false;

  pageNum!: number | null;
  hospitalName: string = "";
  attender_titles: any;
  departments: any;

  constructor(
    injector: Injector,
    config: NgbDropdownConfig,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,

    public dateTimeFormat: TimeConversionService,
    public capitalSrvc: CaptilizeService,
    private printSrvc: PrintService,
    private cookieSrvc: CookieStorageService,
    public timeSrvc: TimeConversionService,
    
    private endPoint: AddPatientEndpoint,
    private patientEndpoint: PatientEndpoint,
    private proEndpoint: ProEndpoint,
    private doctorEndpoint: DoctorEndpoint,
    private staffEndpoint: StaffEndpoint,
    private masterEndpoint: MasterEndpoint,
    private sourcingEndpont: OutsourcingEndpoint,
  ) {
    super(injector);
    config.autoClose = true
  }

  support: any = {
    name: "",
    description: "",
    youtube_link: "",
    article_link: "",
    quick_steps: ""
  };


  selectFirstOption(event: any) {
    event.preventDefault();
    this.onItemSelected(this.searchData[0])
  }


  AutoFocus: boolean = true;
  isAutofocus(): boolean {
    // Add your autofocus logic here, e.g., return true based on certain conditions
    return true;
  }


  override ngAfterViewInit(): void {

    this.getSetting();

    this.subsink.sink = this.endPoint.getDiscountTypes().subscribe((data: any) => {
      if (data.length > 0) {
        data.forEach((d: any) => {
          if (d.is_active) { this.discTypes.push(d) }
        })
      } else {
        this.disableDiscount = true
      }
    });

  }

  user_permissions: any = {
    sa: false,
    number: 0,
    permissions: []
  }

  minimum_paid_amount: any = {
    is_active: false,
    number: 0
  }

  @Input() patientDetails: any ;
  b_id: any ;


  override ngOnInit(): void {

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.subsink.sink = this.patientEndpoint.getDepartments().subscribe((data: any) => {
      this.departments = data
    })

    // const staffData = this.cookieSrvc.getCookieData();
    this.staffId = this.cookieSrvc.getCookieData().lab_staff_id;
    this.hospitalName = this.cookieSrvc.getCookieData().business_name;
    this.b_id = this.cookieSrvc.getCookieData().b_id;

    this.currentDate = new Date() || '';
    this.headText = "Add New Patient";
    this.payText = "Pay & Next";
    this.pageNum = null;

    this.initializeForm();

    if (!this.cookieSrvc.getCookieData().is_superadmin) {
      this.user_permissions.sa = false;
      this.subsink.sink = this.staffEndpoint.getStaffPatientsPermissions(this.cookieSrvc.getCookieData().lab_staff_id).subscribe((data: any) => {

        if (data.length == 0) {
          this.user_permissions.permissions = [];
          this.alertService.showWarning("You Dont't Have Access to View Patient", "")
          this.router.navigate(['/patient/patients/']);
        } else {
          if (!data[0].permissions.includes(1)) {
            this.alertService.showWarning("You Dont't Have Access to Add New Patient", "")
            this.router.navigate(['/patient/patients/']);
          } else {
            this.user_permissions.permissions = data[0].permissions;
            this.user_permissions.number = parseFloat(data[0].number)
          }
        }
      })

      this.subsink.sink = this.masterEndpoint.getBusinessMinimumPaidAmount().subscribe((data: any) => {
        this.minimum_paid_amount.is_active = data[0].is_active;
        this.minimum_paid_amount.number = data[0].number;
      })
    } else {
      this.user_permissions.sa = true;
      this.user_permissions.number = 100;
      this.minimum_paid_amount.is_active = false;
    }

    this.discountGroup = this.formBuilder.group({
      discount_input: ['']
    })

    this.subsink.sink = this.proEndpoint.getLabTestStatus().subscribe((data: any) => {
      const testsStatus = data;
      testsStatus.forEach((tests: any) => {
        if (tests.name === 'Pending') {
          const model = { id: tests.id, name: "General" }
          this.pendingId = tests.id;
          this.status.push(model);
        } else if (tests.name === 'Emergency (Pending)') {
          const model = { id: tests.id, name: "Emergency" }
          this.emeregencyId = tests.id;
          this.status.push(model);
        }

      })

    })

    this.subsink.sink = this.proEndpoint.getPayModes().subscribe((data: any) => {
      this.payModes = data.results.filter((method: any) => method.is_active);
    });


  }


  initializeForm() {
    this.baseForm = this.formBuilder.group({

      title: [this.patientDetails.title.id, Validators.required],
      name: [this.patientDetails.name, Validators.required],
      age: [this.patientDetails.age, Validators.required],
      dob: [null],
      gender: [this.patientDetails.gender , Validators.required],
      mobile_number: [ this.patientDetails.mobile_number , [Validators.required, Validators.pattern('[0-9]{10}')]],
      referral_doctor: [],
      home_service: [false],
      ULabPatientAge: [1],
      address: [''],
      // home_service: [{ is_required: false, added_on: this.getDateTime(), patient: 23 }],
      lab_tests: [[]],
      lab_discount_type_id: [null],
      is_percentage_discount: [false],
      paid_amount: [null],
      pay_mode_id: [1],
      discount_amt: 0,
      attender_name: [""],
      attender_relationship_title: 3,
      prescription_attach: [null],
      lab_packages: [[]]
    });
  }

  initializeVisitForm(ptn: any) {
    this.baseForm = this.formBuilder.group({

      title: [1, Validators.required],
      name: ['', Validators.required],
      age: [null, Validators.required],
      dob: [null],
      gender: [1, Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      referral_doctor: [],
      home_service: [false],
      ULabPatientAge: [1],
      address: [''],
      // home_service: [{ is_required: false, added_on: this.getDateTime(), patient: 23 }],
      lab_tests: [[]],
      lab_discount_type_id: [null],
      is_percentage_discount: [false],
      paid_amount: [null],
      pay_mode_id: [1],
      discount_amt: 0,
      attender_name: [""],
      attender_relationship_title: 3,
      prescription_attach: [null],
      lab_packages: [[]]
    });
  }

  initializeUpdateForm(ptn: any) {
    this.baseForm.reset({
      title: ptn.title ? ptn.title.id : null,
      name: [ptn.name, [Validators.required, Validators.minLength(2)]],
      age: [ptn.age ? ptn.age : null, Validators.required],
      gender: [ptn.gender, Validators.required],
      dob: [ptn.dob ? ptn.dob : null],
      mobile_number: [ptn.mobile_number, [Validators.required, Validators.pattern('[0-9]{10}')]],
      referral_doctor: null,
      home_service: { is_required: false, added_on: this.getDateTime(), patient: 23 },
      lab_tests: [],
      lab_discount_type_id: [ptn.invoice.dis],
      is_percentage_discount: false,
      pay_mode_id: [1],
      paid_amount: null,
    });
  }

  date: string = "";
  timer: any;
  query!: string;
  sort: any = false;
  pageLoading: boolean = false

  showPatient(details: any) {
    this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: details.id } });
  }


  searchData: any;
  testTerm: any = ""
  searchLoading = false;
  
  returnNotFoundHTML(){
    let div = `
    <div class="d-flex flex-row gap-2">
    <span class="text-muted">No matching results found for</span>
    <strong class="text-black">' ${this.testTerm} '</strong>
    </div> `
    return div
  }

  getSearchesss(searchTerm: string): void {
    // Trim leading spaces from the searchTerm
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }

    if (searchTerm) {
      this.testTerm = searchTerm;
      this.searchLoading = true;
      clearTimeout(this.timer);

      this.searchData = []; // Initialize an empty array
      this.timer = setTimeout(() => {
        // Subscribe to getTestsSearchResults endpoint
        this.subsink.sink = this.endPoint.getTestsMasterSearch(searchTerm, true).subscribe((testData: any) => {
          // Filter and add active lab tests to searchData
          this.searchLoading = false;
          this.searchData = [
            ...testData.lab_tests
              .filter((labTest: any) => !this.tests_included.includes(labTest.id))
              .map((labTest: any) => ({
                ...labTest,
                name: labTest.name + '//++' + labTest.short_code
              })),
            ...testData.lab_packages.filter((labPackage: any) => !this.package_included.includes(labPackage.id))
          ]

        });
      }, 500);



    } else {
      // Reset relevant variables if searchTerm is empty
      this.testTerm = null;
      this.searchData = [];
      this.searchLoading = false;
    }
  }

  getSearches(searchTerm: string): void {
    // Trim leading spaces from the searchTerm
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }

    if (searchTerm) {
      this.testTerm = searchTerm;
      this.searchLoading = true;
      clearTimeout(this.timer);

      this.searchData = []; 
      this.timer = setTimeout(() => {

        if(this.patientDetails?.referral_lab){

          this.subsink.sink = this.sourcingEndpont.getRevisedTests(
            this.patientDetails?.referral_lab?.id, searchTerm, 1, 'all', ''
          ).subscribe((res: any)=>{
            this.searchLoading = false;
            this.searchData = [
              ...res
                .filter((labTest: any) => !this.tests_included.includes(labTest.id))
                .map((labTest: any) => ({
                  ...labTest,
                  name: labTest.name + '//++' + labTest.short_code
                })),
            ]
          })

        }else if(this.patientDetails?.partner){

          this.subsink.sink = this.sourcingEndpont.getRevisedTestsCompany(
            this.patientDetails?.partner?.company?.id, searchTerm, 1, 'all', ''
          ).subscribe((testData: any)=>{
            this.searchLoading = false;
            this.searchData = [
              ...testData.lab_tests
                .filter((labTest: any) => !this.tests_included.includes(labTest.id))
                .map((labTest: any) => ({
                  ...labTest,
                  name: labTest.name + '//++' + labTest.short_code
                })),
              ...testData.lab_packages.filter((labPackage: any) => !this.package_included.includes(labPackage.id))
            ]
          }, (error)=>{
            this.alertService.showError(error?.error?.error || error?.error?.Error || error );
          })

        }else{
          this.subsink.sink = this.endPoint.getTestsMasterSearch(searchTerm, true).subscribe((testData: any) => {

            this.searchLoading = false;
            this.searchData = [
              ...testData.lab_tests
                .filter((labTest: any) => !this.tests_included.includes(labTest.id))
                .map((labTest: any) => ({
                  ...labTest,
                  name: labTest.name + '//++' + labTest.short_code
                })),
              ...testData.lab_packages.filter((labPackage: any) => !this.package_included.includes(labPackage.id))
            ]
          });
        }

      }, 500);

    } else {
      // Reset relevant variables if searchTerm is empty
      this.testTerm = null;
      this.searchData = [];
      this.searchLoading = false;
    }
  }

  removeDigitsAfterPlus(inputString: string): string {
    // Find the index of the "//++" sequence
    const plusIndex = inputString.indexOf("//++");

    // If "//++" sequence is found
    if (plusIndex !== -1) {
      // Return the substring before the "//++" sequence
      return inputString.substring(0, plusIndex);
    } else {
      // If "//++" sequence is not found, return the original string
      return inputString;
    }
  }

  removeDigitsAfterPlusAndSave(inputString: string) {
    // Find the index of the "//++" sequence
    const plusIndex = inputString.indexOf("//++");

    // If "//++" sequence is found
    if (plusIndex !== -1) {
      // Return the substring before the "//++" sequence
      inputString = inputString.substring(0, plusIndex);
    } else {
      // If "//++" sequence is not found, return the original string
      inputString = inputString;
    }
  }

  presetRegistrationTime(inputDate: string): string {
    const date = new Date(inputDate);
    return date.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
  }

  @ViewChild('otherElement') otherElement!: ElementRef;

  // DELETE TESTS FROM TABLE 
  deleteTest(index: number, test: any) {
    if (test.package) {
      this.baseForm.get('lab_packages')?.setValue(this.baseForm.value.lab_packages.filter((obj: any) => obj.LabGlobalPackageId !== test.package_id))
      this.selectedTests.splice(index, 1);
      this.package_included = this.package_included.filter((t: any) => t !== test.id);
    } else {
      this.selectedTests.splice(index, 1);
      this.baseForm.value.lab_tests.splice(index, 1);
      this.tests_included = this.tests_included.filter((t: any) => t !== test.id);
      if (this.selectedTests.length === 0) {
        this.totalAmount = 0.00;
        this.dispDisc = 0.00;
        this.total_paid = 0.00;
        this.validateDiscount();
        this.discountGroup.get('discount_input')?.setValue("");
      }
    }
  }

  selectedpackages: any = [];
  tests_included: any = [];
  package_included: any = [];

  onItemSelected(item: any): void {
    this.testTerm = "";
    
    if (!item.hasOwnProperty('lab_tests')) {
      this.otherElement.nativeElement.focus();
      if (this.selectedTests.some((test: any) => {
        if (test.package) {
          if (test.package_tests.some((packageTest: any) => packageTest.id === item.id)) {
            // Test is included in a package
            this.alertService.showInfo("Test already included in a " + test.name, `${this.removeDigitsAfterPlus(item.name)}`);

            return true; // Exit the function early
          }
        } else {
          if (test.id === item.id) {
            // Test is included individually
            this.alertService.showInfo("Test already included individually", `${this.removeDigitsAfterPlus(item.name)}`);

            return true; // Exit the function early
          }
        }
        return false; // Continue checking other tests
      })) {
        return; // Exit the function if the test is already included
      }


      let selectedTest: any = [];
      // if (item.department && item.department.toLowerCase().replace(" ", "").includes("ultrasound")) {
      if (item.department && (item.department.toLowerCase().replace(" ", "").includes("ultrasound") || item.department.toLowerCase().replace(" ", "").includes("medical") || item.department.toLowerCase().replace(" ", "").includes("radiology"))) {
        selectedTest = {
          LabGlobalTestId: item.id,
          status_id: 2
        }
      } else {
        selectedTest = {
          LabGlobalTestId: item.id,
          status_id: this.pendingId
        }
      }

      const tempTest = {
        id: item.id,
        name: item.name,
        date: this.dateTimeFormat.getCurrentDateTime(),
        status: 'Pending',
        cost: item.price,
        total: item.price,
        added_on: item.added_on,
        canRemove: true,
        department: item.department ? item.department : "",
        package: false,
        package_tests: [],
        sourcing_lab: item?.sourcing_lab || null

      }

      if((this.patientDetails?.referral_lab || this.patientDetails?.partner) && item?.revised_price && item?.revised_price.revised_price){
        tempTest.cost = item?.revised_price.revised_price ;
        tempTest.total = item?.revised_price.revised_price ;
      }

      this.testTerm = null;
      // this.showPNDT = this.baseForm.get('gender')?.value.toString() =="2" && item.name.toLowerCase().includes("ultra")
      this.baseForm.value.lab_tests.push(selectedTest);
      this.tests_included.push(item.id);
      this.selectedTests.push(tempTest);


    } else {
      this.onPackagesSelected(item)
    }

    this.searchData = [];
  }

  onPackagesSelected(item: any) {
    this.otherElement.nativeElement.focus();

    if (this.selectedTests.some((test: any) => test.id === item.id + "pkg")) {
      this.alertService.showInfo("Package already Included", `${item.name}`);

      return; // Exit the function early if the package is already included
    }

    // Remove tests that are part of the package from selectedTests array
    item.lab_tests.forEach((testPackage: any) => {
      const index = this.selectedTests.findIndex((selectTest: any) => selectTest.id === testPackage.id);
      const delTest = this.selectedTests.find((selectTest: any) => selectTest.id === testPackage.id);
      if (index !== -1) {
        // this.selectedTests.splice(index, 1);
        delTest['package'] = false;
        this.deleteTest(index, delTest)
        this.alertService.showInfo("Test removed its already included in " + item.name, `${testPackage.name}`);
      }
    });

    // Add the package to selectedTests array
    const selectedTest = {
      LabGlobalPackageId: item.id,
    };

    const tempTest = {
      id: item.id + "pkg",
      name: item.name,
      date: this.dateTimeFormat.getCurrentDateTime(),
      status: 'Pending',
      cost: item.offer_price,
      total: item.offer_price,
      added_on: item.added_on,
      canRemove: true,
      department: "",
      package: true,
      package_tests: item.lab_tests,
      package_id: item.id
    };

    this.baseForm.value.lab_packages.push(selectedTest);
    this.selectedTests.push(tempTest);
    this.package_included.push(item.id)

  }


  applyStatus(id: number, e: any) {
    const status_code = e.target.value;
    const labTestsArray = this.baseForm.get('lab_tests')?.value;

    // if (this.selectedTests[id].department && this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("ultrasound")) {
    if (this.selectedTests[id].department && (this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("ultrasound") || this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("radiology"))) {
      labTestsArray[id].status_id = parseInt(status_code) + 1;
      this.baseForm.get('lab_tests')?.setValue(labTestsArray);
    } else {
      labTestsArray[id].status_id = status_code;
      this.baseForm.get('lab_tests')?.setValue(labTestsArray);
    }
  }


  getTotalTestsAmount(): string {
    let totalAmount = 0;
    if (this.selectedTests.length !== 0) {
      for (const test of this.selectedTests) {
        totalAmount += parseFloat(test.cost);
        this.tests_amt = totalAmount;
      }
    } else {
      totalAmount = 0
      this.tests_amt = 0;
    }
    this.getTotalAmount();
    return totalAmount.toFixed(2) // Assuming you want to display the amount with two decimal places
  }

  tests_amt = 0 //used
  isPercentage = false;
  totalAmount: any = 0 //used
  discountAmount: any = 0;  //used
  isDiscountApplied: boolean = false; //used
  discount_amount: any = 0;
  total_paid: number = 0

  dispDisc: any = 0;
  tempDisc!: number;

  is_discount_percentage: boolean = false;
  discountPercentage: number = 0;

  selectedDiscount: any = {
    name: "",
    is_prcntg: false,
    number: 0,
    is_active: false,
    id: ""
  }

  @ViewChild('discountType') discountSelect_option: any;

  tempAmount!: number;

  dispAmount: any = "0.00";
  dispDiscount: any = "";
  netDiscount: any = ""
  netamount: any = "";
  discLimit: any = '';

  getTotalAmount(): any {

    let bill = 0;
    if (this.is_discount_percentage) {

      bill = this.tests_amt - (this.tests_amt * (this.discountPercentage / 100));
      this.discountAmount = this.tests_amt * (this.discountPercentage / 100);
    } else {
      if (this.discountAmount > this.tests_amt) {
        bill = 0
      } else {
        bill = this.tests_amt - this.discountAmount
      }
    }
    this.totalAmount = bill;
    const curr = bill.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
    this.dispAmount = curr;

    const decimalPart = this.discountAmount !== 0 ? this.discountAmount.toString().split('.')[1] : "0"
    const discountAmountFormatted = decimalPart ? this.discountAmount.toString().split('.')[0] + '.' + decimalPart.substring(0, 2) : this.discountAmount.toFixed(2);

    this.dispDiscount = this.discountAmount !== 0 ? discountAmountFormatted : "0.00"


    const netPart = this.totalAmount !== 0 ? this.totalAmount.toString().split('.')[1] : "0"
    const netPartFomartted = netPart ? this.totalAmount.toString().split('.')[0] + '.' + netPart.substring(0, 2) : this.totalAmount.toFixed(2);
    this.netamount = this.totalAmount !== 0 ? netPartFomartted : "0.00"

    // const discLimit = (this.tests_amt + this.preTestsCost) * (this.user_permissions.number / 100);

    this.discLimit = this.tests_amt * this.user_permissions.number / 100;

    // this.checkDiscountLimit();
    return curr;
  }

  checkDiscountLimit() {
    // this.alertService.showError(this.totalAmount * this.user_permissions.number / 100)
    const discountLimit = this.totalAmount - (this.totalAmount * this.user_permissions.number / 100);
    // if(this.)

  }


  getLimit() {
    if (this.payModesCount === 1) {
      const paid = this.baseForm.get('paid_amount')?.value;

      return paid
    } else {
      const single_paid = parseFloat(this.baseForm.get('paid_amount')?.value);
      const double_paid = this.secondMode.get('paidAmount')?.value;
      const paid = (isNaN(single_paid) ? 0 : single_paid) + double_paid
      return paid
    }
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
      const single_paid = parseFloat(this.baseForm.get('paid_amount')?.value);
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

  showReturn(): any {
    const T_amt = this.totalAmount !== 0;
    const val = this.baseForm.get("paid_amount")?.value > 0;
    const amt = this.totalAmount - this.baseForm.get('paid_amount')?.value;
    { bool: amt > this.totalAmount, amt }
    return { bool: this.baseForm.get('paid_amount')?.value > this.totalAmount, val: (this.baseForm.get('paid_amount')?.value - this.totalAmount).toFixed(0) }
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
    function extractNumbers(input: string): number {
      const trimmedInput = input.trim(); // Remove leading and trailing whitespace
      const numberPattern = /^(\d+(\.\d+)?)/;  // Match digits with optional decimal part, ignoring leading zeros
      const match = trimmedInput.match(numberPattern);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return 0;
      }
    }

    // const input_number = extractNumbers(e.target.value);
    e.target.value = e.target.value.replace(/[^\d.]/g, '')
    const input_number = e.target.value.replace(/[^\d.]/g, '');
    if (this.payModesCount === 1) {

      if (this.baseForm.get('pay_mode_id')?.value == 1) {
        if (input_number <= 0) {
          // this.baseForm.get('paid_amount')?.setValue("");
        }
      } else {
        if (input_number <= 0) {
          // this.baseForm.get('paid_amount')?.setValue("");
        }

        if (input_number > this.totalAmount) {
          this.baseForm.get('paid_amount')?.setValue(this.totalAmount);
        }
      }
    } else {

      const secondModeAmount = this.secondMode.get('paidAmount')?.value;

      if (input_number <= 0) {
        // this.baseForm.get('paid_amount')?.setValue(0);
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

  getDiscountType(id: string) {
    return this.discTypes.find((type: any) => type.id == id);
  }

  validateDiscount() {

    if (this.totalAmount !== 0 || this.selectedTests.length !== 0) {
      this.isDiscountApplied = !this.isDiscountApplied;
      this.applyDiscount();
    } else {
      this.isDiscountApplied = false;
      this.selectedDiscount.is_active = false;
      this.selectedDiscount.name = "";
      this.selectedDiscount.is_prcntg = false;
      this.selectedDiscount.number = 0;
      this.selectedDiscount.id = "";

      this.discountAmount = 0;
      this.is_discount_percentage = true;
      this.discountPercentage = 0;

      if (this.baseForm.get('lab_tests')?.value.length == 0 && this.baseForm.get('lab_packages')?.value.length == 0) {
        this.alertService.showError("Include some tests")
      }

    }
  }

  getDiscount() {
    return this.discountAmount;
  }

  applyDiscount() {

    if (this.isDiscountApplied) {
      this.discountGroup.get('discount_input')?.setValue("");

      this.checkPayModes();

      const selectedDiscount = this.getDiscountType(this.discountSelect_option.nativeElement.value)

      if (selectedDiscount.is_percentage) {
        this.is_discount_percentage = true;
        this.discountPercentage = selectedDiscount.number

        this.selectedDiscount.id = this.discountSelect_option.nativeElement.value
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
        this.selectedDiscount.id = this.discountSelect_option.nativeElement.value
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
      this.selectedDiscount.id = null;
      this.discountAmount = 0;
      this.is_discount_percentage = true;
      this.discountPercentage = 0;

      this.getTotalAmount();
    }
  }

  changeDiscount(isPercentage: boolean = this.isPercentage): void {
    this.isDiscountApplied = false;
    if (this.selectedDiscount.number !== 0) {
      this.applyDiscount();
    }

    if (this.selectedTests.length !== 0) {
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

      if (this.baseForm.get('lab_tests')?.value.length == 0 && this.baseForm.get('lab_packages')?.value.length == 0) {
        this.alertService.showError("Include some tests")
      }
    }
  }

  checkPayModes(){
    if (this.payModesCount == 2) {
      this.baseForm.get('paid_amount')?.setValue("");
      this.secondMode.get('paidAmount')?.setValue("");
    } else {
      this.baseForm.get('paid_amount')?.setValue("");
    }
  }

  validatorsInput(e: any, inputElement: any): void {

    this.checkPayModes();

    function extractNumbers(input: string): number {
      const trimmedInput = input.trim(); // Remove leading and trailing whitespace
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
        if (this.totalAmount != 0) {
          this.alertService.showInfo("Maximum Percentage Discount Limit is Reached", "")
        }

        this.discountGroup.get('discount_input')?.setValue(this.user_permissions.number);
      }
    } else {
      if (input_number < this.discLimit) {
        if (input_number <= 0) {
          this.discountGroup.get('discount_input')?.setValue("");
        } else if (input_number > this.tests_amt) {
          this.discountGroup.get('discount_input')?.setValue(this.tests_amt);
        }
      } else {
        if (this.totalAmount != 0) {
          this.alertService.showInfo("Maximum Discount Limit is Reached", "")
        }

        this.discountGroup.get('discount_input')?.setValue(this.discLimit);
      }

    }
    this.changeDiscount();

    setTimeout(() => {
      const valueLength = inputElement.value.length;
      if(valueLength && inputElement){
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


  calculateAge(): number {
    function getAge(dateOfBirth: string) {
      const dob = new Date(dateOfBirth);
      const now = new Date();

      let age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        age--;
      }

      return age;
    }

    if (this.years) {
      return getAge(this.baseForm.value.dob);
    }
    else {
      return this.baseForm.value.age;
    }
  }

  // Temp function 

  getDateTime() {
    const date = new Date()
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  }

  homeServices(e: any) {
    // this.baseForm.value.home_service.is_required = e;
    // this.baseForm.value.home_service.added_on = this.getDateTime();
  }


  showRemark: boolean = false;
  remarkSave: any = "";

  remarkInput(e: any) {
    this.remarkSave = e;
  }




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
      // this.alertService.showInfo("Include Some Tests")
      if (this.baseForm.get('lab_tests')?.value.length == 0 && this.baseForm.get('lab_packages')?.value.length == 0) {
        this.alertService.showError("Include some tests")
      }
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
    function extractNumbers(input: string): number {
      const trimmedInput = input.trim(); // Remove leading and trailing whitespace
      const numberPattern = /^(\d+(\.\d+)?)/;  // Match digits with optional decimal part, ignoring leading zeros
      const match = trimmedInput.match(numberPattern);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return 0;
      }
    }

    const input_number = extractNumbers(e.target.value);

    const firstModeAmount = this.baseForm.get('paid_amount')?.value
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
    if (this.payModesCount === 2) {
      // Get the paid amount from the base form
      const basePaidAmount = this.baseForm.get('paid_amount')?.value;
      // Get the paid amount from the second mode form
      const secondPaidAmount = this.secondMode.get('paidAmount')?.value;
      // Return true if either paid amount or second amount is truthy
      return !!basePaidAmount || !!secondPaidAmount;
    } else {
      // Get the paid amount from the base form
      const paidAmount = this.baseForm.get('paid_amount')?.value;
      // Return true if paid amount is truthy
      return !!paidAmount;
    }
  }


  private getPatientModel(pay = false): AddPatientsModel {
    if (pay) {
      const due = this.totalAmount;
      const paying = this.baseForm.get('paid_amount')?.value || 0;

      const model: any = {
        id: this.patientDetails.id,
        title: this.patientDetails.title.id,

        // referral_lab: this.patientDetails?.referral_lab?.value?.id || null,
        // partner: this.patientDetails?.partner?.id || null,


        // home_service : this.getHomeService() ,
        name: this.patientDetails.name,
        age: this.patientDetails.age,
        dob: this.patientDetails.dob,
        gender: this.patientDetails.gender,
        attender_name: this.patientDetails.attender_name,
        attender_relationship_title: this.patientDetails.attender_relationship_title,
        mobile_number: this.patientDetails.mobile_number,
        email: "",
        area: "",
        address: this.patientDetails.address,
        referral_doctor: this.patientDetails.referral_doctor,
        client: parseInt(this.cookieSrvc.getCookieData().client_id),
        ULabPatientAge: this.patientDetails.ULabPatientAge,
        prescription_attach: this.patientDetails.prescription_attach,
        lab_tests: this.baseForm.get('lab_tests')?.value,
        lab_packages: this.baseForm.get('lab_packages')?.value,
        created_by: this.staffId || "",
        payment_remarks: this.remarkSave || "",
        lab_discount_type_id: this.isDiscountApplied ? parseInt(this.selectedDiscount.id) : null,
        printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        discount_amt: !this.isDiscountApplied && this.discountGroup.get('discount_input')?.value !== "" ? this.discountAmount.toFixed(2) : 0,
        receipt: [
          {
            pay_mode: null,
            paid_amount: 0
          }
        ],
        payment_for: 3,
      };



      if (pay) {
        const due = this.totalAmount;
        const paying = this.baseForm.get('paid_amount')?.value || 0;

        if (this.payModesCount == 1) {
          model.receipt = [
            {
              pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
              paid_amount: paying > due ? due : this.baseForm.get('paid_amount')?.value
            }
          ]
        } else {
          model.receipt = [
            {
              pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
              paid_amount: paying > due ? due : this.baseForm.get('paid_amount')?.value
            }, {
              pay_mode: this.secondMode.get('paymode')?.value,
              paid_amount: this.secondMode.get('paidAmount')?.value,
            }
          ]
        }
      }

      return model
    } else {
      const model: any = {
        id: this.patientDetails.id,
        title: this.patientDetails.title.id,
        // home_service : this.getHomeService() ,
        name: this.patientDetails.name,
        age: this.patientDetails.age,
        dob: this.patientDetails.dob,
        gender: this.patientDetails.gender,
        attender_name: this.patientDetails.attender_name,
        attender_relationship_title: this.patientDetails.attender_relationship_title,
        mobile_number: this.patientDetails.mobile_number,
        email: "",
        area: "",
        address: this.patientDetails.address,
        referral_doctor: this.patientDetails.referral_doctor,
        client: parseInt(this.cookieSrvc.getCookieData().client_id),
        ULabPatientAge: this.patientDetails.ULabPatientAge,
        prescription_attach: this.patientDetails.prescription_attach,
        lab_tests: this.baseForm.get('lab_tests')?.value,
        lab_packages: this.baseForm.get('lab_packages')?.value,
        created_by: this.staffId || "",
        printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        lab_discount_type_id: this.isDiscountApplied ? parseInt(this.selectedDiscount.id) : null,

        // referral_lab: this.patientDetails?.referral_lab?.value?.id || null,
        // partner: this.patientDetails?.partner?.id || null,

        discount_amt: !this.isDiscountApplied && this.discountGroup.get('discount_input')?.value !== "" ? this.discountAmount.toFixed(2) : 0,
        payment_for: 3,
        receipt: [
          {
            pay_mode: 1,
            paid_amount: 0
          }
        ],
      };

      return model
    }

  }

  private getNEWPaymentModel(patient: any, details: any, pay: boolean = true): any {
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
        payment_for: 3,
        patient: patient.id,
        remarks: this.remarkSave || "",
        created_by: this.staffId,
        printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        discount_type: this.isDiscountApplied ? this.selectedDiscount.id : null,
        client_id: details.client_id,
        payments: [
          {
            pay_mode: details.pay_mode_id,
            // paid_amount: details.paid_amount.toFixed(2),
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



      return model;
    } else {
      let model: any = {
        payment_for: 3,
        patient: patient.id,
        remarks: this.remarkSave || "",
        created_by: this.staffId,
        printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
        discount_type: this.isDiscountApplied ? this.selectedDiscount.id : null,
        client_id: this.cookieSrvc.getCookieData().client_id,

        payments: [
          {
            pay_mode: 1,
            paid_amount: 0,
          }
        ]
      };

      if (!this.isDiscountApplied && this.discountGroup.get('discount_input')?.value !== "") {
        model.discount_amt = this.discountGroup.get('discount_input')?.value !== "" ? this.discountAmount : "";
      }

      return model;

    }
  }



  private getPaymentModel(patient: any, details: any): any {

    const due = this.totalAmount;
    const paying = this.baseForm.get('paid_amount')?.value || 0;

    if (paying > due) {

      details = {
        payment_for: 3,
        lab_discount_type_id: this.selectedDiscount.id !== "" ? this.selectedDiscount.id : null,
        paid_amount: due || 0,
        pay_mode_id: this.baseForm.get('pay_mode_id')?.value || null,
        discount_amt: this.discountAmount,
        created_by: this.staffId,
        is_percentage_discount: this.isDiscountApplied || this.isPercentage,
        client_id: this.cookieSrvc.getCookieData().client_id
      }
    } else {

      details = {
        payment_for: 3,
        lab_discount_type_id: this.selectedDiscount.id !== "" ? this.selectedDiscount.id : null,
        paid_amount: this.baseForm.get('paid_amount')?.value || 0,
        pay_mode_id: this.baseForm.get('pay_mode_id')?.value || null,
        discount_amt: this.discountAmount,
        created_by: this.staffId,
        is_percentage_discount: this.isDiscountApplied || this.isPercentage,
        client_id: this.cookieSrvc.getCookieData().client_id
      }
    }

    let model: any;

    if (this.isDiscountApplied) {

      model = {
        payment_for: 3,
        patient: patient.id,
        pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
        paid_amount: details.paid_amount,
        remarks: this.remarkSave || "",
        created_by: this.staffId,
        discount_type: this.isDiscountApplied ? parseInt(this.selectedDiscount.id) : null,
        client_id: this.cookieSrvc.getCookieData().client_id
      }
    }
    else {

      model = {
        payment_for: 3,
        patient: patient.id,
        pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
        paid_amount: details.paid_amount,
        remarks: this.remarkSave || "",
        created_by: this.staffId,
        discount_amt: this.discountGroup.get('discount_input')?.value !== "" ? details.discount_amt.toFixed(2) : 0,
        client_id: this.cookieSrvc.getCookieData().client_id
      }
    }

    return model;
  }

  private InoiceModel(patient: any, details: any): Payment {
    const model: any = {
      patient_id: patient.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }
    return model;
  }

  resetBaseForm() {
    this.baseForm.reset();
    this.initializeForm();
    this.selectedTests = [];
    this.discountAmount = 0;
    this.totalAmount = 0;
    this.discountGroup.get('discount_input')?.setValue("");
    this.submitted = false;

    this.tests_included = [];
    this.package_included = [];

    this.selectedDiscount = {
      name: "",
      is_prcntg: false,
      number: 0,
      is_active: false,
      id: ""
    }

    // this.baseForm.value.home_service = { is_required: false, added_on: this.getDateTime(), patient: 23 };
    this.tempDisc = 0;
    this.dispDiscount = 0
    this.isDiscountApplied = false;
    this.is_discount_percentage = false;
    this.discountPercentage = 0;
    this.getTotalAmount();
    this.visitId = '';
    // this.remarksSave =
    this.remarkSave = "";

    if (this.payModesCount == 2) {
      this.baseForm.get('paid_amount')?.setValue("");
      this.secondMode.get('paidAmount')?.setValue("");
      this.secondMode.reset();
      this.payModesCount = 1;
    } else {
      this.baseForm.get('paid_amount')?.setValue("");
    }
  }

  @ViewChild(PatientOffcanvasComponent) patientOffcanvas!: PatientOffcanvasComponent;
  closeCanvas() {
    this.patientOffcanvas.closeCanvas();
  }

  lastItemReached() {

  }


  PNDTPatientID!: any;

  private getPatientReceipt(ptn: any, ptnModel: any) {
    const model = this.getPaymentModel(ptn, ptnModel);
    this.subsink.sink = this.endPoint.getReceipt(model).subscribe((response: any) => {
      this.printSrvc.print(response.html_content);
      // this.showPNDT ? this.postPNDTForm(model.patient) : //pass ;
      this.resetBaseForm()
    }, (error: any) => {
   
        this.alertService.showError("Failed to get receipt information", "Payment Failed. Please Try Again",);
      this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptn.id } });
    });
  }

  private getIncoicePDF(ptn: any, ptnModel: any) {
    const model = this.InoiceModel(ptn, ptnModel);
    this.subsink.sink = this.endPoint.getInvoice(model).subscribe((response: any) => {
      this.inProgress = false;
      if (this.setting?.api) {
        this.printSrvc.print(response.html_content);
      } else {
        // this.patientOffcanvas.shakeCanvas();
      }

      this.resetBaseForm();

    }, (error: any) => {
      this.inProgress = false;
      this.alertService.showError("Failed to get invoice information", "");
      // this.showPNDT ? this.postPNDTForm(model?.patient_id) : null;
      this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptn.id } });
    });
  }

  saveAndNext(): void {
    if (this.baseForm.valid) {
      if (this.selectedTests.length !== 0) {

        this.inProgress = true;
        const model: any = this.getPatientModel();
        model['id']=this.patientDetails.id;
        model.receipt = this.getNEWPaymentModel(this.patientDetails, model, false);

        this.subsink.sink = this.endPoint.updatePatient(model, model.id).subscribe((response: any) => {
        
          this.alertService.showSuccess("Tests Added", `${response.name} | ${response.mr_no} | ${response.visit_id}`);
          // this.patientOffcanvas.getData();
          // this.modalService.dismissAll();
          // this.sessionCreated.emit();
          // this.getIncoicePDF(response, model);

          // this.newSessionReceiptPrint(response.id)
          this.print_patient_report(response.last_receipt_id, {}, response.id);
        },
          (error) => {
            this.inProgress = false;

            if (error?.error[0]?.includes("already")) {
              this.alertService.showError("Patient Already Registered")
            } else {
              this.alertService.showError("", error.error);
            }

          }
        );
      } else {
        this.alertService.showWarning("Add Tests")
      }
    } else {
      this.submitted = true;
      let invalid: any = []
      Object.keys(this.baseForm.controls).forEach(key => {
        const control = this.baseForm.get(key);
        if (control && !control.valid) {
          if (key === 'mobile_number') {
            this.alertService.showError("", `Enter Valid Mobile Number`)
          } else {
            this.alertService.showError("", `Enter ${key}`)
          }
        }
      });
      if (this.selectedTests.length === 0) {
        this.alertService.showError("", `Add Test`)
      }
    }
  }

  getReceipt(ptn: any) {
    const model = {
      patient_id: ptn,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
      if (this.setting?.apr) {
        // this.printSrvc.print(response.html_content);
        this.printSrvc.printRcpts(response.html_content);
      } else {
        // this.patientOffcanvas.shakeCanvas();
      }
      // this.printSrvc.print(response.html_content);
      this.inProgress = false;
      this.resetBaseForm();
    }, (error: any) => {
      this.inProgress = false;
      this.alertService.showError("Failed to get receipt information", "Payment Failed. Please Try Again",);
      this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptn.id } });
    })
  }


  savePayment() {
    if (this.payModesCount === 2) {
      // Get the paid amount from the base form
      const basePaidAmount = this.baseForm.get('paid_amount')?.value;
      // Get the paid amount from the second mode form
      const secondPaidAmount = this.secondMode.get('paidAmount')?.value;
      // Return true if either paid amount or second amount is truthy
      if (!!basePaidAmount && !!secondPaidAmount) {
        if (this.minimum_paid_amount.is_active) {
          const limit = this.totalAmount * (this.minimum_paid_amount.number / 100)
          if (this.getLimit() >= limit) {
            this.saveApiCall()
          } else {
            this.alertService.showInfo("Minimum Payment Must be " + limit, "")
          }
        } else {
          this.saveApiCall()
        }
      } else {
        this.alertService.showError("One of the payment fields is empty, at least one rupee, or pick just one payment")
      }
    } else {
      // Get the paid amount from the base form
      const paidAmount = this.baseForm.get('paid_amount')?.value;
      // Return true if paid amount is truthy
      // return !!paidAmount;
      if (!!paidAmount) {

        if (this.minimum_paid_amount.is_active) {
          const limit = this.totalAmount * (this.minimum_paid_amount.number / 100)
          if (this.getLimit() >= limit) {
            this.saveApiCall()
          } else {
            this.alertService.showInfo("Minimum Payment Must be " + this.capitalSrvc.formatIndianNumber(limit) + " Rupees")
          }

        } else {
          this.saveApiCall()
        }

      } else {
        if(this.selectedTests.length != 0){
          const limit = this.totalAmount * (this.minimum_paid_amount.number / 100)
          // this.alertService.showError("One of the payment fields is empty, at least one rupee, or pick just one payment")
          this.alertService.showInfo("Minimum Payment Must be " + this.capitalSrvc.formatIndianNumber(limit)+ " Rupees")
        }else{
          this.alertService.showError("Include Some Tests.")
        }

      }
    }
  }



  override saveApiCall(): void {
    if (this.baseForm.valid) {
      if (this.selectedTests.length !== 0) {
        this.inProgress = true;
        const model: any = this.getPatientModel(true);
        model['id'] = this.patientDetails.id;

        model.receipt = this.getNEWPaymentModel(this.patientDetails, model)

        this.subsink.sink = this.endPoint.updatePatient(model, model.id).subscribe((response: any) => {
          this.alertService.showSuccess("Added", `${response.name} | ${response.mr_no} | ${response.visit_id}`);
          // this.getPatientReceipt(response, model);
          // this.getReceipt(response.id);
          // this.modalService.dismissAll();
          // this.sessionCreated.emit();
          // this.newSessionReceiptPrint(response.id)
          this.print_patient_report(response.last_receipt_id, {}, response.id);
        },
          (error) => {
            this.inProgress = false;

            if (error?.error[0]?.includes("already")) {
              this.alertService.showError("Patient Already Registered")
            } else {
              this.alertService.showError("", error.error);
            }

          }
        );

      } else {
        this.alertService.showWarning("Add Tests")
      }
    } else {
      this.submitted = true;
      let invalid: any = []
      Object.keys(this.baseForm.controls).forEach(key => {
        const control = this.baseForm.get(key);
        if (control && !control.valid) {
          if (key === 'mobile_number') {
            this.alertService.showError("", `Enter Valid Mobile Number`)
          } else {
            this.alertService.showError("", `Enter ${key}`)
          }
        }
      });
      if (this.selectedTests.length === 0) {
        this.alertService.showError("", `Add Test`)
      }
    }
  }

  customSearch(itemList: any, searchTerm: string) {
    let filterList = itemList['name'].toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase());
    return filterList;
  }


  // utilities 


  setting: any = {
    api: true,
    apr: true,
    aprremark: true,
    count: 2
  }


  getSetting() {
    this.setting.api = this.cookieSrvc.getSetting().api;
    this.setting.apr = this.cookieSrvc.getSetting().apr;
    this.setting.aprremark = this.cookieSrvc.getSetting().aprremark;

    this.setting.count = 0; // Initialize count to 0

    if (!this.setting.api) {
      this.setting.count += 1;
    }

    if (!this.setting.apr) {
      this.setting.count += 1;
    }

    if (!this.setting.aprremark) {
      this.setting.count += 1;
    }
  }


  setAutoPrint(type: any, e: boolean) {
    if (type == 1) {
      this.cookieSrvc.setSetting(e, this.setting.apr, this.setting.aprremark);
      this.getSetting();
    } else if (type == 2) {
      this.cookieSrvc.setSetting(this.setting.api, e, this.setting.aprremark);
      this.getSetting();
    } else {
      this.cookieSrvc.setSetting(this.setting.api, this.setting.apr, e);
      this.getSetting();
    }
  }


  getNextPrint() {
    if (this.paidAmountCheck()) {
      return this.setting.apr ? 'Print' : 'Next'
    } else {
      return this.setting.api ? 'Print' : 'Next'
    }
  }

  activeId: any = 0;

  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }

  print_patient_report(id: any, receipt: any, ptnId: any) {

    const model = {
      patient_id: ptnId,
      client_id: this.cookieSrvc.getCookieData().client_id,
      receipt_id: id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    receipt['loading'] = true;
    this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
      this.inProgress = false;
      this.printSrvc.printRcpts(response.html_content);
      this.sessionCreated.emit();
      this.modalService.dismissAll();
      
    }, (error: any) => {
      receipt['loading'] = false;
      this.inProgress = false;

      this.showAPIError(error);

      this.modalService.dismissAll();
    })

  }

  // newSessionReceiptPrint(ptnId:any){
  //   this.subsink.sink = this.endPoint.getPaymentHistory(ptnId).subscribe((data: any) => {

  //     const model = {
  //       patient_id: ptnId,
  //       client_id: this.cookieSrvc.getCookieData().client_id,
  //       receipt_id: data[data.length - 1].id,
  //       printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
  //     }

  //     this.inProgress = false;
      
  //     this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
  //       this.printSrvc.printRcpts(response.html_content);
  //       this.sessionCreated.emit();
  //       this.modalService.dismissAll();
  //     }, (error: any) => {
  //       this.inProgress = false;
  //       this.modalService.dismissAll();
  //       this.alertService.showError("Failed to Print Receipt", error)
  //     })
      
  //   },(error)=>{
  //     this.inProgress = false;
  //     this.modalService.dismissAll(); 
  //     this.alertService.showError("Failed to Print Receipt", error)
  //   })
  // }

}
