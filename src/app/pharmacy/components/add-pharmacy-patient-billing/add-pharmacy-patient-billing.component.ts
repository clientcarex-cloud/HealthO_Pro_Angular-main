import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { FileService } from '@sharedcommon/service/file.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { AutocompleteComponent } from 'angular-ng-autocomplete';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { LoyaltyCardEndpoint } from 'src/app/loyaltycard/loyaltycard.enpoint';
import { OutsourcingEndpoint } from 'src/app/outsourcing/outsourcing.endpoint';
import { AddPatientEndpoint } from 'src/app/patient/endpoints/addpatient.endpoint';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { AddPatientsModel } from 'src/app/patient/models/addPatient/addpatient.model';
import { SharedPatientsService } from 'src/app/patient/services/sharedpatient.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-add-pharmacy-patient-billing',
  templateUrl: './add-pharmacy-patient-billing.component.html',
  styleUrl: './add-pharmacy-patient-billing.component.scss'
})

export class AddPharmacyPatientBillingComponent extends BaseComponent<AddPatientsModel> {

  discountGroup!: UntypedFormGroup;

  @ViewChild('auto_complete') auto_complete!: AutocompleteComponent ;

  inProgress: boolean = false;
  currentDate!: Date;
  years: boolean = false;
  visitId: string = "";
  selectedTests: any = [];

  refDoctors: any[] = [];
  titles!: any[];
  genders!: any[];

  tests_included: any = [];
  package_included: any = [];
  discTypes: any = [];
  payModes!: any[];
  ages!: any[];
  isCollapsed: boolean = true;
  staffId!: any;

  status: any = [];
  pendingId!: number;
  urgentId!: number;
  emeregencyId!: number;
  disableDiscount: boolean = false;
  disableForm: boolean = false;

  hospitalName: string = "";
  attender_titles: any;
  apt_id: any = null;
  b_id: any ;

  pharmacy__dis_tax: any ;

  manualDateTime: any = false ;

  constructor(
    injector: Injector,
    config: NgbDropdownConfig,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private formBuilder: UntypedFormBuilder,

    public timeSrvc: TimeConversionService,
    public capitalSrvc: CaptilizeService,
    private printSrvc: PrintService,
    private cookieSrvc: CookieStorageService,
    private proEndpoint: ProEndpoint,
    private fileSrvc: FileService,
    private sharedPatient: SharedPatientsService,

    private endPoint: AddPatientEndpoint,
    private prevCardEndpoint: LoyaltyCardEndpoint,
    private patientEndpoint: PatientEndpoint,
    private staffEndpoint: StaffEndpoint,
    private masterEndpoint: MasterEndpoint,
    private sourcingEndpont: OutsourcingEndpoint,
    private pharmacyEndpoint: PharmacyEndpoint
  ) {
    super(injector);
    config.autoClose = true
  }

  navigateBack() {
    window.history.back()
  }

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

  minimum_paid_amount: any ={
    is_active: false,
    number: 0
  }


  override ngAfterViewInit(): void {

    const input = document.getElementById('patient_name') as HTMLInputElement;
    if (input && !input.readOnly) {
      input.focus();
    }

    this.getSetting();

    this.subsink.sink = this.proEndpoint.getAttenderTitles().subscribe((data: any) => {
      this.attender_titles = data.reverse();
    });

    this.subsink.sink = this.endPoint.getSupport().subscribe((data: any) => {
      this.support = data.results.find((item: any) => item.slug === "Patient_registration");
    });

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

  override ngOnInit(): void {

    const cookieData = this.cookieSrvc.getCookieData();

    this.staffId = cookieData.lab_staff_id;
    this.hospitalName = cookieData.business_name;
    this.b_id = cookieData.b_id;

    this.currentDate = new Date() || '';

    this.initializeForm();
    this.getManualDateSettings();

    if (!cookieData.is_superadmin) {
      this.user_permissions.sa = false;
      this.subsink.sink = this.staffEndpoint.getStaffPatientsPermissions(this.staffId || cookieData.lab_staff_id).subscribe((data: any) => {

          if (data.length == 0) {
            this.user_permissions.permissions = [];
            this.alertService.showWarning("You Dont't Have Access to View Patient", "")
            this.router.navigate(['/patient/patients/']);
          } else {
            if(!data[0].permissions.includes(1)){
              this.alertService.showWarning("You Dont't Have Access to Add New Patient", "")
              this.router.navigate(['/patient/patients/']);
            }else{
              this.user_permissions.permissions = data[0].permissions;
              this.user_permissions.number = parseFloat(data[0].number)
            }
          }
      })

      this.subsink.sink = this.masterEndpoint.getBusinessMinimumPaidAmount().subscribe((data:any)=>{
        this.minimum_paid_amount.is_active = data[0].is_active;
        this.minimum_paid_amount.number = data[0].number;
      })
    } else {
      this.user_permissions.sa = true;
      this.user_permissions.number = 100;
      this.minimum_paid_amount.is_active = false;
    }

    this.discountGroup = this.formBuilder.group({
      discount_input: ["",[Validators.min(0), Validators.max(100)]]
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
        // else if (tests.name === 'Urgent (Pending)') {
        //   const model = { id: tests.id, name: "Urgent" }
        //   this.urgentId = tests.id
        //   this.status.push(model);
        // }
      })

    })

    this.subsink.sink = this.proEndpoint.getTitle().subscribe((data: any) => {
      this.titles = data
    });

    this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
      this.genders = data.results.sort((a: any, b: any) => a.id - b.id);
    });

    this.subsink.sink = this.proEndpoint.getPayModes().subscribe((data: any) => {
      this.payModes = data.results.filter((method: any) => method.is_active);
    });

    this.subsink.sink = this.proEndpoint.getAges().subscribe((data: any) => {
      this.ages = data.results;
      this.baseForm.get('ULabPatientAge')?.setValue(this.ages.find((age: any) => age.name === "Years")?.id)
    });

    this.getPharmacyDiscountTaxs();

  }

  getPharmacyDiscountTaxs(){
    this.subsink.sink = this.masterEndpoint.getPharmacyDisTax().subscribe((res: any)=>{
      this.pharmacy__dis_tax = res[0];
    })
  }


  getManualDateSettings(){
    this.subsink.sink = this.masterEndpoint.getManualDateTimeSetting().subscribe((res: any)=>{
      try{
        this.manualDateTime = res[0].manual_date ;
        if(this.manualDateTime){
          this.updateAddedOnTimeValidation(true) ;
        }
      }catch(error){
       
      }
    })
  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({

      added_on_time: [this.timeSrvc.getTodaysDate()],

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
      lab_packages: [[]],
      is_discount_amt_by_ref_doc: [false],

      email : [null],
      ref_lab: [null],

      privilege_membership: [],

      privilege_discount: ['discount'],

      referral_lab: [null],

      partner: [null]

    });

  }

  updateAddedOnTimeValidation(isRequired: boolean) {
    const addedOnTimeControl = this.baseForm.get('added_on_time');
  
    if (isRequired) {
      addedOnTimeControl!.setValidators([Validators.required]);
    } else {
      addedOnTimeControl!.clearValidators();
    }
  
    addedOnTimeControl!.updateValueAndValidity(); // Update validity after changing validators
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
      lab_packages: [[]],
      is_discount_amt_by_ref_doc: false,

      email : [null],
      ref_lab: [null],

      privilege_membership: []
    });
  }

  validNumberField(event: any, type: string) {
    this.baseForm.get(type)?.setValue(event.target.value.replace(/[.e]/gi, ''))
  }

  toggleMoreOptions(e: boolean) {
    this.isCollapsed = e;
  }

  @ViewChild('file') fileImage: any;

  clearPrescription() {
    if (this.fileImage && this.fileImage.nativeElement) {
      this.fileImage.nativeElement.value = '';
      this.baseForm.get('prescription_attach')?.setValue(null)
    }
  }

  
  onFileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        this.baseForm.get('prescription_attach')?.setValue(base64String);
      });
    }
  }

  date: string = "";
  timer: any;

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


  // stocks: any ;

  getSearches(searchTerm: string): void {
    this.searchData = []; 

    while (searchTerm.startsWith(" ")) searchTerm = searchTerm.substring(1);

    if (searchTerm && searchTerm.length > 2) {

      this.testTerm = searchTerm;
      this.searchLoading = true;

      clearTimeout(this.timer);

      this.timer = setTimeout(() => {

        if(this.baseForm.get('referral_lab')?.value){

          this.subsink.sink = this.sourcingEndpont.getRevisedTests(
            this.baseForm.get('referral_lab')?.value?.id, searchTerm, 1, 'all', ''
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

        }else if(this.baseForm.get('partner')?.value){

          this.subsink.sink = this.sourcingEndpont.getRevisedTestsCompany(
            this.baseForm.get('partner')?.value?.company?.id, searchTerm, 1, 'all', ''
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

        }
        else{

          this.subsink.sink = this.pharmacyEndpoint.getPatientStocks(searchTerm)?.subscribe((res: any)=>{
            res.map((med: any)=> med['showName'] = `${med.item?.name}${med?.item?.composition ? ' - ' + med?.item?.composition : ''}`+ '//++' + searchTerm ) ;
            this.searchData = res;
            this.searchLoading = false;
          })
        }

      }, 1000);

    } else {
      this.testTerm = null;
      this.searchData = [];
      this.searchLoading = false;
    }
  }

  removeDigitsAfterPlus(inputString: string): string {
    const plusIndex = inputString.indexOf("//++");
    if (plusIndex !== -1) {
      return inputString.substring(0, plusIndex);
    } else {
      return inputString;
    }
  }

  docLoading: boolean = false
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
          this.refDoctors.map((d:any) => d.name = `${d.name}, ${d.mobile_number}`)
          this.docLoading = false;
        });
      }, 0);
    } else {
      this.testTerm = null;
      this.refDoctors = [];
      this.docLoading = false;
    }
  }



  prevCardLoading: boolean = false;
  cards: any ;
  getCardSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {

      this.prevCardLoading = true;
      this.cards = []
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.prevCardEndpoint.getMemberships(
        "all",1, searchTerm, true , "", "", this.timeSrvc.getTommorowDate(this.timeSrvc.getTodaysDate())
        ).subscribe((data: any) => {
         
          this.cards = data;
          this.cards.map((d:any) =>  d.name = `${d.card_holder.name}, PC No. ${d.pc_no}, Ph no : ${d.card_holder.mobile_number}`)
          this.prevCardLoading = false;
        });
      }, 300);
    } else {

      this.prevCardLoading = false;
      this.cards = [];
    }
  }

  refLabLoading: boolean = false;
  refLabs: any ;
  getLabSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {

      this.refLabLoading = true;
      this.refLabs = []
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.sourcingEndpont.getPartnerships(
          searchTerm, '&acceptor=', this.b_id, 'all', 1, true
        ).subscribe((res: any)=>{
          res.forEach((lab: any)=>{
            lab.dispName = `${lab?.organization_name || lab?.partner?.organization_name}`
          });

          this.refLabs = res.filter((r: any)=> r.is_referral_lab) ;
        });

        this.refLabLoading = false;
      }, 300);
    } else {

      this.refLabLoading = false;
      this.refLabs = []
    }
  }

  partnersLoading: boolean = false;
  partners: any ;
  getPartnerSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {

      this.partnersLoading = true;
      this.partners = []
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.sourcingEndpont.getCompanyPartnerShips(
          searchTerm, 'all'
        ).subscribe((res: any)=>{
          res.forEach((r: any)=>{
            r.name = `${r?.company?.name} / ${r.name}` ;
          })
          this.partners = res ;
        });

        this.partnersLoading = false;
      }, 300);
    } else {

      this.partnersLoading = false;
      this.partners = []
    }
  }

  privilegeCard_dis: any = 0;

  changeTitle(e: any) {
    const value = e.target.value;
    if (["2", "3", "5", 2, 3, 5].includes(value)) {
      this.baseForm.get('gender')?.setValue(2);
      if (["2", 2].includes(value)) {
        this.baseForm.get('attender_relationship_title')?.setValue(3);
      }
    } else if (["1", 1, "4", 4, "7", 7, "6", 6].includes(value)) {
      this.baseForm.get('gender')?.setValue(1);
    }
  }

  changeGender(e: any) {
    const genderValue = e.target.value === '1' || e.target.value === 1 ? 1 : e.target.value === '2' || e.target.value === 2 ? 2 : null;
  
    if (genderValue && this.baseForm.value.title !== '7') {
      this.baseForm.get('title')?.setValue(genderValue);
    }
  }

  changeAges(e: any) {
    if (e.target.value == 4 || e.target.value == "4") {
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

  presetRegistrationTime(inputDate: string): string {
    const date = new Date(inputDate);
    return date.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
  }

  deleteTest(index: number, test: any) {
    this.selectedTests.splice(index, 1);

    this.tests_included = this.tests_included.filter((t: any) => t !== test.stock.id);
    if (this.selectedTests.length === 0) {
      this.totalAmount = 0;
      this.dispDisc = 0;
      this.total_paid = 0;
      this.discountAmount = 0 ;

      this.tests_amt = 0 ;
      this.prev_disc = 0 ;
      this.validateDiscount();
      this.discountGroup.get('discount_input')?.setValue("");
    }
  }
  

  clearAllTests(type: any ){
    this.tests_included = [] ;
    this.package_included = [] ;
    this.searchData = [] ;

    this.baseForm.get('lab_packages')?.setValue([]);
    this.baseForm.get('lab_tests')?.setValue([]);

    this.selectedTests = [];

    if (this.selectedTests.length === 0) {
      this.totalAmount = 0.00;
      this.dispDisc = 0.00;
      this.total_paid = 0.00;
      this.discountAmount = 0 ;
      this.prev_disc = 0 ;
      this.validateDiscount();
      this.discountGroup.get('discount_input')?.setValue("");
    }

    this.baseForm.get(type)?.setValue(null) ;
    this.baseForm.get(type)!.disable() ;

    if(type == 'partner'){
      this.baseForm.get('mobile_number')?.setValue(this.baseForm?.get('referral_lab')?.value?.phone_number || null) ;
    }

    this.getPrevDisc();
  }

  selectedMedicine: any ;
  medSelected(){
    this.tests_included.push(this.selectedMedicine.stock.id);
    this.updateTotalMedBill(this.selectedMedicine);
    this.selectedTests.push(this.selectedMedicine);
    this.selectedMedicine = null ;
    this.clearFocusAutoComplete();
  }

  onItemSelected(item: any, autoComplete: any, mobile: boolean ): void {

    if(this.tests_included.includes(item?.id)){
      this.alertService.showInfo(`${item.showName}`, 'Already Selected');
      this.clearFocusAutoComplete();
      return ;
    }else if(item.available_quantity < 1){
      this.alertService.showInfo(`${item.showName}`, 'Out of Stock');
      this.clearFocusAutoComplete();
      return ;
    }else if(item?.expiry_date && this.timeSrvc.hasCrossedSpecifiedDateTime(item.expiry_date)){
      this.alertService.showWarning(`${item.showName}`, "Expired!");
      this.clearFocusAutoComplete();
      return ;
    }

    this.testTerm = '';

    item.showName = this.removeDigitsAfterPlus(item?.showName);
    autoComplete.query = this.removeDigitsAfterPlus(item?.showName);

    try{
      item['patientRate'] = parseFloat(item.price) - (parseFloat(item.price) * (parseFloat(item?.item.discount) / 100)) ;
    }catch(error){
      item['patientRate'] = 0 ;
    }

    const model = {
      stock: item, 
      is_strips: false,
      quantity: 1,
      total_med_bill: 0,
      dispRate: this.formatToTwoDecimals(item.patientRate),
      added_on: this.timeSrvc.getCurrentDateTime(),
    }

    this.selectedMedicine = model ;
    this.searchData = [];

    if(mobile){
      this.tests_included.push(this.selectedMedicine.stock.id);
      this.updateTotalMedBill(this.selectedMedicine);
      this.selectedTests.push(this.selectedMedicine);
      this.selectedMedicine = null ;
      this.clearFocusAutoComplete();
    }else{
      this.sharedPatient.setInputElementFocus("searchBarMedQuantity");
    }
    
  }

  writeQuantity(med: any, event: any){
    med['quantity'] = event ;

    if(med.stock.available_quantity < med.quantity){
      this.alertService.showInfo(`Only ${med.stock.available_quantity} left`, `${med.stock.showName}`)
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.updateTotalMedBill(med) ;
      
    }, 500) ;

  }

  updateTotalMedBill(med: any){

    if(med?.is_strips){
      med.total_med_bill = this.formatToTwoDecimals(med.stock.patientRate * med.quantity) ; 
    }else{
      med.total_med_bill = this.formatToTwoDecimals((med.stock.patientRate / med.stock.packs) * med.quantity) ; 
    }

    this.cdr.detectChanges(); 
  }

  checkQuantity(med: any){
    if(med.quantity < 1 || med.quantity == ""){
      setTimeout(()=>{
        med.quantity = 1 ;
        this.updateTotalMedBill(med) ;
      }, 100)
    }
  }

  writeIsStrips(med: any, event: any){
    med['is_strips'] = event.target.value == "true" ;
    this.updateTotalMedBill(med) ;
  }

  prev_disc: any = 0 ;
  card: any ;

  getPrevDisc(popup : any = null){
    if(this.baseForm.get('privilege_membership')?.value){

      this.card = this.baseForm.get('privilege_membership')?.value;

      this.disableDiscount = true ; 
      this.dispDiscount = "0.00" ;
      this.discountAmount = 0;
      this.discountGroup.get('discount_input')?.setValue("");
      this.discountGroup.get('discount_input')?.disable();
      this.getTotalAmount();

      if(popup){
        setTimeout(()=>{
          popup?.open();
         },100)
      }

      if(this.tests_included.length!=0 || this.package_included.length !=0){
        let pkg : any = []
        if(this.baseForm.get('lab_packages')?.value && this.baseForm.get('lab_packages')?.value.length >= 1){
          this.baseForm.get('lab_packages')?.value.forEach((id: any)=>{
            pkg.push(id.LabGlobalPackageId)
          })
        }
  
  
        this.subsink.sink = this.endPoint.getPrevCardDisc(
          this.baseForm.get('privilege_membership')?.value?.id, 
          this.tests_included.join(","), 
          pkg.join(","),
          this.baseForm.get('privilege_discount')?.value
        ).subscribe((res: any)=>{
          this.prev_disc = res.discount
        }, (error)=>{
          this.prev_disc = 0;
          this.alertService.showError(error?.error?.Error || error?.error?.Error || error)
        })

      }

    }else{
      this.card = null;
      this.disableDiscount = false ; 
      this.dispDiscount = "0.00" ;
      this.discountAmount = 0;
      this.discountGroup.get('discount_input')?.setValue("");
      this.discountGroup.get('discount_input')?.enable();
      this.getTotalAmount();
    }
  }

  getTotalTestsAmount(): string {
    let totalAmount = 0;
    if (this.selectedTests.length !== 0) {
      for (const item of this.selectedTests) {
        totalAmount += parseFloat(item.total_med_bill);
        this.tests_amt = totalAmount;
      }
    } else {
      totalAmount = 0
      this.tests_amt = 0;
    }
    this.getTotalAmount();
    return totalAmount.toFixed(2) // Assuming you want to display the amount with two decimal places
  }

  getTotalTax(): string {
    let totalAmount = 0;
    if (this.selectedTests.length !== 0) {
      for (const item of this.selectedTests) {
        totalAmount += parseFloat(item.total_med_bill) * (parseFloat(item.stock.item.tax) / 100);
      }
    } else {
      totalAmount = 0;
    }
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

    this.totalAmount = bill - this.getPrivilegeCardDiscount();

    const curr = bill.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
    this.dispAmount = curr;

    const decimalPart = this.discountAmount !== 0 ? this.discountAmount.toString().split('.')[1] : "0"
    const discountAmountFormatted = decimalPart ? this.discountAmount.toString().split('.')[0] + '.' + decimalPart.substring(0, 2) : this.discountAmount.toFixed(2);

    this.dispDiscount = this.discountAmount !== 0 ? discountAmountFormatted : "0.00" ;


    const netPart = this.totalAmount !== 0 ? this.totalAmount.toString().split('.')[1] : "0"
    const netPartFomartted = netPart ? this.totalAmount.toString().split('.')[0] + '.' + netPart.substring(0, 2) : this.totalAmount.toFixed(2);
    this.netamount = this.totalAmount !== 0 ? netPartFomartted : "0.00"


    this.discLimit = (this.tests_amt * this.user_permissions.number / 100) - this.getPrivilegeCardDiscount();

    return curr;
  }

  checkDiscountLimit(){
    const discountLimit = this.totalAmount - (this.totalAmount * this.user_permissions.number / 100);

  }

  getPrivilegeCardDiscount(){
    const prevCard = this.baseForm.get('privilege_membership')?.value;
    return (prevCard && prevCard!="" ? parseFloat(this.prev_disc) : 0)
  }

  getLimit(){
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

  getPaidAmount(){
    if (this.payModesCount === 1) {
      return this.baseForm.get('paid_amount')?.value;
    }else{
      const single_paid = parseFloat(this.baseForm.get('paid_amount')?.value);
      const double_paid = this.secondMode.get('paidAmount')?.value;
      const paid = (isNaN(single_paid) ? 0 : single_paid) + double_paid

      return paid;
    }
  }

  getDue(): string {
    const singlePaid = parseFloat(this.baseForm.get('paid_amount')?.value) || 0;
    const doublePaid = this.payModesCount === 1 ? 0 : this.secondMode.get('paidAmount')?.value || 0;
  
    const paid = singlePaid + doublePaid;
    const due = this.totalAmount - paid;
  
    const formattedDue = due.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  
    return due > 0 ? formattedDue : "₹0.00";
  }
  

  showReturn(): any {
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
        this.alertService.showError("Include Some Items.")
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

  checkPayModes(){
    if (this.payModesCount == 2) {
      this.baseForm.get('paid_amount')?.setValue("");
      this.secondMode.get('paidAmount')?.setValue("");
    } else {
      this.baseForm.get('paid_amount')?.setValue("");
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
      // this.alertService.showError("Include Some Items.");
      if (this.baseForm.get('lab_tests')?.value.length == 0 && this.baseForm.get('lab_packages')?.value.length == 0) {
        this.alertService.showError("Include Some Items.")
      }
    }
  }

  validatorsInput(e: any, inputElement: any): void {
    
    this.checkPayModes();

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
      if(input_number < this.user_permissions.number){
        if (input_number <= 0) {
          this.discountGroup.get('discount_input')?.setValue("");
  
        } else if (input_number >= 100) {
          this.discountGroup.get('discount_input')?.setValue(100);
        }
      }else{
        if(this.totalAmount != 0){
          this.alertService.showInfo("Maximum Percentage Discount Limit is Reached", "")
        }

        this.discountGroup.get('discount_input')?.setValue(this.user_permissions.number);
      }
    } else {
      if(input_number < this.discLimit){
        if (input_number <= 0) {
          this.discountGroup.get('discount_input')?.setValue("");
        } else if (input_number > this.tests_amt) {
          this.discountGroup.get('discount_input')?.setValue(this.tests_amt);
        }
      }else{
        if(this.totalAmount != 0){
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
    this.getPrevDisc();
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
      // this.alertService.showInfo("Include Some Items.")
      if (this.baseForm.get('lab_tests')?.value.length == 0 && this.baseForm.get('lab_packages')?.value.length == 0) {
        this.alertService.showError("Include Some Items.")
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
      const basePaidAmount = this.baseForm.get('paid_amount')?.value;
      const secondPaidAmount = this.secondMode.get('paidAmount')?.value;
      return !!basePaidAmount || !!secondPaidAmount;
    } else {
      const paidAmount = this.baseForm.get('paid_amount')?.value;
      return !!paidAmount;
    }
  }

  private getPatientModel(pay = false): AddPatientsModel {
    const due = this.totalAmount;
    const paying = this.baseForm.get('paid_amount')?.value || 0;
    const commonModel: any = {
      title: this.baseForm.get('title')?.value,
      appointment_id: this.apt_id,
      name: this.baseForm.get('name')?.value,
      age: this.timeSrvc.calculateAge(this.years, this.baseForm.value.dob, this.baseForm.value?.age),
      dob: this.baseForm.get('dob')?.value || null,
      gender: this.baseForm.get('gender')?.value,
      attender_name: this.baseForm.get('attender_name')?.value || '',
      attender_relationship_title: this.baseForm.get('attender_relationship_title')?.value || "",
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value,
      referral_lab: this.baseForm.get('referral_lab')?.value?.id || null,
      partner: this.baseForm.get('partner')?.value?.id || null,
      privilege_membership: this.baseForm.get('privilege_membership')?.value?.id || null,
      privilege_discount: this.baseForm.get('privilege_membership')?.value?.id
        ? this.baseForm.get('privilege_discount')?.value || null
        : null,
      area: "",
      tax_amount: parseFloat(this.getTotalTax()),
      address: this.baseForm.get('address')?.value || "",
      referral_doctor: this.baseForm.get('referral_doctor')?.value?.id || null,
      client: parseInt(this.cookieSrvc.getCookieData().client_id),
      lab_tests: this.baseForm.get('lab_tests')?.value || [],
      lab_packages: this.baseForm.get('lab_packages')?.value || [] ,
      medicine: [],
      ULabPatientAge: parseInt(this.baseForm.get('ULabPatientAge')?.value),
      prescription_attach: this.baseForm.get('prescription_attach')?.value || null,
      created_by: this.staffId || this.cookieSrvc.getCookieData().lab_staff_id,
      payment_remarks: this.remarkSave || "",
      lab_discount_type_id: this.isDiscountApplied ? parseInt(this.selectedDiscount.id) : null,
      is_discount_amt_by_ref_doc: this.baseForm.get('is_discount_amt_by_ref_doc')?.value || false,
      printed_by: this.staffId || this.cookieSrvc.getCookieData().lab_staff_id,
      discount_amt: !this.isDiscountApplied && this.discountGroup.get('discount_input')?.value !== ""
        ? this.discountAmount.toFixed(2)
        : 0,
      added_on_time: this.baseForm.get('added_on_time')?.value,
      payment_for: 6,
      payments: [
        {
          pay_mode: 1,
          paid_amount: 0
        }
      ],
    };
  
    if (this.manualDateTime) {
      commonModel.added_on_time = this.timeSrvc.getAddedOnTime(commonModel.added_on_time);
    } else {
      delete commonModel.added_on_time;
    }
  
    if (pay) {
      // Handle payments when `pay` is true
      if (this.payModesCount === 1) {
        commonModel.payments = [
          {
            pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
            paid_amount: paying > due ? due : paying,
          },
        ];
      } else {
        commonModel.payments = [
          {
            pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
            paid_amount: paying > due ? due : paying,
          },
          {
            pay_mode: this.secondMode.get('paymode')?.value,
            paid_amount: this.secondMode.get('paidAmount')?.value || 0,
          },
        ];
      }
    }

    if(this.selectedTests && this.selectedTests.length ){
      this.selectedTests.forEach((med: any)=>{
        const medModel = {
          stock: med.stock?.id,
          quantity: med.quantity,
          is_strip: med.is_strips
        }

        commonModel.medicine.push(medModel);
      })
    }
  
    return commonModel;
  }

  resetBaseForm() {
    this.apt_id = null;
    this.baseForm.reset();
    this.initializeForm();
    this.selectedTests = [];
    this.discountAmount = 0;
    this.totalAmount = 0;
    this.discountGroup.get('discount_input')?.setValue("");
    this.submitted = false;

    this.tests_included = [];
    this.package_included = [];
  
    this.clearPrescription();
    this.selectedDiscount = {
      name: "",
      is_prcntg: false,
      number: 0,
      is_active: false,
      id: ""
    }
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

  test(autoComplete: any) {

  }

  disableInputs(e: any){
    this.disableForm = e;
    // Enable or disable baseForm based on disableForm flag
    if (this.disableForm) {
      this.disableDiscount = true;
      this.baseForm.disable(); // Disable the entire baseForm
      this.discountGroup.disable(); // Disable the entire discountGroup if needed
    } else {
      this.disableDiscount = false;
      this.baseForm.enable(); // Enable the entire baseForm
      this.discountGroup.enable(); // Enable the entire discountGroup if needed
    }
  }

  saveAndNext(): void {
    if (this.baseForm.valid) {
      if (this.selectedTests.length !== 0) {

        this.inProgress = true;

        if(this.baseForm.get('referral_lab')?.value){
          this.checkReferralLab(false);
        }else{
          this.postSaveAndNextPatient(); 
        }

      } else {
        this.alertService.showWarning("Add Tests")
      }
    } else {
      this.submitted = true;
      this.showBaseFormErrors()
    }
  }

  postSaveAndNextPatient(){
    const model: AddPatientsModel = this.getPatientModel();

    this.subsink.sink = this.endPoint.addPatient(model).subscribe((response: any) => {
      this.alertService.showSuccess("Added", `${response.name} | MR No. ${response.mr_no} | Visit Id. ${response.visit_id}`);
      // this.patientOffcanvas.getData();
      
 
      if (this.setting?.apr) {
        this.newSessionReceiptPrint(response.id);
      }else{
        this.inProgress = false;
        this.disableInputs(false);
        this.resetBaseForm();
      }

    },
      (error) => {
        this.inProgress = false;
        this.disableInputs(false);
        this.serverErrors(error);
      }
    );
  }

  serverErrors(error: any){

    if(error?.error?.email){
      this.alertService.showError(error?.error?.email[0])
    }else if (error?.error[0]?.includes("already") && error?.error[0]?.includes("Patient")) {
      this.alertService.showError(this.baseForm.value.name + " Patient Already Registered Today.")
    } else if(error?.error[0]?.includes("already") && error?.error[0]?.includes("Card")){
      this.alertService.showError("Privilege Card Benefits for Lab Tests already used! Please remove Card!")
    } else {
      this.alertService.showError(error.error[0]);
    }

  }

  getReceipt(ptn: any) {
    const model = {
      patient_id: ptn,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.staffId || this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
      if (this.setting?.apr) {
        this.printSrvc.printRcpts(response.html_content);
      } 

      this.inProgress = false;
      this.disableInputs(false);
      this.resetBaseForm();
    }, (error: any) => {
      this.inProgress = false;
      this.disableInputs(false);
      this.alertService.showError("Failed to get receipt information", "Payment Failed. Please Try Again",);
      this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptn.id } });
    })
  }


  savePayment() {
    if (this.payModesCount === 2) {
      const basePaidAmount = this.baseForm.get('paid_amount')?.value;
      const secondPaidAmount = this.secondMode.get('paidAmount')?.value;
      if (!!basePaidAmount && !!secondPaidAmount) {
        if(this.minimum_paid_amount.is_active){
          const limit = this.totalAmount * (this.minimum_paid_amount.number / 100)
          if(this.getLimit() >= limit){
            this.saveApiCall()
          }else{
            this.alertService.showInfo("Minimum Payment Must be " + limit, "")
          }
        }else{
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
      if(this.baseForm.get('referral_lab')?.value){
        this.saveApiCall() ;
        return 
      }

      if (!!paidAmount) {
       
        if(this.minimum_paid_amount.is_active){
          const limit = this.totalAmount * (this.minimum_paid_amount.number / 100)
          if(this.getLimit() >= limit){
            this.saveApiCall()
          }else{
            this.alertService.showInfo("Minimum Payment Must be " + limit, "")
          }

        }else{
          this.saveApiCall()
        }

      } else {
        if(this.baseForm.valid && this.selectedTests.length !==0 ){
          const limit = this.totalAmount * (this.minimum_paid_amount.number / 100)
          // this.alertService.showError("One of the payment fields is empty, at least " + limit  +  " , or pick just one payment")
          this.alertService.showInfo("Minimum Payment Must be " + limit + " Rupees", "")
        }else{
          this.showBaseFormErrors()
        }
       
      }
    }
  }


  override saveApiCall(): void {
    if (this.baseForm.valid) {
      if (this.selectedTests.length !== 0) {
        this.inProgress = true;
        this.disableInputs(true);

        if(this.baseForm.get('referral_lab')?.value){
          this.checkReferralLab(true);
        }else{
          this.postPatient() ;
        }

      } else {
        this.alertService.showWarning("Add Tests")
      }
    } else {
      this.submitted = true;
      this.showBaseFormErrors()
    }
  }

  checkReferralLab(post: any){
    const model: AddPatientsModel = this.getPatientModel(true);

    this.subsink.sink = this.endPoint.postReferalLabForCheck(model).subscribe((res: any)=>{
      if(post){
        this.postPatient() ;
      }else{
        this.postSaveAndNextPatient() ;
      }
    }, (error)=>{
      this.inProgress = false;
      this.disableInputs(false);
      this.alertService.showError(error?.error?.Error || error?.error?.error || error ) ;
    })
  }

  postPatient(){
    const model: AddPatientsModel = this.getPatientModel(true);
    this.subsink.sink = this.endPoint.addPatient(model).subscribe((response: any) => {
      this.alertService.showSuccess("Added", `${response.name} | MR No. ${response.mr_no} | Visit Id. ${response.visit_id}`);

      if (this.setting?.apr) {
        this.getReceipt(response.id);
      }else{
        this.inProgress = false;
        this.disableInputs(false);
        this.resetBaseForm();
      }

    },
      (error) => {
        this.inProgress = false;
        this.disableInputs(false);
        this.serverErrors(error);
      }
    );
  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: true, keyboard: true});
  }


  // utilities 

  formatToTwoDecimals(value:any) {
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue)) {
        return numberValue.toFixed(2);
    } else {
        throw new Error("Invalid input");
    }
  }

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
      return this.setting.apr ? 'Print' : 'Next' ;
    } else {
      return this.setting.api ? 'Print' : 'Next' ;
    }
  }

  activeId: any = 0;

  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }

  newSessionReceiptPrint(ptnId:any){
    this.subsink.sink = this.endPoint.getPaymentHistory(ptnId).subscribe((data: any) => {

      const model = {
        patient_id: ptnId,
        client_id: this.cookieSrvc.getCookieData().client_id,
        receipt_id: data[data.length - 1].id,
        printed_by: this.staffId || this.cookieSrvc.getCookieData().lab_staff_id,
      }

      this.inProgress = false;

      this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
        this.resetBaseForm();
        this.printSrvc.printRcpts(response.html_content);

      }, (error: any) => {
        this.inProgress = false;
        this.alertService.showError("Failed to get receipt information", "");
        this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptnId } });

      })
    },(error)=>{
      this.inProgress = false;
      this.alertService.showError("Failed to get receipt information", "");
      this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptnId } });
    })
  }

  closeAutoComplete(){
    if(this.auto_complete){
      this.auto_complete?.close();
    }
  }

  clearFocusAutoComplete(){
    this.auto_complete.clear() ;
    this.auto_complete.focus();
  }
}