import { Component, ElementRef, Input, OnInit, EventEmitter, Output, Renderer2, ViewChild, ChangeDetectorRef, AfterViewInit, Injector } from '@angular/core';
// import { EditorConfig, ST_BUTTONS } from 'ngx-simple-text-editor';
import { EditorConfig, ST_BUTTONS, LINK_INPUT, UNDO_BUTTON, REDO_BUTTON, REMOVE_FORMAT_BUTTON, SEPARATOR, BOLD_BUTTON, ITALIC_BUTTON, UNDERLINE_BUTTON, STRIKE_THROUGH_BUTTON, JUSTIFY_LEFT_BUTTON, JUSTIFY_CENTER_BUTTON, JUSTIFY_RIGHT_BUTTON, JUSTIFY_FULL_BUTTON, ORDERED_LIST_BUTTON, UNORDERED_LIST_BUTTON, INDENT_BUTTON, OUTDENT_BUTTON, SUBSCRIPT_BUTTON, SUPERSCRIPT_BUTTON, FONT_SIZE_SELECT, UNLINK_BUTTON, FORE_COLOR, IMAGE_INPUT, CUSTOM } from 'ngx-simple-text-editor';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@sharedcommon/service/alert.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import { BaseComponent } from '@sharedcommon/base/base.component';

@Component({
	selector: 'app-simple-editor',
	templateUrl: './simple-editor.component.html',
	styleUrl: './simple-editor.component.scss'
})

export class SimpleEditorComponent extends BaseComponent<any> {

	// FONT_SIZE_SELECT
	config: EditorConfig = {
		placeholder: 'Type something...',
		buttons: [UNDO_BUTTON, REDO_BUTTON, REMOVE_FORMAT_BUTTON, SEPARATOR, BOLD_BUTTON, ITALIC_BUTTON, UNDERLINE_BUTTON, STRIKE_THROUGH_BUTTON, JUSTIFY_LEFT_BUTTON, JUSTIFY_CENTER_BUTTON, JUSTIFY_RIGHT_BUTTON, JUSTIFY_FULL_BUTTON, ORDERED_LIST_BUTTON, UNORDERED_LIST_BUTTON, INDENT_BUTTON, OUTDENT_BUTTON, SUBSCRIPT_BUTTON, SUPERSCRIPT_BUTTON, FONT_SIZE_SELECT ]
	};

	@ViewChild('setMargins') marginModal: any;
	@Input() content: any = ``;
	@Input() details: any = null;
	@Input() onlySave: boolean = false;
	@Input() auth: boolean = false;
	@Input() test_id: any;
	@Input() department_id: any;
	@Input() header_to_diplay_in_every_page: any = "";

	paddingTop: string = '0';
	paddingRight: string = '1cm';
	paddingBottom: string = '0';
	paddingLeft: string = '1cm';
	marginOptions: string[] = ['0', '0.3cm', '0.4cm', '0.5cm', '0.6cm', '0.7cm', '0.8cm', '0.9cm', '1.0cm', '1.1cm', '1.2cm'];
	st_area_editor: any = "<div id='st_area_editor'></div>"

	bg = '/assets/images/blank_paper_with_dotted.png'
	extractedContent!: SafeHtml; // To store the extracted content
	templateContentStore: any;

	settings:any = {
		header_height: 0,
		footer_height: 0,
		margin_left: 0,
		margin_right: 0
	};
	fontList: any = [
		"Trebuchet", // Add Trebuchet to the font list
		// "Segoe UI",
		"Arial",
		"Verdana",
		"Times New Roman",
		"Garamond",
		"Georgia",
		"Courier New",
		"cursive",

	];

	fontSizes: any = [
		'12px',
		'14px',
		'15px',
		'16px',
		'18px',
	]

	constructor(
		injector: Injector,
		private sanitizer: DomSanitizer,
		private renderer: Renderer2,
		private elRef: ElementRef,
		private modelService: NgbModal,
		private endPoint: SignUpEndpoint,
		private cookieSrvc: CookieStorageService,
		private masterEndpoint: MasterEndpoint,
		private printSrvc: PrintService,
		private cdr: ChangeDetectorRef
	) { super(injector) }


	override ngOnInit(): void {

		this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((set:any)=>{
			if(set.length!== 0){
			  this.settings.header_height = set[0].header_height;
			  this.settings.footer_height = set[0].footer_height;
			  this.settings.margin_left = set[0].margin_left;
			  this.settings.margin_right = set[0].margin_right;
			  this.bg = set[0].letterhead;
			  this.setPages();
			//   this.setContent(data.results[0].data, data.results[0].header);
			}else{
				// this.setContent(data.results[0].data, data.results[0]?.header);
				this.addPasteListener();
			}
		}, (error)=>{
			// this.setContent(data.results[0].data, data.results[0].header);
		})
		
		this.setPageBackground();

		this.tempBackup = this.content;
	}


	setPages(){
		this.st_area_editor = `	
		
<div class="st_area_editor" id="st_area_editor${this.page_number}" 
    style="min-height: 297mm; line-height:20px !important; outline: 1px solid #000; 
    background-size: 210mm 297mm; margin: 10px auto; align-self: center; 
    width: 210mm; background-image: url('${this.bg}'); 
    padding: 0px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px;
    background-color: white; background-repeat: repeat; overflow: hidden;">
    
    <div contentEditable="true" class="wordreportcontent" id="wordreportcontent">
        ${this.content}
    </div>
</div>

	
	`




	document.addEventListener('DOMContentLoaded', function() {
		const contentDiv = document.getElementById('wordreportcontent');
		const headerHTML = '<div inert contentEditable=false style="opacity: 0.5; padding-top: ${this.settings.header_height}px">${this.header_to_diplay_in_every_page}</div>';
		const headerHeight = (document.querySelector('[inert]') as any)!.offsetHeight;
		const interval = 500; // Interval in px where header should repeat
	
		let currentHeight = 0;
	
		while (currentHeight < contentDiv!.scrollHeight) {
			currentHeight += interval;
	
			if (currentHeight < contentDiv!.scrollHeight) {
				const headerClone = document.createElement('div');
				headerClone.innerHTML = headerHTML;
				headerClone.style.position = 'absolute';
				headerClone.style.top = currentHeight + 'px';
				headerClone.style.width = '100%';
				contentDiv!.appendChild(headerClone);
			}
		}
	});
	
	}



























	setContent(templateContent:any, templateHeader: any){

		if (this.details) {
			// templateHeader = templateHeader.replace("{VisitID}", this.details.LabPatientTestID.patient.visit_id);
			// templateHeader = templateHeader.replace("{MrNo}", this.details.LabPatientTestID.patient.mr_no);
			// templateHeader = templateHeader.replace("{PatientName}", this.details.LabPatientTestID.patient.name);
			// templateHeader = templateHeader.replace("{Age}", this.details.LabPatientTestID.patient.age);
			// templateHeader = templateHeader.replace("{Gender}", this.details.LabPatientTestID.patient.gender);
			templateContent = templateContent.replace("{VisitID}", this.details.LabPatientTestID.patient.visit_id);
			templateContent = templateContent.replace("{MrNo}", this.details.LabPatientTestID.patient.mr_no);
			templateContent = templateContent.replace("{PatientName}", this.details.LabPatientTestID.patient.name);
			templateContent = templateContent.replace("{Age}", this.details.LabPatientTestID.patient.age);
			templateContent = templateContent.replace("{Gender}", this.details.LabPatientTestID.patient.gender);

		}

		const contentWithDiv = `<div id="wordreportcontent" class="wordreportcontent" style="outline: none;font-family: 'Trebuchet MS', sans-serif;">${this.content}</div>`;
		templateContent = templateContent.replace(/<table/g, "<table contenteditable=\"false\"");
		this.templateContentStore = templateContent;
		templateContent = templateContent.replace("{TestWordReportContent}", contentWithDiv); // Assign the modified content back to the variable
		// padding: ${this.settings.header_height}px 0px 0px 0px'
		this.st_area_editor = `
			<div class='st_area_editor' id='st_area_editor' style='line-height:20px !important;'>
				<div id="nonEditableContent">
					${templateContent}
				</div>
 			</div>`;

		// Disable contenteditable for all divs inside st_area_editor
		const stAreaEditor = document.getElementById('st_area_editor');
		const contentDivs = stAreaEditor?.querySelectorAll('div');
		contentDivs?.forEach((div) => {
			if (div.id !== 'wordreportcontent') {
				div.contentEditable = 'false';
				// this.alertSrvc.showInfo("")
			}
		});


		
		// this.st_area_editor = `
		// 	<div class='st_area_editor' id='st_area_editor' style='line-height:20px !important;'>
		// 		<div contentEditable=false style="opacity: 0.5">${templateHeader}</div>
		// 		<div id="wordreportcontent" style="padding-top: 20px">${this.content}</div>
 		// 	</div>`;


	}

	
	changeContent(content: any) {
		const contentWithDiv = `<div id="wordreportcontent" style="outline: none;font-family: 'Trebuchet MS', sans-serif;">${content}</div>`
		const newTemplate = this.templateContentStore.replace("{TestWordReportContent}", contentWithDiv); // Assign the modified content back to the variable

		this.st_area_editor = `
			<div class='st_area_editor' id='st_area_editor' style='line-height:20px !important;'>
				<div id="nonEditableContent">
					${newTemplate}
				</div>
			</div>
		`;

		// Disable contenteditable for all divs inside st_area_editor
		const stAreaEditor = document.getElementById('st_area_editor');
		const contentDivs = stAreaEditor?.querySelectorAll('div');
		contentDivs?.forEach((div) => {
			if (div.id !== 'wordreportcontent') {
				div.contentEditable = 'false';
			}
		});
		this.setPageBackground();
	}

	checkHeightAndAdjustPadding() {
		const stAreaEditor = this.elRef.nativeElement.querySelector('.st_area_editor');
		if (stAreaEditor) {
			const height = stAreaEditor.offsetHeight;
			//   this.alertSrvc.showError(height, Math.ceil(height/950));
			this.page_number = Math.ceil(height / 910);
			//   this.alertSrvc.showError(height)
			this.setPageBackground();
		}
	}

	addPasteListener() {
		const stAreaEditor = this.elRef.nativeElement.querySelector('.st_area_editor');
		if (stAreaEditor) {
		  stAreaEditor.addEventListener('paste', (event: ClipboardEvent) => {
			event.preventDefault();
	
			const clipboardData = event.clipboardData || (window as any).clipboardData;
			const pastedData = clipboardData?.getData('text/html') || clipboardData?.getData('text/plain');
	
			const targetElement = stAreaEditor.querySelector('#wordreportcontent');
	
			if (targetElement && pastedData) {
			  targetElement.insertAdjacentHTML('beforeend', pastedData);
			  this.adjustHeightAndBackground();
			}
		  });
		}
	  }

	setPageBackground() {
		// const stArea = this.elRef.nativeElement.querySelector('.st-area');
		// if (stArea) {
		// 	this.renderer.setStyle(stArea, 'background-image', `url('${this.bg}')`);
		// 	this.renderer.setStyle(stArea, 'background-size', '212.2mm 302mm');
		// 	this.renderer.setStyle(stArea, 'height', `${this.page_number * 302}` + 'mm')
		// 	this.renderer.setStyle(stArea, 'background-repeat', `repeat-y`);

		// 	// if (this.onlySave) {
		// 	// 	this.renderer.setStyle(stArea, 'padding', `271px 1.5cm 5px 1.5cm`);
		// 	// }
		// }

		this.adjustHeightAndBackground();
	}

	addContentChangeListener() {
		const stAreaEditor = this.elRef.nativeElement.querySelector('.st_area_editor');
		if (stAreaEditor) {
			const observer = new MutationObserver(() => {
				this.adjustHeightAndBackground();
			});
	
			observer.observe(stAreaEditor, {
				childList: true,
				subtree: true,
				characterData: true
			});
		}
	}

	adjustHeightAndBackground() {
		const stAreaEditor = this.elRef.nativeElement.querySelector('.st_area_editor');
		if (stAreaEditor) {
			const height = stAreaEditor.scrollHeight;
			this.page_number = Math.ceil(height / 910);
			// this.alertSrvc.showError(height); // Optional: For debugging height
	
			const stArea = this.elRef.nativeElement.querySelector('.st-area');
			if (stArea) {
				this.renderer.setStyle(stArea, 'background-image', `url('${this.bg}')`);
				this.renderer.setStyle(stArea, 'background-size', '212.2mm 302mm');
				this.renderer.setStyle(stArea, 'height', `${this.page_number * 302}` + 'mm');
				this.renderer.setStyle(stArea, 'background-repeat', `repeat-y`);
				this.renderer.setStyle(stArea, 'padding', `${this.settings.header_height}px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px`)
			}

			// if(stArea){
			// 	const container = document.createElement("div");
			// 	container.classList.add("st_area_editor");
			// 	stArea.appendChild(container)
			// }
		}
	}


	inAnyErrorOpen() {
		this.st_area_editor = `<div class='st_area_editor' id='st_area_editor' >${this.content}</div>`;
	}

	override ngAfterViewInit(): void {
		const editableDiv = document.getElementById('wordreportcontent');
		const nonEditableDiv = document.getElementById('noneditablecontent');

		if (editableDiv) {
			editableDiv.contentEditable = 'true';
			editableDiv.addEventListener('input', this.handleInput.bind(this));
		}

		if (nonEditableDiv) {
			nonEditableDiv.contentEditable = 'false';
		}
	}

	handleInput(event: any) {

	}

	handleWordReportContentInput() {

	}

	simulateToolbarButtonClicks(): void {
		// Simulate click event on bold button
		(document.querySelector('.toolbar-bold-button') as any)?.click();
		// Simulate click event on italic button
		(document.querySelector('.toolbar-italic-button') as any)?.click();
	}

	changeFont(font: any) {
		// Convert the font value to lowercase for comparison
		const lowercaseFont = font.value.toLowerCase();

		// Apply the font with the correct case
		switch (lowercaseFont) {
			case 'trebuchet':
				document.execCommand('fontName', false, 'Trebuchet MS');
				break;
			default:
				// For other fonts, apply the value directly
				document.execCommand('fontName', false, font.value);
				break;
		}
	}

	changeFontSize(font:any){
		document.execCommand("fontSize", false, font.value);
	}

	organization: any;

	tempBackup: any;

	resetDefault() {
		this.content = this.tempBackup;
		this.st_area_editor = `<div class='st_area_editor' id='st_area_editor'>${this.content}</div>`;
	}

	focusContainer() {
		const container = this.elRef.nativeElement.querySelector('#wordreportcontent');

		this.renderer.listen(container, 'click', () => {
			// Your event handler code here
			container.focus
		});

		container?.focus();
	}

	getEditorValue() {
		// Create a temporary div element to parse the HTML content
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = this.content;

		// Find the first div element and get its inner HTML
		const firstDivContent = this.elRef.nativeElement.querySelector('.st-area')?.innerHTML || '';

		// Sanitize the extracted content and assign it to extractedContent
		this.extractedContent = this.sanitizer.bypassSecurityTrustHtml(firstDivContent);
	}


	page_number: any = 1

	pageCount = 1; // Track the number of pages

	addNewPage() {
		this.pageCount++;

		// const newPageContent = this.content.replace('st-area', 'st-area-new');
		const newPage = document.createElement('div');
		newPage.classList.add('st-area');

		newPage.style.backgroundImage = `url('${this.bg}')`;
		newPage.style.backgroundSize = '212.2mm 302mm';
		newPage.style.minHeight = '297mm';
		newPage.style.padding = '120px 10px 10px';
		newPage.style.width = '210mm';
		newPage.contentEditable = 'true'; // Set contenteditable to true
		const stArea = this.elRef.nativeElement.querySelector('.st-editor-container');
		stArea.appendChild(newPage);
		newPage.focus();

		// Wait for a short delay before getting the editor value
		setTimeout(() => {
			this.getEditorValue();
		}, 100);
	}

	openMarginModal(content: any) {
		this.modelService.open(content, { size: 'sm' });
	}


	setMarginsForPage() {
		const page = document.getElementById('st_area_editor');
		const stArea = this.elRef.nativeElement.querySelector('.st_area_editor');
		// this.renderer.setStyle(stArea, 'padding-left', `200px}')`);
		if (stArea) {
			stArea.style.paddingLeft = this.paddingLeft;
			stArea.style.paddingRight = this.paddingRight;
			stArea.style.paddingTop = this.paddingTop;
			stArea.style.paddingBottom = this.paddingBottom;
		}
	}

	scale: number = 1;

	minEventValue: number = 1; // Minimum event value
	maxEventValue: number = 1.5; // Maximum event value
	minMarginTop: number = 10; // Minimum margin-top value
	maxMarginTop: number = 300; // Maximum margin-top value

	zoomContent(e: any) {
		const contentContainer: any = document.querySelector('.st-editor-container .st-area');

		if (contentContainer) {
			// Set the scale
			const scaleValue = e.target.value;
			contentContainer.style.transform = `scale(${scaleValue})`;

			// Calculate margin-top based on event value
			const eventRange = this.maxEventValue - this.minEventValue;
			const marginRange = this.maxMarginTop - this.minMarginTop;
			const eventPercentage = (e.target.value - this.minEventValue) / eventRange;
			const marginTop = this.minMarginTop + eventPercentage * marginRange;

			// Apply margin-top
			contentContainer.style.marginTop = `${marginTop}px`;

			// Center the content horizontally
			const containerWidth = contentContainer.offsetWidth;
			const scaledWidth = containerWidth * scaleValue;
			const offsetX = (containerWidth - scaledWidth) / 2;
			contentContainer.style.left = `${offsetX}px`;

			// Center the content vertically
			const containerHeight = contentContainer.offsetHeight;
			const scaledHeight = containerHeight * scaleValue;
			const offsetY = (containerHeight - scaledHeight) / 2;
			contentContainer.style.top = `${offsetY}px`;
		}
	}

	@Output() fullscreenClicked = new EventEmitter<any>();
	@Output() exitFullscreenClicked = new EventEmitter<any>();
	@Output() extractedContentChange = new EventEmitter<any>();
	@Output() openPreviewReport = new EventEmitter<any>();

	@Input() fullScreenMode: any = false;

	onFullscreenClick(): any {
		const stArea = this.elRef.nativeElement.querySelector('.st-editor-container .st-area');
		this.fullscreenClicked.emit(this.getContent()); // Emit event
	}

	emitScreen() {
	}

	ExitFullscreenClick(): any {
		const stArea = this.elRef.nativeElement.querySelector('.st-editor-container .st-area');
	}

	emitExtractedContent(e: boolean) {
		const stArea = this.elRef.nativeElement.querySelector('.st-editor-container .st-area');
		this.extractedContentChange.emit({ data: this.getContent(), boolVal: e });
	}



	getContent() {
		if (!this.onlySave) {
			const content = document.getElementById("wordreportcontent");
			`<div style="font-family: 'Trebuchet MS', sans-serif;">${content?.innerHTML}</div>`
			return `<div style="font-family: 'Trebuchet MS', sans-serif;">${content?.innerHTML}</div>`
		} else {
			// const stArea = this.elRef.nativeElement.querySelector('.st-editor-container .st-area');
			const content = document.getElementById("wordreportcontent");
			`<div style="font-family: 'Trebuchet MS', sans-serif;">${content?.innerHTML}</div>`

			return `<div style="font-family: 'Trebuchet MS', sans-serif;">${content?.innerHTML}</div>`
		}

	}

	openPreview() {
		this.openPreviewReport.emit({ data: this.getContent(), boolVal: true });
	}

	@Input() TestTemplates: any;
	@Input() routineTemplates: any;

	changeTestTemplate(e: any) {
		this.masterEndpoint.getReportData(e.id, e.LabGlobalTestID).subscribe((reportdata: any) => {
			this.changeContent(reportdata.report)
		})
	}


	dummy = `
	<div style=\"text-align: center;\"><span style=\"font-weight: 600; color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"5\" face=\"Trebuchet MS\"><u style=\"\">FNAC Test Template</u></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><span style=\"font-weight: 600;\">&nbsp; &nbsp; &nbsp; ULTRASOUND :&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>HIGH THAN 100 BELOW 50</font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; THIS IS SECOND LINE&nbsp;</font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; THIS IS THIRD LINE</font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\">&nbsp; &nbsp; BLOOD PRESSURE :&nbsp; &nbsp; &nbsp; THIS FIRST LINE</font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; THIS IS SECOND LINE&nbsp;</font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><br></font></span></div><div style=\"text-align: center;\"><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font size=\"3\" face=\"Trebuchet MS\"><b>SHAIK SHAFI&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;SAI BHARGAV KARNA&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;KRISHNA VENI</b></font></span></div><div style=\"text-align: center;\"><span style=\"color: var(--vz-body-color); text-align: var(--vz-body-text-align);\"><font face=\"Trebuchet MS\" size=\"2\">DOCTOR M.B.B.S&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; STANFORD , LONDON&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;OXFORD UNIVERSITY, MIT</font></span></div><div class=\"st_area_editor\" id=\"st_area_editor\"><div></div></div>
	`

}
