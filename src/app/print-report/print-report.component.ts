import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrintReportEndpoint } from './print-report.endpoint';
import { NgOtpInputModule } from 'ng-otp-input';
import { AlertService } from '@sharedcommon/service/alert.service';
import { NgModule } from '@angular/core';
import { NgIf } from '@angular/common';
import { PrintService } from '@sharedcommon/service/print.service';
import { environment } from "src/environments/environment";
import { BaseComponent } from '@sharedcommon/base/base.component';
import { SharedModule } from '@sharedcommon/shared.module';

@Component({
  selector: 'app-print-report',
  templateUrl: './print-report.component.html',
  standalone: true,
  imports: [NgOtpInputModule, NgIf, SharedModule],
  styleUrl: './print-report.component.scss'
})
export class PrintReportComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private endPoint: PrintReportEndpoint,
    private printSrvc: PrintService,
    private router: Router,
  ) {
    super(injector)
  }

  // https://lab360.in/patient_report/?test_id=2271&client_id=29&mobile_number=

  test_id: any;
  client_id: any;
  mobile_number: any;
  otp: any;
  lh: any = '' ;

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '42px',
      'height': '42px',
      'padding': '5px',
      'border': '2px solid #ddd',
      'font-size': '16px',
      'margin-bottom': '25px',
      'fontFamily': "'DM Sans', sans-serif",
      'fontWeight': '900'
    }
  };

  override ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mobile_number = params['m'];
      this.client_id = params['c'];
      this.test_id = params['t'];
      this.lh=params['lh'];

      this.getReport()
    })
  }


  sendOTP() {
    const model = {
      mobile_number: this.mobile_number,
      client_id: this.client_id
    }

    this.endPoint.postOTP(model).subscribe((data: any) => {

    })
  }


  onOtpChange(otp: any) {
    this.otp = otp;
    if (this.otp.length === 4) {
      this.getReport();
    }
  }


  showReport: boolean = false;

  htmlData: any = '';


  printReport() {
    this.printSrvc.print(this.htmlData);
  }

  getReport() {
    const model = {
      test_id: this.test_id,
      client_id: this.client_id,
      lh: this.lh
    }

    this.showReport = true;

    this.subsink.sink = this.endPoint.getPatientReport(model).subscribe((data: any) => {
      this.showReport = false;
      if (data?.pdf) {
        this.downloadFile(data.pdf_base64, data.report_name);
        this.insertPdf(data.pdf_base64);
        // window.close();
      } else {
        this.htmlData = data.html_content;
        this.insertPrint(data);
      }


    }, (error) => {
      this.showReport = false;
      this.alertService.showError(error?.error?.Error || error?.error?.error || error)
    })


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



  insertPrint(data: any) {
    this.insertPrinter(this.printSrvc.retunrContent(data.html_content, data.header, data.letter_head_settings_content))
  }


  insertPrinter(content: any) {
    const iframe = document.createElement('iframe');
    iframe.style.margin = '20px auto';
    iframe.style.width = '221mm';
    iframe.style.height = '297mm';
    const printPage = document.getElementById('report');
    printPage!.appendChild(iframe);
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(content);
    iframe.contentDocument?.close();
  }

  insertPdf(content: any) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', content);
    iframe.setAttribute('style', 'width: 100%; height: 100vh');
    const printPage = document.getElementById('report');
    printPage!.appendChild(iframe);
  }

}
