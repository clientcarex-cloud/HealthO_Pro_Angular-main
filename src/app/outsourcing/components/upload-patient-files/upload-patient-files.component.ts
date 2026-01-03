import { Component, Injector, Input, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { FileService } from '@sharedcommon/service/file.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-upload-patient-files',
  templateUrl: './upload-patient-files.component.html',
  styleUrl: './upload-patient-files.component.scss'
})

export class UploadPatientFilesComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: OutsourcingEndpoint,
    public timeSrvc: TimeConversionService,
    private fileSrvc: FileService,
    private sanitizer: DomSanitizer,
  ){ super(injector) };


  @Input() patient: any ;

  selected_tests: any = [] ;

  uploaded_files: any = [] ;

  override ngOnInit(): void {
    this.getFiles()
  }

  override ngOnDestroy(): void {
    this.patient = null ;
  }

  getFiles(){
    this.subsink.sink = this.endPoint.getPatientTestFiles(this.patient.id).subscribe((res: any)=>{
      this.uploaded_files = res ;
    })
  }



  postFile(model: any){
    this.subsink.sink = this.endPoint.postTestFile(model).subscribe((res: any)=>{
      this.alertService.showSuccess("File Uploaded.");

      this.getFiles() ;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error );
    })
  }

  // utilities 

  concatenateShortCodes(item:any) {
    let shortForm = ''
    if(item.length > 0){
      item.forEach((test:any)=>{
        shortForm += test.name + ', '
      })
    }

    return shortForm.slice(0, -2)
  }

  isTestAdded(test: any){
    return this.selected_tests.includes(test.id) ;
  }

  manageTest(value: any, test: any){
    if(value){
      this.selected_tests.push(test.id) ;
    }else{
      this.selected_tests = this.selected_tests.filter((t: any)=> t.id != test.id) ;
    }
  }

  selectAllFiles(value : any){
    this.selected_tests = [] ;
    if(value){
      this.patient.lab_tests.forEach((test: any)=> this.selected_tests.push(test.id))
    }
  }

  onFileChanged(event: any){
    this.fileSrvc.convertToBase64(event.target.files[0]).then((base64: any)=>{
      const model= {
        patient : this.patient.id,
        tests: this.selected_tests,
        pdf_file: base64
      } ;
 
      this.postFile(model) ;
 
    })
  }


  bulkSelect(file: any){
    if(this.selected_tests.length > 0){
      file?.click() ;
    }else{
      this.alertService.showInfo("Select Tests and Upload.")
    }
  }


  openedFile: any;
  selected_file: any = '' ;
  safeUrl: any
  @ViewChild('viewImage') viewImage: any;
  @ViewChild('viewPdf') viewPdf: any;

  openFile(file_name: any, pdf_file: any) {
    this.openedFile = file_name;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdf_file);
  
    this.selected_file = pdf_file ;

    // Check if pdf_file is a base64 encoded string
    const isBase64 = (str: string) => {
      const base64Pattern = /^data:(application\/pdf|image\/(jpeg|png));base64,/;
      return base64Pattern.test(str);
    };
  
    if (isBase64(pdf_file) || pdf_file.includes('pdf') || pdf_file.includes('html')) {

      this.openModal(this.viewPdf, { size: 'xl' });

    } else if (pdf_file.includes('jpg') || pdf_file.includes('jpeg') || pdf_file.includes('png')) {

      this.openModal(this.viewImage, { size: 'xl' });

    } else {
      this.downloadFile(pdf_file, file_name || this.patient.name)
      this.alertService.showError("Can't Open this File");
    }
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
  
  getFileIconClass(base64String: string): string {
    // Check if the string starts with a valid data URL prefix
    const matches = base64String.match(/^data:([^;]+);base64,/);
    if (matches) {
      const mimeType = matches[1];
  
      // Determine the icon class based on the MIME type
      switch (mimeType) {
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return 'ri-file-excel-2-line fs-1';
        case 'application/pdf':
          return 'ri-file-pdf-line fs-1';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'ri-file-word-line fs-1';
        case 'image/png':
        case 'image/jpeg':
        case 'image/gif':
        case 'image/bmp':
          return 'ri-image-line fs-1';
        case 'text/html':
          return 'ri-html5-line fs-1';
        default:
          return 'ri-file-line fs-1'; // Default icon for unknown types
      }
    }
    return 'ri-file-line fs-1'; // Fallback for non-base64 strings
  }

  getFileExtension(base64String: string): string {
    // Check if the string starts with a valid data URL prefix
    const matches = base64String.match(/^data:([^;]+);base64,/);
    if (matches) {
      const mimeType = matches[1];
  
      // Determine the file extension based on the MIME type
      switch (mimeType) {
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return '.xls';
        case 'application/pdf':
          return '.pdf';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return '.doc';
        case 'image/png':
          return '.png';
        case 'image/jpeg':
          return '.jpg';
        case 'image/gif':
          return '.gif';
        case 'image/bmp':
          return '.bmp';
        case 'text/html':
          return '.html';
        default:
          return ''; // Return empty for unknown types
      }
    }
    return ''; // Fallback for non-base64 strings
  }
  
  

}
