import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { PrintReportEndpoint } from './print-report.endpoint';
import { PrintReportEndpoint } from '../print-report/print-report.endpoint';
import { NgOtpInputModule } from 'ng-otp-input';
import { AlertService } from '@sharedcommon/service/alert.service';
import { NgModule } from '@angular/core';
import { NgIf } from '@angular/common';
import { PrintService } from '@sharedcommon/service/print.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-download-patient-receipt',
  standalone: true,
  imports: [],
  templateUrl: './download-patient-receipt.component.html',
})
export class DownloadPatientReceiptComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private endPoint: PrintReportEndpoint,
    private alertService: AlertService,
    private printSrvc: PrintService,
    private sanitizer: DomSanitizer
  ) {

  }

  patient_id: any;
  client_id: any;
  receipt_id: any;
  showReport: boolean = false;
  htmlData: any = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.client_id = params['c'];
      this.patient_id = params['p'];
      this.receipt_id = params['r']
      this.getReport();
    })
  }

  printReport() {
    this.printSrvc.print(this.htmlData);
  }

  getReport() {
    const model = {
      receipt_id: this.receipt_id,
      patient_id: this.patient_id,
      client_id: this.client_id
    }

    this.endPoint.getPatientReceipt(model).subscribe((data: any) => {
      this.showReport = true;

      if (data?.pdf) {
        this.downloadFile(data.pdf_base64, data.report_name);
       
        this.insertPdf(data.pdf_base64);
        // window.close();
      } else {
        this.htmlData = data.html_content;
        this.insertPrint(data);
      }




    }, (error: any) => {
      this.alertService.showError(error)
    })
  }


  insertPrint(data: any) {
    this.insertPrinter(this.printSrvc.retunrContent(data.html_content, data.header, data.letter_head_settings_content));
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



  insertPrinter(content: any) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'height: 200vh; width: 212mm');
    // iframe.setAttribute('style', 'width: 221mm;border: 1px solid #ccc;box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);margin: 20px auto;height: 80vh;');
    const printPage = document.getElementById('report');
    printPage!.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(content);
      // const report  = document.getElementById("report");
      // report?.appendChild()

    }
  }


  insertPdf(content: any) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', content);
    iframe.setAttribute('style', 'width: 100%; height: 100vh');
    const printPage = document.getElementById('report');
    printPage!.appendChild(iframe);

  }
}
