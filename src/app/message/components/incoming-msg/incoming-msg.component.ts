import { Component, Inject, Injector, Input, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-incoming-msg',
  templateUrl: './incoming-msg.component.html',
  styleUrl: './incoming-msg.component.scss'
})


export class IncomingMsgComponent extends BaseComponent<any>{
  @Input() chat: any ;
  @Input() group: boolean = false;


  constructor(
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private sanitizer: DomSanitizer){ super(injector) }



  openedFile: any;
  safeUrl: any
  @ViewChild('viewImage') viewImage: any;
  @ViewChild('viewPdf') viewPdf: any;

  openFile(file: any, content: any) {
    this.openedFile = file.file_name;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(file.file);
    if (file.file_name.includes('.pdf')) {
      this.openXl(this.viewPdf, 'xl');
    } else if (file.file_name.includes('.jpg') || file.file_name.includes('.jpeg') || file.file_name.includes('.png')) {
      this.openXl(this.viewImage, 'xl');
    }
    // else if (file.file_name.includes('.xlsx') || file.file_name.includes('.docx')){
    //   this.openDocument(file.file);
    //   this.openXl(this.viewPdf, 'xl');
    // }
    else {
      this.alertService.showError("Can't Open this File")
    }

  }

  openDocument(base64Content: string) {
    const file = base64Content;
    let currentDocument = file;

    // const docxOptions = Object.assign(docx.defaultOptions, {
    //   className: "docx",
    //   inWrapper: true,
    //   ignoreWidth: false,
    //   ignoreHeight: false,
    //   ignoreFonts: false,
    //   breakPages: true,
    //   ignoreLastRenderedPageBreak: true,
    //   experimental: false,
    //   trimXmlDeclaration: true,
    //   useBase64URL: false,
    //   useMathMLPolyfill: false,
    //   renderChanges: false,
    //   renderHeaders: true,
    //   renderFooters: true,
    //   renderFootnotes: true,
    //   renderEndnotes: true,
    //   debug: false,
    // });

    // docxOptions.renderAsync(currentDocument, document.getElementById("container"), null, docxOptions)
    //   .then((x: any) => {

    //   });
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


  openXl(content: any, sz: any = '', cntr: boolean = false) {
    this.modalService.open(content, { size: sz  , centered: cntr})
  }

}
