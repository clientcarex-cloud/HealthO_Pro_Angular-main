import { Component, Injector, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AnalyticEndpoint } from '../../analytic.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { AppSelectComponent } from '@sharedcommon/components/select-component/app-select.component';

@Component({
  selector: 'app-test-wise',
  templateUrl: './test-wise.component.html',
})

export class TestWiseComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private printSrvc: PrintService,
    private endPoint: PatientEndpoint,
  ) {
    super(injector)
  }

  datePickerMaxDate: any;
  count: number = 1;
  all_count: number = 1;
  date: string = "";

  from_date: string = this.timeSrvc.getTodaysDate();
  to_date: string = this.timeSrvc.getTodaysDate();
  timer: any;
  page_size: any = 10;
  page_number: any = 1;
  query: string = "";
  sort: any = false;
  pageLoading: boolean = false;
  reports: any;
  tests: any = [] ;

  reportsTypes: any = [
    {
      id: 1,
      name: "Tests",
      value: "tests_details",
      action: "tests_print",
      title: "Tests Report - "
    },
    {
      id: 2,
      name: "Packages",
      value: "packages_details",
      action: "Package Report - "
    }
  ]

  override ngOnInit(): void {
    this.selectShirtReportTemplate(this.reportsTypes[0]);
  }

  getData() {
    this.tests = [];
    this.selected_items_for_prints = [];
    this.pageLoading = true;
    this.subsink.sink = this.endPoint.getTestWiseCollection(
      this.page_size, this.page_number, this.query,
      this.date, this.from_date,this.to_date == "" ? this.from_date : this.to_date, this.SR_template?.value, null
    ).subscribe((data: any) => {

      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.tests = data.results;

    }, (error)=>{
      this.showAPIError(error);
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

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.page_number = 1;
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
        this.date = "";
        this.from_date = e;
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
    this.page_number = 1;
    this.getData();
  }



  selectAllStaffs(e: any) {
    if (e) {
      this.selected_items_for_prints = this.tests.map((doc: any) => doc.id);
    } else {
      this.selected_items_for_prints = [];
    }
  }

  checkDoc(i: any) {
    return this.selected_items_for_prints?.includes(i);
  }

  Handle_print_report(e: any, item: any): void {
    if (e) {
      this.selected_items_for_prints.push(item.id);
    } else {
      this.selected_items_for_prints = this.selected_items_for_prints.filter((doc: any) => doc !== item.id);
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


  selected_items_for_prints: any = [];

  SR_template: any;
  title: string = "";
  viewPrintLoading: boolean = false;
  printLoading: boolean = false;


  @ViewChild(AppSelectComponent) selectComp!: AppSelectComponent

  reportType: any = "general";

  selectReportType(e: any) {
    if (e && e != '') {
      this.reportType = e.name.toLowerCase()
    } else {
      this.reportType = null;
    }
  }


  selectShirtReportTemplate(e: any) {
    this.SR_template = e && e!= '' ? e : this.alertService.showInfo("Select Atleast One Report.");
    if(this.SR_template) this.getData();
  }

  divData: any = "";
  print_content = '';
  xlsxFiles: any;
  counter: any = 0;

  @ViewChild('reportModal') reportModal: any;
  async getShiftReport(print: boolean) {
    if (this.from_date && this.SR_template && this.selected_items_for_prints.length !== 0) {

      this.divData = '';
      this.print_content = "";
      this.counter = 0;
      this.xlsxFiles = [];

      print ? this.viewPrintLoading = true : this.printLoading = true;

      try {
        await this.shiftReport();
      } catch (error) {
        console.error('Error fetching shift report:', error);
      }

    
      this.title = `${this.SR_template.title} ${this.from_date} to ${this.to_date == "" ? this.from_date : this.to_date}`
      this.viewPrintLoading = false ;
      this.printLoading = false;
      if (this.counter != this.selected_items_for_prints.length) {
        if(print){
          this.modalService.open(this.reportModal, { size: 'xl', centered: false, scrollable: true });
          this.insertPrint(this.print_content);
        }else{
          this.export()
        }
      }
    } else {
      this.showErrors();
    }

  }


  shiftReport(): Promise<void> {
    return new Promise((resolve, reject) => {
    
      this.subsink.sink = this.endPoint.getTestWiseCollection(
        this.page_size, this.page_number, this.query,
        this.date, this.from_date,this.to_date == "" ? this.from_date : this.to_date, this.SR_template?.action,
        this.selected_items_for_prints.join(",")
      ).subscribe((data: any) => {
  
        this.divData += data.html_content + "<div style='padding-top: 100px;'></div>";
        this.print_content = this.print_content + "<div class='border rounded-3 overflow-hidden bg-white'>" + data.html_content.replace(/#e6e8e6/g, "#c2ceff;") + "</div>" + "<div style='page-break-before: always;padding-top: 100px;'></div>";
        resolve(); 
  
      }, (error)=>{
        this.counter++;
        reject(error); 
        this.showAPIError(error);
      })
    });
  }

  showErrors() {
    this.selected_items_for_prints.length == 0 ? this.alertService.showError("Select atleast one test to get report.", "") : "";
    !this.SR_template ? this.alertService.showError("Choose the Report", "") : "";
    !this.from_date ? this.alertService.showError("Choose a Start Date to get Report", "") : ""
    !this.reportType ? this.alertService.showError("Choose one type", "") : ""
  }

  insertPrint(content: any) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'height: 80vh;background-color: #F8FAFC;width: 100%; overflow: auto;');
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
  <body style="background-color: #F8FAFC;" class="rounded-3 overflow-auto pt-3">
  
  `

footer= `
</body>

</html>
`


  print() {
    this.printSrvc.printZeroWithBootstrap(this.divData);
  }

  export() {
    this.printSrvc.exportToExcel(this.divData, this.title)
  }

  downloadFile(base64String: any, fileName: any) {
    const linkSource = base64String;
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = '_self';
    downloadLink.download = fileName;
    downloadLink.click();
  }


  showReportError(staffId: any) {
    this.viewPrintLoading = false;
    this.printLoading = false;
    this.alertService.showError(`Failed to get Reports ${this.tests.find((s: any) => s.staff.id == staffId).staff.name} ${this.SR_template.name}`, "")
  }



}
