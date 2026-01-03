import { Component, Injector, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from '../../endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PatientEndpoint } from '../../endpoints/patient.endpoint';
import { AppSelectComponent } from '@sharedcommon/components/select-component/app-select.component';

@Component({
  selector: 'app-shift-report',
  templateUrl: './shift-report.component.html',
  styleUrl: './shift-report.component.scss'
})
export class ShiftReportComponent extends BaseComponent<any> {


  @Input() showDropdownContainer : boolean = true;

  constructor(
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private printSrvc: PrintService,
    private proEndPoint: ProEndpoint,
    private staffEndpoint: StaffEndpoint,
    private cookieSrvc: CookieStorageService,
    private endPoint: PatientEndpoint,
  ){
    super(injector)
  }

  datePickerMaxDate: any;
  selectStaff: any ;
  reports: any;
  staffs: any;
  disableStaff!: boolean ;
  shiftLoad: boolean = true;
  defaultStaff : any ;
  reportsTypes: any = [
    {
      id: 1,
      name: "General"
    },
    {
      id: 1,
      name: "Transactions",
    }
  ]


  override ngAfterViewInit(): void {

  }

  override ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.datePickerMaxDate = today;

 

    this.subsink.sink = this.staffEndpoint.getAllStaff().subscribe((data:any)=>{
      const staff = data.find((d:any)=> d.id == this.cookieSrvc.getCookieData().lab_staff_id);
      this.staffs = data;
      this.shiftLoad = true
      this.selectStaff = staff;
      this.SR_staff = staff;
      this.defaultStaff = staff;
      this.setToday();
      this.selectReportType(this.reportsTypes[0])
      this.subsink.sink = this.staffEndpoint.getShiftReportsTemplates('all',1,"").subscribe((data:any)=>{
        this.reports = []

        if(this.selectStaff.is_superadmin){
          this.shiftLoad = false;
          this.reports = data;

        }else{
          this.shiftLoad = false;
          data.forEach((d:any)=>{
            d.print_template_type.name == "User Collection - Shift Wise Report" ? this.reports.push(d) : ""
          })
        }

        this.selectShirtReportTemplate(this.reports && this.reports.length!==0 ? this.reports[0] : [])
      }, (error)=>{
        this.shiftLoad = false;
      })
    }, (error)=>{
      this.shiftLoad = false;
    })


  }
  
  
  SR_start_date: any ;
  SR_end_date: any;
  SR_staff: any ;
  SR_template: any;
  title: string = "";
  viewPrintLoading : boolean = false;
  printLoading : boolean = false;

  setToday(){
    this.SR_start_date = this.timeSrvc.getTodaysDate();
    this.SR_end_date = ""
  }

  setYesterday(){
    this.SR_start_date = this.timeSrvc.getYesterdayDate();
    this.SR_end_date = ""
  }

  setSevenDays(){
    this.SR_start_date = this.timeSrvc.getLast7Days()?.startDate;
    this.SR_end_date = this.timeSrvc.getLast7Days()?.endDate;
  }

  selectShirtReportStaff(e:any){
    this.SR_staff = e;
  }

  @ViewChild(AppSelectComponent) selectComp!: AppSelectComponent

  reportType = null
  selectReportType(e: any){
    if(e && e!=''){
      this.reportType = e.name.toLowerCase()
    }else{
      this.reportType = null;
    }
  }

  selectShirtReportTemplate(e:any){
    this.SR_template = e;

    if(e.id==5){
      this.SR_staff = {
        id : ""
      }
    }else{
      this.SR_staff = this.defaultStaff
    }
    
  }

  set_shiftReport_start_date(e:any){
    this.SR_start_date = e.srcElement.value;
  }

  set_shiftReport_end_date(e:any){
    this.SR_end_date = e.srcElement.value;
  }



  divData: any = "";

  @ViewChild('reportModal') reportModal: any;

  getShiftReport(){
    const data = this.cookieSrvc.getCookieData();
    if(this.SR_start_date && this.SR_template && this.SR_staff && this.reportType){
      this.viewPrintLoading =  true ;

        this.subsink.sink = this.endPoint.getShiftReport(
          this.SR_staff.id,
          this.SR_template.id,
          this.reportType,
          data.client_id,
          this.SR_start_date,
          this.SR_end_date
        ).subscribe((data:any)=>{
          this.viewPrintLoading  = false;
          this.divData = data.html_content;
          
          if(this.SR_template.id != 5){
            this.title = `${this.SR_staff.name} | ${this.SR_template.name}`;
          }else{
            this.title = `${this.SR_template.name}`;
          }
          
          this.modalService.open(this.reportModal,{ size: 'xl', centered:false, scrollable : true});
          this.insertPrint(data.html_content);
        }, (error)=>{
          this.showReportError();
        })

    }else{
      this.showErrors();
    }
  }

  printShiftReport(){
    const data = this.cookieSrvc.getCookieData();
    if(this.SR_start_date && this.SR_template && this.SR_staff){

      this.printLoading = true ;

        this.subsink.sink = this.endPoint.getShiftReport(
          this.SR_staff.id,
          this.SR_template.id,
          this.reportType,
          data.client_id,
          this.SR_start_date,
          this.SR_end_date
        ).subscribe((data:any)=>{
          this.printLoading = false;
          this.title = `${this.SR_staff.name} | ${this.SR_template.name}`
          this.divData = data.html_content;
          
          // this.printSrvc.printWithoutHeaderFooter(data.html_content);
          this.printSrvc.printer(data.html_content, false, false)
        }, (error)=>{
          this.showReportError();
        })

    }else{
      this.showErrors()
    }
  }

  showErrors(){
    !this.SR_staff ? this.alertService.showError("Select a staff member to get a report","") : "";
    !this.SR_template ? this.alertService.showError("Choose the Report","") : "";
    !this.SR_start_date ? this.alertService.showError("Choose a Start Date to get Report","") : ""
    !this.reportType ? this.alertService.showError("Choose one type","") : ""
  }

  insertPrint(content: any) {
    const iframe = document.createElement('iframe');
    iframe.style.height = '80vh'
    iframe.setAttribute('style', 'margin: 20px auto;height: 80vh; ');
    const printPage = document.getElementById('report');
    printPage!.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
        iframeDoc.write(content);
    }
}


header = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Your Page Title</title>
    <!-- Google Font -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
        }
    </style>
</head>
<body>
`


  print(){
    // const table = document.getElementById('custom-table');
    // table?.classList.add("table")
    // this.printSrvc.printWithoutHeaderFooter(this.divData);
    this.printSrvc.printer(this.divData, false, false);
  }

  showReportError(){
    this.viewPrintLoading = false;
    this.printLoading = false;
    this.alertService.showError(`Failed to get Reports ${this.SR_staff.name} ${this.SR_template.name}`,"")
  }



}
