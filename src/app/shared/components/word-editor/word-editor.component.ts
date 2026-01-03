import { Component, ElementRef, Input, OnInit, EventEmitter, Output, Renderer2, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { EditorConfig, ST_BUTTONS, LINK_INPUT, UNDO_BUTTON, REDO_BUTTON, REMOVE_FORMAT_BUTTON, SEPARATOR, BOLD_BUTTON, ITALIC_BUTTON, UNDERLINE_BUTTON, STRIKE_THROUGH_BUTTON, JUSTIFY_LEFT_BUTTON, JUSTIFY_CENTER_BUTTON, JUSTIFY_RIGHT_BUTTON, JUSTIFY_FULL_BUTTON, ORDERED_LIST_BUTTON, UNORDERED_LIST_BUTTON, INDENT_BUTTON, OUTDENT_BUTTON, SUBSCRIPT_BUTTON, SUPERSCRIPT_BUTTON, FONT_SIZE_SELECT, UNLINK_BUTTON, FORE_COLOR, IMAGE_INPUT, CUSTOM } from 'ngx-simple-text-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '@sharedcommon/service/alert.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import DOMPurifyI from 'dompurify';

@Component({
	selector: 'app-word-editor',
	templateUrl: './word-editor.component.html',
	styleUrl: './word-editor.component.scss'
})

export class WordEditorComponent implements OnInit {

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

	bg = '/assets/images/blank_paper_with_dotted.png'
	extractedContent!: SafeHtml; // To store the extracted content
	templateContentStore: any;


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
		private sanitizer: DomSanitizer,
		private renderer: Renderer2,
		private elRef: ElementRef,
		private modelService: NgbModal,
		private alertSrvc: AlertService,
		private endPoint: SignUpEndpoint,
		private cookieSrvc: CookieStorageService,
		private masterEndpoint: MasterEndpoint,
		private printSrvc: PrintService,
		private cdr: ChangeDetectorRef,

	) { }

	ngAfterViewInit(): void {

	}

	ngOnInit(): void {

		this.setContent();
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
			deleteButton.classList.add("shadow");
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

			toolbar?.appendChild(page_container);

			toolbar?.appendChild(addButton);

			toolbar?.appendChild(deleteButton);

			// Bind the handler to the instance
			this.deletePageHandler = this.deletePageHandler.bind(this);

			const deletePage = document.getElementById('deletePage');
			// Add the new event listener
			deletePage!.addEventListener('click', this.deletePageHandler);

			// Bind the handler to the instance
			this.addPageHandler = this.addPageHandler.bind(this);

			const addPage = document.getElementById('addPage');
			// Add the new event listener
			addPage!.addEventListener('click', this.addPageHandler);
		}
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



	setContent(templateContent: any = '') {
		this.page_number = 1;

		this.st_area_editor = `
			<div class="all_pages" contentEditable=false id="all_pages">`;

		this.pages_content.forEach((data: any) => {
			let page = `
					<div class='st_area_editor${this.page_number}' id='st_area_editor${this.page_number}' 
						style="max-height: 625px; min-height: 660px; 
						line-height:20px !important; outline: 1px solid #000; 
						background-size: 684px 660px; margin: 10px auto; 
						align-self: center; 
						width: 684px; background-color: white;
						padding: 0px 5px 0px 5px;
					 	; overflow: hidden;">

					  		<div inert contentEditable=false style="opacity: 0.5; padding-top: ${this.settings.header_height}px">
								${this.header_to_diplay_in_every_page}
							</div>

					  		<div contentEditable=true class="wordreportcontent${this.page_number}" 
					  			style="outline: none; 
					  			height: 650px;
					  			max-height: 650px" 
					  			id="wordreportcontent${this.page_number}" >
								${data}
							</div>

					</div>
				`;

			this.st_area_editor += page;
			this.page_number += 1;
		})

		this.st_area_editor += '</div>';
		this.setToolBar();
		this.addClickEvents();

		// this.zoomContent({target:{
		// 	value: 0.5
		// }})
	}

	contentEditBool: any = 'true';

	makeContentEdit(val = this.contentEditBool) {
		const pageElement = document.getElementById(`all_pages`);
		pageElement!.setAttribute('contenteditable', this.contentEditBool)
	}

	documentEvents() {
		setTimeout(() => {
			document.addEventListener('keydown', (event) => {
				if (event.ctrlKey && event.key === 'a') {
					// pageElement.setAttribute('contenteditable', 'true')
					this.contentEditBool = 'true'
					this.makeContentEdit('true');
					selectAllContent();
				}
			});

			function selectAllContent() {
				const editorContainer = document.getElementById('all_pages');
				if (editorContainer) {
					// Get all wordreportcontent elements
					const contentContainers = editorContainer.querySelectorAll('[id^="wordreportcontent"]');
					contentContainers.forEach(container => {
						// Select the content of each wordreportcontent element
						selectText(container);
					});
				}
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

		}, 0)
	}


	addClickEvents(): void {
		setTimeout(() => {
			this.pages_content.forEach((data: any, index: number) => {
				const pageElement = document.getElementById(`st_area_editor${index + 1}`);
				if (pageElement) {

					this.renderer.listen(pageElement, 'input', (event) => {

						const contentElement = document.getElementById(`wordreportcontent${index + 1}`);

						// Check if content overflows, if so, add a new page
						const inputKey = (event as InputEvent); // Get the input character

						this.setPageNumbers(index);

						if (inputKey.inputType != "deleteContentBackward") {
							if (contentElement!.scrollHeight > 650) {
								this.alertSrvc.showInfo("Content Exceeds the page content");
								document.execCommand('undo', false, undefined);

								const nextPage = document.getElementById(`wordreportcontent${index + 2}`)

								// check next page is full or not 
								if (nextPage) {
									if (nextPage!.scrollHeight > 650) {
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

									this.alertSrvc.showInfo("Page Added")

									setTimeout(() => {
										const nextPage = document.getElementById(`wordreportcontent${index + 2}`);
										nextPage?.focus();
									}, 0);
								}
							}


						} if (inputKey.inputType == "insertFromPaste") {

							if (contentElement!.scrollHeight > 650) {
								document.execCommand('undo', false, undefined);
							}
							event.preventDefault();
						}


						this.saveCombinedContent();
					});

					this.renderer.listen(pageElement, 'click', () => {
						this.setPageNumbers(index);
						// pageElement.focus();
					})

					this.renderer.listen(pageElement, 'paste', (event) => {
						// Prevent default paste behavior

						const container = document.getElementById(`wordreportcontent${index + 1}`);

						const currentContent = container!.innerHTML;

						let clipboardData = event.clipboardData || (window as any).clipboardData;
						let pastedContent = clipboardData.getData("text/html");

						const sanitizedContent = DOMPurifyI.sanitize(pastedContent);

						const allowedContentSize = 650// Calculate allowed size based on page height

						if (this.getHeight(pastedContent) > allowedContentSize) {
							event.preventDefault();
							this.alertSrvc.showError("Content exceeds page limit. Please paste in smaller chunks.");
						}
					});

				}
			});

			const pageElement = document.getElementById(`all_pages`);

			if (pageElement) {
				this.renderer.listen(pageElement, 'mouseleave', () => {
					pageElement.setAttribute('contenteditable', 'true')
				})

				this.renderer.listen(pageElement, 'mouseenter', () => {
					pageElement.setAttribute('contenteditable', 'false');
				})
			}


		}, 0); // Delay to ensure the DOM is fully rendered before adding event listeners
	}


	extractMainChildElements(htmlContent: string): any {
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'text/html');
		const bodyChildren = Array.from(doc.body.children);
		return bodyChildren;
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
				if (this.getHeight(container.innerHTML) != 0) {
					combinedContent.push(container.innerHTML);
				}
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

			// this.pages_content = combinedContent;
			// return combinedContent

		}
	}



	addPreventBackspaceBehavior(): void {
		document.addEventListener('keydown', (event) => {
			const selection = window.getSelection();
			if (event.key === 'Backspace' && selection!.rangeCount > 0) {
				const range = selection!.getRangeAt(0);
				const startContainer = range.startContainer;
				const parentElement = startContainer.parentElement;

				// Prevent backspace if the parent element is not the contentEditable section
				if (!parentElement || !parentElement.classList.contains('wordreportcontent')) {
					event.preventDefault();
					this.alertSrvc.showError("Can't Delete Whole Content")
				}
			}
		});
	}


	getCaretCharacterOffsetWithin(element: HTMLElement, event: MouseEvent): number {
		const range = document.createRange();
		range.setStart(element, 0);
		range.setEnd(event.target as Node, 0);
		const selection = window.getSelection();
		range.collapse(true);
		return selection!.focusOffset;
	}


	addNewPage(pageIndex: number): void {
		const allPagesElement = document.getElementById('all_pages');
		if (allPagesElement) {
			const newPageIndex = pageIndex + 1;
			const newPageElement = document.createElement('div');
			newPageElement.className = `st_area_editor${newPageIndex}`;
			newPageElement.id = `st_area_editor${newPageIndex}`;
			newPageElement.style.cssText = `max-height: 297mm; min-height: 297mm; line-height:20px !important; border: 1px solid #000; background-size: 210mm 297mm; margin: 10px auto; align-self: center; width: 210mm; padding: 0px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px; background-image: url('${this.bg}'); overflow: hidden;`;

			const headerDiv = document.createElement('div');
			headerDiv.style.cssText = `opacity: 0.5; padding-top: ${this.settings.header_height}px`;
			headerDiv.appendChild(document.createTextNode(this.header_to_diplay_in_every_page));

			const contentDiv = document.createElement('div');
			contentDiv.contentEditable = 'true';
			contentDiv.className = `wordreportcontent${newPageIndex}`;
			contentDiv.id = `wordreportcontent${newPageIndex}`;
			contentDiv.style.cssText = `outline: none; max-height: ${1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()}px`;

			newPageElement.appendChild(headerDiv);
			newPageElement.appendChild(contentDiv);

			allPagesElement.appendChild(newPageElement);

			// Focus on the new page content for input
			contentDiv.focus();
		}
	}


	setCursorToEnd(element: HTMLElement): void {
		const range = document.createRange();
		const selection = window.getSelection();

		range.selectNodeContents(element);
		range.collapse(false); // Collapse the range to the end point
		selection!.removeAllRanges();
		selection!.addRange(range);
	}


	checkSplit() {
		this.st_area_editor = `
		<div class="all_pages" contentEditable=false id="all_pages">`

		this.pages_content.forEach((data: any) => {
			this.alertSrvc.showError(this.settings.header_height)

			let page = `
				<div class='st_area_editor${this.page_number}' id='st_area_editor${this.page_number}' style=" max-height: 297mm;min-height: 297mm; line-height:20px !important; border: 1px solid #000; background-size: 210mm 297mm;margin: 10px auto; align-self: center; width: 210mm; 
				padding: 0px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px; 
				 background-image: url('${this.bg}'); ">
				  <div contentEditable=false style="opacity: 0.5; padding-top: ${this.settings.header_height}px">${this.header_to_diplay_in_every_page}</div>
				  <div contentEditable=true class="wordreportcontent${this.page_number}" style="outline: none; max-height: ${1123 - parseInt(this.settings.header_height) - parseInt(this.settings.footer_height) - this.getHeight()}px" id="wordreportcontent${this.page_number}" >${data}</div>
				</div>
			`;

			this.st_area_editor += page;
			this.page_number += 1;
		})

		this.st_area_editor += '</div>'
	}

	checkSplitttt(): void {
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

				let arrayPages = [];


				for (let i = 0; i < childNodes.length; i++) {
					range.selectNode(childNodes[i]);
					totalHeight += range.getBoundingClientRect().height;
					// this.alertSrvc.showError(1123 - (parseInt(this.settings.header_height) * 2 )- parseInt(this.settings.footer_height) - this.getHeight() , totalHeight)


					if (totalHeight
						> 1123) {
						// Create a new page with the collected content
						// this.createPage(editorContainer, pageContent, pageNumber);
						arrayPages.push(pageContent);

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
					// this.createPage(editorContainer, pageContent, pageNumber);
					arrayPages.push(pageContent);
				}

				// Remove temporary container

				document.body.removeChild(tempContainer);

				this.pages_content = arrayPages
				this.setContent();
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

	createPage(editorContainer: HTMLElement, content: string, pageNumber: number): void {
		const newPage = document.createElement('div');
		newPage.className = `st_area_editor${pageNumber}`;
		newPage.id = `st_area_editor${pageNumber}`;
		newPage.style.cssText = `min-height: 297mm;max-height: 297mm; height: 297mm; border: 1px solid #000; line-height:20px !important; background-size: 210mm 297mm; margin: 10px auto; align-self: center; width: 210mm; padding:0px ${this.settings.margin_right}px ${this.settings.footer_height}px ${this.settings.margin_left}px; background-image: url('${this.bg}'); `;
		newPage.innerHTML = `
			<div contentEditable=false style="opacity: 0.5;padding-top: ${this.settings.header_height}px" >${this.header_to_diplay_in_every_page}</div>
			<div id="wordreportcontent${pageNumber}" >${content}</div>`;
		editorContainer.appendChild(newPage);
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
		const height = container.scrollHeight;

		// Remove hidden container
		document.body.removeChild(container);

		return height;
	}


	splitContentPrecisely(container: HTMLElement, overflowHeight: number, newContent: HTMLElement | null): void {
		if (!newContent) return;

		const range = document.createRange();
		let childNodes = Array.from(container.childNodes);
		let totalHeight = 0;

		for (let i = 0; i < childNodes.length; i++) {
			range.selectNode(childNodes[i]);
			const nodeHeight = range.getBoundingClientRect().height;
			totalHeight += nodeHeight;

			if (totalHeight > overflowHeight) {
				// Split the content here
				range.setEnd(childNodes[i], 0);
				const fragment = range.extractContents();
				newContent.appendChild(fragment);

				// Remove the processed nodes from the original container
				for (let j = 0; j <= i; j++) {
					container.removeChild(childNodes[j]);
				}

				break;
			}
		}
	}


















	getStAreaEditorTemplate(content: string): string {
		return `
      <div class="page">
        <div class='st_area_editor' style="line-height:20px !important; background-size: 210mm 297mm; margin: 10px auto; align-self: center; width: 210mm; 
          padding: ${this.settings.header_height}px ${this.settings.margin_right}px 0px ${this.settings.margin_left}px; 
          background-image: url('${this.bg}'); max-height: 297mm">
          <div contentEditable=false style="opacity: 0.5">${this.header_to_diplay_in_every_page}</div>
          <div class="wordreportcontent" id="wordreportcontent" style="padding-top: 20px">${content}</div>
        </div>
      </div>`;
	}

	checkAndSplitContent() {

		const wordreportcontent = document.getElementById('wordreportcontent');

		if (wordreportcontent) {

			const excessContent = this.splitContent(wordreportcontent);
			const newContentDiv = this.renderer.createElement('div');
			newContentDiv.innerHTML = this.getStAreaEditorTemplate(excessContent);
			this.renderer.appendChild(document.getElementById("all_pages"), newContentDiv);
			// }
		}

		const stArea = document.querySelector('.all_pages');
		const contentEditor = document.querySelector('.wordreportcontent');
		this.alertSrvc.showError("")
		if (contentEditor) {
			this.alertSrvc.showError("")
		}
	}

	splitContent(contentEditor: Element): string {
		const wordReportContent = document.getElementById('wordreportcontent');
		if (wordReportContent) {
			const children = Array.from(wordReportContent.childNodes);
			let excessContent = '';
			while (wordReportContent.scrollHeight > 300 && children.length > 0) {
				const child: any = children.pop();
				if (child) {
					excessContent = child.outerHTML + excessContent;
					wordReportContent.removeChild(child);
				}
			}
			return excessContent;
		}
		return '';
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
			this.page_number = Math.ceil(height / 1123);
			// this.setPageBackground();
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
		}
	}


	inAnyErrorOpen() {
		this.st_area_editor = `<div class='st_area_editor' id='st_area_editor' >${this.content}</div>`;
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

	changeFontSize(font: any) {
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

	addNewPagee() {
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
		this.setCombinedCOntent();
		this.extractedContentChange.emit({ data: this.pages_content, boolVal: e });
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
				const contentContainers = editorContainer.querySelectorAll('[id^="wordreportcontent"]');
				contentContainers.forEach(container => {
					combinedContent += container.innerHTML;
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

	openPreview() {
		this.openPreviewReport.emit({ data: this.getCombinedCOntent(), boolVal: true });
	}

	@Input() TestTemplates: any;
	@Input() routineTemplates: any;

	changeTestTemplate(e: any) {
		this.masterEndpoint.getReportData(e.id, e.LabGlobalTestID).subscribe((reportdata: any) => {
			this.changeContent(reportdata.report)
		})
	}

}
