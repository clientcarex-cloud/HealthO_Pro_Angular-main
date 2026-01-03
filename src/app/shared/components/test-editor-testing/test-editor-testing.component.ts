import { Component, ElementRef, Input, OnInit, EventEmitter, Output, Renderer2, ViewChild, ChangeDetectorRef, AfterViewInit, Injector } from '@angular/core';

import { EditorConfig, ST_BUTTONS, LINK_INPUT, UNDO_BUTTON, REDO_BUTTON, REMOVE_FORMAT_BUTTON, SEPARATOR, BOLD_BUTTON, ITALIC_BUTTON, UNDERLINE_BUTTON, STRIKE_THROUGH_BUTTON, JUSTIFY_LEFT_BUTTON, JUSTIFY_CENTER_BUTTON, JUSTIFY_RIGHT_BUTTON, JUSTIFY_FULL_BUTTON, ORDERED_LIST_BUTTON, UNORDERED_LIST_BUTTON, INDENT_BUTTON, OUTDENT_BUTTON, SUBSCRIPT_BUTTON, SUPERSCRIPT_BUTTON, FONT_SIZE_SELECT, UNLINK_BUTTON, FORE_COLOR, IMAGE_INPUT, CUSTOM } from 'ngx-simple-text-editor';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import DOMPurifyI from 'dompurify';
import { BaseComponent } from '@sharedcommon/base/base.component';

@Component({
  selector: 'app-test-editor-testing',
  templateUrl: './test-editor-testing.component.html',
  styleUrl: './test-editor-testing.component.scss'
})

export class TestEditorTestingComponent extends BaseComponent<any> {
  
	// FONT_SIZE_SELECT
	config: EditorConfig = {
		placeholder: 'Type something...',
		buttons: [UNDO_BUTTON, REDO_BUTTON, REMOVE_FORMAT_BUTTON, SEPARATOR, BOLD_BUTTON, ITALIC_BUTTON, UNDERLINE_BUTTON, STRIKE_THROUGH_BUTTON, JUSTIFY_LEFT_BUTTON, JUSTIFY_CENTER_BUTTON, JUSTIFY_RIGHT_BUTTON, JUSTIFY_FULL_BUTTON, ORDERED_LIST_BUTTON, UNORDERED_LIST_BUTTON, FONT_SIZE_SELECT]
	};

	@ViewChild('setMargins') marginModal: any;

	@Input() content: any = ``;
	@Input() details: any = null;
	@Input() onlySave: boolean = false;
	@Input() auth: boolean = false;
	@Input() test_id: any;
	@Input() department_id: any;
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
	@Output() openPreviewReport = new EventEmitter<any>();

	paddingTop: string = '0';
	paddingRight: string = '1cm';
	paddingBottom: string = '0';
	paddingLeft: string = '1cm';
	marginOptions: string[] = ['0', '0.3cm', '0.4cm', '0.5cm', '0.6cm', '0.7cm', '0.8cm', '0.9cm', '1.0cm', '1.1cm', '1.2cm'];
	st_area_editor: any = "<div id='st_area_editor'></div>"
	organization: any;
	tempBackup: any;
	page_number: any = 1
	pageCount = 1; // Track the number of pages
	bg = '/assets/images/blank.png'
  	// bg = '#fff'
	extractedContent!: SafeHtml; // To store the extracted content
	templateContentStore: any;
	opened: boolean = false;
	contentEditBool: any = 'true';
	selectedAll: boolean = false
	scale: number = 1;

	minEventValue: number = 1; // Minimum event value
	maxEventValue: number = 1.5; // Maximum event value
	minMarginTop: number = 10; // Minimum margin-top value
	maxMarginTop: number = 300; // Maximum margin-top value

	@Input() pages_content: any = [];


	page1: any = `<p>page 1</p>`
	page2: any = `<p>page 2</p>`
	page7: any = `<p>page 3</p>`

	settings: any = {
		header_height: 0,
		footer_height: 0,
		margin_left: 0,
		margin_right: 0
	};

	fontList: any = [
		"Trebuchet", // Add Trebuchet to the font list
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
		private cdr: ChangeDetectorRef,

	) { super(injector) }

	override ngAfterViewInit(): void {

	}

	override ngOnDestroy(): void {
		this.opened = false;
	}

	override ngOnInit(): void {
		this.opened = true;

		if (this.disableEditor) {
			this.removeToolBar();
		}

		this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((set: any) => {
			if (set.length !== 0) {
				this.settings.header_height = set[0].header_height;
				this.settings.footer_height = set[0].footer_height;
				this.settings.margin_left = set[0].margin_left;
				this.settings.margin_right = set[0].margin_right;
				this.bg = set[0].letterhead && set[0].letterhead !== '' ? set[0].letterhead : this.bg;
				this.setContent();

				this.documentEventsAdd();
			} else {
				this.setContent();
				this.documentEventsAdd();
			}
		}, (error) => {
			this.setContent();
			this.documentEventsAdd();
		})

		this.tempBackup = this.pages_content;
	}

	setContentttt(templateContent: any) {
		this.page_number = 1;

		this.st_area_editor = `
			<div class="all_pages" style="w-100" id="all_pages">`;

		// this.st_area_editor = "";

		this.pages_content.forEach((data: any) => {
			let page = `
				<div class='st_area_editor${this.page_number}' id='st_area_editor${this.page_number}' style="max-height: 297mm; min-height: 297mm; line-height:20px !important; border: 1px solid #000; background-size: 210mm 297mm; margin: 10px auto; align-self: center; width: 210mm; padding: 0px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px;
				 background-image: url('${this.bg}'); overflow: hidden;">
				  <div contentEditable=false style="opacity: 0.5; padding-top: ${this.settings.header_height}px">${this.header_to_diplay_in_every_page}</div>
				  <div contentEditable=true class="wordreportcontent${this.page_number}" 
				  style="outline: 2.5px solid #0d6efd42; 
				  height: ${1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()}px;
				  max-height: ${1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()}px" 
				  id="wordreportcontent${this.page_number}" >${data}</div>
				</div>
			`;

			this.st_area_editor += page;
			this.page_number += 1;
		})

		this.st_area_editor += '</div>';

		this.addClickEvents();
		// this.addPreventBackspaceBehavior();
	}

	setToolBar() {
		const toolbar = document.querySelector(".st-toolbar");
		let page_container = document.getElementById("page_container");

		if (!page_container) {
			page_container = document.createElement("div");
			page_container.setAttribute("id", "page_container");

			const page_number_div = document.createElement("div");
			page_number_div.setAttribute("id", "page_number");

			// Create small and i tags dynamically
			const smallTag = document.createElement("small");
			const iTag = document.createElement("i");
			iTag.textContent = "Page  ";
			smallTag.appendChild(iTag);

			// Create b tag for the page number
			const pageNumberTag = document.createElement("b");
			pageNumberTag.setAttribute("id", "current_page_number");
			pageNumberTag.textContent = "1";

			// Append small and b tags to page_number_div
			page_number_div.appendChild(smallTag);
			page_number_div.appendChild(document.createTextNode(" "));
			page_number_div.appendChild(pageNumberTag);

			const of_div = document.createElement("div");
			of_div.setAttribute("id", "page_number");
			of_div.textContent = "of";

			const total_number_div = document.createElement("div");
			total_number_div.setAttribute("id", "total_number");
			total_number_div.innerHTML = `<b>${this.pages_content.length}</b>`;

			page_container.setAttribute("style", "display: flex; flex-direction: row; gap: 7px; padding-left: 25px");
			page_container.append(page_number_div);
			page_container.append(of_div);
			page_container.append(total_number_div);

			const deleteButton = document.createElement("button");
			deleteButton.innerText = "Delete Page";
			deleteButton.classList.add("btn");
			deleteButton.classList.add("btn-sm")
			deleteButton.classList.add("btn-soft-danger");
			deleteButton.classList.add("rounded-3");
			deleteButton.classList.add("ms-3");
			deleteButton.setAttribute("id", "deletePage")

			const addButton = document.createElement("button");
			addButton.innerText = "+ Add Page ";
			addButton.classList.add("btn");
			addButton.classList.add("btn-sm")
			addButton.classList.add("bg-dark");
			addButton.classList.add("rounded-3");
			addButton.classList.add("text-white");
			addButton.classList.add("ms-3");
			addButton.classList.add("shadow");
			addButton.setAttribute("id", "addPage")


			// const resetButton = document.createElement("button");
			// resetButton.innerText = "Reset Report ";
			// resetButton.classList.add("btn");
			// resetButton.classList.add("btn-sm")
			// resetButton.classList.add("bg-white");
			// resetButton.classList.add("rounded-3");
			// resetButton.classList.add("text-black");
			// resetButton.classList.add("border");
			// resetButton.classList.add("ms-3");
			// resetButton.classList.add("shadow");
			// resetButton.setAttribute("id", "resetPage")

			toolbar?.appendChild(page_container);

			toolbar?.appendChild(addButton);

			toolbar?.appendChild(deleteButton);

			// toolbar?.appendChild(resetButton);
			// Bind the handler to the instance
			this.deletePageHandler = this.deletePageHandler.bind(this);

			this.resetPagesContent = this.resetPagesContent.bind(this);

			const deletePage = document.getElementById('deletePage');
			// Add the new event listener
			deletePage!.addEventListener('click', this.deletePageHandler);

			// const resetBtn = document.getElementById('resetPage');

			// resetBtn!.addEventListener('click', this.resetPagesContent);

			// Bind the handler to the instance
			this.addPageHandler = this.addPageHandler.bind(this);

			const addPage = document.getElementById('addPage');
			// Add the new event listener
			addPage!.addEventListener('click', this.addPageHandler);
		}
	}

	resetPagesContent(){
		this.pages_content = this.tempBackup;
		this.setContent();
	}

	deletePageHandler() {
		this.setCombinedCOntent();
		const page_number = document.getElementById("current_page_number");
		if (page_number) {
			const pageNumber = parseInt(page_number.textContent || "0", 10); // Convert to number

			if (this.pages_content.length != 1) {
				// Remove the specified page
				this.pages_content.splice(pageNumber - 1, 1);
				this.setContent();
				this.setPageNumbers();

				// Use setTimeout to ensure the new page is rendered before focusing
				setTimeout(() => {
					const nextPage = document.getElementById(`wordreportcontent${pageNumber - 1}`);
					nextPage?.focus();
				}, 0); // You can adjust the delay time if needed
			}
		}
	}

	addPageHandler() {
		this.setCombinedCOntent();
		const page_number = document.getElementById("current_page_number");
		if (page_number) {
			const pageNumber = parseInt(page_number.textContent || "0", 10); // Convert to number

			this.pages_content.splice(pageNumber + 1, 0, " ");
			this.setContent();
			this.setPageNumbers();

			// Use setTimeout to ensure the new page is rendered before focusing
			setTimeout(() => {
				const nextPage = document.getElementById(`wordreportcontent${pageNumber + 1}`);
				nextPage?.focus();
			}, 0); // You can adjust the delay time if needed
		}
	}

	removeToolBar() {
		const toolbar = document.querySelector(".st-toolbar");
		toolbar!.remove();
		// toolbar?.setAttribute("style", "visibility: hidden");
	}

  async setContent(templateContent: any = '', listeners: boolean = true) {
    this.page_number = 1;
    this.st_area_editor = `<div class="all_pages" contentEditable=false id="all_pages">`;
  
    this.pages_content.forEach((data: any, index: number) => {
      this.st_area_editor += this.createPageContent(data, index);
      this.page_number += 1;
    });
  
    this.st_area_editor += '</div>';
  
    if (!this.disableEditor) {
      this.setToolBar();
      this.addClickEvents();
    }
  }
  
  private createPageContent(data: any, index: number): string {
    return `
      <div class='st_area_editor${index + 1}' id='st_area_editor${index + 1}' 
        style="max-height: 297mm; min-height: 297mm; 
        line-height:20px !important; outline: 1px solid #000; 
        background-size: 210mm 297mm; margin: 10px auto; 
        align-self: center; 
        width: 210mm; 
        background-image: url('${this.bg}'); 
        padding: 0px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px;
        background-color: white;
        overflow: hidden;">
  
          <div inert contentEditable=false style="opacity: 0.5; padding-top: ${this.settings.header_height}px ;">
            ${this.header_to_diplay_in_every_page}
          </div>
  
          <div contentEditable=${!this.disableEditor} class="wordreportcontent wordreportcontent${index + 1}" 
            style="${!this.disableEditor ? "outline: 1.5px dashed #0d6efd42; " : ""}
            height: ${1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()}px;
            max-height: ${1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()}px" 
            id="wordreportcontent${index + 1}" >
            ${data}
          </div>
      </div>`;
  }
  



	makeContentEdit(val = this.contentEditBool) {
		const pageElement = document.getElementById(`all_pages`);
		pageElement!.setAttribute('contenteditable', this.contentEditBool)
	}

	removeALLContent() {
		document.execCommand('undo', false, undefined);
		this.pages_content = ["Type Here"];
		this.setContent();
		this.selectedAll = false;
		const element = document.getElementById('wordreportcontent1');
		element?.focus();
	}

	documentEventsAdd(){
		setTimeout(() => {
			document.addEventListener('keydown', (event) => {
				if (!event.ctrlKey && !event.shiftKey && /^[a-zA-Z]$/.test(event.key) && this.selectedAll) {
					event.preventDefault();
					document.execCommand('undo', false, undefined);
					this.removeALLContent();
				}

				else if (event.ctrlKey && (event.key === 'a' || event.key === 'A') && this.opened) {
					event.preventDefault();
					// this.selectedAll = true;
					// pageElement!.setAttribute('contenteditable', 'true')
					// this.makeContentEdit('true');
					// const page_number = document.getElementById("current_page_number");
					// const contentElement = document.getElementById(`wordreportcontent${page_number!.textContent}`);
					// if (contentElement) {
					// 	const range = document.createRange();
					// 	range.selectNodeContents(contentElement);
					// 	const selection = window.getSelection();
					// 	if (selection) {
					// 		selection.removeAllRanges();
					// 		selection.addRange(range);
					// 	}
					// }

				}

				else if (event.ctrlKey && (event.key === 'x' || event.key === 'X') && this.opened) {
					event.preventDefault();
					// this.openPreview()
					// this.alertService.showSuccess("Text Copied");
				}
				else if (event.key === 'Backspace' && this.opened && this.selectedAll) {
					event.preventDefault();
					this.removeALLContent();
				}

				else if (event.ctrlKey && (event.key === 'p' || event.key === 'P') && this.opened) {
					event.preventDefault();
					this.openPreview()
				}

				else if (event.ctrlKey && (event.key === 's' || event.key === 'S') && this.opened) {
					event.preventDefault();
					this.emitExtractedContent(false, false)
				}

				else if (event.key === 'Tab') {
					if (window.location.pathname == '/radiology/radiologists' && this.opened) {
						event.preventDefault();
						insertTab();
					}
				}

				function selectAllContent() {
					const page_number = document.getElementById("current_page_number");
					const current_container = document.getElementById(`wordreportcontent${page_number!.textContent}`);
					selectText(current_container)
				}

				function selectText(element: any) {
					const range = document.createRange();
					range.selectNodeContents(element);
					const selection = window.getSelection();
					if (selection) {
						selection.removeAllRanges();
						selection.addRange(range);
					}
				}

				function insertTab() {
					const page_number = document.getElementById("current_page_number");
					const element = document.getElementById(`wordreportcontent${page_number!.textContent}`)
					if (element) {
						document.execCommand('insertText', false, '    ');
					}
				};

			});

		}, 0)
	}

	addClickEvents(): void {
		setTimeout(() => {
			this.pages_content.forEach((data: any, index: number) => {
				const pageElement = document.getElementById(`st_area_editor${index + 1}`);
				if (pageElement) {

					this.renderer.listen(pageElement, 'input', (event) => {

						const contentElement = document.getElementById(`wordreportcontent${index + 1}`);

						if (!this.selectedAll) {
							// Check if content overflows, if so, add a new page
							const inputKey = (event as InputEvent); // Get the input character
							this.setPageNumbers(index);
							if (inputKey.inputType != "deleteContentBackward") {
								if (contentElement!.scrollHeight > 1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()) {
									this.alertService.showInfo("Content Exceeds the page content");
									document.execCommand('undo', false, undefined);

									const nextPage = document.getElementById(`wordreportcontent${index + 2}`)

									// check next page is full or not 
									if (nextPage) {
										if (nextPage!.scrollHeight > 1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()) {
											this.setCombinedCOntent();
											this.pages_content.splice(index + 1, 0, " ");
											this.setContent();
										} else {
											nextPage?.focus()
										}
									} else {
										this.setCombinedCOntent();
										this.pages_content.splice(index + 1, 0, " ");
										this.setContent();

										this.alertService.showInfo("Page Added")

										setTimeout(() => {
											const nextPage = document.getElementById(`wordreportcontent${index + 2}`);
											nextPage?.focus();
										}, 0);
									}
								}


							} if (inputKey.inputType == "insertFromPaste") {
                
								if (contentElement!.scrollHeight > 1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()) {
									document.execCommand('undo', false, undefined);
								}
								event.preventDefault();
							}
						} else {
							this.removeALLContent();
						}

						this.saveCombinedContent();
					});

					this.renderer.listen(pageElement, 'click', () => {
						this.setPageNumbers(index);
					})

					this.renderer.listen(pageElement, 'paste', (event) => {
						// Prevent default paste behavior
						const container = document.getElementById(`wordreportcontent${index + 1}`);

						const currentContent = container!.innerHTML;

						let clipboardData = event.clipboardData || (window as any).clipboardData;
						let pastedContent = clipboardData.getData("text/html");

						// const sanitizedContent = DOMPurifyI.sanitize(pastedContent);

						let totalHeight = 0;
						container!.childNodes.forEach((node) => {
							if (node.nodeType === Node.ELEMENT_NODE) {
								totalHeight += (node as HTMLElement).offsetHeight;
							}
						});

						const allowedContentSize = 1123 - totalHeight - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()// Calculate allowed size based on page height

						if (this.getHeight(pastedContent) > allowedContentSize) {
							event.preventDefault();
							this.alertService.showError("Content exceeds page limit. Please paste in smaller chunks.");
						}

					});

				}
			});


			// document.addEventListener('click', (event) =>{
			// 	this.selectedAll = false
			// })


			const pageElement = document.getElementById(`all_pages`);

			if (pageElement) {
				this.renderer.listen(pageElement, 'mouseleave', () => {
					this.makeContentEdit(this.contentEditBool)
				})

				this.renderer.listen(pageElement, 'mouseenter', () => {
					pageElement.setAttribute('contenteditable', 'false');
				})
			}

		}, 0); // Delay to ensure the DOM is fully rendered before adding event listeners
	}

	setPageNumbers(index: any = 0) {
		const page_number = document.getElementById("current_page_number");
		page_number!.textContent = `${index + 1}`;



		const total_number = document.getElementById("total_number");
		total_number!.innerHTML = `<b>${this.pages_content.length}</b>`;

		const deletePage = document.getElementById("deletePage");
		if (this.pages_content.length !== 1) {
			deletePage!.textContent = "Delete Page No. " + (index + 1);
			deletePage?.classList.remove("d-none");
			deletePage?.classList.add("d-flex");
		} else {
			deletePage?.classList.remove("d-flex");
			deletePage?.classList.add("d-none");

		}
	}

	setCombinedCOntent() {
		const editorContainer = document.getElementById('all_pages');
		if (editorContainer) {
			let combinedContent: any = [];
			const contentContainers = editorContainer.querySelectorAll('[id^="wordreportcontent"]');
			contentContainers.forEach(container => {
				combinedContent.push(container.innerHTML);
			});

			this.pages_content = combinedContent
			// return combinedContent
		} else {
			// return ''
		}
	}

	tempPages: any = [];

	saveCombinedContent() {
		const editorContainer = document.getElementById('all_pages');
		if (editorContainer) {
			let combinedContent: any = [];
			const contentContainers = editorContainer.querySelectorAll('[id^="wordreportcontent"]');
			contentContainers.forEach(container => {
				combinedContent.push(container.innerHTML);
			});

			this.tempPages = combinedContent;
		}
	}

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

	onFullscreenClick(): any {
		this.saveCombinedContent();
		this.fullscreenClicked.emit({ pages: this.tempPages }); // Emit event
	}

	ExitFullscreenClick(): any {
		const stArea = this.elRef.nativeElement.querySelector('.st-editor-container .st-area');
	}

	emitExtractedContent(e: boolean, modal: boolean = true) {
		this.saveCombinedContent();
		this.extractedContentChange.emit({ data: this.getContent(), pages: this.tempPages, boolVal: e, closeModal: modal });
	}



	getCombinedCOntent() {
		const editorContainer = document.getElementById('all_pages');
		if (editorContainer) {
			let combinedContent = '';
			const contentContainers = editorContainer.querySelectorAll('[id^="wordreportcontent"]');
			contentContainers.forEach(container => {
				combinedContent += container.innerHTML;
			});
			return combinedContent
		} else {
			return ''
		}
	}


	getContent() {
		if (!this.onlySave) {
			// Combine content from all wordreportcontent elements
			const editorContainer = document.getElementById('all_pages');
			if (editorContainer) {
				let combinedContent = '';
				this.setCombinedCOntent();
				this.pages_content.forEach((page: any, index: number) => {
					combinedContent += `<div>${this.autoCloseTags(DOMPurifyI.sanitize(page))}</div>`;
					// Add page break div except for the last page
					if (index < this.pages_content.length - 1) {
						combinedContent += "<div class='break_page'></div>";
					}
				});
				return combinedContent
			} else {
				return ''
			}

		} else {
			const content = document.getElementById("wordreportcontent");
			`<div style="font-family: 'Trebuchet MS', sans-serif;">${content?.innerHTML}</div>`
			return `<div style="font-family: 'Trebuchet MS', sans-serif;">${content?.innerHTML}</div>`
		}

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

	openPreview() {
		const editorContainer = document.getElementById('all_pages');
		if (editorContainer) {
			this.openPreviewReport.emit({ data: this.getContent(), boolVal: true });
		} else {
			this.openPreviewReport.emit({ data: this.getCombinedCOntent(), boolVal: true });
		}
	}

	changeTestTemplate(e: any) {
		this.masterEndpoint.getReportData(e.id, e.LabGlobalTestID).subscribe((reportdata: any) => {
			if (reportdata.pages.length != 0) {
				this.pages_content = [];
				reportdata.pages.forEach((data: any) => {
					this.pages_content.push(data.page_content)
				})
				this.setContent()
			} else {
				this.alertService.showError(`No Content Availiable in ${e.name}`)
			}
		})
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

	changeFontSize(font: any) {
		document.execCommand("fontSize", false, font.value);
	}

	openMarginModal(content: any) {
		this.modelService.open(content, { size: 'sm' });
	}

	setMarginsForPage() {
		const page = document.getElementById('st_area_editor');
		const stArea = this.elRef.nativeElement.querySelector('.st_area_editor');
		if (stArea) {
			stArea.style.paddingLeft = this.paddingLeft;
			stArea.style.paddingRight = this.paddingRight;
			stArea.style.paddingTop = this.paddingTop;
			stArea.style.paddingBottom = this.paddingBottom;
		}
	}

	getHeight(content: any = this.header_to_diplay_in_every_page): number {
		// Create a hidden container
		const container = document.createElement('div');
		container.style.visibility = 'hidden';
		container.style.position = 'absolute';
		container.style.top = '-9999px';
		container.style.left = '-9999px';
		document.body.appendChild(container);

		// Set the innerHTML of the hidden container
		container.innerHTML = content;

		// Measure the height after rendering the content
		const height = container.offsetHeight;

		// Remove hidden container
		document.body.removeChild(container);
    // this.alertService.showError(height)
		return height;
	}



  handleContentSplitting() {
    const containers = document.querySelectorAll('.wordreportcontent');
    
    containers.forEach((container, index) => {
      const content = container.innerHTML;
      const height = container.scrollHeight;
      const maxHeight = container.scrollHeight;
      
      if (height < maxHeight) {
        // Content overflow, move excess content to previous container or new page
        const previousContainer = containers[index - 1];
        if (previousContainer) {
          // Move excess content to previous container
          previousContainer.innerHTML += content; // Append excess content
          container.innerHTML = ''; // Clear current container
        } else {
          // Create a new container or handle overflow as needed
          // Example: createNewPage(content);
        }
      }
    });}



    checkSplitttt() {
      requestAnimationFrame(() => {
        const editorContainer = document.getElementById('all_pages');
        if (editorContainer) {

          // Combine content from all wordreportcontent elements
          let combinedContent = '';
          const contentContainers = editorContainer.querySelectorAll('[id^="wordreportcontent"]');
          contentContainers.forEach(container => {
            combinedContent += container.innerHTML;
          });


  
          // Clear existing content
          editorContainer.innerHTML = '';
  
          // Create a temporary container to hold combined content
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = combinedContent;
          document.body.appendChild(tempContainer);
  
          // Split combined content into pages
          let totalHeight = 0;
          let pageNumber = 1;
          const range = document.createRange();
          let pageContent = '';
  
          const childNodes = Array.from(tempContainer.childNodes);
  
          for (let i = 0; i < childNodes.length; i++) {
            range.selectNode(childNodes[i]);
            totalHeight += range.getBoundingClientRect().height;
  
            if (totalHeight
              > 1123) {
              // Create a new page with the collected content
  
              // Reset for the next page
              pageNumber++;
              totalHeight = range.getBoundingClientRect().height;
              pageContent = this.getNodeHTML(childNodes[i]);
            } else {
              pageContent += this.getNodeHTML(childNodes[i]);
            }
          }
  
          // Create the last page with remaining content
          if (pageContent) {
  
          }
  
          // Remove temporary container
          document.body.removeChild(tempContainer);
        }
      });
    }
  
    getNodeHTML(node: ChildNode): string {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return (node as Element).outerHTML;
      } else if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      return '';
    }



    organizeContentIntoPages() {
      const contentContainers = document.querySelectorAll('.wordreportcontent');
      const pageHeight = 297; // Example: Height of each page in mm (adjust as needed)
      const pages = [];
    
      let currentPage = this.createNewPage(); // Start with the first page
    
      contentContainers.forEach((container) => {
        const content = container.innerHTML;
        const containerHeight = container.scrollHeight;
    
        if (containerHeight > pageHeight) {
          // Content overflows current page, split and move to next page
          let contentChunks = this.splitContentIntoChunks(content, pageHeight);
          contentChunks.forEach((chunk) => {
            currentPage.appendChild(this.createContentElement(chunk));
            
            // Check if adding this chunk overflows the current page
            if (currentPage.scrollHeight > pageHeight) {
              pages.push(currentPage); // Finish current page
              currentPage = this.createNewPage(); // Start new page
            }
          });
        } else {
          currentPage.appendChild(this.createContentElement(content));
          
          // Check if adding this content overflows the current page
          if (currentPage.scrollHeight > pageHeight) {
            pages.push(currentPage); // Finish current page
            currentPage = this.createNewPage(); // Start new page
          }
        }
      });
    
      // Push the last created page to the pages array
      if (currentPage.childNodes.length > 1) {
        pages.push(currentPage);
      }
    
      // Append all created pages to the container
      const allPagesContainer = document.getElementById('all_pages');
      allPagesContainer!.innerHTML = '';
      pages.forEach(page => allPagesContainer!.appendChild(page));
    }
    
    createNewPage() {
      const page = document.createElement('div');
      page.className = 'page';
      
      // Example: Add header to each page
      const header = document.createElement('header');
      header.textContent = 'Page Header';
      page.appendChild(header);
      
      return page;
    }
    
    createContentElement(content: any) {
      const div = document.createElement('div');
      div.innerHTML = content;
      div.className = 'wordreportcontent';
      return div;
    }
    
    splitContentIntoChunks(content: any, chunkSize: any) {
      // Split content into chunks of specified size (e.g., page height)
      const chunks = [];
      for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize));
      }
      return chunks;
    }
    







    checkSpiltContent(){

      const page_number = document.getElementById("current_page_number");

      const current_page = document.getElementById("wordreportcontent"+ page_number!.textContent);
      if(current_page){
        const last_child = current_page.querySelector(':last-child');
        if(last_child){
          this.alertService.showInfo(this.getHeight(last_child.innerHTML).toString())
        }
      }
    }
  

	
	preview_by_frame(){
		const content = this.printSrvc.previewIframe(this.getCombinedCOntent(),this.header_to_diplay_in_every_page, this.settings, this.bg);
		// this.alertService.showSuccess(this.printSrvc.getHeight(content))
		const iframe = document.getElementById('preview_iframe') as any;

		iframe!.contentDocument?.open();
		iframe!.contentDocument?.write(content);

		iframe!.contentDocument?.close();
	}

  }