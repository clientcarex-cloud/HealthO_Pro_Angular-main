import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-mini-editor',
  templateUrl: './mini-editor.component.html',
  styleUrl: './mini-editor.component.scss'
})
export class MiniEditorComponent implements OnInit, AfterViewInit {
  editor!: Editor;
  @Input()  html = '<p>Type Here</p>';
  @Output() extractedContentChange = new EventEmitter<any>();
  @ViewChild('joditValue') joditValue: any;

  private inputSubject: Subject<any> = new Subject<any>();

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline','ordered_list', 'bullet_list', 'align_left', 'align_center','align_right','align_justify'],
  ];

  

  ngAfterViewInit(): void {
    this.joditValue.value = this.html;
  }

  ngOnInit(): void {

    this.inputSubject.pipe(
			debounceTime(300)  // Adjust the debounce time as neededd
		).subscribe(value => {
			this.exportHTML(this.getContent()) ;
		});


    this.editor = new Editor({
      content: '',
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
    });; // Initialize the editor in ngAfterViewInit

    // this.editor.setContent(this.html)
    // this.documentEventsAdd();
  }
  
  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  getContent() {
		let content = '<div>'
		content += document.querySelector('.jodit-wysiwyg')?.innerHTML as string
		content += '</div>';
		return content
	}

  showChanges(e: any = null) {

    if(this.inputSubject){
      this.inputSubject.next('')
    }
}


  exportHTML(e:any){
    this.extractedContentChange.emit(e);
  }



  private keydownListener: any;

	documentEventsAdd() {
		this.keydownListener = (event: KeyboardEvent) => {

			// Handle different key events using a switch statement
			switch (event.key.toLowerCase()) {
				case 'tab':
					event.preventDefault();
					insertTab();
					break;
        case ']':
					if (event.ctrlKey) {
						event.preventDefault();
						document.execCommand('indent');
					}
          break;
        case '[':
          if (event.ctrlKey) {
            event.preventDefault();
            document.execCommand('oudent');
          }
          break;

				default:
					// No action for other keys
					break;
			}

			// Function to insert a tab
			function insertTab() {
					document.execCommand('insertText', false, '    ');
			}
		}

		setTimeout(() => {
			document.addEventListener('keydown', this.keydownListener);
		}, 0);
	}




















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
		buttons: "undo,redo,|,bold,italic,underline,font,fontsize,lineHeight,|,ul,ol,paragraph,|,table,|,left,center,right,|,indent,outdent,image",
		disablePlugins: "about,ai-assistant,class-span,xpath,video,speech-recognize,source,link,media,mobile,limit,",
		zIndex: 0,
		defaultActionOnPaste: "INSERT_AS_HTML",
    askBeforePasteHTML: true,
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
	};
  
}
