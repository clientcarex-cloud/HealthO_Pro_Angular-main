import { Component, Injector, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-executives',
  templateUrl: './executives.component.html',
  styleUrl: './executives.component.scss'
})

export class ExecutivesComponent extends BaseComponent<any>{


  constructor(
    private staffEndpoint: StaffEndpoint,
    injector: Injector,
    private cookieSrvc: CookieStorageService,
    public capitalSrvc : CaptilizeService,
    public timeSrvc: TimeConversionService,
    public printSrvc: PrintService,
    private router : Router,
  ) { super(injector) }

  @Input() analyticsShow: boolean = false ;

  @ViewChild('reportModal') reportModal: any;

  inProgress: boolean = false;
  pageNum! : number | null;
  users:any = [];

  override ngAfterViewInit(): void {

  }


  override ngOnInit(): void {

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.query = "";
    this.date = this.timeSrvc.getTodaysDate();
    this.staffs = [];
    this.getData();

  }


  datePickerMaxDate: any;
  count!: number ;
  all_count!: number;
  staffs!:any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any; 
  page_size!: any ;
  page_number! : any;
  query!:string;
  sort : any = false;
  pageLoading: boolean = false;

  getData(){
    this.staffs = [];

    this.pageLoading = true;
    this.subsink.sink = this.staffEndpoint.getPaginatedStaff(
      this.page_size, this.page_number,
        this.query, this.sort, '&role=MarketingExecutive'
        ).subscribe((data:any)=>{
        
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.staffs = data.results ;
      this.dataEmployee[0].count = data.count;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error) ;
    })
  }


  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
      
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e:any){
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData()
  }

  onPageChange(e:any){
    this.page_number=e;
    this.getData();
  }

  getRangeValue(e:any){
    if(e.length !== 0){
      if(e.includes("to")){
        this.separateDates(e);
      }else{
        this.date = e;
        this.from_date = "";
        this.to_date = "" ;
        // this.page_number = 1;
        // this.getData();
      }}
      else{
        this.date = "";
        this.from_date = "";
        this.to_date = "";
        // this.page_number = 1;
        // this.getData();
      }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate ;
    this.date = "";
    // this.page_number = 1;
    // this.getData();
  }

  formatString(e:any,val:any){
    this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
  
  calculateDaysBack(dateString: string): string {
    const currentDate = new Date();
    const inputDate = new Date(dateString);
  
    // Calculate the difference in milliseconds
    const differenceMs = currentDate.getTime() - inputDate.getTime();
  
    // Calculate the difference in days
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
  
    // Return the result based on the difference
    if (differenceDays === 0) {
      return 'Today';
    } else if (differenceDays === 1) {
      return 'Yesterday';
    } else if (differenceDays <= 7) {
      return `${differenceDays} days ago`;
    } else if (differenceDays <= 30) {
      const weeksAgo = Math.floor(differenceDays / 7);
      return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
    } else if (differenceDays <= 90) {
      return 'One month ago';
    } else if (differenceDays <= 365) {
      const monthsAgo = Math.floor(differenceDays / 30);
      return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
    } else {
      const yearsAgo = Math.floor(differenceDays / 365);
      return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
    }
  }

  dataEmployee = [
    {label: 'Employees', count:0},
    {label: 'Total Present', count:0},
    {label: 'Total Absent', count: 0 },
    {label: 'Total Users', count: 0 },
  ]

  showStaff(id:any){
    this.router.navigate(['/marketingexecutive/view/'], { queryParams: {s_id: id}});
  }

  toggleAccess(staff:any, e: any){

    if(!e && staff.is_superadmin){
      staff.is_superadmin = false;
    }

    const model ={
      client: this.cookieSrvc.getCookieData().client_id,
      lab_staff : staff.id
    }

    this.subsink.sink = this.staffEndpoint.toggleAccess(model).subscribe((res:any)=>{
      res['user_tenant.isactive'] ?  this.alertService.showSuccess("Active", staff.name ) : this.alertService.showInfo("Inactive", staff.name);
    },(error)=>{
      this.alertService.showError(error);
      staff.is_login_access = !e;
    })

  }

  selectedItem: any ;

  openMap(content: any, item:any, is_start: any, showRoute: boolean){  
    this.selectedItem = item ;
    if(this.selectedItem?.last_seen && this.selectedItem?.last_seen?.latitude_at_last_seen && this.selectedItem?.last_seen?.longitude_at_last_seen){
      this.selectedItem['is_start'] = is_start ;
      this.selectedItem['showRoute'] = showRoute ;
      if(is_start){
        this.selectedItem['locations'] = [this.selectedItem?.last_seen?.latitude_at_last_seen, this.selectedItem?.last_seen?.longitude_at_last_seen]
      }else{
        this.selectedItem['locations'] = [this.selectedItem.latitude_at_end, this.selectedItem.longitude_at_end]
      }
  
      if(showRoute){
        this.selectedItem['locations'] = [this.selectedItem.latitude_at_start, this.selectedItem.longitude_at_start, this.selectedItem.latitude_at_end, this.selectedItem.longitude_at_end]
      }
      this.openModal(content, { size: 'xl', centered: true });
    }else{
      this.alertService.showInfo(`No Last Seen Reported for ${item.name}`)
    }
  }



  selectAllCompletedTrue: boolean = false;
  selected_docs_for_prints: any = [];

  title: string = "";
  viewPrintLoading: boolean = false;
  printLoading: boolean = false;

  divData: any = '';
  excel_files: any = [];

  checkDoc(i: any) {
    return this.selected_docs_for_prints.includes(i);
  }

  selectAllDocs(e: any) {

    if (e) {
      this.selected_docs_for_prints = this.staffs.map((doc: any) => doc.id);
    } else {
      this.selected_docs_for_prints = [];
    }

  }


  Handle_print_report(e: any, item: any): void {

    if (e) {
      this.selected_docs_for_prints.push(item.id);
    } else {
      this.selected_docs_for_prints = this.selected_docs_for_prints.filter((doc: any) => doc !== item.id);
    }

  }


  printAllReports(print: boolean) {
    if ((this.date || (this.from_date || this.to_date)) && this.selected_docs_for_prints.length !== 0) {

      let print_content: any = "";

      this.divData = "";
      this.excel_files = [];

      const doctors = this.selected_docs_for_prints.join(',')

      this.title = "Executive Report " + this.from_date + " to " + this.to_date;

      if(this.to_date){
        this.title = "Executive Report " + this.from_date + " to " + this.to_date;
      }else{
        this.title = "Executive Report " + ( this.from_date || this.date )
      }

      this.subsink.sink = this.staffEndpoint.getExecutiveReports(doctors, this.date, this.from_date, this.to_date).subscribe((data: any) => {

        this.divData += data.html_content +  "<div style='padding-top: 100px;'></div>"

        print_content = print_content + "<div class='border rounded-3 overflow-hidden bg-white'>" + data.html_content.replace(/#e6e8e6/g, "#c2ceff;") + "</div>" + "<div style='page-break-before: always;padding-top: 100px;'></div>";

        this.excel_files.push(data.html_content);

        this.printLoading = false;
        this.viewPrintLoading = false;

        if (print) {
          this.modalService.open(this.reportModal, { size: 'xl', centered: true, scrollable: false });
          this.insertPrint(print_content);
        } else {
          this.export()
        }

      }, (error) => {

        this.alertService.showError(error.error.Error)
        this.printLoading = false;
        this.showReportError();
      },)

    } else {
      this.selected_docs_for_prints.length === 0 ? this.alertService.showInfo("Select atleast one executive.") : null;

      // !this.from_date ? this.alertService.showInfo("Select Start Date") : null;
      // !this.to_date ? this.alertService.showInfo("Select End Date") : null;
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

  export() {
    this.printSrvc.exportToExcel(this.divData, this.title || 'download')
  }

  print() {
    this.printSrvc.printZeroWithBootstrap(this.divData);
  }

  showReportError() {
    this.viewPrintLoading = false;
    this.printLoading = false;
    this.alertService.showError(`Failed to get Reports`, "")
  }


  

  header = `
  <!DOCTYPE html>
  <html>
  
  <head>
    <title>Page Title</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">
  </head>
  <style>
  .inter-font {
    font-family: "Nunito", sans-serif;
    font-style: normal;
    font-weight: 500px;
    font-size: 13px !important;
  }
  </style>
  <body style='background-color: #F8FAFC;' class="rounded-3 overflow-auto pt-2">
  
  `

  footer= `
  </body>
  
  </html>
  `

}
