import { Component, Injector, ViewChild } from '@angular/core';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { NablEndpoint } from '../../endpoint/nabl.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { NablService } from '../../service/nabl.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-nablcomp',
  templateUrl: './nablcomp.component.html',
  styleUrls: ['./nablcomp.component.scss']
})
export class NablcompComponent extends BaseComponent<any> {

  constructor(
    private endPoint: NablEndpoint,
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private printSrvc: PrintService,
    public service: NablService,
    private spinner: NgxSpinnerService
  ) { super(injector) }

  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";

  queries!: any;
  pageNum!: number;

  override  ngOnInit(): void {

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.date = this.timeSrvc.getTodaysDate();
    // this.from_date = "2024-08-01";
    // this.to_date = this.timeSrvc.getTodaysDate();
    this.patients = []
    this.getData()

  }

  count!: number;
  all_count!: number;
  patients!: any;
  timer: any;
  sort:any = true;

  page_size!: any;
  page_number!: any;
  query!: string;
  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  getData() {
    this.subsink.sink = this.endPoint.search(
      this.page_size, this.page_number,
      this.query,
      this.date, this.from_date, this.to_date, this.sort
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.patients = data.results || data;
    })
  }

  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }


  searchQuery(e: any) {
    this.query = e;
    // this.datePicker.onClearInput();
    // this.datePicker.dateValue = ""
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // this.date = "";
      // this.from_date = "";
      // this.to_date = "";
      this.page_number = 1;

      this.getData();
    }, 800); // Adjust the delay as needed
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


  printPatients: any ;
  printDate: any = "";
  printFromDate: any = "";
  printToDate: any = "";
  printStaff: any ;
  
  cleanedHtml: any = '' ;

  getDataForPrint(is_print: boolean ){

    if(this.printDate != this.date || this.printFromDate != this.from_date || this.printToDate != this.to_date ){
      
      this.printDate = this.date ;
      this.printFromDate = this.from_date ;
      this.printToDate = this.to_date ;


      this.printPatients = [];
      this.spinner.show();
      
      this.subsink.sink = this.endPoint.search(
        "", 1, "", this.date, this.from_date, this.to_date, this.sort
      ).subscribe((data: any) => {
        this.printPatients = data.results || data;
  
          const html_content = is_print ? this.generateHTML(this.printPatients, is_print) : this.generateExcelHTML(this.printPatients ) ;
          is_print ? this.printSrvc.printZeroWithBootstrap(html_content) : this.printSrvc.exportToExcel(html_content, this.getTitle())
      
          this.spinner.hide();
        })
    }else{
      this.printExcel(is_print,);
    }
    

  }
  

  printExcel(is_print: boolean){

    if(this.printPatients.length != 0){
      const html_content = is_print ? this.generateHTML(this.printPatients, is_print) : this.generateExcelHTML(this.printPatients ) ;
      this.cleanedHtml = html_content ;
      if(is_print){
        this.printSrvc.printZeroWithBootstrap(html_content);
      }else{
        this.printSrvc.exportToExcel(html_content, this.getTitle())
      }

    }else{
      this.alertService.showInfo(`No Patients to ${is_print ? 'Print.': 'Export.'}`, '')
    }

  }

  getTitle(){
    let title = `NABL REPORT - `

    if(this.date && this.date != "") title += this.date ;
    else title += `${this.from_date} to ${this.to_date}`;

    return title ;
  }


  generateHTML(patients: any, is_print: boolean) {
    // Start table
    let html = `<table border="1"  style="border-collapse: collapse; width: 100%;" class='inter-font table table-bordered table-striped'>`;
    

    let dateRows = '';

    if(this.date && this.date != ''){
      dateRows =  `
      <tr style="font-size: 11px !important; line-height: 10px;">
        <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="5">${this.timeSrvc.dateAsString(this.date, false, false)}</th>
        <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="5">Printed On - ${this.timeSrvc.dateAsString(null, true, true)}</th>
      </tr>
      `
    }else{
      dateRows = `
      <tr style="font-size: 11px !important; line-height: 10px;">
        <th style="text-align: center; font-weight: bold;" colspan="10">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span>Date - ${this.timeSrvc.dateAsString(this.from_date, false, true)}${this.to_date && this.to_date != '' ? ' to ' + this.timeSrvc.dateAsString(this.to_date, false, true) : ''}</span>
            <span>Printed - ${this.timeSrvc.dateAsString(null, true, true)}</span>
          </div>
        </th>
      </tr>
      `
    }


    // Table header
    html += `
        <thead>
            <tr>
                <th colspan="10" style="text-align: center; font-weight: bold; line-height: 10px;">NABL REPORT</th>
            </tr>

            ${dateRows}

            <tr style="font-size: 11px !important; font-weight: bold; line-height: 10px;">
                <th style="white-space: nowrap; color: black;">#</th>
                <th style="white-space: nowrap; color: black; text-align: center;">Reg. Date</th>
                <th style="white-space: nowrap; color: black; text-align: center;">Visit Id</th>
                <th style="white-space: nowrap; color: black;">Name</th>
                <th>Test</th>
                <th>Status</th>
                <th style="white-space: nowrap;">Sample Collection</th>
                <th style="white-space: nowrap;">Sample Received</th>
                <th style="white-space: nowrap;">Report Result</th>
                <th style="white-space: nowrap;">TAT</th>
            </tr>

        </thead>
        <tbody>
    `;

    // Table rows (dynamically created)
    patients.forEach((ptn: any, i: number) => {
        html += `
            <tr>
                <td style="text-align: center; line-height: 10px; padding: 2px; vertical-align: middle; white-space: nowrap;">
                    <small><small>${i + 1}</small></small>
                </td>
                <td style="text-align: center; line-height: 10px; padding: 2px; vertical-align: middle; white-space: nowrap;">
                    <small><small>${this.timeSrvc.formatDateWithDiv(ptn.patient.added_on, '-')}</small></small>
                </td>
                <td style="text-align: center; line-height: 10px; padding: 2px; vertical-align: middle; white-space: nowrap;">
                    <small><small>${ptn.patient?.visit_id || ''}</small></small>
                </td>
                <td style="line-height: 10px; padding: 2px; vertical-align: middle; font-weight: 600;">
                    <small><small>${ptn.patient.name}</small></small>
                </td>
                <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
                    <small><small>${ptn.name}</small></small>
                </td>
                <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
                    <small><small>${ptn.status_id}</small></small>
                </td>
                <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
                  ${
                    ptn.phlebotomist!==null ?
                    `
                      <div style="display: flex; flex-direction: column;">
                        <small><small>${this.timeSrvc.formatDateWithDiv(ptn.phlebotomist?.collected_at, '-', true)}</small></small>
                        <small><small>${ptn?.phlebotomist?.collected_by}</small></small>
                      </div>
                    `
                    : ``
                  }
                </td>
                <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
                    ${
                      ptn.phlebotomist!==null ?
                      `
                      <div style="display: flex; flex-direction: column;">
                          <small><small>${this.timeSrvc.formatDateWithDiv(ptn?.phlebotomist?.received_at, '-', true)}</small></small>
                          <small><small>${ptn?.phlebotomist?.received_by}</small></small>
                      </div>
                      `
                    : ``
                  }
                </td>
                <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
                  ${
                      ptn.phlebotomist!==null ?
                      `
                        <div style="display: flex; flex-direction: column;">
                          <small><small>${this.timeSrvc.formatDateWithDiv(ptn?.labtechnician?.completed_at, '-', true)}</small></small>
                          <small><small>${ptn?.labtechnician?.report_created_by}</small></small>
                        </div>
                      ` : `` }
                </td>
                <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
                    <small><small>${ptn?.result || '' }</small></small>
                </td>
            </tr>
        `;
    });

    // Close the tbody and table
    html += `
        </tbody>
    </table>
    `;

    // Return the generated HTML
    return html;
  }


  generateExcelHTML(patients: any) {
    // Start table
    let html = `<table border="1" borderColor="#d4d4d6" style="border-collapse: collapse; width: 100%;" class='inter-font table table-bordered table-striped'>`;
  
    // Generate date rows
    let dateRows = '';
  
    if (this.date && this.date != '') {
      dateRows = `
        <tr style="line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="7">${this.timeSrvc.dateAsString(this.date, false, false)}</th>
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="6">Printed On - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    } else {
      dateRows = `
        <tr style="line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th style="text-align: center; font-weight: bold;" colspan="7">
            Date - ${this.timeSrvc.dateAsString(this.from_date, false, true)}${this.to_date && this.to_date != '' ? ' to ' + this.timeSrvc.dateAsString(this.to_date, false, true) : ''}
          </th>
          <th colspan="6">Printed - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    }
  
    // Table header
    html += `
      <thead>
        <tr style="background-color:rgb(239, 243, 254) !important; ">
          <th colspan="13" style="text-align: center; font-weight: bold; line-height: 10px; font-weight: 600;">NABL REPORT</th>
        </tr>
        ${dateRows}
        <tr style="font-weight: 600; line-height: 10px; background-color:rgb(239, 243, 254) !important; ">
          <th style="white-space: nowrap; color: black;">#</th>
          <th style="white-space: nowrap; color: black; text-align: center;">Reg. Date</th>
          <th style="white-space: nowrap; color: black; text-align: center;">Visit Id</th>
          <th style="white-space: nowrap; color: black; text-align: left">Name</th>
          <th>Test</th>
          <th>Status</th>
          <th style="white-space: nowrap;">Sample Collected At</th>
          <th style="white-space: nowrap; text-align: left">Sample Collected By</th>
          <th style="white-space: nowrap;">Sample Received At</th>
          <th style="white-space: nowrap; text-align: left">Sample Received By</th>
          <th style="white-space: nowrap;">Report Result At</th>
          <th style="white-space: nowrap; text-align: left">Report Result By</th>
          <th style="white-space: nowrap;">TAT</th>
        </tr>
      </thead>
      <tbody>
    `;
  
    // Table rows (dynamically created)
    patients.forEach((ptn: any, i: number) => {
      html += `
        <tr>
          <td style="text-align: center; line-height: 10px; padding: 2px; vertical-align: middle; white-space: nowrap;">
            ${i + 1}
          </td>
          <td style="text-align: center; line-height: 10px; padding: 2px; vertical-align: middle; white-space: nowrap;">
            ${this.timeSrvc.formatDateWithDiv(ptn.patient.added_on, '-')}
          </td>
          <td style="text-align: center; line-height: 10px; padding: 2px; vertical-align: middle; white-space: nowrap;">
            ${ptn.patient?.visit_id || ''}
          </td>
          <td style="line-height: 10px; padding: 2px; vertical-align: middle; ">
            ${ptn.patient.name}
          </td>
          <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
            ${ptn.name}
          </td>
          <td style="line-height: 10px; padding: 2px; vertical-align: middle; text-align: center; ${ptn.status_id.toLowerCase().includes('completed') ? 'color: green;' : ''}">
            ${ptn.status_id}
          </td>
  
          <!-- Sample Collected At -->
          <td style="line-height: 10px; padding: 2px; vertical-align: middle; text-align: center">
            ${
              ptn.phlebotomist !== null ?
              `${this.timeSrvc.formatDateWithDiv(ptn.phlebotomist?.collected_at, '-', true)}`
              : ``
            }
          </td>
  
          <!-- Sample Collected By -->
          <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
            ${
              ptn.phlebotomist !== null ?
              `${ptn?.phlebotomist?.collected_by}`
              : ``
            }
          </td>
  
          <!-- Sample Received At -->
          <td style="line-height: 10px; padding: 2px; vertical-align: middle; text-align: center">
            ${
              ptn.phlebotomist !== null ?
              `${this.timeSrvc.formatDateWithDiv(ptn?.phlebotomist?.received_at, '-', true)}`
              : ``
            }
          </td>
  
          <!-- Sample Received By -->
          <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
            ${
              ptn.phlebotomist !== null ?
              `${ptn?.phlebotomist?.received_by}`
              : ``
            }
          </td>
  
          <!-- Report Result At -->
          <td style="line-height: 10px; padding: 2px; vertical-align: middle; text-align: center">
            ${
              ptn.labtechnician !== null ?
              `${this.timeSrvc.formatDateWithDiv(ptn?.labtechnician?.completed_at, '-', true)}`
              : ``
            }
          </td>
  
          <!-- Report Result By -->
          <td style="line-height: 10px; padding: 2px; vertical-align: middle;">
            ${
              ptn.labtechnician !== null ?
              `${ptn?.labtechnician?.report_created_by}`
              : ``
            }
          </td>
  
          <!-- Turnaround Time (TAT) -->
          <td style="line-height: 10px; padding: 2px; vertical-align: middle; text-align: center">
            ${ptn?.result || ''}
          </td>
        </tr>
      `;
    });
  
    // Close the tbody and table
    html += `
      </tbody>
    </table>
    `;
  
    // Return the generated HTML
    return html;
  }
  


}
