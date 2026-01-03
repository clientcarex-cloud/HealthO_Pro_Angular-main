import { Component, Injector, ViewChild, } from '@angular/core';

import { ManagePaymentsService } from '../../services/managepayment.service';

import { ManagePaymentEndpoint } from '../../endpoints/managepayments.endpoints';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { Patient } from '../../models/patient.model';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileService } from '@sharedcommon/service/file.service';


@Component({
  selector: 'app-managepayments',
  templateUrl: './managepayments.component.html',
  styleUrls: ['./managepayments.component.scss'],
  providers: [ManagePaymentsService]
})

export class ManagepaymentsComponent extends BaseComponent<Patient> {

  constructor(
    injector: Injector,
    private router: Router,
    private printSrvc: PrintService,
    public service: ManagePaymentsService,
    public timeSrvc: TimeConversionService,
    private spinner: NgxSpinnerService,
    private fileSrvc: FileService,
    private endPoint: ManagePaymentEndpoint,
    private staffEndpoint: StaffEndpoint,

  ) { super(injector) }

  patientsLength: number = 0;
  activeButton: string = "All";
  pageNum!: number | null;
  staffs: any = [];
  staffQuery: any = '';
  count!: number;
  all_count!: number;
  patients!: any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  statusQuery: any = "";
  page_size!: any;
  page_number!: any;
  query!: string;

  selectPrintItem: any = [{ id: 1, name: 'Patient List'}]
  override ngOnInit(): void {
    this.pageNum = 1;

    this.statusQuery = `payment_status=all`;
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.date = this.timeSrvc.getTodaysDate();
    this.patients = []

    this.getData()

  }

  override ngAfterViewInit(): void {
    this.subsink.sink = this.staffEndpoint.getAllStaff().subscribe((res: any) => {
      this.staffs = res;
    })

  }

  selectStaff(e: any) {
    this.staffQuery = e || null
    this.getData();
  }

  getTotalCost(patients: Patient[] = this.patients): number {
    return patients.reduce((total, patient) => {
      if (patient.patient_invoice && patient.patient_invoice.total_cost) {
        return total + parseFloat(patient.patient_invoice.total_cost.toString());
      } else {
        return total;
      }
    }, 0);
  }

  getTotalDiscount(patients: Patient[] = this.patients): number {
    return patients.reduce((total, patient) => {
      if (patient.patient_invoice && patient.patient_invoice.total_discount) {
        return total + parseFloat(patient.patient_invoice.total_discount.toString());
      } else {
        return total;
      }
    }, 0);
  }

  getTotalPaid(patients: Patient[] = this.patients): number {
    return patients.reduce((total, patient) => {
      if (patient.patient_invoice && patient.patient_invoice.total_paid) {
        return total + parseFloat(patient.patient_invoice.total_paid.toString());
      } else {
        return total;
      }
    }, 0);
  }

  getTotalRefund(patients: Patient[] = this.patients): number {
    return patients.reduce((total, patient) => {
      if (patient.patient_invoice && patient.patient_invoice.total_refund) {
        return total + parseFloat(patient.patient_invoice.total_refund.toString());
      } else {
        return total;
      }
    }, 0);
  }

  getTotalDue(patients: Patient[] = this.patients): number {
    return patients.reduce((total, patient) => {
      if (patient.patient_invoice && patient.patient_invoice.total_due) {
        return total + parseFloat(patient.patient_invoice.total_due.toString());
      } else {
        return total;
      }
    }, 0);
  }

  getTotalAmount(patients: Patient[] = this.patients): number {
    return parseFloat((this.getTotalCost(patients) - this.getTotalDiscount(patients)).toString());
  }

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  sort: any = false;

  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }

  getData() {

    this.subsink.sink = this.endPoint.getPaginatedPayments(
      this.page_size, this.page_number, this.query, 
      this.date, this.from_date, this.to_date, 
      this.statusQuery, this.staffQuery?.id || null, this.sort
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data.results;

    })
  }

  setActiveButton(buttonId: string) {
    this.activeButton = buttonId;

    switch (this.activeButton) {
        case 'All':
            this.statusQuery = "payment_status=all";
            break;
        case 'Dues':
            this.statusQuery = "payment_status=due";
            break;
        case 'Partial':
            this.statusQuery = "payment_status=partial";
            break;
        case 'Refund':
            this.statusQuery = "payment_status=refund";
            break;
        case 'Paid':
            this.statusQuery = "payment_status=paid";
            break;
        default:
            this.statusQuery = "";
    }
    this.page_number = 1;
    this.getData();
}


  searchQuery(e: any) {
    this.query = e;
    // this.datePicker.onClearInput();
    // this.datePicker.dateValue = ""
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();

    }, 500); // Adjust the delay as needed
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

  checkInvoice(invoice: null | Object): any {
    if (invoice !== null) { return invoice }
    else { return "-" }
  }

  formatIndianNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(number);
    return formattedNumber;
  }

  test(e: any) {

  }

  concatenateShortCodes(item: any, tests: boolean , packages: boolean, separator: any = ", " ) {
    let shortForm = ''
    if (item?.lab_tests && tests) {
      // item?.lab_tests.forEach((test: any) => {
      //   shortForm += test?.name + ', '
      // })
      shortForm += item?.lab_tests.join(separator)
    }

    if (item?.lab_packages && packages) {

      shortForm += item?.lab_packages.join(separator)
      // item?.lab_packages.forEach((pkg: any) => {
      //   // pkg?.lab_tests.forEach((test: any) => {
      //   //   shortForm += test?.name + ', '
      //   // })
      //   shortForm += pkg?.name + ', '
      // })
    }

    return shortForm || ''
  }



  showPatient(details: any) {
    this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: details.id } });
  }
  


  printPatients: any ;
  printDate: any = "";
  printFromDate: any = "";
  printToDate: any = "";
  printStaff: any ;
  cleanedHtml: any = "";
  testing(is_print: boolean ) {

    if(this.printDate != this.date || this.printFromDate != this.from_date || this.printToDate != this.to_date || this.printStaff != this.staffQuery){
      
      this.printDate = this.date ;
      this.printFromDate = this.from_date ;
      this.printToDate = this.to_date ;
      this.printStaff = this.staffQuery;

      this.printPatients = [];
      this.spinner.show();
  
      this.subsink.sink = this.endPoint.getPaginatedPayments(
        "all", this.page_number, this.query, 
        this.date, this.from_date, this.to_date, 
        this.statusQuery, this.staffQuery?.id || null, this.sort
      ).subscribe((data: any) => {
        this.printPatients = data?.results || data;
    
        this.printExcel(is_print)
          // const html_content = document.getElementById("patientsDataTable");
          // this.printSrvc.printZeroWithBootstrap(this.cleanHtml(html_content?.outerHTML) )
          this.spinner.hide();

      });
  
    }else{
      this.printExcel(is_print)
    }

  }

  printExcel(is_print: boolean){
    if(this.printPatients.length != 0){
      this.cleanedHtml = is_print ? this.generateTableHtml(is_print) : this.generateExcelTableHtml(is_print);
      if(is_print){
        this.printSrvc.printZeroWithBootstrap(this.cleanedHtml);
      }else{
        this.printSrvc.exportToExcel(this.cleanedHtml, this.getTitle())
      }

    }else{
      this.alertService.showInfo(`No Patients to ${is_print ? 'Print.': 'Export.'}`, '')
    }

  }

  getTitle(){
    let title = `Payment List - `
    if(this.staffQuery) title = `${this.staffQuery?.name}, Payment List - `
    if(this.date && this.date != "") title += this.date ;
    else title += `${this.from_date} to ${this.to_date}`;
    return title ;
  }
  
  // Function to generate HTML string from the printPatients array
  generateTableHtml(is_print: boolean): string {

    let borderColor = is_print ? '#dee2e6' : '#000';
    let borderString = is_print ? `border: ${is_print ? '0.25px' : '1px'} solid ${borderColor}; ` : '';
    // let bgColor = `#E6E8E6`;
    // let bgColor = `#ddd`;
    let bgColor = `rgb(239, 243, 254) !important` ;
    // 1E336A

    let dateRows = ``;
    if (this.date && this.date != '') {
      dateRows = `
        <tr style="font-size: 11px !important; line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="8">Date - ${this.timeSrvc.dateAsString(this.date, false, false)}</th>
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="8">Printed On - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    } else {
      dateRows = `
        <tr style="font-size: 11px !important; line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th style="text-align: center; font-weight: bold;" colspan="8">
            Date - ${this.timeSrvc.dateAsString(this.from_date, false, true)}${this.to_date && this.to_date != '' ? ' to ' + this.timeSrvc.dateAsString(this.to_date, false, true) : ''}
          </th>
          <th colspan="8">Printed - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    }

    let htmlString = `
      <table id="excelReport" border="1" style="width: 100%; ">
        <thead style="background-color: ${bgColor}; border: none;">
          <tr style="font-size: 11px !important">
            <th class="patientPrintColumn" style="text-align: center; font-weight: bold; ${borderString}" colspan="16">Patient List ${this.getPaymentType()}</th>
          </tr>

          ${

            this.staffQuery ? 
            
            `
            <tr style="font-size: 11px !important">
              <th class="patientPrintColumn" style="text-align: center; font-weight: bold; ${borderString}" colspan="16">User - ${this.staffQuery?.name}</th>
            </tr>
            ` : ``
          }
  
          ${dateRows}
  
          <tr style="font-size: 11px !important">
            <th class="patientPrintColumn" style="width:10px; ${borderString} background-color: ${bgColor}; font-weight: bold;">#</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Reg Date</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Visit Id</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Ptn Name</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Age</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Gender</th>

            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Mobile No.</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Tests</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Packages</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Ref Dr.</th>

            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Total(₹)</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Discount</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right; text-wrap: nowrap;">Net Total</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Paid</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Refund</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right; text-wrap: nowrap;">Total Due</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    // Loop through the printPatients and build the rows dynamically
    this.printPatients.forEach((patient: any, i: number) => {
      let rowBgColor = (i % 2 === 1) ? `background-color: ${bgColor};` : ''; // Apply background color for odd rows
  
      htmlString += `
        <tr style="${rowBgColor}">
          <td class="patientPrintColumn" style="${borderString} text-align: left;"><small>${i + 1}.</small></td>
          <td class="patientPrintColumn" style="${borderString} text-align: left;">
            ${this.createSmallText(this.timeSrvc.formatDateWithDiv(patient.added_on, '-'), 'text-nowrap')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: left;">
            ${this.createSmallText(patient.visit_id, 'text-nowrap')}
          </td>
          <td class="patientPrintColumn" style="${borderString} font-weight: bold;  line-height: 1;">
            ${this.createSmallText(patient.name)}
          </td>
          <td class="patientPrintColumn" style="${borderString}">
            <small><small class="text-nowrap">
                                ${patient?.ULabPatientAge == 'DOB' ?
                                patient.dob + " " +
                                patient?.ULabPatientAge : patient.age +
                                " " + patient?.ULabPatientAge.toString()[0] }
            </small></small>
          </td>
          <td class="patientPrintColumn" style="${borderString}">
            ${this.createSmallText(patient.gender)}
          </td>
          <td class="patientPrintColumn" style="${borderString}">
            ${patient?.mobile_number ? this.createSmallText(patient?.mobile_number?.toString()) : ''}
          </td>
          <td class="patientPrintColumn" style="${borderString} line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              ${this.createSmallText(this.concatenateShortCodes(patient, true, false, ",\n"))}
            </div>
          </td>
          <td class="patientPrintColumn" style="${borderString} line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              ${this.createSmallText(this.concatenateShortCodes(patient, false, true, ",\n"))}
            </div>
          </td>
          <td class="patientPrintColumn" style="${borderString} line-height: 1; ">
            ${this.createSmallText(patient?.doctor_name || '')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right;">
            ${this.createSmallText(patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_cost : '--')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right;">
            ${this.createSmallText(patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_discount : '--')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right;">
            ${this.createSmallText(patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_cost - this.checkInvoice(patient.patient_invoice).total_discount : '--')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right;">
            ${this.createSmallText(patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_paid : '--')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right;">
            ${this.createSmallText(patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_refund : '--')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right;">
            ${this.createSmallText(patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_due : '--')}
          </td>

        </tr>
      `;
    });
  
    htmlString += `
      <tr style="background-color: ${bgColor}; border: none;">
        <td colspan="10" style="${borderString} text-wrap: nowrap; text-align: right; font-weight: bold;">
          <small>Totals : </small>
        </td>
        <td style="${borderString} text-align: right;font-weight: bold; ">
          <small>${this.formatIndianNumber(this.getTotalCost(this.printPatients))}</small>
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
          <small>${this.formatIndianNumber(this.getTotalDiscount(this.printPatients))}</small>
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
          <small>${this.formatIndianNumber(this.getTotalAmount(this.printPatients))}</small>
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
          <small>${this.formatIndianNumber(this.getTotalPaid(this.printPatients))}</small>
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
          <small>${this.formatIndianNumber(this.getTotalRefund(this.printPatients))}</small>
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
          <small>${this.formatIndianNumber(this.getTotalDue(this.printPatients))}</small>
        </td>
      </tr>
    `
    htmlString += `</tbody></table>`;
    
    return htmlString;
  }
  
  
  generateExcelTableHtml(is_print: boolean): string {


    let borderColor = is_print ? '#dee2e6' : '#000';
    let borderString = is_print ? `border: ${is_print ? '0.25px' : '1px'} solid ${borderColor}; ` : '';

    let bgColor = `rgb(239, 243, 254) !important` ;


    let dateRows = ``;
    if (this.date && this.date != '') {
      dateRows = `
        <tr style="line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="8">Date - ${this.timeSrvc.dateAsString(this.date, false, false)}</th>
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="8">Printed On - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    } else {
      dateRows = `
        <tr style="line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th style="text-align: center; font-weight: bold;" colspan="8">
            Date - ${this.timeSrvc.dateAsString(this.from_date, false, true)}${this.to_date && this.to_date != '' ? ' to ' + this.timeSrvc.dateAsString(this.to_date, false, true) : ''}
          </th>
          <th colspan="8">Printed - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    }

    let htmlString = `
      <table id="excelReport" border="1" borderColor="#d4d4d6" style=" width: 100%;  ">
        <thead style="background-color: ${bgColor}; border: none;">
          <tr style="background-color: ${bgColor};">
            <th class="patientPrintColumn" style="text-align: center; font-weight: bold; ${borderString}" colspan="16">Patient List  ${this.getPaymentType()}</th>
          </tr>

          ${

            this.staffQuery ? 

            `
            <tr>
              <th class="patientPrintColumn" style="text-align: center; font-weight: bold; ${borderString}" colspan="16">User - ${this.staffQuery?.name}</th>
            </tr>
            `

            :

            ``
          }

          ${dateRows}
  
          <tr>
            <th class="patientPrintColumn" style="width:10px; ${borderString} background-color: ${bgColor}; font-weight: bold;">#</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Reg Date</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Visit Id</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Ptn Name</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Age</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Gender</th>

            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Mobile No.</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Tests</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Packages</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-wrap: nowrap;">Ref Dr.</th>

            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Total(₹)</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Discount</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right; text-wrap: nowrap;">Net Total</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Paid</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right;">Refund</th>
            <th class="patientPrintColumn" style="${borderString} background-color: ${bgColor}; font-weight: bold; text-align: right; text-wrap: nowrap;">Total Due</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    // Loop through the printPatients and build the rows dynamically
    this.printPatients.forEach((patient: any, i: number) => {
      // let rowBgColor = (i % 2 === 1) ? `background-color: ${bgColor};` : ''; // Apply background color for odd rows
      let rowBgColor = '';
      htmlString += `
        <tr style="${rowBgColor}">
          <td class="patientPrintColumn" style="${borderString} text-align: left; vertical-align: middle; white-space: nowrap;">${i + 1}.</td>
          <td class="patientPrintColumn" style="${borderString} text-align: left; vertical-align: middle; white-space: nowrap;">
            ${this.timeSrvc.formatDateWithDiv(patient.added_on, '-')}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: left; vertical-align: middle; white-space: nowrap;">
            ${patient.visit_id}
          </td>
          <td class="patientPrintColumn" style="${borderString} line-height: 1; vertical-align: middle; white-space: nowrap;">
            ${patient.name}
          </td>
          <td class="patientPrintColumn" style="${borderString} vertical-align: middle; white-space: nowrap;">
  
                                ${patient?.ULabPatientAge == 'DOB' ?
                                patient.dob + " " +
                                patient?.ULabPatientAge : patient.age +
                                " " + patient?.ULabPatientAge.toString() }

          </td>
          <td class="patientPrintColumn" style="${borderString} vertical-align: middle; white-space: nowrap;">
            ${patient.gender}
          </td>
          <td class="patientPrintColumn" style="${borderString} vertical-align: middle; white-space: nowrap;">
            ${patient?.mobile_number ? patient?.mobile_number?.toString() : ''}
          </td>
          <td class="patientPrintColumn" style="${borderString} line-height: 1;  vertical-align: middle;">
              ${this.concatenateShortCodes(patient, true, false, ",<br>")}
          </td>
          <td class="patientPrintColumn" style="${borderString} line-height: 1;  vertical-align: middle; ">
              ${this.concatenateShortCodes(patient, false, true, ",<br>")}
          </td>
          <td class="patientPrintColumn" style="${borderString} line-height: 1;  vertical-align: middle; white-space: nowrap;">
            ${patient?.doctor_name || ''}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right; vertical-align: middle; white-space: nowrap;">
            ${patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_cost : '--'}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right; vertical-align: middle; white-space: nowrap;">
            ${patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_discount : '--'}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right; vertical-align: middle; white-space: nowrap;">
            ${patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_cost - this.checkInvoice(patient.patient_invoice).total_discount : '--'}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right; vertical-align: middle; white-space: nowrap;">
            ${patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_paid : '--'}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right; vertical-align: middle; white-space: nowrap;">
            ${patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_refund : '--'}
          </td>
          <td class="patientPrintColumn" style="${borderString} text-align: right; vertical-align: middle; white-space: nowrap;">
            ${patient.patient_invoice ? this.checkInvoice(patient.patient_invoice).total_due : '--'}
          </td>

        </tr>
      `;
    });
  
    htmlString += `
      <tr style="background-color: ${bgColor}; border: none;">
        <td colspan="10" style="${borderString} text-wrap: nowrap; text-align: right; font-weight: bold;">
        Totals :
        </td>
        <td style="${borderString} text-align: right;font-weight: bold; ">
        ${this.formatIndianNumber(this.getTotalCost(this.printPatients))}
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
        ${this.formatIndianNumber(this.getTotalDiscount(this.printPatients))}
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
        ${this.formatIndianNumber(this.getTotalAmount(this.printPatients))}
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
        ${this.formatIndianNumber(this.getTotalPaid(this.printPatients))}
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
        ${this.formatIndianNumber(this.getTotalRefund(this.printPatients))}
        </td>
        <td style="${borderString} text-align: right;font-weight: bold;">
        ${this.formatIndianNumber(this.getTotalDue(this.printPatients))}
        </td>
      </tr>
    `
    htmlString += `</tbody></table>`;
    
    return htmlString;
  }
  

  getPaymentType(){
    if(this.activeButton == 'Due'){
      return '(Due)'
    }else if(this.activeButton == 'Refund'){
      return '(Refunded)'
    }else if(this.activeButton == 'Partial'){
      return '(Partially Paid)'
    }else if(this.activeButton != 'Paid'){
      return '(Paid)'
    }else{
      return ''
    }
  }

  // Helper function to convert <app-small-text> to <small><small></small></small>
  createSmallText(text: any, classVal: any = null): string {
    return `<small class="${classVal}"><small>${text}</small></small>`;
  }
  

  cleanHtml(htmlString: any) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');
    let elements = doc.querySelectorAll('*');
    elements.forEach(element => {
        let attributes = Array.from(element.attributes);
        attributes.forEach(attribute => {
            if (!['id', 'class', 'style', 'colspan'].includes(attribute.name) && !attribute.name.startsWith('data-')) {
                element.removeAttribute(attribute.name);
            }
        });
    });
    return doc.body.innerHTML;
  }



}
