import { Component, ViewChild, Injector } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { PrintService } from '@sharedcommon/service/print.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { LoyaltyCardEndpoint } from 'src/app/loyaltycard/loyaltycard.enpoint';
import { OutsourcingEndpoint } from 'src/app/outsourcing/outsourcing.endpoint';
import { PatientOffcanvasComponent } from 'src/app/patient/components/patient-offcanvas/patient-offcanvas.component';
import { GlobalTestModel } from 'src/app/labpackage/models/globaltest.model';
import { AddPatientEndpoint } from 'src/app/patient/endpoints/addpatient.endpoint';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { AddPatientsModel } from 'src/app/patient/models/addPatient/addpatient.model';
import { HIMSSetupEndpoint } from 'src/app/setup_hims/components/services-hims/hmis.endpoint';
import { FileService } from '@sharedcommon/service/file.service';
import { SharedPatientsService } from 'src/app/patient/services/sharedpatient.service';

@Component({
  selector: 'app-addconsultation',
  templateUrl: './addconsultation.component.html',
  styleUrl: './addconsultation.component.scss',
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
        animate('0.2s ease-in-out')
      ]),
    ],
    ),

    trigger('offCanvasWidthChange', [
      state('off', style({
        width: '0',
      })),
      state('on', style({
        width: '22vw',
      })),
      transition('off <=> on', [
        animate('0.3s ease-in-out'),
      ]),
    ]),
  ]
})

export class AddconsultationComponent extends BaseComponent<any> {

  model: any;
  discountGroup!: UntypedFormGroup;
  @ViewChild(PatientOffcanvasComponent) patientOffcanvas!: PatientOffcanvasComponent;
  @ViewChild('file') fileImage: any;

  image: string | null = '';

  activeTab: number = 1;
  inProgress: boolean = false;
  currentDate!: Date;
  years: boolean = false;
  visitId: string = "";
  selectedTests: any = [];
  selectedServices: any = [];
  selectedRooms: any = [];
  selectedHIMSPackage: any = [];

  homeSrvc: boolean = false;

  // tests: GlobalTestModel[] = []
  refDoctors: any[] = [];
  titles!: any[];
  genders!: any[];
  consulting_doctors: any = [];
  selected_doctors: any = [];
  tests_included: any = [];
  package_included: any = [];
  docs_included: any = [];
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

  // hospitalName: string = "";
  pageTitle: string = "Add New Patient";
  attender_titles: any;
  apt_id: any = null;
  b_id: any;

  patientType: any = 1;

  manualDateTime: any = false;

  constructor(
    injector: Injector,
    config: NgbDropdownConfig,

    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,

    // public dateTimeFormat: TimeConversionService,
    public capitalSrvc: CaptilizeService,

    private printSrvc: PrintService,
    private cookieSrvc: CookieStorageService,
    public timeSrvc: TimeConversionService,
    private fileSrvc: FileService,
    private sharedPatient: SharedPatientsService,

    private proEndpoint: ProEndpoint,
    private endPoint: AddPatientEndpoint,
    private prevCardEndpoint: LoyaltyCardEndpoint,
    private patientEndpoint: PatientEndpoint,
    private doctorEndpoint: DoctorEndpoint,
    private staffEndpoint: StaffEndpoint,
    private masterEndpoint: MasterEndpoint,
    private sourcingEndpont: OutsourcingEndpoint,
    private himsEndpoint: HIMSSetupEndpoint
  ) {
    super(injector);
    config.autoClose = true;
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

  minimum_paid_amount: any = {
    is_active: false,
    number: 0
  }


  selectFirstOption(event: any) {
    event.preventDefault();
    if (this.activeTab == 3) {
      this.onItemSelected(this.searchData[0])
    } else if (this.activeTab == 1 && this.consulting_doctors.length > 0) {
      this.doctorSelected(this.consulting_doctors[0])
    } else if (this.activeTab == 2) {
      this.onServiceItemSelected(this.searchData[0])
    }
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

    this.route.queryParams.subscribe(params => {

      if (params['patient_id']) {
        this.subsink.sink = this.patientEndpoint.getPaginatedPatients(
          1, 1, '', '', params['patient_id'], '', '', '', false
        ).subscribe((data: any) => {

          this.baseForm.get('name')?.setValue(data.results[0].name);
          this.baseForm.get('mobile_number')?.setValue(data.results[0].mobile_number);
          this.baseForm.get('age')?.setValue(data.results[0].age);
          this.baseForm.get('gender')?.setValue(data.results[0].gender);
          this.baseForm.get('title')?.setValue(data.results[0].title.id);
        }, (error)=>{
          this.showAPIError(error);
        })
      } else if (params['apt_id']) {

        this.apt_id = params['apt_id'];
        this.subsink.sink = this.patientEndpoint.getAppointedPatient(
          params['apt_id']
        ).subscribe((data: any) => {

          this.baseForm.get('name')?.setValue(data.name);
          this.baseForm.get('title')?.setValue(this.titles.find((t: any) => t.name == data.title)?.id);
          this.baseForm.get('mobile_number')?.setValue(data.mobile_number);
          this.baseForm.get('age')?.setValue(data.age);
          this.baseForm.get('dob')?.setValue(data.dob);
          if (data.ULabPatientAge === 4) {
            this.years = data.ULabPatientAge === 4;
            this.baseForm.get('age')?.clearValidators();
            this.baseForm.get('age')?.updateValueAndValidity();
          }
          this.baseForm.get('ULabPatientAge')?.setValue(data.ULabPatientAge);
          this.baseForm.get('gender')?.setValue(data.gender);

          if (data.tests && data.tests.length != 0) {
            data.tests.forEach((d: any) => this.onItemSelected(d))
          }
        })
      }
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
    // this.hospitalName = cookieData.business_name;
    this.b_id = cookieData.b_id;

    this.currentDate = new Date() || '';
    
    this.route.queryParams.subscribe(params => {
      this.patientType = +params['type'] ;
      if(this.patientType === 1){
        this.pageTitle = `Add In-Patient`; 
      }else if(this.patientType === 2){
        this.pageTitle = `Add Out-Patient`
      }
    })

    this.initializeForm();
    this.getManualDateSettings();
    this.getUserPermisisons(cookieData);

    this.discountGroup = this.formBuilder.group({
      discount_input: ["", [Validators.min(0), Validators.max(100)]]
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


  }


  getUserPermisisons(cookieData: any) {
    if (!cookieData.is_superadmin) {
      this.user_permissions.sa = false;
      this.subsink.sink = this.staffEndpoint.getStaffPatientsPermissions(this.staffId || cookieData.lab_staff_id).subscribe((data: any) => {

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
  }

  getManualDateSettings() {
    this.subsink.sink = this.masterEndpoint.getManualDateTimeSetting().subscribe((res: any) => {
      try {
        this.manualDateTime = res[0].manual_date;
        if (this.manualDateTime) {
          this.updateAddedOnTimeValidation(true);
        }
      } catch (error) {

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
      email: [null],
      ref_lab: [null],
      privilege_membership: [],
      privilege_discount: ['discount'],
      referral_lab: [null],
      partner: [null],
      doctor_consultations: [],
      services: [[]]
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

      email: [null],
      ref_lab: [null],

      privilege_membership: []
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
      referral_doctor: this.getRefDoctor(this.refDoctors, ptn.referral_doctor) || null,
      home_service: { is_required: false, added_on: this.getDateTime(), patient: 23 },
      lab_tests: [],
      lab_discount_type_id: [ptn.invoice.dis],
      is_percentage_discount: false,
      pay_mode_id: [1],
      paid_amount: null,
    });
  }

  validNumberField(event: any, type: string) {
    this.baseForm.get(type)?.setValue(event.target.value.replace(/[.e]/gi, ''))
  }

  toggleMoreOptions(e: boolean) {
    this.isCollapsed = e;
  }


  clearPrescription() {
    if (this.fileImage && this.fileImage.nativeElement) {

      this.fileImage.nativeElement.value = '';
      this.image = null;
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

  date: string = "";
  timer: any;

  showPatient(details: any) {
    this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: details.id } });
  }


  searchData: any;
  testTerm: any = ""
  searchLoading = false;
  returnNotFoundHTML() {


    let div = `
    <div class="d-flex flex-row gap-2">
    <span class="text-muted">No matching results found for</span>
    <strong class="text-black">' ${this.testTerm} '</strong>
    </div> `

    // let matched : boolean = false

    // this.selectedTests.forEach((test: any)=>{
    //   if(test.name.toLowerCase().includes(this.testTerm)){
    //     matched = true;
    //     div = `
    //     <div class="d-flex flex-row gap-2">
    //     <strong class="text-black">${this.removeDigitsAfterPlus(test.name)}</strong>
    //     <span class="text-muted"> already included</span>
    //     </div> `
    //   }
    // })

    return div
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

        if (this.baseForm.get('referral_lab')?.value) {

          this.subsink.sink = this.sourcingEndpont.getRevisedTests(
            this.baseForm.get('referral_lab')?.value?.id, searchTerm, 1, 'all', ''
          ).subscribe((res: any) => {
            this.searchLoading = false;
            this.searchData = [
              ...res
                .filter((labTest: any) => !this.tests_included.includes(labTest.id))
                .map((labTest: any) => ({
                  ...labTest,
                  name: labTest.name + '//++' + labTest.short_code
                })),
            ]
          },)

        } else if (this.baseForm.get('partner')?.value) {

          this.subsink.sink = this.sourcingEndpont.getRevisedTestsCompany(
            this.baseForm.get('partner')?.value?.company?.id, searchTerm, 1, 'all', ''
          ).subscribe((testData: any) => {
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
          }, (error) => {
            this.alertService.showError(error?.error?.error || error?.error?.Error || error);
          })

        }
        else {
          this.subsink.sink = this.endPoint.getTestsMasterSearch(searchTerm, false).subscribe((testData: any) => {

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
    const plusIndex = inputString.indexOf("//++");
    if (plusIndex !== -1) {
      return inputString.substring(0, plusIndex);
    } else {
      return inputString;
    }
  }

  removeDigitsAfterPlusAndSave(inputString: string) {
    const plusIndex = inputString.indexOf("//++");
    if (plusIndex !== -1) {
      inputString = inputString.substring(0, plusIndex);
    } else {
      inputString = inputString;
    }
  }



  docLoading: boolean = false;
  consDocLoading: boolean = false;
  getDoctorSearches(searchTerm: any, is_referral: boolean = true): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.testTerm = searchTerm;

      if (is_referral) this.docLoading = true; else this.consDocLoading = true;

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {

        this.subsink.sink = this.endPoint.getLabDoctors(
          searchTerm,
          is_referral ? 'lab_get_referral_doctors' : 'lab_get_consulting_doctors'
        ).subscribe((data: any) => {

          if (is_referral) {
            this.refDoctors = data.filter((d: any) => d.is_active && !d.is_duplicate);
            this.refDoctors.map((d: any) => d.name = `${d.name}, ${d.mobile_number}`)
          } else {
            this.consulting_doctors = data.filter((d: any) => !this.docs_included.includes(d.id));
          }

          this.docLoading = false;
          this.consDocLoading = false;
        });

      }, 500);
    } else {
      this.testTerm = null;

      this.docLoading = false;
      this.consDocLoading = false;

      this.refDoctors = [];
      this.consulting_doctors = [];
    }
  }

  servicesData: any = [];
  services_included: any = [];
  getHospitalServices(searchTerm: any) {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.testTerm = searchTerm;

      this.searchLoading = true;

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.himsEndpoint.getServices(
          "all", 1, searchTerm, ""
        ).subscribe((res: any) => {
          this.searchLoading = false;
          this.searchData = [
            ...res
              .filter((labTest: any) => !this.services_included.includes(labTest.id))
              .map((labTest: any) => ({
                ...labTest,
                name: labTest.name + '//++' + labTest.short_code
              })),
          ]
        })

      }, 500);
    } else {
      this.testTerm = null;

      this.docLoading = false;
      this.consDocLoading = false;

      this.refDoctors = [];
      this.consulting_doctors = [];
    }
  }

  himspackagesData: any = [];
  himspackages_included: any = [];
  getHospitalPackages(searchTerm: any) {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.testTerm = searchTerm;
      this.searchLoading = true;
      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        this.subsink.sink = this.himsEndpoint.getPackages(
          "all", 1, searchTerm,
        ).subscribe((res: any) => {
          this.searchLoading = false;
          this.searchData = res;
        })

      }, 500);
    } else {
      this.testTerm = null;

      this.docLoading = false;
      this.consDocLoading = false;

      this.refDoctors = [];
      this.consulting_doctors = [];
    }
  }

  roomsData: any = [];
  rooms_included: any = [];
  getRooms(searchTerm: any) {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.testTerm = searchTerm;
      this.searchLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.searchData = [];

        this.subsink.sink = this.himsEndpoint.getRooms(
          "all", 1, searchTerm, ""
        ).subscribe((res: any) => {
          this.searchLoading = false;
          this.roomsData = [...res.filter((labTest: any) => !this.rooms_included.includes(labTest.id))]
        })

      }, 500);
    } else {
      this.testTerm = null;

      this.docLoading = false;
      this.consDocLoading = false;

      this.refDoctors = [];
      this.consulting_doctors = [];
    }
  }


  prevCardLoading: boolean = false;
  cards: any;
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
          "all", 1, searchTerm, true, "", "", this.timeSrvc.getTommorowDate(this.timeSrvc.getTodaysDate())
        ).subscribe((data: any) => {

          this.cards = data;
          this.cards.map((d: any) => d.name = `${d.card_holder.name}, PC No. ${d.pc_no}, Ph no : ${d.card_holder.mobile_number}`)
          this.prevCardLoading = false;
        });
      }, 400);
    } else {

      this.prevCardLoading = false;
      this.cards = [];
    }
  }

  refLabLoading: boolean = false;
  refLabs: any;
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
        ).subscribe((res: any) => {
          res.forEach((lab: any) => {
            lab.dispName = `${lab?.organization_name || lab?.partner?.organization_name}`
          });

          this.refLabs = res.filter((r: any) => r.is_referral_lab);
        });

        this.refLabLoading = false;
      }, 400);
    } else {

      this.refLabLoading = false;
      this.refLabs = []
    }
  }

  partnersLoading: boolean = false;
  partners: any;
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
        ).subscribe((res: any) => {
          res.forEach((r: any) => {
            r.name = `${r?.company?.name} / ${r.name}`;
          })
          this.partners = res;
        });

        this.partnersLoading = false;
      }, 300);
    } else {

      this.partnersLoading = false;
      this.partners = []
    }
  }


  privilegeCard_dis: any = 0;

  doctorSelected(event: any) {
    if (!this.docs_included.includes(event.id)) {
      if (event?.lab_doctors_consultation_details && event?.lab_doctors_consultation_details.length > 0) {
        event?.lab_doctors_consultation_details.forEach((item: any) => {
          item['name'] = `${item.case_type?.name} - ${item?.is_online ? 'Online' : 'Walk-In'}`;
        })

        const model = {
          doctor: event,
          cons_details: event?.lab_doctors_consultation_details,
          selectedCase: event?.lab_doctors_consultation_details[0],
          added_on: this.timeSrvc.djangoFormatWithT(),
          canRemove: true,
          status: 1
        }

        this.selected_doctors.push(model);
        this.docs_included.push(event.id);
        this.consulting_doctors = [];
        this.getTotalDocsAmount();
        this.consDocLoading = false;
      } else {
        this.alertService.showInfo(`${event.name} case type details not`);
        this.consulting_doctors = [];
      }
    } else {
      this.alertService.showInfo(`${event.name} already selected.`);
      this.consulting_doctors = [];
    }
  }

  HIMSPackagesSelected(item: any) {

    if (this.selectedHIMSPackage.some((test: any) => test.id === item.id)) {
      this.alertService.showInfo("Package already Included", `${item.name}`);
      return; // Exit the function early if the package is already included
    }

    this.baseForm.value.lab_packages.push({ GlobalPackageId: item.id });
    this.selectedHIMSPackage.push(item);
    // this.package_included.push(item.id)
    this.getPrevDisc();
  }


  roomSelected(event: any) {
    this.selectedRooms = [];

    if (!this.rooms_included.includes(event.id)) {
      const model = {
        room: event,
        added_on: this.timeSrvc.djangoFormatWithT(),
        canRemove: true,
        no_of_hours: "",
        type: 1
      }

      this.selectedRooms.push(model);
      this.getTotalRoomsAmount();
      this.modalService.dismissAll();

    } else {
      this.alertService.showInfo(`${event.name} already selected.`);
      this.roomsData = [];
    }
  }

  roomType(e: any, item: any) {
    item.type = parseInt(e);
  }

  consultCaseType(e: any, item: any) {
    item.selectedCase = item.cons_details.find((d: any) => d.id == parseInt(e));
  }

  deleteDoctor(index: any, item: any) {
    this.docs_included = this.docs_included.filter((d: any) => d != item?.doctor?.id);
    this.selected_doctors.splice(index, 1);
    this.getTotalDocsAmount();
  }

  deleteRoom(index: any, item: any) {
    this.rooms_included = this.rooms_included.filter((d: any) => d != item?.room?.id);
    this.selectedRooms.splice(index, 1);
    this.getTotalRoomsAmount();
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

    // this.checkPNDT();
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
    // this.checkPNDT();
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

  // GET REFERRAL DOCTORS 
  getRefDoctor(objects: any[] = this.refDoctors, id: number): any {
    return objects.find(obj => obj.id === id);
  }

  presetRegistrationTime(inputDate: string): string {
    const date = new Date(inputDate);
    return date.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
  }

  // DELETE TESTS FROM TABLE 
  deleteTest(index: number, test: any) {
    if (test.package) {
      this.baseForm.get('lab_packages')?.setValue(this.baseForm.value.lab_packages.filter((obj: any) => obj.LabGlobalPackageId !== test.package_id))
      this.selectedTests.splice(index, 1);
      this.package_included = this.package_included.filter((t: any) => t !== test.id);

      this.getPrevDisc();
    } else {
      this.selectedTests.splice(index, 1);
      this.baseForm.value.lab_tests.splice(index, 1);
      this.tests_included = this.tests_included.filter((t: any) => t !== test.id);
      if (this.selectedTests.length === 0) {
        this.totalAmount = 0;
        this.dispDisc = 0;
        this.total_paid = 0;
        this.discountAmount = 0;

        this.tests_amt = 0;
        this.docs_amt = 0;
        this.service_amt = 0;
        this.prev_disc = 0;
        this.validateDiscount();
        this.discountGroup.get('discount_input')?.setValue("");
      }

      this.getPrevDisc();
    }
  }

  // DELETE TESTS FROM TABLE 
  deleteService(index: number, test: any) {
    this.selectedServices.splice(index, 1);
    this.baseForm.value.services.splice(index, 1);
    this.services_included = this.services_included.filter((t: any) => t !== test.id);

    if (this.selectedTests.length === 0 && this.selectedServices.length == 0 && this.consulting_doctors.length == 0) {
      this.totalAmount = 0;
      this.dispDisc = 0;
      this.total_paid = 0;
      this.discountAmount = 0;
      this.tests_amt = 0;
      this.docs_amt = 0;
      this.service_amt = 0;
      this.prev_disc = 0;
      this.validateDiscount();
      this.discountGroup.get('discount_input')?.setValue("");
    }

    this.getPrevDisc();
  }

  clearAllTests(type: any) {
    this.tests_included = [];
    this.package_included = [];
    this.searchData = [];

    this.baseForm.get('lab_packages')?.setValue([]);
    this.baseForm.get('lab_tests')?.setValue([]);

    this.selectedTests = [];

    if (this.selectedTests.length === 0) {
      this.totalAmount = 0.00;
      this.dispDisc = 0.00;
      this.total_paid = 0.00;
      this.discountAmount = 0;
      this.prev_disc = 0;
      this.validateDiscount();
      this.discountGroup.get('discount_input')?.setValue("");
    }

    this.baseForm.get(type)?.setValue(null);
    this.baseForm.get(type)!.disable();

    if (type == 'partner') {
      this.baseForm.get('mobile_number')?.setValue(this.baseForm?.get('referral_lab')?.value?.phone_number || null);

    }

    this.getPrevDisc();
  }

  onItemSelected(item: any): void {
    this.testTerm = '';
    if (!item.hasOwnProperty('lab_tests')) {

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

      this.searchLoading = false;

      let selectedTest = {
        LabGlobalTestId: item.id,
        status_id: item.department && /ultrasound|medical|radiology/.test(item.department.toLowerCase().replace(" ", "")) ? 2 : this.pendingId
      };

      const tempTest = {
        id: item.id,
        name: item.name,
        date: this.timeSrvc.getCurrentDateTime(),
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

      if ((this.baseForm.get('referral_lab')?.value || this.baseForm.get('partner')?.value) && item?.revised_price && item?.revised_price.revised_price) {
        tempTest.cost = item?.revised_price.revised_price;
        tempTest.total = item?.revised_price.revised_price;
      }

      this.baseForm.value.lab_tests.push(selectedTest);
      this.tests_included.push(item.id);
      this.selectedTests.push(tempTest);
      this.getPrevDisc();
    } else {
      this.onPackagesSelected(item)
    }

    this.searchData = [];
  }


  onServiceItemSelected(item: any): void {
    this.testTerm = '';
    if (this.selectedServices.some((test: any) => {
      if (test.id === item.id) {
        this.alertService.showInfo("Service already included individually", `${this.removeDigitsAfterPlus(item.name)}`);
        return true; // Exit the function early
      }
      return false; // Continue checking other tests
    })) { return; }

    this.searchLoading = false;

    const tempTest = {
      id: item.id,
      name: item.name,
      date: this.timeSrvc.getCurrentDateTime(),
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

    this.baseForm.value.services.push({ service: item.id, status_id: 3 });
    this.services_included.push(item.id);
    this.selectedServices.push(tempTest);
    this.getTotalServiceAmount();

    this.searchData = [];
  }

  onPackagesSelected(item: any) {

    if (this.selectedTests.some((test: any) => test.id === item.id + "pkg")) {
      this.alertService.showInfo("Package already Included", `${item.name}`);
      return; // Exit the function early if the package is already included
    }

    // Remove tests that are part of the package from selectedTests array
    item.lab_tests.forEach((testPackage: any) => {
      const index = this.selectedTests.findIndex((selectTest: any) => selectTest.id === testPackage.id);
      const delTest = this.selectedTests.find((selectTest: any) => selectTest.id === testPackage.id);
      if (index !== -1) {
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
      date: this.timeSrvc.getCurrentDateTime(),
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
    this.getPrevDisc();
  }


  prev_disc: any = 0;
  card: any;

  getPrevDisc(popup: any = null) {
    if (this.baseForm.get('privilege_membership')?.value) {

      this.card = this.baseForm.get('privilege_membership')?.value;

      this.disableDiscount = true;
      this.dispDiscount = "0.00";
      this.discountAmount = 0;
      this.discountGroup.get('discount_input')?.setValue("");
      this.discountGroup.get('discount_input')?.disable();
      this.getTotalAmount();

      if (popup) {
        setTimeout(() => {
          popup?.open();
        }, 100)
      }

      if (this.tests_included.length != 0 || this.package_included.length != 0) {
        let pkg: any = []
        if (this.baseForm.get('lab_packages')?.value && this.baseForm.get('lab_packages')?.value.length >= 1) {
          this.baseForm.get('lab_packages')?.value.forEach((id: any) => {
            pkg.push(id.LabGlobalPackageId)
          })
        }


        this.subsink.sink = this.endPoint.getPrevCardDisc(
          this.baseForm.get('privilege_membership')?.value?.id,
          this.tests_included.join(","),
          pkg.join(","),
          this.baseForm.get('privilege_discount')?.value
        ).subscribe((res: any) => {
          this.prev_disc = res.discount
        }, (error) => {
          this.prev_disc = 0;
          this.alertService.showError(error?.error?.Error || error?.error?.Error || error)
        })

      }

    } else {
      this.card = null;
      this.disableDiscount = false;
      this.dispDiscount = "0.00";
      this.discountAmount = 0;
      this.discountGroup.get('discount_input')?.setValue("");
      this.discountGroup.get('discount_input')?.enable();
      this.getTotalAmount();
    }
  }

  applyStatus(id: number, e: any) {
    const status_code = e.target.value;
    const labTestsArray = this.baseForm.get('lab_tests')?.value;

    if (this.selectedTests[id].department && (this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("ultrasound") || this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("radiology"))) {
      labTestsArray[id].status_id = parseInt(status_code) + 1;
      this.baseForm.get('lab_tests')?.setValue(labTestsArray);
    } else {
      labTestsArray[id].status_id = status_code;
      this.baseForm.get('lab_tests')?.setValue(labTestsArray);
    }
  }

  applyDoctorStatus(item: any, status_id: any) {
    item.status = status_id;
  }

  applyServiceStatus(id: number, e: any) {
    const status_code = e.target.value;
    const labTestsArray = this.baseForm.get('services')?.value;

    if (this.selectedTests[id].department && (this.selectedServices[id].department.toLowerCase().replace(" ", "").includes("ultrasound") || this.selectedTests[id].department.toLowerCase().replace(" ", "").includes("radiology"))) {
      labTestsArray[id].status_id = parseInt(status_code) + 1;
      this.baseForm.get('services')?.setValue(labTestsArray);
    } else {
      labTestsArray[id].status_id = status_code;
      this.baseForm.get('services')?.setValue(labTestsArray);
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

  getTotalServiceAmount(): string {
    let totalAmount = 0;
    if (this.selectedServices.length !== 0) {
      for (const test of this.selectedServices) {
        totalAmount += parseFloat(test.cost);
        this.service_amt = totalAmount;
      }
    } else {
      totalAmount = 0
      this.service_amt = 0;
    }
    this.getTotalAmount();
    return totalAmount.toFixed(2) // Assuming you want to display the amount with two decimal places
  }

  getTotalDocsAmount(): string {
    let totalAmount = 0;
    if (this.selected_doctors.length !== 0) {
      for (const doc of this.selected_doctors) {
        totalAmount += parseFloat(doc.selectedCase.consultation_fee);
        this.docs_amt = totalAmount;
      }
    } else {
      totalAmount = 0
      this.docs_amt = 0;
    }
    this.getTotalAmount();
    return totalAmount.toFixed(2) // Assuming you want to display the amount with two decimal places
  }

  getTotalRoomsAmount(): string {
    let totalAmount = 0;
    if (this.selectedRooms.length !== 0) {
      for (const item of this.selectedRooms) {
        totalAmount += parseFloat(item.room.charges_per_bed);
        this.room_amt = totalAmount;
      }
    } else {
      totalAmount = 0
      this.room_amt = 0;
    }
    this.getTotalAmount();
    return totalAmount.toFixed(2) // Assuming you want to display the amount with two decimal places
  }

  returnCost() {
    return this.tests_amt + this.docs_amt + this.service_amt + this.room_amt;
  }

  room_amt: any = 0; //used
  tests_amt = 0 //used
  docs_amt = 0 //used
  service_amt = 0; //used
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

      bill = this.returnCost() - (this.returnCost() * (this.discountPercentage / 100));
      this.discountAmount = this.returnCost() * (this.discountPercentage / 100);
    } else {
      if (this.discountAmount > this.returnCost()) {
        bill = 0
      } else {
        bill = this.returnCost() - this.discountAmount
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

    this.dispDiscount = this.discountAmount !== 0 ? discountAmountFormatted : "0.00"


    const netPart = this.totalAmount !== 0 ? this.totalAmount.toString().split('.')[1] : "0"
    const netPartFomartted = netPart ? this.totalAmount.toString().split('.')[0] + '.' + netPart.substring(0, 2) : this.totalAmount.toFixed(2);
    this.netamount = this.totalAmount !== 0 ? netPartFomartted : "0.00"


    this.discLimit = (this.returnCost() * this.user_permissions.number / 100) - this.getPrivilegeCardDiscount();

    return curr;
  }

  checkDiscountLimit() {
    const discountLimit = this.totalAmount - (this.totalAmount * this.user_permissions.number / 100);

  }

  getPrivilegeCardDiscount() {
    const prevCard = this.baseForm.get('privilege_membership')?.value;
    return (prevCard && prevCard != "" ? parseFloat(this.prev_disc) : 0)
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

  checkPayModes() {
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

    if (this.selectedTests.length !== 0 || this.selected_doctors.length != 0 || this.selectedServices.length != 0) {
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
      // this.alertService.showError("Include some tests");
      if (this.baseForm.get('lab_tests')?.value.length == 0 && this.baseForm.get('lab_packages')?.value.length == 0) {
        this.alertService.showError("Include some tests")
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
        } else if (input_number > this.returnCost()) {
          this.discountGroup.get('discount_input')?.setValue(this.returnCost());
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
    this.getPrevDisc();
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
      const basePaidAmount = this.baseForm.get('paid_amount')?.value;
      const secondPaidAmount = this.secondMode.get('paidAmount')?.value;
      return !!basePaidAmount || !!secondPaidAmount;
    } else {
      const paidAmount = this.baseForm.get('paid_amount')?.value;
      return !!paidAmount;
    }
  }


  /** * save  **/
  getHomeService() {
    const model = {
      is_required: this.baseForm.get('home_service')?.value || false,
      added_on: this.getDateTime(),
      patient: 23
    }
    return model
  }

  private getPatientModel(pay = false): AddPatientsModel {

    const model: any = {
      title: this.baseForm.get('title')?.value,
      appointment_id: this.apt_id,
      name: this.baseForm.get('name')?.value,
      age: this.calculateAge(),
      dob: this.baseForm.get('dob')?.value || null,
      gender: this.baseForm.get('gender')?.value,
      attender_name: this.baseForm.get('attender_name')?.value || null ,
      attender_relationship_title: this.baseForm.get('attender_relationship_title')?.value || "",
      mobile_number: this.baseForm.get('mobile_number')?.value,
      email: this.baseForm.get('email')?.value,
      referral_lab: this.baseForm.get('referral_lab')?.value?.id || null,
      partner: this.baseForm.get('partner')?.value?.id || null,
      privilege_membership: this.baseForm.get('privilege_membership')?.value?.id || null,
      privilege_discount: this.baseForm.get('privilege_membership')?.value?.id ? this.baseForm.get('privilege_discount')?.value || null : null,
      area: "",
      address: this.baseForm.get('address')?.value || null,
      referral_doctor: this.baseForm.get('referral_doctor')?.value?.id || null,
      client: parseInt(this.cookieSrvc.getCookieData().client_id),
      lab_tests: this.baseForm.get('lab_tests')?.value,
      services: this.baseForm.get('services')?.value,
      lab_packages: this.baseForm.get('lab_packages')?.value,
      ULabPatientAge: parseInt(this.baseForm.get('ULabPatientAge')?.value),
      prescription_attach: this.image || null,
      created_by: this.staffId || this.cookieSrvc.getCookieData().lab_staff_id,
      printed_by: this.staffId || this.cookieSrvc.getCookieData().lab_staff_id,
      lab_discount_type_id: this.isDiscountApplied ? parseInt(this.selectedDiscount.id) : null,
      is_discount_amt_by_ref_doc: this.baseForm.get('is_discount_amt_by_ref_doc')?.value || false,
      added_on_time: this.baseForm.get('added_on_time')?.value,
      discount_amt: !this.isDiscountApplied && this.discountGroup.get('discount_input')?.value !== "" ? this.discountAmount.toFixed(2) : 0,
      payments: [{ pay_mode: 1, paid_amount: 0 }],
      payment_for: this.activeTab,
    };

    if(this.patientType && (this.patientType === 2 || this.patientType === 1)){
      model['patient_type'] = this.patientType || null ;
    }

    if (this.selected_doctors.length > 0) {
      let ids: any = [];

      this.selected_doctors.forEach((d: any) => {

        ids.push({
          consultation: d.selectedCase.id,
          status_id: d.status
        })
      })

      model['doctor_consultations'] = ids;
    }

    if (this.selectedRooms.length > 0) {
      model["room_booking"] = {
        GlobalRoomId: this.selectedRooms[0].room?.id,
        no_of_days: 1,
        bed_number: this.selectedRooms[0].room?.selectedBed?.id,
      }
    }

    // Handle the added_on_time transformation if necessary
    if (this.manualDateTime) {
      model.added_on_time = this.sharedPatient.getAddedOnTime(model.added_on_time);
    } else {
      delete model.added_on_time;
    }

    if (pay) {
      // Handle the payment section if 'pay' is true
      const due = this.totalAmount;
      const paying = this.baseForm.get('paid_amount')?.value || 0;

      if (this.payModesCount === 1) {
        model.payments = [{
          pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
          paid_amount: paying > due ? due : paying
        }];
      } else {
        model.payments = [{
          pay_mode: this.baseForm.get('pay_mode_id')?.value || null,
          paid_amount: paying > due ? due : paying
        }, {
          pay_mode: this.secondMode.get('paymode')?.value,
          paid_amount: this.secondMode.get('paidAmount')?.value || 0
        }];
      }
    }

    return model;
  }

  resetBaseForm(form: boolean = true) {
    this.apt_id = null;

    if (form) {
      this.baseForm.reset();
      this.initializeForm();
    }

    this.totalAmount = 0;
    this.netamount = 0;
    this.discountGroup.get('discount_input')?.setValue("");
    this.submitted = false;

    this.selectedServices = [];
    this.selected_doctors = [];
    this.selectedTests = [];
    this.selectedRooms = [];

    this.tests_included = [];
    this.package_included = [];
    this.services_included = [];
    this.docs_included = [];

    this.consulting_doctors = [];

    this.clearPrescription();

    this.discountAmount = 0;
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

  closeCanvas() {
    this.patientOffcanvas.closeCanvas();
  }

  test() {

  }

  disableInputs(e: any) {
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
      if (this.isTestsDocsServicesAdded()) {

        this.inProgress = true;

        if (this.baseForm.get('referral_lab')?.value) {
          this.checkReferralLab(false);
        } else {
          this.postSaveAndNextPatient();
        }

      } else {
        this.alertService.showWarning("Add Tests")
      }
    } else {
      this.submitted = true;
      this.showBaseFormErrors();
    }
  }

  postSaveAndNextPatient() {
    const model: AddPatientsModel = this.getPatientModel();

    this.subsink.sink = this.endPoint.addPatient(model).subscribe((response: any) => {
      this.alertService.showSuccess("Added", `${response.name} | MR No. ${response.mr_no} | Visit Id. ${response.visit_id}`);
      this.patientOffcanvas.getData();


      if (this.setting?.apr) {
        this.newSessionReceiptPrint(response.id);
      } else {
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

  serverErrors(error: any) {
    this.sharedPatient.serverErrors(error, this.baseForm.value.name);
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
      if (this.baseForm.get('referral_lab')?.value) {
        this.saveApiCall();
        return
      }

      if (!!paidAmount) {

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
        if (this.baseForm.valid && this.isTestsDocsServicesAdded()) {
          const limit = this.totalAmount * (this.minimum_paid_amount.number / 100)
          // this.alertService.showError("One of the payment fields is empty, at least " + limit  +  " , or pick just one payment")
          this.alertService.showInfo("Minimum Payment Must be " + limit + " Rupees", "")
        } else {
          this.showBaseFormErrors()
        }

      }
    }
  }

  override saveApiCall(): void {
    if (this.baseForm.valid) {
      if (this.isTestsDocsServicesAdded()) {
        this.inProgress = true;
        this.disableInputs(true);

        if (this.baseForm.get('referral_lab')?.value) {
          this.checkReferralLab(true);
        } else {
          this.postPatient();
        }

      } else {
        this.alertService.showWarning("Add Tests")
      }
    } else {
      this.submitted = true;
      this.showBaseFormErrors()
    }
  }

  checkReferralLab(post: any) {
    const model: AddPatientsModel = this.getPatientModel(true);

    this.subsink.sink = this.endPoint.postReferalLabForCheck(model).subscribe((res: any) => {
      if (post) {
        this.postPatient();
      } else {
        this.postSaveAndNextPatient();
      }

    }, (error) => {
      this.inProgress = false;
      this.disableInputs(false);
      this.alertService.showError(error?.error?.Error || error?.error?.error || error);
    })
  }

  postPatient() {
    const model: AddPatientsModel = this.getPatientModel(true);
    this.subsink.sink = this.endPoint.addPatient(model).subscribe((response: any) => {
      this.alertService.showSuccess("Added", `${response.name} | MR No. ${response.mr_no} | Visit Id. ${response.visit_id}`);
      this.patientOffcanvas.getData();

      if (this.setting?.apr) {
        this.getReceipt(response.id);
      } else {
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


  customSearch(itemList: any, searchTerm: string) {
    let filterList = itemList['name'].toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase());
    return filterList;
  }












  // PNDT FORM 

  enterAddress(e: any) {
    this.baseForm.get('address')?.setValue(e);
    this.isCollapsed = true;
  }


  checkPNDT() { }

  writeAttenderName(id: number, e: any) {
    this.baseForm.get('attender_relationship_title')?.setValue(id);
    this.baseForm.get('attender_name')?.setValue(this.capitalSrvc.AutoName(e));
  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: true, keyboard: true });
  }

  consultingDoctors!: any;

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
      return this.setting.apr ? 'Print' : 'Next';
    } else {
      return this.setting.api ? 'Print' : 'Next';
    }
  }

  activeId: any = 0;

  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }


  isTestsDocsServicesAdded() {
    return this.selectedTests.length !== 0 || this.selected_doctors.length != 0 || this.selectedServices.length != 0 || this.selectedRooms.length != 0
  }


  async newSessionReceiptPrint(ptnId: any) {

    try{
      await this.sharedPatient.newSessionReceiptPrint(ptnId, this.staffId);
      this.inProgress = false;
      this.resetBaseForm();
    }catch(error){

    }

    // this.subsink.sink = this.endPoint.getPaymentHistory(ptnId).subscribe((data: any) => {

    //   const model = {
    //     patient_id: ptnId,
    //     client_id: this.cookieSrvc.getCookieData().client_id,
    //     receipt_id: data[data.length - 1].id,
    //     printed_by: this.staffId || this.cookieSrvc.getCookieData().lab_staff_id,
    //   }

    //   this.inProgress = false;

    //   this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
    //     this.resetBaseForm();
    //     this.printSrvc.printRcpts(response.html_content);

    //   }, (error: any) => {
    //     this.inProgress = false;
    //     this.alertService.showError("Failed to get receipt information", "");
    //     this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptnId } });

    //   })
    // }, (error) => {
    //   this.inProgress = false;
    //   this.alertService.showError("Failed to get receipt information", "");
    //   this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptnId } });
    // })
  }

  formatIndianNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(number);
    return formattedNumber;
  }

}