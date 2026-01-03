import { Component, ElementRef, Input, OnInit, EventEmitter, Output, Renderer2, ViewChild, ChangeDetectorRef, AfterViewInit, Injector } from '@angular/core';
import { EditorConfig, ST_BUTTONS, LINK_INPUT, UNDO_BUTTON, REDO_BUTTON, REMOVE_FORMAT_BUTTON, SEPARATOR, BOLD_BUTTON, ITALIC_BUTTON, UNDERLINE_BUTTON, STRIKE_THROUGH_BUTTON, JUSTIFY_LEFT_BUTTON, JUSTIFY_CENTER_BUTTON, JUSTIFY_RIGHT_BUTTON, JUSTIFY_FULL_BUTTON, ORDERED_LIST_BUTTON, UNORDERED_LIST_BUTTON, INDENT_BUTTON, OUTDENT_BUTTON, SUBSCRIPT_BUTTON, SUPERSCRIPT_BUTTON, FONT_SIZE_SELECT, UNLINK_BUTTON, FORE_COLOR, IMAGE_INPUT, CUSTOM, EditorButtonComponent, EditorButton, ExecCommand } from 'ngx-simple-text-editor';
import { SafeHtml } from '@angular/platform-browser';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import DOMPurifyI from 'dompurify';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { debounceTime, Subject } from 'rxjs';
// import { EditorButton } from 'ngx-simple-text-editor';
import { ToolbarItemType } from 'ngx-simple-text-editor';


@Component({
	selector: 'app-editor-iframe',
	templateUrl: './editor-iframe.component.html',
	styleUrl: './editor-iframe.component.scss'
})
export class EditorIframeComponent extends BaseComponent<any> {



	// FONT_SIZE_SELECT
	config: EditorConfig = {
		placeholder: 'Type something...',
		buttons: [
			UNDO_BUTTON, REDO_BUTTON, SEPARATOR,
			BOLD_BUTTON, ITALIC_BUTTON, UNDERLINE_BUTTON, STRIKE_THROUGH_BUTTON,
			SEPARATOR,
			JUSTIFY_LEFT_BUTTON, JUSTIFY_CENTER_BUTTON, JUSTIFY_RIGHT_BUTTON, JUSTIFY_FULL_BUTTON,
			SEPARATOR,
			ORDERED_LIST_BUTTON, UNORDERED_LIST_BUTTON,
			SEPARATOR,
			INDENT_BUTTON, OUTDENT_BUTTON,
			SEPARATOR,
			REMOVE_FORMAT_BUTTON,
			FONT_SIZE_SELECT
		]
	};

	@ViewChild('setMargins') marginModal: any;

	private previewSubject: Subject<any> = new Subject<any>();

	@Input() content: any = ``;
	@Input() details: any = null;
	@Input() onlySave: boolean = false;
	@Input() auth: boolean = false;


	@Input() fullScreenMode: any = false;
	@Input() header_to_diplay_in_every_page: any = '';
	@Input() TestTemplates: any;
	@Input() routineTemplates: any;
	@Input() loadingAnm: boolean = false;
	@Input() loadingAuthAnm: boolean = false;
	@Input() previewLoad: boolean = false;
	@Input() disableEditor: boolean = false;

	@Output() fullscreenClicked = new EventEmitter<any>();
	@Output() exitFullscreenClicked = new EventEmitter<any>();
	@Output() extractedContentChange = new EventEmitter<any>();

	st_area_editor: any = "<div id='st_area_editor'></div>"

	tempBackup: any;
	pageCount = 1; // Track the number of pages
	bg = '/assets/images/blank.png'
	extractedContent!: SafeHtml; // To store the extracted content
	opened: boolean = false;
	contentEditBool: any = 'true';
	scale: number = 1;

	docLoading: any = this.cookieSrvc.getSpecificBooleanData('prv')

	@Input() showPreview: boolean = false;

	minEventValue: number = 1; // Minimum event value
	maxEventValue: number = 1.5; // Maximum event value
	minMarginTop: number = 10; // Minimum margin-top value
	maxMarginTop: number = 300; // Maximum margin-top value

	@Input() pages_content: any = [];

	settings: any = {
		header_height: 0,
		footer_height: 0,
		margin_left: 40,
		margin_right: 30,
		display_letterhead: false,
		font: 'Arial'
	};

	fontList: any = [
		"Trebuchet",
		"Arial",
		'Segoe UI',
		"Verdana",
		"Times New Roman",
		"Garamond",
		"Georgia",
		"Courier New",
		"cursive",
		'Calibri',
		'Franklin Gothic',
	];

	fontSizes: any = [
		'12px',
		'14px',
		'15px',
		'16px',
		'18px',
	]


	test() {
		this.content = this.content.replace(/<span class="Apple-tab-span" style="text-wrap: nowrap;">\t<\/span>/g, "    ");
	}


	constructor(
		injector: Injector,
		private renderer: Renderer2,
		private elRef: ElementRef,
		private cookieSrvc: CookieStorageService,
		private masterEndpoint: MasterEndpoint,
		private printSrvc: PrintService,
		private cdr: ChangeDetectorRef,
		private elementRef: ElementRef

	) { super(injector) }


	preview_loading: boolean = false;

	override ngOnInit(): void {

		this.docLoading = true;
		this.opened = true;
		if (this.showPreview) {
			this.preview_loading = true;
			this.showChanges();
		}

		this.previewSubject.pipe(
			debounceTime(300)  // Adjust the debounce time as neededd
		).subscribe(value => {
			this.preview_by_frame();
		});

		this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((set: any) => {

			if (set.length !== 0) {
				this.settings.header_height = set[0].header_height;
				this.settings.footer_height = set[0].footer_height;
				this.settings.margin_left = set[0].margin_left;
				this.settings.margin_right = set[0].margin_right;
				this.settings.display_letterhead = set[0]?.display_letterhead || false;
				
				if(this.settings.display_letterhead){
					this.bg = set[0].letterhead && set[0].letterhead !== '' ? set[0].letterhead : this.bg;
				}
				
				if(!this.disableEditor){
					this.setMargins();
					this.documentEventsAdd();
				}else{
					this.preview_loading = false;
					this.preview_by_frame();
				}

			} else {
				this.documentEventsAdd();

			}
		}, (error) => {

			this.documentEventsAdd();
		})

		this.tempBackup = this.pages_content;
	}

	override ngAfterViewInit(): void {
		if (!this.disableEditor) {
			this.toggleSwitch(null, false);
			setTimeout(() => {
				this.createAndAppendSelect();
				this.setMargins();
			}, 1000);
			
		}

		if(this.disableEditor){
			document.removeEventListener('keydown', this.keydownListener);
			document.removeEventListener('paste', this.pasteListener);
		}
	}

	override ngOnDestroy(): void {
		this.opened = false;
		this.disableEditor = false;
		document.removeEventListener('keydown', this.keydownListener);
		document.removeEventListener('paste', this.pasteListener);

	}

	createAndAppendSelect() {
		// Create a div container
		const div = this.renderer.createElement('div');
		this.renderer.addClass(div, 'd-flex');
	
		// Create a select element
		const select = this.renderer.createElement('select');
		this.renderer.setAttribute(select, 'class', 'form-select form-select-sm py-1 ps-2 pe-0');
		this.renderer.listen(select, 'change', (event) => this.changeFont(event.target));
	
		// Populate the select element with font options
		this.fontList.forEach((font: any) => {
			const option = this.renderer.createElement('option');
			this.renderer.setAttribute(option, 'class', 'fs-6 fw-normal');
			this.renderer.setStyle(option, 'font-family', font);
			const text = this.renderer.createText(font);
			this.renderer.appendChild(option, text);
			this.renderer.appendChild(select, option);
		});
	
		// Append the select element to the div container
		this.renderer.appendChild(div, select);
	
		// Create a switch input container
		const switchDiv = this.renderer.createElement('div');
		this.renderer.setAttribute(switchDiv, 'class', 'form-check form-switch ms-2 d-flex align-items-center gap-2');
	
		// Create the switch input
		const switchInput = this.renderer.createElement('input');
		this.renderer.setAttribute(switchInput, 'class', 'form-check-input');
		this.renderer.setAttribute(switchInput, 'type', 'checkbox');
		this.renderer.setAttribute(switchInput, 'id', 'flexSwitchCheckDefault');
		this.renderer.listen(switchInput, 'change', (event) => this.toggleSwitch(event));
	
		// Create the switch label
		const switchLabel = this.renderer.createElement('label');
		this.renderer.setAttribute(switchLabel, 'class', 'form-check-label fw-light text-nowrap');
		this.renderer.setAttribute(switchLabel, 'for', 'flexSwitchCheckDefault');
		const labelText = this.renderer.createText('Side Preview');
		this.renderer.appendChild(switchLabel, labelText);
	
		// Create the page break button
		const pageBreakButton = this.renderer.createElement('button');
		this.renderer.addClass(pageBreakButton, 'btn');
		this.renderer.addClass(pageBreakButton, 'btn-sm');
		this.renderer.addClass(pageBreakButton, 'bg-dark');
		this.renderer.addClass(pageBreakButton, 'rounded-3');
		this.renderer.addClass(pageBreakButton, 'text-white');
		this.renderer.addClass(pageBreakButton, 'mx-2');
		this.renderer.addClass(pageBreakButton, 'shadow');
		this.renderer.setAttribute(pageBreakButton, 'id', 'page_break_button');
		const pageBreakText = this.renderer.createText('Page Break');
		this.renderer.appendChild(pageBreakButton, pageBreakText);
	
		// Append the switch input and label to the switchDiv
		this.renderer.appendChild(switchDiv, switchInput);
		this.renderer.appendChild(switchDiv, switchLabel);
	
		// Append the switchDiv and pageBreakButton to the div container
		this.renderer.appendChild(div, switchDiv);
		this.renderer.appendChild(div, pageBreakButton);
	
		// Create the font size increase button (A+)
		const increaseFontButton = this.renderer.createElement('button');
		this.renderer.addClass(increaseFontButton, 'btn');
		this.renderer.addClass(increaseFontButton, 'btn-sm');
		this.renderer.addClass(increaseFontButton, 'btn-outline-primary');
		this.renderer.addClass(increaseFontButton, 'mx-2');
		this.renderer.setAttribute(increaseFontButton, 'title', 'Increase Font Size');
		const increaseText = this.renderer.createText('A+');
		this.renderer.appendChild(increaseFontButton, increaseText);
		this.renderer.listen(increaseFontButton, 'click', () => document.execCommand( "increaseFontSize", false, "" ));
	
		// Create the font size decrease button (A-)
		const decreaseFontButton = this.renderer.createElement('button');
		this.renderer.addClass(decreaseFontButton, 'btn');
		this.renderer.addClass(decreaseFontButton, 'btn-sm');
		this.renderer.addClass(decreaseFontButton, 'btn-outline-primary');
		this.renderer.addClass(decreaseFontButton, 'mx-2');
		this.renderer.setAttribute(decreaseFontButton, 'title', 'Decrease Font Size');
		const decreaseText = this.renderer.createText('A-');
		this.renderer.appendChild(decreaseFontButton, decreaseText);
		this.renderer.listen(decreaseFontButton, 'click', () => document.execCommand('decreaseFontSize', false));
	
		// Append the font size buttons to the div container
		this.renderer.appendChild(div, increaseFontButton);
		this.renderer.appendChild(div, decreaseFontButton);
	
		// Find the toolbar and append the div container to it
		const toolbar = document.querySelector('.st-toolbar');
		this.renderer.appendChild(toolbar, div);
	
		this.insertPageBreak = this.insertPageBreak.bind(this);
	
		// Add event listener for the page break button
		pageBreakButton.addEventListener('click', this.insertPageBreak);
	
		// Manually update the input value to bind it with `ngModel`
		const angularElement = this.elementRef.nativeElement.querySelector('#flexSwitchCheckDefault');
		angularElement.checked = this.showPreview;
	}
	

	toggleSwitch(event: any, not_init: boolean = true) {
		if (not_init) {
			this.showPreview = event.target.checked;
			this.cookieSrvc.setPreview(this.showPreview);
		}


		if (this.showPreview) {
			setTimeout(() => {
				if (!this.fullScreenMode) {

					const starea = document.querySelector('.st-area') as any;
					if (starea) {
						starea!.style!.float = "right";
						starea!.style!.margin = "5px 10px";
					}

				} else {
					const starea = document.querySelector('.st-area') as any;
					if (starea) {
						starea!.style!.margin = "10px 60px ";
						starea!.style!.float = "right";
					}
				}

				const iframe = document.getElementById('preview_iframe') as any;
				iframe?.classList.remove("d-none");

				this.docLoading = false;
				this.preview_loading = false;

			}, 1000)
		} else {
			setTimeout(() => {
				const starea = document.querySelector('.st-area') as any;
				if (starea) {
					starea!.style!.margin = "10px auto";
					starea!.style!.float = "";
				}
				const iframe = document.getElementById('preview_iframe') as any;
				iframe.classList.add("d-none");

				this.docLoading = false;
				this.preview_loading = false;

			}, 1000)
		}
	}

	insertPageBreak() {
		const element = document.querySelector('.st-area');
		if (element) {
			document.execCommand("insertHTML", false, `<div class="page-break" style="display: flex" contenteditable='true'>Page Break</div>`);
		}
	}

	removeToolBar() {
		const toolbar = document.querySelector(".st-toolbar");
		toolbar!.remove();
	}

	// Store event listener functions
	private keydownListener: any;
	private pasteListener: any;

	documentEventsAdd() {
		this.keydownListener = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === ']') {
				document.execCommand('indent');
			} else if (event.ctrlKey && event.key === '[') {
				document.execCommand('outdent');
			} else if (event.ctrlKey && (event.key === 'p' || event.key === 'P') && this.opened) {
				event.preventDefault();
				this.openPreview();
			} else if (event.ctrlKey && (event.key === 's' || event.key === 'S') && this.opened) {
				event.preventDefault();
				this.emitExtractedContent(false, false);
			} else if (event.key === 'Tab') {
				if (window.location.pathname == '/radiology/radiologists' && this.opened) {
					event.preventDefault();
					insertTab();
				}
			}else if (event.shiftKey && event.key === 'F3') {
				event.preventDefault();
				this.toggleCase();
			}

			function insertTab() {
				const element = document.querySelector('.st-area');
				if (element) {
					document.execCommand('insertText', false, '    ');
				}
			}
		};

		this.pasteListener = (event: ClipboardEvent) => {
			event.preventDefault();

			const clipboardData = event.clipboardData;
			let text = clipboardData?.getData('text/html') || '';

			// Create a temporary DOM element to manipulate the HTML
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = text;

			// Function to recursively remove styles from an element and its children
			function removeStyles(element: any) {
				// Remove specific styles
				if (element.style.marginLeft) element.style.marginLeft = '';
				if (element.style.textIndent) element.style.textIndent = '';
				if (element.style.left) element.style.left = '';
				if (element.style.whiteSpace) element.style.whiteSpace = 'pre-line';

				// Recursively remove styles from child elements
				Array.from(element.children).forEach(child => removeStyles(child));
			}

			// Remove &nbsp; and replace with a regular space
			// tempDiv.innerHTML = tempDiv.innerHTML.replace(/&nbsp;/g, ' ');

			// Convert all <p> tags to <div> tags
			const paragraphs = tempDiv.querySelectorAll('p');
			paragraphs.forEach((paragraph) => {
				const div = document.createElement('div');
				div.innerHTML = paragraph.innerHTML;

				// Replace the paragraph with a div
				paragraph.parentNode?.replaceChild(div, paragraph);
			});

			// Apply the function to all elements with styles
			const elements = tempDiv.querySelectorAll('[style]');
			elements.forEach((element) => {
				removeStyles(element);
			});

			// Get the cleaned HTML back as a string
			const cleanedHTML = tempDiv.innerHTML;

			// Insert the cleaned HTML into the document
			document.execCommand('insertHTML', false, cleanedHTML);
		};

		setTimeout(() => {
			document.addEventListener('keydown', this.keydownListener);
			document.addEventListener('paste', this.pasteListener);
		}, 0);
	}


	// Function to toggle the case of selected text
	toggleCase() {
		const selection = (window as any).getSelection();
		if (!selection || selection.rangeCount === 0) return;
	
		const range = selection.getRangeAt(0);
		const fragment = range.cloneContents();
		const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null);
	
		let hasUpperCase = true;
		let hasLowerCase = true;
	
		// Check if selected text is uniformly uppercase or lowercase
		while (walker.nextNode()) {
			const text = walker.currentNode.textContent || '';
			if (text !== text.toUpperCase()) hasUpperCase = false;
			if (text !== text.toLowerCase()) hasLowerCase = false;
		}
	
		// Toggle case
		walker.currentNode = fragment; // Reset the walker to the start
		while (walker.nextNode()) {
			const textNode = walker.currentNode;
			const text = textNode.textContent || '';
	
			if (hasUpperCase) {
				textNode.textContent = text.toLowerCase();
			} else if (hasLowerCase) {
				textNode.textContent = text.toUpperCase();
			} else {
				textNode.textContent = text.toUpperCase();
			}
		}
	
		// Replace the selected range with the modified content
		range.deleteContents();
		range.insertNode(fragment);
	
		// Clear the selection
		selection.removeAllRanges();
	}
	
	

	autoCloseTags(html: any) {
		// Create a div element to parse the HTML
		const div = document.createElement('div');
		div.innerHTML = html;

		// Stack to keep track of opened tags
		const stack: any = [];

		// Function to process nodes recursively
		function processNode(node: any) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				stack.push(node.nodeName);
			}
			// Process child nodes
			for (let child of node.childNodes) {
				processNode(child);
			}
			// When exiting the node, if it's an element, pop it from the stack
			if (node.nodeType === Node.ELEMENT_NODE) {
				stack.pop();
			}
		}

		// Start processing from the root element
		processNode(div);

		// Close any unclosed tags
		while (stack.length > 0) {
			const tagName = stack.pop();
			this.alertService.showError("opened")
			html += `</${tagName.toLowerCase()}>`;
		}

		return html;
	}



	setMargins() {
		const starea = document.querySelector('.st-area') as any;
		if (starea) {
			starea!.style!.padding = `0px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px`;
		}

	}

	onFullscreenClick(): any {
		this.fullscreenClicked.emit(this.getContent()); // Emit event
	}

	ExitFullscreenClick(): any {
		const stArea = this.elRef.nativeElement.querySelector('.st-editor-container .st-area');
	}

	emitExtractedContent(e: boolean, modal: boolean = true) {
		this.extractedContentChange.emit({ data: this.getContent(), pages: [], boolVal: e, closeModal: modal });
	}



	getCombinedCOntent() {
		const wordreportcontent = document.getElementById("wordreportcontent");
		if (wordreportcontent) {
			return wordreportcontent.innerHTML;
		} else { return "" }
	}


	getContent() {
		let content = '<div>'
		content += DOMPurifyI.sanitize(document.querySelector('.st-area')?.innerHTML as string)
		content += '</div>';
		return content.replace("Page Break", "<div class='page-break'></div>")
	}

	openPreview() {
		let content = this.printSrvc.previewIframe(this.getContent(), this.header_to_diplay_in_every_page, this.settings, this.bg, true);
		// this.printSrvc.printWithoutHeaderFooter(content)
		this.printSrvc.printer(content, false, false)
	}


	zoomContent(e: any, pop: any = null) {
		const contentContainer: any = document.querySelector('.st-area');

		if (contentContainer) {

			pop?.open()
			// Set the scale
			const scaleValue = e.target.value;
			contentContainer.style.transform = `scale(${scaleValue})`;

			// Calculate margin-top based on event value
			const eventRange = this.maxEventValue - this.minEventValue;
			const marginRange = this.maxMarginTop - this.minMarginTop;
			const eventPercentage = (e.target.value - this.minEventValue) / eventRange;
			const marginTop = this.minMarginTop + eventPercentage * marginRange;

			// Apply margin-top
			// contentContainer.style.marginTop = `${marginTop}px`;


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



	showChanges() {
		if (this.showPreview) {
			this.previewSubject.next('')
		}

	}

	preview_by_frame() {

		if (!this.preview_loading) {
			// Get the content you want to display in the iframe
			let content = this.printSrvc.previewIframe(this.disableEditor ? this.content : this.getContent(), this.header_to_diplay_in_every_page, this.settings, this.bg);
			// Get the iframe element

			const iframe = document.getElementById(this.disableEditor ? 'disbaled_iframe' : 'preview_iframe') as any;

			// Open the iframe's document
			iframe!.contentDocument.open();

			// Write the content to the iframe's document
			iframe!.contentDocument.write(content);
			iframe.contentDocument.body.style.visibility = "hidden"

			// Close the iframe's document
			iframe!.contentDocument.close();


			function convertPixelsToMm(x: any) {
				// Given: x = 1123 corresponds to y = 297
				const referenceX = 1123;
				const referenceY = 297;

				// Calculate y using the proportional relationship
				const y = (x / referenceX) * referenceY;
				return y;
			}

			// Apply additional styles or modifications if needed
			setTimeout(() => {
				// // For example, you can add new content or styles here
				const body = iframe.contentDocument.body;
				if (this.disableEditor) {
					body.style.transform = 'scale(1)';
					body.style.border = '1px solid black';
					body.style.width = "212mm";
				} else {
					body.style.transform = this.fullScreenMode ? 'scale(0.5)' : 'scale(0.3)';
				}
				body.style.transformOrigin = 'top left';
				body.style.visibility = "visible"
				body.style.minHeight = '297mm';
				body.style.margin = '0';

				const html = iframe.contentDocument.documentElement;
				const heightInMm = convertPixelsToMm(body.offsetHeight);
				html.style.height = `${heightInMm}`;


			}, 500); // Delay in milliseconds

		} else {
			const iframe = document.getElementById(this.disableEditor ? 'disbaled_iframe' : 'preview_iframe') as any;

			// Open the iframe's document
			iframe!.contentDocument.open();

			// Write the content to the iframe's document
			iframe!.contentDocument.write(this.loading_html);


			// Close the iframe's document
			iframe!.contentDocument.close();
		}

	}


	disabledIframe() {
		// Get the content you want to display in the iframe
		let content = this.printSrvc.previewIframe(this.content, this.header_to_diplay_in_every_page, this.settings, this.bg);

		// Get the iframe element
		const iframe = document.getElementById('disbaled_iframe') as any;

		// Open the iframe's document
		iframe!.contentDocument.open();

		// Write the content to the iframe's document
		iframe!.contentDocument.write(content);

		// Close the iframe's document
		iframe!.contentDocument.close();


		function convertPixelsToMm(x: any) {
			// Given: x = 1123 corresponds to y = 297
			const referenceX = 1123;
			const referenceY = 297;

			// Calculate y using the proportional relationship
			const y = (x / referenceX) * referenceY;
			return y;
		}

		// Apply additional styles or modifications if needed
		setTimeout(() => {
			// // For example, you can add new content or styles here
			const body = iframe.contentDocument.body;
			body.style.transform = this.fullScreenMode ? 'scale(0.5)' : 'scale(0.3)';
			body.style.transformOrigin = 'top left';
			body.style.visibility = "visible"
			body.style.minHeight = '297mm';
			body.style.margin = '0';

			const html = iframe.contentDocument.documentElement;
			const heightInMm = convertPixelsToMm(body.offsetHeight);
			html.style.height = `${heightInMm}`;

			// body.style.outline = '2px solid black';
		}, 500); // Delay in milliseconds

	}

	changeTestTemplate(e: any) {
		this.subsink.sink = this.masterEndpoint.getReportData(e.id, e.LabGlobalTestID).subscribe((reportdata: any) => {
			if (reportdata.report) {
				this.content = reportdata.report
			} else {
				this.alertService.showError(`No Content Availiable in ${e.name}`)
			}
		})
	}

	parameters: any = [];
	getTestDefaultParamters(q: any) {

		if (q && q.length >= 2) {
			this.parameters = [];

			this.subsink.sink = this.masterEndpoint.getDefaultParamters(this.details.LabPatientTestID.LabGlobalTestId, "all", 1, q).subscribe((res: any) => {
				if (res.length >= 1) {
					this.parameters = res.filter((r: any) => r.is_active);
				}
			});
		}
	}

	savedRange: any;

	saveCursorPosition(event: MouseEvent | KeyboardEvent | any) {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			this.savedRange = selection.getRangeAt(0);
		}
	}

	addText(e: any) {
		const element = document.querySelector('.st-area');
		if (element) {
			const selection = window.getSelection();
			if (selection) {
				if (this.savedRange) {
					selection.removeAllRanges();
					selection.addRange(this.savedRange);
				} else {
					// If no saved cursor position, create a new range at the start
					const range = document.createRange();
					range.setStart(element, 0);
					range.setEnd(element, 0);
					selection.removeAllRanges();
					selection.addRange(range);
				}
				document.execCommand('insertText', false, e.parameter);
				// Save the new cursor position after insertion
				this.saveCursorPosition(new Event('input'));
			}
		}
	}




	onPaste(event: any) {
		event.preventDefault();
		// const clipboardData = event.clipboardData;
		// const text = clipboardData?.getData('text/html') || '';

		// document.execCommand('insertHTML', false, text);
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
