import { Component, ElementRef, Output, EventEmitter, Input, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { create, createOptions, RichEdit, ViewType, RichEditUnit, 
  DocumentFormat, Margins, InsertTabItemId, PageLayoutTabItemId } from 'devexpress-richedit';
import { Options, RibbonTabType, FileTabItemId, HomeTabItemId, RibbonItem } from 'devexpress-richedit';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';

@Component({
  selector: 'app-dev-rich',
  templateUrl: './dev-rich.component.html',
})

export class DevRichComponent extends BaseComponent<any> {

  @Output() extractedContentChange = new EventEmitter<any>();
  @Output() fullscreenClicked = new EventEmitter<any>();

  @Input() content: any;
  @Input() rtf_content: any;
  @Input() loadRTF: boolean = false;
  @Input() showHeader: boolean = false;
  @Input() patient: any;
  @Input() autoSave: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() header_to_diplay_in_every_page: any = "";
  @Input() fullScreen: boolean = false;

  @Input() sampleSignature = "";

  private rich: RichEdit | null = null;

  settings: any = {
    header_height: 0,
    footer_height: 0,
    margin_left: 45,
    margin_right: 45,
    display_page_no: false,
    display_letterhead: false,
    letterhead: '#fff',
    font: null
  };

  bg_img: any = '#fff';
  

  constructor(
    injector: Injector,
    private element: ElementRef,
    private masterEndpoint: MasterEndpoint,
    private cookieSrvc: CookieStorageService,
    private timeSrvc: TimeConversionService,
    private printSrvc: PrintService,
    private spinner: NgxSpinnerService,
  ) { super(injector) }

  override ngOnDestroy() {
    if (this.rich) {
      this.rich.dispose();
      this.rich = null;
    }
  }

  override ngOnInit(): void {

    this.spinner.show();

    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((set: any) => {
      
      this.settings.header_height = set[0].header_height;
      this.settings.footer_height = set[0].footer_height;
      this.settings.margin_left = set[0].margin_left;
      this.settings.margin_right = set[0].margin_right;
      this.settings.display_letterhead = set[0].display_letterhead;

      this.settings.display_page_no = set[0].display_page_no;
      this.bg_img = set[0]?.letterhead;

      if(set[0].letterhead && set[0].letterhead == ''){
        this.settings.letterhead = set[0].letterhead;
        this.bg_img = set[0].letterhead;
      }

      if(this.isDisabled){
        this.preview_by_frame();
      }else{
        this.setContent();
      }

      this.spinner.hide();
    });

  }

  override ngAfterViewInit(): void {


  }

  setContent() {
    // the createOptions() method creates an object that contains RichEdit options initialized with default values
    const options = createOptions();

    this.ribbonCustomization(options)

    options.confirmOnLosingChanges = {enabled: false};
    
    options.unit = RichEditUnit.Centimeter;
    options.view!.viewType = ViewType.PrintLayout;
    options.events.saving = (e) => { this.saveReport() };
  

    options.events.documentLoaded = (e) =>{ 
      if(this.rich){

        this.setMargins(null);
        
        if(this.showHeader){
          this.insertHeader();
        }

        if (this.rtf_content) {
          this.insertContent(this.rtf_content);
        }

        this.rich!.history.clear();

      }

     }

    if (this.autoSave) {
      options.events.documentChanged = (e) => {
        this.saveReport()
      }
    }

    options.readOnly = false;
    options.width = '100%';
    options.height = this.fullScreen ? '100%' : '75vh';

    this.rich = create(this.element.nativeElement.firstElementChild, options);

    var blankDocument = "e1xydGYxXGRlZmYwe1xmb250dGJse1xmMCBDYWxpYnJpO319e1xjb2xvcnRibCA7XHJlZDBcZ3JlZW4wXGJsdWUyNTUgO317XCpcZGVmY2hwIFxmczIyfXtcc3R5bGVzaGVldCB7XHFsXGZzMjIgTm9ybWFsO317XCpcY3MxXGZzMjIgRGVmYXVsdCBQYXJhZ3JhcGggRm9udDt9e1wqXGNzMlx1bFxmczIyXGNmMSBIeXBlcmxpbms7fXtcKlx0czNcdHNyb3dkXGZzMjJccWxcdHN2ZXJ0YWx0XGNsdHhscnRiIE5vcm1hbCBUYWJsZTt9fXtcKlxsaXN0b3ZlcnJpZGV0YWJsZX17XGluZm99XG5vdWljb21wYXRcc3BseXR3bmluZVxodG1hdXRzcFxleHBzaHJ0blxzcGx0cGdwYXJcZGVmdGFiNzIwXHNlY3RkXG1hcmdsc3huMzc1XG1hcmdyc3huMzc1XG1hcmd0c3huMFxtYXJnYnN4bjIxNzVcaGVhZGVyeTE4NzVcZm9vdGVyeTcyMFxwZ3dzeG4xMTkwN1xwZ2hzeG4xNjgzOVxjb2xzMVxjb2xzeDcyMFxwYXJkXHBsYWluXHFsXGZzMjJcY2YwXHBhcn0="

    if (this.showHeader) {
      this.rich.openDocument(blankDocument, "HealthOPro", DocumentFormat.Rtf);
    } else {
      this.rich.openDocument(blankDocument, "HealthOPro", DocumentFormat.Rtf);
    }

  }

  insertHeader() {
    const firstSection = this.rich?.document.sections.getByIndex(0);
  
    if (firstSection) {
      const header = firstSection.getHeader();
      if (header) {
        this.rich!.beginUpdate();
        header.deleteText({
          start: 0,
          length: header.length
      })
        header.insertHtml(0, this.header_to_diplay_in_every_page || '');

        this.rich!.endUpdate();
        this.rich!.history.clear();

      }
    } else {
      console.log('First section not found.');
    }

  }

  setRtfHeader(patient: any = this.patient) {
    this.blankDocumentWithHeader = this.changeRtf(this.blankDocumentWithHeader, patient?.LabPatientTestID?.patient?.name, "\\{PATIENTNAME\\}");
    this.blankDocumentWithHeader = this.changeRtf(this.blankDocumentWithHeader, patient?.LabPatientTestID?.patient?.title, "\\{TITLE\\}");
    this.blankDocumentWithHeader = this.changeRtf(this.blankDocumentWithHeader, patient.LabPatientTestID?.patient.gender, "\\{GENDER\\}")
    this.blankDocumentWithHeader = this.changeRtf(this.blankDocumentWithHeader, patient?.LabPatientTestID?.patient?.ULabPatientAge == 'DOB' ? patient?.LabPatientTestID?.patient?.dob : patient?.LabPatientTestID?.patient?.age, "\\{AGE\\}")
    this.blankDocumentWithHeader = this.changeRtf(this.blankDocumentWithHeader, patient.LabPatientTestID?.patient?.referral_doctor ? patient.LabPatientTestID?.patient?.referral_doctor : 'SELF', "\\{REFERRALDOCTOR\\}");
    this.blankDocumentWithHeader = this.changeRtf(this.blankDocumentWithHeader, patient.LabPatientTestID?.patient?.visit_id, "\\{VISITID\\}");
    this.blankDocumentWithHeader = this.changeRtf(this.blankDocumentWithHeader, this.timeSrvc.decodeTimestamp(patient.LabPatientTestID?.patient?.added_on, true), "\\{REGDATE\\}");
  }


  private setMargins(rtfText: string | null): void {

  this.rich?.beginUpdate();

   var documentSection = this.rich!.document.sections.getByIndex(0);

    var marginSizeTop = this.rich!.unitConverter.pixelsToTwips(parseInt(this.settings.header_height));
    var marginSizeFooter = this.rich!.unitConverter.pixelsToTwips(parseInt(this.settings.footer_height));
    var marginSizeLeft = this.rich!.unitConverter.pixelsToTwips(parseInt(this.settings.margin_left));
    var marginSizeRight = this.rich!.unitConverter.pixelsToTwips(parseInt(this.settings.margin_right));

    documentSection!.headerOffset = marginSizeTop;
    documentSection!.footerOffset = 0;
    this.rich!.document.sections.getByIndex(0)!.margins = new Margins(marginSizeLeft, marginSizeRight, 0, marginSizeFooter)

    if (rtfText) {
      this.insertContent(rtfText);
      this.rich!.history.clear();
    }

    this.rich?.endUpdate();

  }


  changeContent(rtfText: any){

    this.rich?.document.deleteText({
      start:0,
      length : this.rich?.document.length
    })

    this.insertContent(rtfText);
  }

  insertContent(content: any){
    this.rich!.beginUpdate();
    this.rich!.history.beginTransaction();

    this.rich?.document.subDocuments.main.insertRtf(-1, content);

    this.rich!.history.endTransaction();
    this.rich!.endUpdate();
  }

  insertSignature(content:any = this.sampleSignature){
    this.rich!.beginUpdate();
    this.rich!.history.beginTransaction();

    this.rich?.document.subDocuments.main.insertHtml(this.rich?.document.subDocuments.main.length, content);

    this.rich!.history.endTransaction();
    this.rich!.endUpdate();
  }

  removeTabs(options: Options) {

    // remove items
    const fileTab: any = options.ribbon.getTab(RibbonTabType.File);
    const homeTab: any = options.ribbon.getTab(RibbonTabType.Home);
    const insertTab: any = options.ribbon.getTab(RibbonTabType.Insert);
    const PageLayout: any = options.ribbon.getTab(RibbonTabType.PageLayout);
    const mailMerge: any = options.ribbon.getTab(RibbonTabType.MailMerge);
    const viewTab: any = options.ribbon.getTab(RibbonTabType.View);



    fileTab.removeItem(FileTabItemId.CreateNewDocument);
    fileTab.removeItem(FileTabItemId.PrintDocument);
    fileTab.removeItem(FileTabItemId.Download);
    fileTab.removeItem(FileTabItemId.OpenDocument);


    homeTab.removeItem(HomeTabItemId.ClearFormatting);
    homeTab.removeItem(HomeTabItemId.ToggleShowHiddenSymbols);
    homeTab.removeItem(HomeTabItemId.SetDoubleParagraphSpacing);
    homeTab.removeItem(HomeTabItemId.AddSpacingAfterParagraph);
    homeTab.removeItem(HomeTabItemId.AddSpacingBeforeParagraph);
    homeTab.removeItem(HomeTabItemId.ToggleFontStrikeout);
    homeTab.removeItem(HomeTabItemId.ToggleMultilevelList);
    homeTab.removeItem(HomeTabItemId.ChangeFontHighlightColor);
    homeTab.removeItem(HomeTabItemId.ShowFontDialog);

    insertTab.removeItem(InsertTabItemId.ShowBookmarkDialog);
    insertTab.removeItem(InsertTabItemId.ShowHyperlinkDialog);
    insertTab.removeItem(InsertTabItemId.InsertFloatingTextBox);
    insertTab.removeItem(InsertTabItemId.InsertHeader);
    insertTab.removeItem(InsertTabItemId.InsertFooter);


    PageLayout.removeItem(PageLayoutTabItemId.MarginsMenu);
    PageLayout.removeItem(PageLayoutTabItemId.OrientationMenu);
    PageLayout.removeItem(PageLayoutTabItemId.ColumnsMenu);
    PageLayout.removeItem(PageLayoutTabItemId.SizeMenu);
    PageLayout.removeItem(PageLayoutTabItemId.InsertColumnBreak);
    PageLayout.removeItem(PageLayoutTabItemId.InsertSectionBreakEvenPage);
    PageLayout.removeItem(PageLayoutTabItemId.InsertSectionBreakNextPage);
    PageLayout.removeItem(PageLayoutTabItemId.InsertSectionBreakOddPage);
    

    options.ribbon.removeTab(mailMerge);
    options.ribbon.removeTab(viewTab);
    // options.ribbon.removeTab(fileTab);

  }


  ribbonCustomization(options: Options) {

    this.removeTabs(options)

    const homeTab = options.ribbon.getTab(RibbonTabType.Home);
    homeTab!.removeItem(HomeTabItemId.Copy);
    homeTab!.removeItem(HomeTabItemId.Cut);
    homeTab!.removeItem(HomeTabItemId.Paste);

    // move items to new tab
    const findElem: RibbonItem = homeTab!.getItem(HomeTabItemId.Find)!;
    const replaceElem: RibbonItem = homeTab!.getItem(HomeTabItemId.Replace)!;
    homeTab!.removeItem(findElem);
    homeTab!.removeItem(replaceElem);

    // remove tab
    options.ribbon.removeTab(RibbonTabType.References);

  }


  saveReport(saveRpt: boolean = true) {

    this.rich!.exportToFile((e: any) => {

      if (e instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const rtfContent = reader.result as string;
          this.emitExtractedContent(rtfContent, saveRpt, true);
        };
        reader.readAsText(e);
      } else if (e.blob instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const rtfContent = reader.result as string;
          this.emitExtractedContent(rtfContent, saveRpt, true);
        };
        reader.readAsText(e.blob);
      }
    }, DocumentFormat.Rtf);

  }


  fullscreen() {
    this.rich!.exportToFile((e: any) => {

      if (e instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const rtfContent = reader.result as string;
          this.fullscreenClicked.emit({ rtf_content: rtfContent });
        };
        reader.readAsText(e);
      } else if (e.blob instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const rtfContent = reader.result as string;
          this.fullscreenClicked.emit({ rtf_content: rtfContent });
        };
        reader.readAsText(e.blob);
      }
    }, DocumentFormat.Rtf);
  }

  getDuplicateHtml() {
    // Clone the body or a specific container to work on a duplicate
    const bodyClone = document.body.cloneNode(true) as HTMLElement;
  
    // Query and manipulate elements within the cloned body
    const blackouts = bodyClone.querySelectorAll('.dxreBlackout') as NodeListOf<HTMLElement>;
    blackouts.forEach((element: HTMLElement) => {
      element.remove(); // Remove blackout elements from the clone
    });
  
    const elements = bodyClone.querySelectorAll('.dxrePageArea') as NodeListOf<HTMLElement>;
  
    let mergedHtml = '';
    let index = 0;
  
    elements.forEach((element: HTMLElement) => {
      element.style.top = '';
      element.style.left = '';
      mergedHtml += element.outerHTML;
  
      if (index != elements.length -1) {
        mergedHtml += "<div class='break_page'></div>"; // Add page break between elements

      }
  
      
      index++;
    });
  
    return mergedHtml; // Return merged HTML
  }
  

  emitExtractedContent(content: any, e: boolean, modal: boolean = true) {
    this.extractedContentChange.emit({ data: this.getDuplicateHtml(), rtf_content: content, boolVal: e, closeModal: modal });
  };


  openPreview() {
		this.printSrvc.previewIframe(this.getDuplicateHtml(), this.header_to_diplay_in_every_page, this.settings, this.bg_img, true);
	}

  file: any = `
 e1xydGYxXGRlZmYwe1xmb250dGJse1xmMCBDYWxpYnJpO317XGYxIFRpbWVzIE5ldyBSb21hbjt9e1xmMiBBcmlhbDt9fXtcY29sb3J0YmwgO1xyZWQwXGdyZWVuMFxibHVlMjU1IDtccmVkMFxncmVlbjBcYmx1ZTAgO317XCpcZGVmY2hwIFxmczIyfXtcc3R5bGVzaGVldCB7XHFsXGZzMjIgTm9ybWFsO317XCpcY3MxXGZzMjIgRGVmYXVsdCBQYXJhZ3JhcGggRm9udDt9e1wqXGNzMlxmczIyXGNmMSBIeXBlcmxpbms7fXtcKlx0czNcdHNyb3dkXGZzMjJccWxcdHN2ZXJ0YWx0XGNsdHhscnRiIE5vcm1hbCBUYWJsZTt9fXtcKlxsaXN0b3ZlcnJpZGV0YWJsZX17XGluZm99XG5vdWljb21wYXRcc3BseXR3bmluZVxodG1hdXRzcFxleHBzaHJ0blxzcGx0cGdwYXJcZGVmdGFiNzIwXHNlY3RkXG1hcmdsc3huMTQ0MFxtYXJncnN4bjE0NDBcbWFyZ3RzeG4xNDQwXG1hcmdic3huMTQ0MFxoZWFkZXJ5NzIwXGZvb3Rlcnk3MjBccGd3c3huMTIyNDBccGdoc3huMTU4NDBcY29sczFcY29sc3g3MjBccGFyZFxwbGFpblxxY3tcYlxmMVxmczI2XGNmMCAgICAgICAgfXtcYlxmMVxmczI4XGNmMCAgICAgfXtcYlx1bFxmMlxmczI4XGNmMiBVTFRSQVNPTk9HUkFNIE9GIFRIRSBBQkRPTUVOICYgUEVMVklTfVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxY3tcZjJcZnMyNlxjZjAgIH1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWxcZmktMjA3MFxsaTIwNzBcbGluMjA3MHtcYlxmMlxmczI2XGNmMCBMSVZFUn17XGYyXGZzMjZcY2YwIFx0YWIgIFx0YWIgIFx0YWIgTm9ybWFsIGluIHNpemUgd2l0aCBub3JtYWwgZWNob3RleHR1cmUufVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbFxsaTIwNzBcbGluMjA3MHtcZjJcZnMyNlxjZjAgICAgXHRhYiBObyBpbnRyYSBvciBleHRyYSBoZXBhdGljIGJpbGlhcnkgZHVjdCBkaWxhdGF0aW9uLiAgfVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcZjJcZnMyNlxjZjAgXHRhYiAgXHRhYiBcdGFiICBcdGFiIENCRCAmIFBvcnRhbCB2ZWluIGFyZSBub3JtYWwufVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcZjJcZnMyNlxjZjAgIH1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGJcZjJcZnMyNlxjZjAgR0FMTCBCTEFEREVSfXtcZjJcZnMyNlxjZjAgXHRhYiAgIFx0YWIgUGh5c2lvbG9naWNhbGx5IGRpc3RlbmRlZCBhbmQgc2hvd3Mgbm8gZXZpZGVuY2V9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCBcdGFiIFx0YWIgIFx0YWIgIFx0YWIgb2YgY2FsY3VsaSAvIGluZmxhbW1hdG9yeSBjaGFuZ2VzIC8gbWFzcyBsZXNpb24ufVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcZjJcZnMyNlxjZjAgIH1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGJcZjJcZnMyNlxjZjAgUEFOQ1JFQVN9e1xmMlxmczI2XGNmMCBcdGFiICAgICBcdGFiIEhlYWQsIGJvZHksIHZpc3VhbGl6ZWQgcGFydHMgb2YgdGFpbCBhcmUgbm9ybWFsLn1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGYyXGZzMjZcY2YwICB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xiXGYyXGZzMjZcY2YwIFNQTEVFTlx0YWIgfXtcZjJcZnMyNlxjZjAgXHRhYiAgICAgXHRhYiBOb3JtYWwgaW4gaXRzIHNpemUsIHNoYXBlIGFuZCBlY2hvdGV4dHVyZS59XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xiXGYyXGZzMjZcY2YwICB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xiXGYyXGZzMjZcY2YwIFJJR0hUIEtJRE5FWX17XGYyXGZzMjZcY2YwIFx0YWIgIFx0YWIgU2l6ZSAgOiBtbSB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFsXGZpNzIwXGxpMTQ0MFxsaW4xNDQwe1xmMlxmczI2XGNmMCAgXHRhYiBSaWdodCBraWRuZXkgaXMgbm9ybWFsIGluIHNpemUsIHNoYXBlIGFuZCBlY2hvdGV4dHVyZS59XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCBcdGFiIFx0YWIgIFx0YWIgICBcdGFiIENvbGxlY3Rpbmcgc3lzdGVtIGlzIG5vcm1hbC4gTm8gZXZpZGVuY2Ugb2YgY2FsY3VsaS59XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCAgICB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xiXGYyXGZzMjZcY2YwIExFRlQgS0lETkVZfXtcZjJcZnMyNlxjZjAgXHRhYiAgICBcdGFiIFNpemUgIDogIG1tfVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcZjJcZnMyNlxjZjAgXHRhYiBcdGFiIFx0YWIgICAgICBcdGFiIExlZnQgIGtpZG5leSBpcyBub3JtYWwgaW4gc2l6ZSwgc2hhcGUgYW5kIGVjaG90ZXh0dXJlLn1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGYyXGZzMjZcY2YwIFx0YWIgXHRhYiBcdGFiICAgICAgXHRhYiBDb2xsZWN0aW5nIHN5c3RlbSBpcyBub3JtYWwuIE5vIGV2aWRlbmNlIG9mIGNhbGN1bGkufVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcYlxmMlxmczI2XGNmMCAgfVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcYlxmMlxmczI2XGNmMCBVUklOQVJZIEJMQURERVJ9e1xmMlxmczI2XGNmMCAgICAgIE5vcm1hbC4gTm8gY2FsY3VsaS5cdGFiICB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCAgfVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcYlxmMlxmczI2XGNmMCBQUk9TVEFURX17XGYyXGZzMjZcY2YwIFx0YWIgIFx0YWIgICAgXHRhYiBTaXplIDogIG1tICggVm9sdW1lIFx0YWIgY2MgKX1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGYyXGZzMjZcY2YwIFx0YWIgXHRhYiBcdGFiICBcdGFiIE5vcm1hbCBpbiBzaXplLn1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGYyXGZzMjZcY2YwICB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCBBb3J0YSBhbmQgSVZDIGFyZSBub3JtYWwuICBObyBseW1waGFkZW5vcGF0aHkuICBObyBhc2NpdGVzLn1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGYyXGZzMjZcY2YwICB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCAgfVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbHtcYlxmMlxmczI2XGNmMCBJTVBSRVNTSU9OIDpcdGFiICB9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCAgIH1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWxcZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWx7XGYyXGZzMjZcY2YwIEZvciBjbGluaWNhbCBjb3JyZWxhdGlvbi59XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczI2XGNmMCAgfVxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbFxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxbFxmczIyXGNmMFxwYXJccGFyZFxwbGFpblxxantcYlxmMlxmczIyXGNmMCBEci4gUy4gQWx0YWYgQWxpICBNLkQgICAgRHIuIFN5ZWQgTmF6aXlhICBNLkQsIERNUkUgICAgIERyLiBSLkFudXNoYSAgTURcdGFiICBEci4gTWFuYXNhIFJlZGR5ICBNLkR9XGZzMjJcY2YwXHBhclxwYXJkXHBsYWluXHFse1xmMlxmczIyXGNmMCAgICAgUmFkaW9sb2dpc3RcdGFiIFx0YWIgICBcdGFiIFJhZGlvbG9naXN0XHRhYiAgXHRhYiAgXHRhYiBSYWRpb2xvZ2lzdFx0YWIgIFx0YWIgICAgICAgICBSYWRpb2xvZ2lzdFx0YWIgIH1cZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWxcZnMyMlxjZjBccGFyXHBhcmRccGxhaW5ccWxcZnMyMlxjZjBccGFyfQ==
  `
  // rtf file 
  @Input() blankDocumentWithHeader = `
e1xydGYxXGRlZmYwe1xmb250dGJse1xmMCBDYWxpYnJpO317XGYxIFRyZWJ1Y2hldCBNUzt9e1xmMiBBcmlhbDt9fXtcY29sb3J0YmwgO1xyZWQwXGdyZWVuMFxibHVlMjU1IDt9e1wqXGRlZmNocCBcZnMyMn17XHN0eWxlc2hlZXQge1xxbFxmczIyIE5vcm1hbDt9e1wqXGNzMVxmczIyIERlZmF1bHQgUGFyYWdyYXBoIEZvbnQ7fXtcKlxjczJcdWxcZnMyMlxjZjEgSHlwZXJsaW5rO317XCpcdHMzXHRzcm93ZFxmczIyXHFsXHRzdmVydGFsdFxjbHR4bHJ0YiBOb3JtYWwgVGFibGU7fX17XCpcbGlzdG92ZXJyaWRldGFibGV9e1xpbmZvfVxub3VpY29tcGF0XHNwbHl0d25pbmVcaHRtYXV0c3BcZXhwc2hydG5cc3BsdHBncGFyXGRlZnRhYjcyMFxzZWN0ZFxtYXJnbHN4bjY3NVxtYXJncnN4bjY3NVxtYXJndHN4bjBcbWFyZ2JzeG4yMTAwXGhlYWRlcnkxOTUwXGZvb3Rlcnk3MjBccGd3c3huMTIyNDBccGdoc3huMTU4NDBcY29sczFcY29sc3g3MjB7XGhlYWRlcnJcdHJvd2RcaXJvdzBcaXJvd2JhbmQwXHRybGVmdC0xNVx0cmZ0c1dpZHRoMlx0cndXaWR0aDUwMDBcdHJhdXRvZml0MVx0cnNwZGZsM1x0cnNwZGwyNFx0cnNwZGZiM1x0cnNwZGIyNFx0cnNwZGZyM1x0cnNwZHIyNFx0cnNwZGZ0M1x0cnNwZHQyNFx0YmxpbmR0eXBlM1x0YmxpbmQwXGNsdmVydGFsY1xjbGJyZHJ0XGJyZHJub25lXGNsYnJkcmxcYnJkcm5vbmVcY2xicmRyYlxicmRybm9uZVxjbGJyZHJyXGJyZHJub25lXGNsdHhscnRiXGNsZnRzV2lkdGgzXGNsd1dpZHRoMTI3NVxjbHBhZGZiM1xjbHBhZGIxNVxjbHBhZGZsM1xjbHBhZGwxNVxjbHBhZGZyM1xjbHBhZHIxNVxjbHBhZGZ0M1xjbHBhZHQxNVxjZWxseC01XGNsdmVydGFsY1xjbGJyZHJ0XGJyZHJub25lXGNsYnJkcmxcYnJkcm5vbmVcY2xicmRyYlxicmRybm9uZVxjbGJyZHJyXGJyZHJub25lXGNsdHhscnRiXGNsZnRzV2lkdGgxXGNscGFkZmIzXGNscGFkYjE1XGNscGFkZmwzXGNscGFkbDE1XGNscGFkZnIzXGNscGFkcjE1XGNscGFkZnQzXGNscGFkdDE1XGNlbGx4NVxwYXJkXHBsYWluXHFsXGludGJse1xiXGYxXGZzMThcY2YwIE5hbWUgICAgICAgICAgOn1cYlxmMlxmczIyXGNmMFxjZWxsXHBhcmRccGxhaW5ccWxcaW50Ymx7XGJcZjJcZnMxOFxjZjAgTXIuU0hBRkkgU0hBSUt9XGJcZjJcZnMyMlxjZjBcY2VsbFx0cm93ZFxpcm93MFxpcm93YmFuZDBcdHJsZWZ0LTE1XHRyZnRzV2lkdGgyXHRyd1dpZHRoNTAwMFx0cmF1dG9maXQxXHRyc3BkZmwzXHRyc3BkbDI0XHRyc3BkZmIzXHRyc3BkYjI0XHRyc3BkZnIzXHRyc3BkcjI0XHRyc3BkZnQzXHRyc3BkdDI0XHRibGluZHR5cGUzXHRibGluZDBcY2x2ZXJ0YWxjXGNsYnJkcnRcYnJkcm5vbmVcY2xicmRybFxicmRybm9uZVxjbGJyZHJiXGJyZHJub25lXGNsYnJkcnJcYnJkcm5vbmVcY2x0eGxydGJcY2xmdHNXaWR0aDNcY2x3V2lkdGgxMjc1XGNscGFkZmIzXGNscGFkYjE1XGNscGFkZmwzXGNscGFkbDE1XGNscGFkZnIzXGNscGFkcjE1XGNscGFkZnQzXGNscGFkdDE1XGNlbGx4LTVcY2x2ZXJ0YWxjXGNsYnJkcnRcYnJkcm5vbmVcY2xicmRybFxicmRybm9uZVxjbGJyZHJiXGJyZHJub25lXGNsYnJkcnJcYnJkcm5vbmVcY2x0eGxydGJcY2xmdHNXaWR0aDFcY2xwYWRmYjNcY2xwYWRiMTVcY2xwYWRmbDNcY2xwYWRsMTVcY2xwYWRmcjNcY2xwYWRyMTVcY2xwYWRmdDNcY2xwYWR0MTVcY2VsbHg1XHJvd1x0cm93ZFxpcm93MVxpcm93YmFuZDFcdHJsZWZ0LTE1XHRyZnRzV2lkdGgyXHRyd1dpZHRoNTAwMFx0cmF1dG9maXQxXHRyc3BkZmwzXHRyc3BkbDI0XHRyc3BkZmIzXHRyc3BkYjI0XHRyc3BkZnIzXHRyc3BkcjI0XHRyc3BkZnQzXHRyc3BkdDI0XHRibGluZHR5cGUzXHRibGluZDBcY2x2ZXJ0YWxjXGNsYnJkcnRcYnJkcm5vbmVcY2xicmRybFxicmRybm9uZVxjbGJyZHJiXGJyZHJub25lXGNsYnJkcnJcYnJkcm5vbmVcY2x0eGxydGJcY2xmdHNXaWR0aDFcY2xwYWRmYjNcY2xwYWRiMTVcY2xwYWRmbDNcY2xwYWRsMTVcY2xwYWRmcjNcY2xwYWRyMTVcY2xwYWRmdDNcY2xwYWR0MTVcY2VsbHgtNVxjbHZlcnRhbGNcY2xicmRydFxicmRybm9uZVxjbGJyZHJsXGJyZHJub25lXGNsYnJkcmJcYnJkcm5vbmVcY2xicmRyclxicmRybm9uZVxjbHR4bHJ0YlxjbGZ0c1dpZHRoMVxjbHBhZGZiM1xjbHBhZGIxNVxjbHBhZGZsM1xjbHBhZGwxNVxjbHBhZGZyM1xjbHBhZHIxNVxjbHBhZGZ0M1xjbHBhZHQxNVxjZWxseDVccGFyZFxwbGFpblxxbFxpbnRibHtcYlxmMVxmczE4XGNmMCBBZ2UvR2VuZGVyOn1cYlxmMlxmczIyXGNmMFxjZWxsXHBhcmRccGxhaW5ccWxcaW50Ymx7XGJcZjFcZnMxOFxjZjAgMjIgWWVhcnMgLyBNYWxlfVxiXGYyXGZzMjJcY2YwXGNlbGxcdHJvd2RcaXJvdzFcaXJvd2JhbmQxXHRybGVmdC0xNVx0cmZ0c1dpZHRoMlx0cndXaWR0aDUwMDBcdHJhdXRvZml0MVx0cnNwZGZsM1x0cnNwZGwyNFx0cnNwZGZiM1x0cnNwZGIyNFx0cnNwZGZyM1x0cnNwZHIyNFx0cnNwZGZ0M1x0cnNwZHQyNFx0YmxpbmR0eXBlM1x0YmxpbmQwXGNsdmVydGFsY1xjbGJyZHJ0XGJyZHJub25lXGNsYnJkcmxcYnJkcm5vbmVcY2xicmRyYlxicmRybm9uZVxjbGJyZHJyXGJyZHJub25lXGNsdHhscnRiXGNsZnRzV2lkdGgxXGNscGFkZmIzXGNscGFkYjE1XGNscGFkZmwzXGNscGFkbDE1XGNscGFkZnIzXGNscGFkcjE1XGNscGFkZnQzXGNscGFkdDE1XGNlbGx4LTVcY2x2ZXJ0YWxjXGNsYnJkcnRcYnJkcm5vbmVcY2xicmRybFxicmRybm9uZVxjbGJyZHJiXGJyZHJub25lXGNsYnJkcnJcYnJkcm5vbmVcY2x0eGxydGJcY2xmdHNXaWR0aDFcY2xwYWRmYjNcY2xwYWRiMTVcY2xwYWRmbDNcY2xwYWRsMTVcY2xwYWRmcjNcY2xwYWRyMTVcY2xwYWRmdDNcY2xwYWR0MTVcY2VsbHg1XHJvd1x0cm93ZFxpcm93Mlxpcm93YmFuZDJcdHJsZWZ0LTE1XHRyZnRzV2lkdGgyXHRyd1dpZHRoNTAwMFx0cmF1dG9maXQxXHRyc3BkZmwzXHRyc3BkbDI0XHRyc3BkZmIzXHRyc3BkYjI0XHRyc3BkZnIzXHRyc3BkcjI0XHRyc3BkZnQzXHRyc3BkdDI0XHRibGluZHR5cGUzXHRibGluZDBcY2x2ZXJ0YWxjXGNsYnJkcnRcYnJkcm5vbmVcY2xicmRybFxicmRybm9uZVxjbGJyZHJiXGJyZHJub25lXGNsYnJkcnJcYnJkcm5vbmVcY2x0eGxydGJcY2xmdHNXaWR0aDFcY2xwYWRmYjNcY2xwYWRiMTVcY2xwYWRmbDNcY2xwYWRsMTVcY2xwYWRmcjNcY2xwYWRyMTVcY2xwYWRmdDNcY2xwYWR0MTVcY2VsbHgtNVxjbHZlcnRhbGNcY2xicmRydFxicmRybm9uZVxjbGJyZHJsXGJyZHJub25lXGNsYnJkcmJcYnJkcm5vbmVcY2xicmRyclxicmRybm9uZVxjbHR4bHJ0YlxjbGZ0c1dpZHRoMVxjbHBhZGZiM1xjbHBhZGIxNVxjbHBhZGZsM1xjbHBhZGwxNVxjbHBhZGZyM1xjbHBhZHIxNVxjbHBhZGZ0M1xjbHBhZHQxNVxjZWxseDVccGFyZFxwbGFpblxxbFxpbnRibHtcYlxmMVxmczE4XGNmMCBNb2JpbGUgTm8uICA6fVxiXGYyXGZzMjJcY2YwXGNlbGxccGFyZFxwbGFpblxxbFxpbnRibHtcYlxmMVxmczE4XGNmMCA5NDQwMjY3Nzg2fVxiXGYyXGZzMjJcY2YwXGNlbGxcdHJvd2RcaXJvdzJcaXJvd2JhbmQyXHRybGVmdC0xNVx0cmZ0c1dpZHRoMlx0cndXaWR0aDUwMDBcdHJhdXRvZml0MVx0cnNwZGZsM1x0cnNwZGwyNFx0cnNwZGZiM1x0cnNwZGIyNFx0cnNwZGZyM1x0cnNwZHIyNFx0cnNwZGZ0M1x0cnNwZHQyNFx0YmxpbmR0eXBlM1x0YmxpbmQwXGNsdmVydGFsY1xjbGJyZHJ0XGJyZHJub25lXGNsYnJkcmxcYnJkcm5vbmVcY2xicmRyYlxicmRybm9uZVxjbGJyZHJyXGJyZHJub25lXGNsdHhscnRiXGNsZnRzV2lkdGgxXGNscGFkZmIzXGNscGFkYjE1XGNscGFkZmwzXGNscGFkbDE1XGNscGFkZnIzXGNscGFkcjE1XGNscGFkZnQzXGNscGFkdDE1XGNlbGx4LTVcY2x2ZXJ0YWxjXGNsYnJkcnRcYnJkcm5vbmVcY2xicmRybFxicmRybm9uZVxjbGJyZHJiXGJyZHJub25lXGNsYnJkcnJcYnJkcm5vbmVcY2x0eGxydGJcY2xmdHNXaWR0aDFcY2xwYWRmYjNcY2xwYWRiMTVcY2xwYWRmbDNcY2xwYWRsMTVcY2xwYWRmcjNcY2xwYWRyMTVcY2xwYWRmdDNcY2xwYWR0MTVcY2VsbHg1XHJvd1x0cm93ZFxpcm93M1xpcm93YmFuZDNcbGFzdHJvd1x0cmxlZnQtMTVcdHJmdHNXaWR0aDJcdHJ3V2lkdGg1MDAwXHRyYXV0b2ZpdDFcdHJzcGRmbDNcdHJzcGRsMjRcdHJzcGRmYjNcdHJzcGRiMjRcdHJzcGRmcjNcdHJzcGRyMjRcdHJzcGRmdDNcdHJzcGR0MjRcdGJsaW5kdHlwZTNcdGJsaW5kMFxjbHZlcnRhbGNcY2xicmRydFxicmRybm9uZVxjbGJyZHJsXGJyZHJub25lXGNsYnJkcmJcYnJkcm5vbmVcY2xicmRyclxicmRybm9uZVxjbHR4bHJ0YlxjbGZ0c1dpZHRoMVxjbHBhZGZiM1xjbHBhZGIxNVxjbHBhZGZsM1xjbHBhZGwxNVxjbHBhZGZyM1xjbHBhZHIxNVxjbHBhZGZ0M1xjbHBhZHQxNVxjZWxseC01XGNsdmVydGFsY1xjbGJyZHJ0XGJyZHJub25lXGNsYnJkcmxcYnJkcm5vbmVcY2xicmRyYlxicmRybm9uZVxjbGJyZHJyXGJyZHJub25lXGNsdHhscnRiXGNsZnRzV2lkdGgxXGNscGFkZmIzXGNscGFkYjE1XGNscGFkZmwzXGNscGFkbDE1XGNscGFkZnIzXGNscGFkcjE1XGNscGFkZnQzXGNscGFkdDE1XGNlbGx4NVxwYXJkXHBsYWluXHFsXGludGJse1xiXGYxXGZzMThcY2YwIFJlZmVycmVkIGJ5On1cYlxmMlxmczIyXGNmMFxjZWxsXHBhcmRccGxhaW5ccWxcaW50Ymx7XGJcZjFcZnMxOFxjZjAgU0VMRn1cYlxmMlxmczIyXGNmMFxjZWxsXHRyb3dkXGlyb3czXGlyb3diYW5kM1xsYXN0cm93XHRybGVmdC0xNVx0cmZ0c1dpZHRoMlx0cndXaWR0aDUwMDBcdHJhdXRvZml0MVx0cnNwZGZsM1x0cnNwZGwyNFx0cnNwZGZiM1x0cnNwZGIyNFx0cnNwZGZyM1x0cnNwZHIyNFx0cnNwZGZ0M1x0cnNwZHQyNFx0YmxpbmR0eXBlM1x0YmxpbmQwXGNsdmVydGFsY1xjbGJyZHJ0XGJyZHJub25lXGNsYnJkcmxcYnJkcm5vbmVcY2xicmRyYlxicmRybm9uZVxjbGJyZHJyXGJyZHJub25lXGNsdHhscnRiXGNsZnRzV2lkdGgxXGNscGFkZmIzXGNscGFkYjE1XGNscGFkZmwzXGNscGFkbDE1XGNscGFkZnIzXGNscGFkcjE1XGNscGFkZnQzXGNscGFkdDE1XGNlbGx4LTVcY2x2ZXJ0YWxjXGNsYnJkcnRcYnJkcm5vbmVcY2xicmRybFxicmRybm9uZVxjbGJyZHJiXGJyZHJub25lXGNsYnJkcnJcYnJkcm5vbmVcY2x0eGxydGJcY2xmdHNXaWR0aDFcY2xwYWRmYjNcY2xwYWRiMTVcY2xwYWRmbDNcY2xwYWRsMTVcY2xwYWRmcjNcY2xwYWRyMTVcY2xwYWRmdDNcY2xwYWR0MTVcY2VsbHg1XHJvd1xwYXJkXHBsYWluXHFsXGZzMjJcY2YwXHBhcn1ccGFyZFxwbGFpblxxbFxmczIyXGNmMFxwYXJ9
  `

  rtfToBase64(rtfContent: any) {
    return btoa(rtfContent); // Encode RTF string back to Base64
  }

  changeRtf(base64String: any, targetName: any, tagName: any) {

    function base64ToRtf(base64: any) {
      return atob(base64); // Decode Base64 to RTF string
    }

    function replacePatientName(rtfContent: any, name: any) {

      const placeholder = tagName;

      if (rtfContent.includes(placeholder)) {
        return rtfContent.replace(placeholder, name); // Replace placeholder with actual name
      } else {
        return rtfContent;
      }
    }

    const rtfContent = base64ToRtf(base64String);
    const modifiedRtfContent = replacePatientName(rtfContent, targetName);
    const modifiedBase64String = this.rtfToBase64(modifiedRtfContent);

    return modifiedBase64String;
  }

  changeTestTemplate(e: any) {
		if (e && e != '') {
			this.subsink.sink = this.masterEndpoint.getReportData(e.id, e.LabGlobalTestID).subscribe((reportdata: any) => {
				if (reportdata.rtf_content) {
          this.changeContent(reportdata.rtf_content);

				} else {
					this.alertService.showError(`No Content Availiable in ${e.name}`)
				}
			})
		}
	}

  preview_by_frame() {
    let content = this.printSrvc.setMiniView(this.content, this.header_to_diplay_in_every_page, this.settings, '');
    const iframe = document.getElementById('disbaled_iframe') as any;
    iframe!.contentDocument.open();
    iframe!.contentDocument.write(content);
    iframe!.contentDocument.close();
	}

  loading_html = `
      <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              .loader {
                border: 5px solid #f3f3f3;
                border-radius: 50%;
                border-top: 5px solid #3498db;
                width: 28px;
                height: 28px;
                -webkit-animation: spin 2s linear infinite; /* Safari */
                animation: spin 2s linear infinite;
              }

              /* Safari */
              @-webkit-keyframes spin {
                0% { -webkit-transform: rotate(0deg); }
                100% { -webkit-transform: rotate(360deg); }
              }

              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
            <body>
              <div class="loader"></div>
            </body>
        </html>
	`




}
