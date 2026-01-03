import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { FormBuilder, Validators } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { CKEditorComponent } from 'ckeditor4-angular';
import { PrintService } from '@sharedcommon/service/print.service';

@Component({
  selector: 'app-print-templates',
  templateUrl: './print-templates.component.html',
  styleUrl: './print-templates.component.css'
})

export class PrintTemplatesComponent extends BaseComponent<any> {
  ckEditorConfig: any = {

    toolbar: [
      ['Undo', 'Redo','Maximize','Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript',
      'Styles', 'Format', 'Font', 'FontSize','TextColor', 'BGColor','JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock','Table', 'HorizontalRule',
      'Print','Cut', 'Copy', 'Find', 'Replace', 'SelectAll', 'Scayt',
      'NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'CreateDiv',  'BidiLtr',
      'Image',  'Smiley', 'SpecialChar', 'PageBreak' ,
       'ShowBlocks','Source'
    ],
    ],
    allowedContent: true,
    uiColor: '#FFFFFF',
    height: '297mm',

  };;

  constructor(
    private endPoint: MasterEndpoint,
    private proEndPoint: ProEndpoint,
    public timeSrvc: TimeConversionService,
    injector: Injector,
    private formBuilder: FormBuilder,
    private capitalSrvc: CaptilizeService,
    private printSrvc: PrintService
  ) {
    super(injector);
  }

  templateTypes: any;
  inProgress: boolean = false;

  override ngOnInit(): void {
    this.getTypes()
    this.page_number = 1;
    this.page_size = 10;
    this.getData();
    this.initializeForm();
  }


  override ngAfterViewInit(): void {
    // Accessing the CKEditor iframe after it's loaded
    const iframe = document.querySelector(
      '.cke_wysiwyg_frame'
    ) as HTMLIFrameElement;

    if (iframe) {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDocument) {
        // Apply background color to the body element inside the iframe
        iframeDocument.body.style.backgroundColor = 'blue';
      }
    }
  }

  getTypes() {
    this.subsink.sink = this.proEndPoint.getPrintTemplatesTypes().subscribe((data: any) => {
      this.templateTypes = data.results;
    });
  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({
      name: [null, Validators.required],
      is_default: [true, Validators.required],
      print_template_type: [null, Validators.required]
    })
  }

  openXL(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop });
  }


  reportType: string = ""
  formatString(e: any, val: string = 'any') {
    if (val == 'name') {
      this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e));
    } else if (val === 'type') {
      this.reportType = this.capitalSrvc.capitalizeReturn(e)
    }
  }

  count!: number;
  all_count!: number;
  templates!: any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;

  page_size: any = 10;
  page_number: any = 1;
  query: string = "";
  printType: any = null

  showTerminal: boolean = false;
  selectedTemplate: any = "";


  getData() {
    this.templates = [] ;

    this.subsink.sink = this.endPoint.getPrintTemplates(
      this.page_size, this.page_number,
      this.query, this.printType
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.templates = data.results;
    })
  }

  selectType(e:any){
    this.printType = e;
    this.getData();
  }

  resetPage() {
    if(this.changesMade){
      this.openModal(this.warningModal)
    }else{
      this.query = "";

      this.showTerminal = false;
      this.createNew = false;
      this.changesMade = false;
      this.templates = [] ;
      this.getData();

    }
  }

  @ViewChild('warningModal') warningModal!: any;

  openModalWarning(content: any, sz:string = 'lg', cntrd:boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz,  centered: cntrd, backdropClass: backDrop, backdrop : 'static',  keyboard : false });
  }


  searchQuery(e: any) {
    this.query = e;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();

    }, 500); // Adjust the delay as needed
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
    this.page_number = 1;
    this.getData();
  }

  @ViewChild('ckeditor', { static: false }) ckeditor!: CKEditorComponent;
  @ViewChild('tagContainer') tagContainer!: ElementRef;
  isOverflowing: boolean = false
  checkOverflow() {
    const container = this.tagContainer.nativeElement;
    this.isOverflowing = container.scrollWidth > container.clientWidth;
  }

  showAll : boolean = false;
  addTextAtCursor(text:any){
    if (this.ckeditor) {
      const editorInstance = this.ckeditor.instance;
      editorInstance.insertHtml(text);
    } else {
      console.error('CKEditor component not initialized.');
    }
  }


  templateTypeData!: any;
  createNew: boolean = false;
  tags: any;
  showContent!: number;

  @ViewChild('devRich') devRich: any ;

  changeContent(e:any){
    if(this.showContent == 4){
      this.devRich?.saveReport(false);
      setTimeout(() => {
        this.showContent = e;
      }, 1000);
    }else{
      this.showContent = e;
    }


  }

  getTemplateData(rprt: any) {
    this.selectedTemplate = rprt;

    this.subsink.sink = this.proEndPoint.getPrintTemplatesTags(rprt.print_template_type.id).subscribe((data:any)=>{
      data.sort((a: any, b: any) => {
        return a.tag_name.localeCompare(b.tag_name);
      });
      this.tags = data;

    })
    
    this.subsink.sink = this.endPoint.getPrintDataTemplates(rprt.id).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      if (data.count !== 0) {
        this.showTerminal = true;
        this.showContent = 1;
        this.templateTypeData = data.results[0];
      } else {
        this.createNew = true;
        this.alertService.showError("Oops", "Can't Open this Template");
        this.templateTypeData = {
          data: "<div></div>",
          print_template: rprt.id
        }
      }
    })
  }

  changesMade : boolean = false;

  public ReportInput({ editor }: any) {
    this.changesMade = true;
    if(this.showContent == 1){
      this.templateTypeData.data = editor.getData();
    }else if(this.showContent == 2){
      this.templateTypeData.header = editor.getData();
    }else if(this.showContent == 3){
      this.templateTypeData.footer = editor.getData();
    }
  }


  saveRTF(e: any){
    this.templateTypeData.rtf_content = e.rtf_content;
    if(e.saveClose){
      this.UpdateTemplateData();
    }

  }

  getModel() {
    const model = {
      name: this.baseForm.get('name')?.value,
      is_default: this.baseForm.get('is_default')?.value,
      print_template_type: this.baseForm.get('print_template_type')?.value?.id || null,
    }
    return model;
  }


  saveTemplate() {
    if (this.baseForm.valid) {
      const model = this.getModel();
      this.subsink.sink = this.endPoint.postTemplateData(model).subscribe((dataRes: any) => {
        this.alertService.showSuccess("", `${this.baseForm.value.name} Added`);
        this.baseForm.reset();
        this.initializeForm();

        this.modalService.dismissAll();

        const model = {
          data: "<div></div>",
          header: "<div></div>",
          print_template: dataRes.id
        }

        this.subsink.sink =  this.endPoint.PostTemplateData(model).subscribe((res: any) => {
          this.getTemplateData(dataRes);
        }, (error) => {
          this.alertService.showError("", `Failed to update ${this.selectedTemplate.name} due to ${error}`);
        })
      }, (error) => {
        this.alertService.showError(`Oops Error in Added new template`)
      })
    }
  }

  UpdateTemplateData() {

    if(this.showContent == 4){
      this.devRich.saveReport(false);
      setTimeout(()=>{
        // this.updateTmpltData()
        this.getHeaderHeight() ;
      },1000)
    }else{
      // this.updateTmpltData()
      this.getHeaderHeight() ;
    }


  }


  getHeaderHeight(){
    const model = {
      id: this.templateTypeData.id,
      header: this.templateTypeData.header,
      data: this.templateTypeData.data,
      footer: this.templateTypeData?.footer,
      rtf_content: this.templateTypeData.rtf_content,
      print_template: this.templateTypeData.print_template.id,
      header_height: this.templateTypeData.header ? this.printSrvc.getHeight(this.templateTypeData.header) : this.templateTypeData.header_height
    }

    const headerModel = {
      header : this.templateTypeData.header,
      report_type : "fixed"
    }

    this.subsink.sink = this.endPoint.postPreviewForHeader(headerModel).subscribe((res: any)=>{
      if(res?.html_content){
        model.header_height = res.html_content ? this.printSrvc.getHeight(res.html_content) : this.templateTypeData.header_height
        this.updateTmpltData(model) ;
      }else{
        this.updateTmpltData(model) ;
      }
      
    }, (error)=>{
      this.updateTmpltData(model) ;
    })
  }

  updateTmpltData(model: any){


    this.subsink.sink = this.endPoint.UpdateTemplateData(model).subscribe((data: any) => {
      this.alertService.showSuccess("", `${this.selectedTemplate.name} Updated`);
      // this.selectedTemplate = "";
      // this.templateTypeData = ""
      // this.showTerminal = false;
      this.getData();
    }, (error) => {
      this.alertService.showError("", `Failed to update ${this.selectedTemplate.name} due to ${error?.error?.Error || error}`);
    })
  }

  updateDefault(item: any, e: any) {
    item.is_default = e;
    item.print_template_type = item.print_template_type.id
    this.subsink.sink = this.endPoint.updateTemplateData(item).subscribe((response: any) => {
      response.is_default ? this.alertService.showSuccess("Active", `${item.name}`) : ""
      !response.is_default ? this.alertService.showInfo("Inactive", `${item.name}`) : ""
      this.getData();
    }, (error) => {
      this.alertService.showError("Unable to update the default status");

      this.getData();
    })
  }

  saveTemplateData() {
    const model = {
      data: this.templateTypeData.data,
      print_template: this.templateTypeData.print_template
    }

    this.subsink.sink = this.endPoint.PostTemplateData(model).subscribe((data: any) => {
      this.alertService.showSuccess("", `${this.selectedTemplate?.name} Added`);
      this.selectedTemplate = "";
      this.templateTypeData = ""
      // this.showTerminal = false;
      this.createNew = false;
      this.resetPage();
    }, (error) => {
      this.alertService.showError("", `Failed to update ${this.selectedTemplate.name} due to ${error}`);
    })
  }

  saveType() {
    if (this.reportType !== "") {
      const model = {
        name: this.reportType
      }
      this.subsink.sink = this.endPoint.PostTemplateType(model).subscribe((data: any) => {
        this.alertService.showSuccess("", `${model.name} Added`);
        this.getTypes();
        this.reportType = "";

      }, (error) => {
        this.alertService.showError("", `Failed to Add ${model.name} due to ${error}`);
      })
    } else {
      this.alertService.showError("", "To add a report type, provide its name.")
    }

  }
}
