import { Component, ElementRef, Input, OnInit, EventEmitter, Output, Renderer2, ViewChild, ChangeDetectorRef, AfterViewInit, Injector } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
	selector: 'app-jodit-word-editor',
	templateUrl: './jodit-word-editor.component.html',
	styleUrl: './jodit-word-editor.component.scss'
})
export class JoditWordEditorComponent extends BaseComponent<any> {


	config = {
		hidePoweredByJodit: true,
		toolbarInline: true,
		toolbarInlineForSelection: true,
		toolbarInlineDisabledButtons: ['source','bold'],
		popup: {
			selection: ['bold','italic','ul','ol','paragraph','table','link','spellcheck','source']
			},
		className: 'exampleClass',
		theme: 'default',
		toolbarButtonSize: "small",
		buttons: "undo,redo,|,bold,italic,underline,font,fontsize,lineHeight,|,ul,ol,paragraph,|,table,|,left,center,right,|,indent,outdent",
		disablePlugins: "about,ai-assistant,class-span,xpath,video,speech-recognize,source,link,media,mobile,limit",
		zIndex: 0,
		defaultActionOnPaste: "INSERT_AS_HTML",
		dtd: {
			removeExtraBr: true,
			// checkBlockNesting: true,
			// blockLimits: 1
		},
		disabled: false,
		cleanHTML: {
			cleanOnPaste: true,
			replaceNBSP: true,
		},
		controls: { fontsize: 
			{list: {
				'8': '8',
				'9': '9',
				'10': '10',
				'11': '11',
				'12': '12',
				'13': '13',
				'14': '14',
				'15': '15',
				'16': '16',
				'17': '17',
				'18': '18',
				'19': '19',
				'20': '20',
				'21': '21',
				'22': '22',
				'23': '23',
				'24': '24'
				}			
			},
		},
		processPasteFromWord: false,
		processPasteHTML: true,
		nl2brInPlainText: false,
		askBeforePasteHTML: false,
		readonly: false,
		activeButtonsInReadOnly: ['source', 'fullsize', 'print', 'about', 'dots'],
		showCharsCounter: false,
		showWordsCounter: false,
		showXPathInStatusbar: true,
		spellcheck: true,
		triggerChangeEvent: false,
		height: '70vh',
		pageBreak: {
			separator: '<!-- pagebreak -->'
		},
		minHeight: 100,
		direction: '',
		language: 'auto',
		debugLanguage: false,
		i18n: 'en',
		tabIndex: -1,
		toolbar: true,
		enter: "DIV",
		useSplitMode: false,
		statusbar: true,
		useNativeTooltip: false,
		tab: {
			tabInsideLiInsertNewList: false
		},
		allowResizeX: false,
		allowResizeY: false,
		indentMargin: 15,
		cache: false,
		useSearch: false,
		sourceEditor: 'ace',
		style: {
			font: '16px Arial',
			color: '#0c0c0c'
		},
		editorStyle: {
			font: '16px Arial',
			color: '#0c0c0c'
		},
		// defaultLineHeight: 1.2,
		events: {
			paste: (event: ClipboardEvent) => {

				setTimeout(() => {
					this.cleanHtml();
					this.preview_by_frame();
				}, 100)

				return
			},
		},


	};

	getDynamicStyles(): string {
		let styles = '';

		if (this.docLoading) {
			styles += 'visibility: hidden;';
		}

		if (this.fullScreenMode) {
			styles += 'height: 90vh;';
		} else {
			styles += 'height: 80vh;';
		}

		return styles;
	}

	cleanHtml() {
		const wysiwyg = document.querySelector('.jodit-wysiwyg')
		const text = wysiwyg?.innerHTML as string

		// Create a temporary DOM element to manipulate the HTML
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = text;

		// Function to recursively remove styles from an element and its children
		function removeStyles(element: any) {
			// Remove specific styles
			// if (element.style.marginLeft) element.style.marginLeft = '';
			if (element.style.textIndent) {
				element.style.marginLeft += element.style.textIndent;
				element.style.textIndent = '';
			}
			if (element.style.left) element.style.left = '';
			if (element.style.whiteSpace) element.style.whiteSpace = 'pre-line';

			// Recursively remove styles from child elements
			Array.from(element.children).forEach(child => removeStyles(child));
		}

		// Remove &nbsp; and replace with a regular space
		// tempDiv.innerHTML = tempDiv.innerHTML.replace(/&nbsp;/g, ' ');
		tempDiv.innerHTML = tempDiv.innerHTML.replace(/&#xFEFF;/g, ' ');

		// Convert all <p> tags to <div> tags
		// const paragraphs = tempDiv.querySelectorAll('p');
		// paragraphs.forEach((paragraph) => {
		// 	const div = document.createElement('div');
		// 	div.innerHTML = paragraph.innerHTML;

		// 	// Replace the paragraph with a div
		// 	paragraph.parentNode?.replaceChild(div, paragraph);
		// });

		// Apply the function to all elements with styles
		const elements = tempDiv.querySelectorAll('[style]');
		elements.forEach((element) => {
			removeStyles(element);
		});

		// Get the cleaned HTML back as a string
		const cleanedHTML = tempDiv.innerHTML;

		wysiwyg!.innerHTML = cleanedHTML
	}


	@ViewChild('joditValue') joditValue: any;

	private previewSubject: Subject<any> = new Subject<any>();

	@Input() content: any = ``;
	@Input() details: any = null;
	@Input() onlySave: boolean = false;
	@Input() auth: boolean = false;


	@Input() fullScreenMode: any = false;
	@Input() header_to_diplay_in_every_page: any = '';

	@Input() loadingAnm: boolean = false;
	@Input() loadingAuthAnm: boolean = false;
	@Input() previewLoad: boolean = false;
	@Input() disableEditor: boolean = false;

	@Output() fullscreenClicked = new EventEmitter<any>();
	@Output() exitFullscreenClicked = new EventEmitter<any>();
	@Output() extractedContentChange = new EventEmitter<any>();

	tempBackup: any;
	bg = '/assets/images/blank.png'
	opened: boolean = false;
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
		margin_left: 0,
		margin_right: 0,
		font: null
	};

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
		}else{
			this.showPreview = false;
		}

		if (this.fullScreenMode) {
			this.config.height = '80vh';
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
				this.bg = set[0].letterhead && set[0].letterhead !== '' ? set[0].letterhead : this.bg;

				this.setMargins();
				this.documentEventsAdd();

				if (!this.disableEditor) {
					this.joditValue.value = this.content;
					this.toggleSwitch(null, true);
					this.setMargins();
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

	}

	override ngOnDestroy(): void {
		this.opened = false;
		this.disableEditor = false;
		this.docLoading = false;
		this.preview_loading = false;

		document.removeEventListener('keydown', this.keydownListener);
	}

	createAndAppendSelect() {
		// Create a div container
		const div = this.renderer.createElement('div');
		this.renderer.addClass(div, 'd-flex');

		// Create a switch input container
		const switchDiv = this.renderer.createElement('div');
		// this.renderer.addClass(switchDiv, 'form-check form-switch ms-3');
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

		//page break button 
		// const pageBreakButton = document.createElement("button");
		// pageBreakButton.innerText = "Page Break";
		// pageBreakButton.classList.add("btn");
		// pageBreakButton.classList.add("btn-sm")
		// pageBreakButton.classList.add("bg-dark");
		// pageBreakButton.classList.add("rounded-3");
		// pageBreakButton.classList.add("text-white");
		// pageBreakButton.classList.add("mx-2");
		// pageBreakButton.classList.add("shadow");
		// pageBreakButton.setAttribute("id", "page_break_button")

		// Append the switch input and label to the switchDiv
		this.renderer.appendChild(switchDiv, switchInput);
		this.renderer.appendChild(switchDiv, switchLabel);

		// Append the switchDiv to the div container
		this.renderer.appendChild(div, switchDiv);

		// Find the toolbar and append the div container to it
		const toolbar = document.querySelector('.jodit-ui-group');

		// this.renderer.appendChild(toolbar, pageBreakButton);
		this.renderer.appendChild(toolbar, div);


		this.insertPageBreak = this.insertPageBreak.bind(this);

		// pageBreakButton!.addEventListener('click', this.insertPageBreak);
		// Manually update the input value to bind it with `ngModel`
		
	}

	toggleSwitch(event: any, init: any = false) {

		if (!init) {
			try{
				this.showPreview = event.target.checked;
			}catch(error){
				this.showPreview = event
			}
			
			this.cookieSrvc.setPreview(this.showPreview);
		}

		if (this.showPreview) {
			this.preview_loading = true;
			this.preview_by_frame();

			setTimeout(() => {
				if (!this.fullScreenMode) {
					const starea = document.querySelector('.jodit-workplace') as any;
					if (starea) {
						starea!.style!.float = "right";
						starea!.style!.margin = "5px 10px";
					}

				} else {
					const starea = document.querySelector('.jodit-workplace') as any;
					if (starea) {
						starea!.style!.margin = "10px 60px ";
						starea!.style!.float = "right";
					}
				}

				const iframe = document.getElementById('preview_iframe_setup') as any;
				iframe?.classList.remove("d-none");

				this.preview_loading = false;
				this.preview_by_frame();
				this.docLoading = false;
				this.setMargins();
			}, 1000)
		} else {
			setTimeout(() => {
				const starea = document.querySelector('.jodit-workplace') as any;
				if (starea) {
					starea!.style!.margin = "10px auto";
					starea!.style!.float = "";
				}
				const iframe = document.getElementById('preview_iframe_setup') as any;
				iframe.classList.add("d-none");
				this.docLoading = false;
				this.setMargins();
			}, 500)
		}
	}

	insertPageBreak() {
		const element = document.querySelector('.jodit-wysiwyg');
		if (element) {
			document.execCommand("insertHTML", false, `<div class="page-break" contenteditable='false'>Page Break</div>`);
			this.showChanges();
		}
	}

	removeToolBar() {
		const toolbar = document.querySelector(".st-toolbar");
		toolbar!.remove();
	}

	private keydownListener: any;

	documentEventsAdd() {
		this.keydownListener = (event: KeyboardEvent) => {
			// Ensure the event is prevented only when necessary
			if (!this.opened) {
				return;
			}
			// Handle different key events using a switch statement
			switch (event.key.toLowerCase()) {
				case 'f3':
					if (event.shiftKey) {
						event.preventDefault();
						this.toggleCase();
					}
					break;
				case 'p':
					if (event.ctrlKey) {
						event.preventDefault();
						this.openPreview();
					}
					break;

				case 'f':
					if (event.ctrlKey) {
						event.preventDefault();
						this.onFullscreenClick();
					}
					break;

				case 's':
					if (event.ctrlKey) {
						event.preventDefault();
						this.emitExtractedContent(false, false);
					}
					break;

				case 'tab':
					event.preventDefault();
					insertTab();
					break;

				default:
					// No action for other keys
					break;
			}

			// Function to insert a tab
			function insertTab() {
				const element = document.querySelector('.jodit-wysiwyg');
				if (element) {
					document.execCommand('insertText', false, '    ');
				}
			}
		}

		setTimeout(() => {
			document.addEventListener('keydown', this.keydownListener);
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


	setMargins() {
		const joditArea = document.querySelector('.jodit-wysiwyg') as any;
		if (joditArea) {
			joditArea!.style!.padding = `0px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px`;
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

	getContent() {
		let content = '<div>'
		// content = this.joditValue.elementRef.nativeElement.innerHTML
		content += document.querySelector('.jodit-wysiwyg')?.innerHTML as string
		content += '</div>';
		// return content.replace("PageBreak", "<div class='break_page'></div>")
		return content
	}

	openPreview() {
		let content = this.printSrvc.previewIframe(this.getContent(), this.header_to_diplay_in_every_page, this.settings, this.bg, true);
		// this.printSrvc.printWithoutHeaderFooter(content)
		this.printSrvc.printer(content, false, false)
	}


	zoomContent(e: any, pop: any = null) {
		const contentContainer: any = document.querySelector('.jodit-workplace');

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

	showChanges(e: any = null) {
		if (this.showPreview) {
			this.previewSubject.next('')
		}
	}

	preview_by_frame() {

		if (!this.preview_loading) {

			// Get the content you want to display in the iframe
			let content = this.printSrvc.previewIframe(this.disableEditor ? this.content : this.getContent(), this.header_to_diplay_in_every_page, this.settings, this.bg);

			// Get the iframe element
			const iframe = document.getElementById(this.disableEditor ? 'disbaled_iframe' : "preview_iframe_setup") as any;

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


			const iframe = document.getElementById(this.disableEditor ? 'disbaled_iframe' : "preview_iframe_setup") as any;

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
		const element = document.querySelector('.jodit-wysiwyg');
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
		} else {
			this.alertService.showError("noo")
		}
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
