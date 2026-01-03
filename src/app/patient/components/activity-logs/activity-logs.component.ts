import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss'
})

export class ActivityLogsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private staffEndpoint: StaffEndpoint,
    public capitalSrvc: CaptilizeService,
    public timeSrvc: TimeConversionService,
    private printSrvc: PrintService
  ) { super(injector) }

  @Input() ptn: any;
  logSort: boolean = !false;
  logs: any;

  override ngOnInit(): void {
    this.getActivityLog();
  }

  sortLogs() {
    this.logSort = !this.logSort
    this.logs = this.logs.reverse();
  }

  getActivityLog() {
    this.logs = [];
    const model = {
      patient_id: this.ptn.id,
      page_number: 1,
      page_size: 'all',
      operation: ''
    }
    this.subsink.sink = this.staffEndpoint.getPatientActivityLogs(model).subscribe((data: any) => {
      if (this.logSort) {
        this.logs = data.reverse();
      } else {
        this.logs = data;
      }
    });
  }

  // utilities 

  dismiss(){
    this.modalService.dismissAll();
  }

  transformFieldName(fieldName: string): string {
    return fieldName.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  extractLastWord(input: string): string {
    const parts = input.split('/');
    const lastPart = parts[parts.length - 1];
    return this.transformFieldName(lastPart);
  }

  removeTimeZone(activity: string): string {
    const pattern = /\sin\s\d+(\.\d+)?\sseconds|\sin\s\d+(\.\d+)?\sseconds\)/;
    return activity.replace(pattern, '');
  }

  extractKeywords(activityString: any) {
    const keywords = activityString.toLowerCase().match(/\b(?:refunded|registered|sample collected|tests cancelled|package cancelled|booked|receipt|generated|cancelled|created|authorized)\b/g);
    if (keywords) {
      const inputString = this.capitalSrvc.capitalizeReturn(keywords.join(', '))
      const words = inputString.split(',').map(word => word.trim());

      // Filter out duplicate words
      const uniqueWords = words.filter((word, index) => words.indexOf(word) === index);
      return uniqueWords.join(', ');
    } else {
      return 'No keywords found';
    }
  }
  
  parseJSONObj(e: any) {
    try {
      return JSON.parse(e);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {}; // or any default value that fits your scenario
    }
  }

  isHtml(inputString: any) {
    const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
    return htmlTagPattern.test(inputString);
  }

  selectedHtml: any = "" ;
  insertPdf(modal: any, htmlContent: any) {
    this.openModal(modal, { size: "xl", centered: true})

    const settings = {
      header_height: "100",
      footer_height: "100",
      margin_left: "45.0",
      margin_right: "45.0",
      display_letterhead: false
    }

    this.selectedHtml = htmlContent ;
    let content = this.printSrvc.setMiniView(htmlContent, '', settings, '');
    const iframe = document.getElementById('disbaled_iframe') as any;
    iframe!.contentDocument.open();
    iframe!.contentDocument.write(content);
    iframe!.contentDocument.close();
  }

  



}
