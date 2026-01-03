import { Component, Injector, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AppSelectComponent } from '@sharedcommon/components/select-component/app-select.component';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-user-collection',
  templateUrl: './user-collection.component.html',
  styleUrl: './user-collection.component.scss'
})

export class UserCollectionComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private printSrvc: PrintService,
    private proEndPoint: ProEndpoint,
    private staffEndpoint: StaffEndpoint,
    private cookieSrvc: CookieStorageService,
    private endPoint: PatientEndpoint,
  ) {
    super(injector)
  }

  datePickerMaxDate: any;
  selectStaff: any;
  reports: any;
  staffs: any = [];
  disableStaff!: boolean;
  shiftLoad: boolean = true;
  defaultStaff: any;
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

  override ngOnInit(): void {
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.staffs = [];
    this.getData();

    this.subsink.sink = this.staffEndpoint.getShiftReportsTemplates('all', 1, "").subscribe((data: any) => {
      this.reports = []
      this.reports = data.filter((d: any) => d.id != 4);
      this.reports.map((d: any) => {
        d.name = d.print_template_type.name
      })
      this.selectShirtReportTemplate(this.reports && this.reports.length !== 0 ? this.reports[0] : []);
      this.setToday();
    }, (error) => {
      this.shiftLoad = false;
    })

  }

  count!: number;
  all_count!: number;
  date: string = "";
  status_id: string = "";
  from_date: string = this.timeSrvc.getTodaysDate();
  to_date: string = "";
  timer: any;
  page_size!: any;
  page_number!: any;
  query!: string;
  sort: any = false;
  pageLoading: boolean = false;



  getData(selectAll: boolean = false) {
    this.staffs = [];
    this.selected_staffs_for_prints = [];
    this.pageLoading = true;
    this.subsink.sink = this.staffEndpoint.getUserCollectionsStaff(
      this.page_size,
      this.page_number,
      this.query,
      this.date,
      this.from_date,
      this.to_date
    ).subscribe((data: any) => {

      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.staffs = data.results;

      if (selectAll || this.SR_template || this.SR_template?.id == 5) {
        this.selectAllStaffs(true);
      }

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
        this.SR_start_date = e;
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
    this.SR_start_date = startDate;
    this.SR_end_date = endDate;
    this.date = "";
    this.page_number = 1;
    this.getData();
  }



  selectAllStaffs(e: any) {
    if (e) {
      this.selected_staffs_for_prints = this.staffs.map((doc: any) => doc.staff.id);
    } else {
      this.selected_staffs_for_prints = [];
    }
  }

  checkDoc(i: any) {
    return this.selected_staffs_for_prints?.includes(i);
  }

  Handle_print_report(e: any, item: any): void {
    if (e) {
      this.selected_staffs_for_prints.push(item.id);
    } else {
      this.selected_staffs_for_prints = this.selected_staffs_for_prints.filter((doc: any) => doc !== item.id);
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


  selected_staffs_for_prints: any = [];
  SR_start_date: any;
  SR_end_date: any;
  SR_staff: any;
  SR_template: any;
  title: string = "";
  viewPrintLoading: boolean = false;
  printLoading: boolean = false;

  setToday() {
    this.SR_start_date = this.timeSrvc.getTodaysDate();
    this.SR_end_date = ""
  }

  setYesterday() {
    this.SR_start_date = this.timeSrvc.getYesterdayDate();
    this.SR_end_date = ""
  }

  setSevenDays() {
    this.SR_start_date = this.timeSrvc.getLast7Days()?.startDate;
    this.SR_end_date = this.timeSrvc.getLast7Days()?.endDate;
  }

  selectShirtReportStaff(e: any) {
    this.SR_staff = e;
  }

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
    this.SR_template = e;

    if (e.id == 5) {
      this.SR_staff = {
        id: ""
      }


      this.page_size = this.all_count;
      this.page_number = 1;
      this.getData(true);

    } else {
      this.SR_staff = this.defaultStaff;
      this.selectAllStaffs(false)
    }

  }

  set_shiftReport_start_date(e: any) {
    this.SR_start_date = e.srcElement.value;
  }

  set_shiftReport_end_date(e: any) {
    this.SR_end_date = e.srcElement.value;
  }




  divData: any = "";
  print_content = '';
  xlsxFiles: any;
  counter: any = 0

  @ViewChild('reportModal') reportModal: any;
  async getShiftReport(print: boolean) {
    if (this.SR_template.id != 5) {
      if (this.SR_start_date && this.SR_template && this.selected_staffs_for_prints.length !== 0 && this.reportType) {

        this.divData = '';
        this.print_content = "";
        this.counter = 0;
        this.xlsxFiles = [];

        print ? this.viewPrintLoading = true : this.printLoading = true;
        for (const staffId of this.selected_staffs_for_prints) {
          try {
            await this.shiftReport(staffId);
          } catch (error) {
            console.error('Error fetching shift report:', error);
          }
        }

        this.title = this.SR_template.name + " "
        this.viewPrintLoading = false ;
        this.printLoading = false;
        if (this.counter != this.selected_staffs_for_prints.length) {
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
    } else {

      this.divData = '';
      this.print_content = "";
      this.counter = 0;
      print ? this.viewPrintLoading = true : this.printLoading = true;
      try {
        await this.shiftReport("");
      } catch (error) {
        // Handle error as needed
        console.error('Error fetching shift report:', error);
      }

      this.title = this.SR_template.name 
      this.viewPrintLoading = false ;
      this.printLoading = false;
      if (this.counter != this.selected_staffs_for_prints.length) {
        if(print){
        this.modalService.open(this.reportModal, { size: 'xl', centered: false, scrollable: true });
          this.insertPrint(this.print_content);
        }else{
          this.export()
        }
      }
    }

  }


  shiftReport(staffId: any): Promise<void> {
    return new Promise((resolve, reject) => {
      

      this.subsink.sink = this.endPoint.getShiftReport(
        staffId,
        this.SR_template.id,
        this.reportType,
        this.cookieSrvc.getCookieData().client_id,
        this.SR_start_date,
        this.SR_end_date
      ).subscribe(
        (data: any) => {
          // page-break-before: always;
          this.divData += data.html_content + "<div style='padding-top: 100px;'></div>";
          this.print_content = this.print_content + "<div class='border rounded-3 overflow-hidden bg-white'>" + data.html_content.replace(/#e6e8e6/g, "#c2ceff;") + "</div>" + "<div style='page-break-before: always;padding-top: 100px;'></div>";
          resolve(); // Resolve the promise when request is successful
        },
        (error) => {

          this.showReportError(staffId);
          this.counter++;
          reject(error); // Reject the promise on error
        }
      );
    });
  }


  printShiftReport() {
    const data = this.cookieSrvc.getCookieData();
    if (this.SR_start_date && this.SR_template && this.SR_staff) {

      this.printLoading = true;

      this.subsink.sink = this.endPoint.getShiftReport(
        this.SR_staff.id,
        this.SR_template.id,
        this.reportType,
        data.client_id,
        this.SR_start_date,
        this.SR_end_date
      ).subscribe((data: any) => {
        this.printLoading = false;


        this.title = `${this.SR_staff.name} | ${this.SR_template.name}`
        this.divData = data.html_content;
        this.printSrvc.printer(data.html_content, false, false)
      }, (error) => {
        this.counter += 1;
        this.showReportError(this.SR_staff.id);
      })

    } else {
      this.showErrors()
    }
  }

  showErrors() {
    this.selected_staffs_for_prints.length == 0 ? this.alertService.showError("Select a staff member to get a report", "") : "";
    !this.SR_template ? this.alertService.showError("Choose the Report", "") : "";
    !this.SR_start_date ? this.alertService.showError("Choose a Start Date to get Report", "") : ""
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
    this.alertService.showError(`Failed to get Reports ${this.staffs.find((s: any) => s.staff.id == staffId).staff.name} ${this.SR_template.name}`, "")
  }



}
