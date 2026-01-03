import { Component, Injector, Input, ViewChild, } from '@angular/core';
import { Doctor } from 'src/app/doctor/models/doctor.model';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { FormBuilder } from '@angular/forms';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})

export class ReferralComponent extends BaseComponent<Doctor> {

  constructor(
    private endPoint: DoctorEndpoint,
    private router: Router,
    injector: Injector,
    public dateTimeSrv: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    public printSrvc: PrintService,
    public timeSrvc: TimeConversionService,
    private formBuilder: FormBuilder,
    private proEndpoint: ProEndpoint,
    private masterEndpoint: MasterEndpoint,
    private staffEndpoint: StaffEndpoint
  ) {
    super(injector);
  }


  @Input() analyticShow: boolean = false;
  @Input() date: string = "";
  @Input() from_date: string = "";
  @Input() to_date: string = "";
  @Input() executiveQuery: any = null;

  @Input() from_target : boolean = false;

  @Input() doctorId : number = 1 ;

  count!: number;
  all_count!: number;
  doctors!: any;
  timer: any;
  page_size!: any;
  page_number!: any;
  query: string = '';
  sort: any = false;
  loading: boolean = false;
  
  specialization!: any;
  pageNum!: number | null;
  docLength!: number;

  selectNPrint: any = [ 
    { id: 1, name: "Amount Report" },
    { id: 2,  name: "Patient Count Report"}
   ]

   selectNPrint_selected: any = null ;

  formatCurrency(bill: any): any {
    if (bill) {
      const curr = parseInt(bill).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      return curr;
    } else {
      return 0
    }
  }

  formatNumber(bill: any): any {
    if (bill) {
      const curr = parseInt(bill).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      return curr?.replace("₹", "")?.replace(".00", "");
    } else {
      return 0
    }
  }

  selectReport(e: any){
    if(e && e!= ''){
      this.selectNPrint_selected = e ;
    }else{
      this.selectNPrint_selected = null ;
    }
  }

  hospitaName: string = "";
  datePickerMaxDate: any;
  genders: any;

  override ngOnInit(): void {
    this.hospitaName = this.cookieSrvc?.getCookieData()?.business_name || ""

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.getData();

    this.selectReport(this.selectNPrint[this.analyticShow ? 0 : 1])

    this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
      this.genders = data.results
    })

    if (this.analyticShow) {
      this.getRefDOcSettings()
    }

    this.getExecutives() ;
  }

  staffs: any ;

  getExecutives(){
    this.subsink.sink = this.staffEndpoint.getPaginatedStaff(
      'all', 1, '', true, '&role=MarketingExecutive'
        ).subscribe((data:any)=>{
      this.staffs = data?.results || data;

      this.staffs.forEach((staff: any)=>{
        staff.name = `${staff.name} | Ph no: ${staff.mobile_number}`
      })
    })
  }


  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  getData(returnDoc: boolean = false) {
    this.selected_docs_for_prints = [];
    this.loading = true;

    if (this.analyticShow) {
      this.doctors = []
      this.subsink.sink = this.endPoint.getPatientWiseReferralDoctors(
        this.doctorId,
        this.page_size, this.page_number, this.query,
        this.date, this.from_date, this.from_date != this.to_date ? this.to_date : '', this.sort , this.executiveQuery
      ).subscribe((data: any) => {
        this.loading = false;
        if (!returnDoc) {
          
          let splCount: any = [];

          data.results.forEach((doc: any) => {
            if (!splCount.includes(doc.specialization)) {
              splCount.push(doc.specialization);
            }
          })

          this.count = Math.ceil(data.count / this.page_size)
          this.all_count = data.count;
          this.doctors = data.results;

          this.dataDoctor[0].count = data.count;
        } else {
          this.loading = false;
          this.doctors = data;
        }
      })
    } else {
      this.doctors = [] ;
      this.subsink.sink = this.endPoint.getPaginatedReferralDoctors(
        this.page_size, this.page_number, this.query,
        this.date, this.from_date, this.to_date, this.sort, this.executiveQuery
      ).subscribe((data: any) => {
        this.loading = false;
        if (!returnDoc) {

          let splCount: any = [];

          data.results.forEach((doc: any) => {
            if (!splCount.includes(doc.specialization)) {
              splCount.push(doc.specialization);
            }
          })

          this.count = Math.ceil(data.count / this.page_size)
          this.all_count = data.count;
          this.doctors = data.results;

          this.dataDoctor[0].count = data.count;
        } else {
          this.loading = false;
          this.doctors = data;
        }
      })
    }

  }

  stats!: any;
  dataDoctor = [
    { label: 'Doctors', count: 0, logo: false },
  ]

  selectExecutive(e: any){
    if(e && e!=''){
      this.executiveQuery = `&marketing_executive=${e.id}`;
      this.getData();
    }else{
      this.executiveQuery = null;
      this.getData();
    }
  }

  getStats() {
    this.subsink.sink = this.endPoint.getReferralDoctorStat().subscribe((data: any) => {
      this.dataDoctor[0].count = data.doctor_count;
    })
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // this.date = "";
      // this.from_date = "";
      // this.to_date = "";
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }


  searchDocQuery(e: any) {
    this.query = e.target.value;
    // this.alertService.showError(e.target.value)
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }


  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.getData();
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  getRangeValue(e: any) {
    // this.alertService.showError(e)
    if (e.length !== 0) {
      if (e.includes("to")) {
        this.separateDates(e);
      } else {
        // this.date = e;
        this.date = ""
        this.from_date = e;
        // this.from_date = e
        this.to_date = "";
        // this.alertService.showError("")
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

  getSpecilizationName(id: any) {
    return this.specialization?.find((spcl: any) => spcl.id === id)?.name;
  }

  showDoc(id: any) {
    this.router.navigate(['/doctor/view/'], { queryParams: { d_id: id } });
  }

  addVisit(doc: any) {
    this.modalService.dismissAll();
    this.router.navigate(['/marketingexecutive'], { queryParams: { d_id: doc.id } });
  }

  // doctor reports 


  SR_start_date: any;
  SR_end_date: any;
  SR_staff: any;
  SR_template: any;
  title: string = "";
  viewPrintLoading: boolean = false;
  printLoading: boolean = false;

  docLoading: boolean = false;

  refDoctors: any = [];

  doctorSelected(e: any) {
    this.baseForm.get('referral_doctor')?.setValue(e ? e : null);
  }

  setToday() {
    this.SR_start_date = this.timeSrvc.getTodaysDate();
    this.SR_end_date = this.timeSrvc.getTodaysDate()
  }

  setYesterday() {
    this.SR_start_date = this.timeSrvc.getYesterdayDate();
    this.SR_end_date = this.timeSrvc.getYesterdayDate()
  }

  setSevenDays() {
    this.SR_start_date = this.timeSrvc.getLast7Days()?.startDate;
    this.SR_end_date = this.timeSrvc.getLast7Days()?.endDate;
  }

  selectShirtReportStaff(e: any) {
    this.SR_staff = e;
  }

  selectShirtReportTemplate(e: any) {
    this.SR_template = e;
  }

  set_shiftReport_start_date(e: any) {
    this.SR_start_date = e.srcElement.value;

  }

  set_shiftReport_end_date(e: any) {
    this.SR_end_date = e.srcElement.value;
  }

  divData: any = "";

  @ViewChild('reportModal') reportModal: any;

  getDateVal(e: any) {
    if(this.analyticShow){
      this.getRangeValue(e);
    }

    if (e.length !== 0) {
      if (e.includes("to")) {

        this.separateReportDates(e);
      } else {
        this.SR_start_date = e;
        this.SR_end_date = e;
        this.from_date = e;
        this.to_date = e ;
        // this.from_date
      }
    }

    this.getData();

  }

  separateReportDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate ;
    this.to_date = endDate ;
    this.SR_start_date = startDate;
    this.SR_end_date = endDate;
  }

  getReportPrint(i: any) {
    this.SR_staff = i;
    this.getReferralDoctorReport(true);
  }


  excel_files: any = [];

  getReferralDoctorReport(print: boolean) {
    if ((this.SR_start_date || this.SR_end_date) && this.SR_staff) {

      this.divData = "";
      this.excel_files = [];

      print ? this.printLoading = true : this.viewPrintLoading = true

      const model = {
        doctor_id: this.SR_staff.id,
        start_date: this.SR_start_date,
        end_date: this.SR_end_date,
        client: this.cookieSrvc.getCookieData().client_id
      }

      this.subsink.sink = this.endPoint.Post_N_getReferralDoctorAmountReport(model).subscribe((data: any) => {
        print ? this.printLoading = false : this.viewPrintLoading = false
        this.divData = data.html_content;
        this.excel_files.push(data.html_content)
        this.title = `${this.SR_staff.name} `;
        if (print) {
          this.print();
        } else {

          this.modalService.open(this.reportModal, { size: 'xl', centered: true, scrollable: false });
          this.insertPrint(data.html_content);
        }

      }, (error) => {
        this.showReportError();
      })
    } else {
      !this.SR_staff ? this.alertService.showError("Select Doctor") : null;
      !this.SR_start_date ? this.alertService.showError("Select Start Date") : null;
      !this.SR_end_date ? this.alertService.showError("Select End Date") : null;
    }
  }

  insertPrint(content: any) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'height: 80vh;background-color: #F8FAFC;width: 100%; overflow: auto');
    // iframe.setAttribute('style', 'width: 221mm;border: 1px solid #ccc;box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);margin: 20px auto;height: 80vh;');
    const printPage = document.getElementById('report');
    printPage!.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(this.header + content + this.footer);
    }
  }


  header = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>HealthO Pro</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">
        <style>
        .inter-font {
          font-family: "Nunito", sans-serif;
          font-style: normal;
          font-weight: 500px;
          font-size: 13px !important;
        }
      </style>
    </head>
    <body style='background-color: #F8FAFC;' class="rounded-3 overflow-auto pt-2">
  
    `

  footer= `

    </body>
  </html>
  `
    


  print() {
    this.printSrvc.printZeroWithBootstrap(this.divData);
  }


  export() {
    this.printSrvc.exportToExcel(this.divData, this.title || 'download')
  }

  openReportModal(content: any, size = '') {
    this.modalService.open(content, { size: '', centered: false, scrollable: false });
  }

  departments: any;

  openModalBootstrap(content: any, size = '') {
    this.router.navigate(['/doctor/manage_doctor_amount/'], { queryParams: { d_id: this.doc.id } });
  }


  showReportError() {
    this.viewPrintLoading = false;
    this.printLoading = false;
    this.alertService.showError(`Failed to get Reports ${this.SR_staff.name} ${this.SR_template.name}`, "")
  }

  selectAllCompletedTrue: boolean = false;
  selected_docs_for_prints: any = [];

  Handle_print_report(e: any, item: any): void {

    if (e) {
      this.selected_docs_for_prints.push(item.id);
    } else {
      this.selected_docs_for_prints = this.selected_docs_for_prints.filter((doc: any) => doc !== item.id);
    }

  }


  printReport(print: boolean){
    if(this.analyticShow){
      this.printAllReports(print);
    }else{
      this.printPatientCountReport(print);
    }
  }

  printAllReports(print: boolean) {
    if ((this.SR_start_date || this.SR_end_date) && this.selected_docs_for_prints.length !== 0) {

      let print_content: any = "";

      let count = 0;
      this.divData = "";
      this.excel_files = [];

      this.selected_docs_for_prints.forEach((docs: any) => {
        print ? this.printLoading = true : this.viewPrintLoading = true
        const model = {
          doctor_id : docs,
          start_date: this.SR_start_date,
          end_date: this.SR_end_date,
          client: this.cookieSrvc.getCookieData().client_id
        }

        this.title = "Referral Doctor Report " + this.SR_start_date + " to " + this.SR_end_date;

        this.subsink.sink = this.endPoint.Post_N_getReferralDoctorAmountReport(model).subscribe((data: any) => {

          this.divData += data.html_content +  "<div style='padding-top: 100px;'></div>"

          print_content = print_content + "<div class='border rounded-3 overflow-hidden bg-white'>" + data.html_content.replace(/#e6e8e6/g, "#c2ceff;") + "</div>" + "<div style='page-break-before: always;padding-top: 100px;'></div>";
          count += 1

          this.excel_files.push(data.html_content);

          if (count === this.selected_docs_for_prints.length) {
            this.printLoading = false;
            this.viewPrintLoading = false;

            if (print) {
              this.modalService.open(this.reportModal, { size: 'xl', centered: true, scrollable: false });
              this.insertPrint(print_content);
            } else {
              this.export()
            }

          }

        }, (error) => {
          count += 1;
          this.alertService.showError(error.error.Error)
          this.printLoading = false;
          this.showReportError();
        },)
      })

    } else {
      this.selected_docs_for_prints.length === 0 ? this.alertService.showInfo("Select atleast one doctor.") : null;
      !this.SR_start_date ? this.alertService.showInfo("Select Start Date") : null;
      !this.SR_end_date ? this.alertService.showInfo("Select End Date") : null;
    }
  }

  printPatientCountReport(print: boolean) {
    if ((this.SR_start_date || this.SR_end_date) && this.selected_docs_for_prints.length !== 0) {

      let print_content: any = "";

      let count = 0;
      this.divData = "";
      this.excel_files = [];

      print ? this.printLoading = true : this.viewPrintLoading = true

      this.title = "Referral Doctors Patient Count Report " + this.SR_start_date + " to " + this.SR_end_date;

      const doctors = this.selected_docs_for_prints.join(',') ;

      this.subsink.sink = this.endPoint.getReferralDoctorPatientCount(doctors, this.SR_start_date, this.SR_end_date).subscribe((data: any) => {

        this.divData += data.html_content +  "<div style='padding-top: 100px;'></div>"

        print_content = print_content + "<div class='border rounded-3 overflow-hidden bg-white'>" + data.html_content.replace(/#e6e8e6/g, "#c2ceff;") + "</div>" + "<div style='page-break-before: always;padding-top: 100px;'></div>";

        this.excel_files.push(data.html_content);

        this.printLoading = false;
        this.viewPrintLoading = false;

        if (print) {
          this.modalService.open(this.reportModal, { size: 'xl', centered: true, scrollable: false });
          this.insertPrint(print_content);
        } else {
          this.export() ;
        }

      }, (error: any) => {
        count += 1;
        this.alertService.showError(error.error.Error)
        this.printLoading = false;
        this.showReportError();
      })

    } else {
      this.selected_docs_for_prints.length === 0 ? this.alertService.showInfo("Select atleast one doctor.") : null;
      !this.SR_start_date ? this.alertService.showInfo("Select Start Date") : null;
      !this.SR_end_date ? this.alertService.showInfo("Select End Date") : null;
    }
  }

  selectAllDocs(e: any) {

    if (e) {
      this.selected_docs_for_prints = this.doctors.map((doc: any) => doc.id);
    } else {
      this.selected_docs_for_prints = [];
    }

  }


  checkDoc(i: any) {
    return this.selected_docs_for_prints.includes(i);
  }


  capitalizeName(type: string) {
    {
      if (type === 'name') {
        this.baseForm.value.name = this.baseForm.value.name.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
      }
      else if (type === 'location') {
        this.baseForm.value.geo_area = this.baseForm.value.geo_area.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match: any, p1: any, p2: any) => p1 + p2.toUpperCase());
      }
    }
  }

  referralAmountForm!: UntypedFormGroup;

  initializeRefDoctorForm() {
    this.baseForm = this.formBuilder.group({
      name: ['', Validators.required],
      mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [''],
      license_number: [null],
      geo_area: ['', Validators.required],
      added_on: [null],
      doctor_type_id: 1,
      specialization: [""],
      employement_type: [null],
      gender: [1, Validators.required],
      role: [null],
      department: [null],
      shift: [null],
      branch: [null],
      signature_for_consulting: [null],
      is_active: [true],
      marketing_executive: [null]
    });


    this.referralAmountForm = this.formBuilder.group({
      referral_amount: [null, Validators.required],
      is_percentage: [false],

    })
  }

  resetAmount() {
    this.referralAmountForm.get('referral_amount')?.setValue(null);
  }


  referrAmountObject: any;

  titleName!: string;

  doc: any;

  openDoctorModal(content: any, item: any, model: boolean = true, e: any = true) {
    if (!this.analyticShow && !this.from_target) {
      this.initializeRefDoctorForm();

      this.doc = item;

      this.titleName = item.name;
      this.baseForm.get('name')?.setValue(item.name?.toUpperCase());
      this.baseForm.get('mobile_number')?.setValue(item?.mobile_number || "");
      this.baseForm.get('geo_area')?.setValue(item?.geo_area || "");

      this.baseForm.get('marketing_executive')?.setValue(item?.marketing_executive || null);

      this.baseForm.get('gender')?.setValue(item.gender ? this.genders.find((gen: any) => gen.name == item.gender)?.id || null : "");

      if (this.doc.is_duplicate) {
        this.baseForm.get('name')?.disable();
        this.baseForm.get('mobile_number')?.disable();
        this.baseForm.get('geo_area')?.disable();
      }

      if (!this.doc.is_duplicate) {
        if (model) {
          this.modalService.open(content, { size: "", centered: true, backdropClass: "light-blue-backdrop" });
        } else {
          this.baseForm.get('is_active')?.setValue(e);
          this.saveApiCall();
        }
      } else {
        this.alertService.showInfo("Can't Open Since This Referral Doctor Has Merged With Another")
      }
    }
  }

  validateAmount(e: any) {
    function extractNumbers(input: string): number {
      const trimmedInput = input.trim(); // Remove leading and trailing whitespace
      const numberPattern = /^(\d+(\.\d+)?)/; // Match digits with optional decimal part
      const match = trimmedInput.match(numberPattern);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return 0;
      }
    }

    const input_number = extractNumbers(e.target.value);
    const percen = this.referralAmountForm.get('is_percentage')?.value

    if (percen) {
      if (input_number > 100) {
        this.referralAmountForm.get('referral_amount')?.setValue(100)
      } else if (input_number <= 0) {
        this.referralAmountForm.get('referral_amount')?.setValue("")
      } else {
        // this.referralAmountForm.get('referral_amount')?.setValue(input_number)
      }
    } else {
      if (input_number <= 0) {
        this.referralAmountForm.get('referral_amount')?.setValue("")
      } else {
        // this.referralAmountForm.get('referral_amount')?.setValue(input_number)
      }

    }
  }

  getModel() {
    const model: any = {
      name: this.baseForm.get('name')?.value,
      gender: this.baseForm.get('gender')?.value,
      mobile_number: this.baseForm.get('mobile_number')?.value,
      // license_number: this.baseForm.get('license_number')?.value || null,
      geo_area: this.baseForm.get('geo_area')?.value || "",
      doctor_type_id: 1,
      is_active: this.baseForm.get('is_active')?.value,
      marketing_executive: this.baseForm.get('marketing_executive')?.value?.id || null 
    }
    return model;
  }


  doInactive(doc: any, e: any) {

  }


  override saveApiCall(): void {
    if (this.baseForm.valid) {
      const model = this.getModel();
     this.subsink.sink = this.endPoint.updateDoctor(this.doc.id, model).subscribe((response: any) => {
        this.alertService.showSuccess("Details Updated", `${response.name}`);
        this.getData();
        this.modalService.dismissAll();
        if (this.referrAmountObject) {
          // const refAmountMOdel = {
          //   is_percentage : this.referralAmountForm.get('is_percentage')?.value,
          //   referral_amount: this.referralAmountForm.get('referral_amount')?.value,
          //   referral_doctor: response.id,
          //   id: this.referrAmountObject.id
          // }

          // this.endPoint.updateReferralAmount(refAmountMOdel).subscribe((data:any)=>{
          //   // this.alertService.showSuccess("Inc")
          //   this.getData();
          //   this.modalService.dismissAll();
          // }, (error)=>{
          //   this.getData();
          //   this.modalService.dismissAll();
          //   this.alertService.showError("Oops","Error in Posting Referral Amount Please Try Again")
          // })
        } else {
          // const refAmountMOdel = {
          //   is_percentage : this.referralAmountForm.get('is_percentage')?.value,
          //   referral_amount: this.referralAmountForm.get('referral_amount')?.value,
          //   referral_doctor: response.id,

          // }

          // this.endPoint.postReferralAmount(refAmountMOdel).subscribe((data:any)=>{
          //   // this.alertService.showSuccess("Inc")
          //   this.getData();
          //   this.modalService.dismissAll();
          // }, (error)=>{
          //   this.getData();
          //   this.modalService.dismissAll();
          //   this.alertService.showError("Oops","Error in Posting Referral Amount Please Try Again")
          // })
        }

      }, (error) => {

        let specificErrorHandled = false;

        if (error?.error?.license_number && error?.error?.license_number[0]?.includes('exists')) {
          this.alertService.showError("Referral Doctor with this license number already exists", "");
          specificErrorHandled = true;
        }
        if (error?.error?.name && error?.error?.name[0]?.includes('exists')) {
          this.alertService.showError("Referral Doctor with this Name already exists", "");
          specificErrorHandled = true;
        }
        if (error?.error?.mobile_number && error?.error?.mobile_number[0]?.includes('exists')) {
          this.alertService.showError("Referral Doctor with this Mobile Number already exists", "");
          specificErrorHandled = true;
        }

        if (!specificErrorHandled) {
          this.alertService.showError("Adding doctor failed");
        }
      })
    }
    else {


      this.showErrors();
    }
  }

  showErrors() {
    this.submitted = true;
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
  }

























  // referralAmount start here

  global_tests: any;
  testQuery: any;

  getGlobalTestsData() {
    this.subsink.sink = this.endPoint.getPaginatedGlobalTests(
      "all", this.page_number,
      this.testQuery,
    ).subscribe((data: any) => {
      this.global_tests = data
    })
  }

  searchTestQuery(e: any) {
    this.testQuery = e;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getGlobalTestsData();

    }, 500); // Adjust the delay as needed
  }


  dept: string = "";

  selectDepartment(e: any) {
    let q = "";
    e.forEach((data: any) => q += data.id.toString() + ",")
    this.dept = e.length !== 0 ? q.replace(/,\s*$/, '') : '';
    // this.getData();
  }









  // referral settings 

  refSettings: any = [
    {
      id: 0,
      is_calculation_by_total: false,
      is_calculation_by_net_total: true,
      due_clear_patients: true,
      discount_by_doctor: false,
      client: this.cookieSrvc.getCookieData().client_id
    }
  ]

  getRefDOcSettings() {
    this.subsink.sink = this.masterEndpoint.getRefDocSettings(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {

      this.refSettings = data[0];
    }, (error) => {

      this.alertService.showError(error)
    })
  }


  changeRefDocValue(e: any, typeTrue: any, typeFalse: any) {
    this.refSettings[typeTrue] = e;
    this.refSettings[typeFalse] = !e;
    this.updateRefDoc();
  }

  changeDueNDisRefSettings(e: any, type: any) {
    this.refSettings[type] = e;
    this.updateRefDoc();
  }

  updateRefDoc() {
    this.subsink.sink = this.masterEndpoint.updateRefSetting(this.refSettings).subscribe((res: any) => {
      this.alertService.showSuccess("Referral Doctor Setting updated successfully");
    }, (error) => {
      this.alertService.showError(error)
    })
  }


  mergedDoctorList:any ;

  syncSave: any = false ;

  selectMerged(e:any){
    this.mergedDoctorList = e && e != '' ? e : null ;
    this.refDoctors = [] ;
  }

  selectMainDoc(e:any){
    this.main_doctor_id = e && e != '' ? e : null ;
    this.refDoctors = [] ;
  }

  main_doctor_id: any = null ;

  mergeDoctorsPost(){
    if(this.mergedDoctorList && this.mergedDoctorList.length >0 && this.main_doctor_id){
      let docList:any = [];

      this.mergedDoctorList.forEach((doc:any)=> {
        if(doc.id != this.main_doctor_id.id){
          docList.push(doc.id)
        }
      })

      const model = {
        main_doctor_id: this.main_doctor_id?.id,
        duplicate_doctor_ids: docList
      }
      this.syncSave = true;
      this.subsink.sink = this.endPoint.mergeDoctor(model).subscribe((data:any)=>{

        this.main_doctor_id = null ;
        this.mergedDoctorList = [] ;
        this.getData();
        this.alertService.showSuccess("Merge Doctors Successful")
        this.modalService.dismissAll();
        this.syncSave = false;
        this.page_number=1;

      },(error)=>{

        this.syncSave = false;
        this.alertService.showError(error)
      })
    }else{
      this.alertService.showError("Select Doctors")
    }
  }

  getDoctorSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.docLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.endPoint.getLabDoctors(searchTerm).subscribe((data: any) => {
          this.refDoctors = data.filter((d: any) => d.is_active && !d.is_duplicate && d?.id != this.main_doctor_id?.id);
          this.refDoctors.map((d:any) => d.name = `${d.name}, ${d.mobile_number}`)
          this.docLoading = false;
        });
      }, 400);
    } else {
      this.refDoctors = [];
      this.docLoading = false;
    }
  }


}
