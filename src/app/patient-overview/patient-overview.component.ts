import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';

import { AlertService } from '@sharedcommon/service/alert.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { SharedModule } from '@sharedcommon/shared.module';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { JoditAngularModule } from 'jodit-angular';
import { DxButtonModule, DxHtmlEditorModule } from 'devextreme-angular';
import { create, createOptions, RichEdit } from 'devexpress-richedit';
import { FileService } from '@sharedcommon/service/file.service';

@Component({
  selector: 'app-patient-overview',
  templateUrl: './patient-overview.component.html',
  styleUrls: ['./patient-overview.component.scss'],
  standalone: true,
  imports: [
    SharedModule, 
    NgxEditorModule, 
    JoditAngularModule
  ]
})

export class PatientOverviewComponent implements OnInit {


  isMultiline = true;

  valueContent!: string;

  tabs!: any;

  currentTab!: string[];


  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private printSrvc: PrintService,
    private alertSrvc: AlertService,
    private fileSrvc:FileService
  ) { 


    this.valueContent = '';
    this.tabs = [
      { name: 'From This Device', value: ['file'] },
      { name: 'From the Web', value: ['url'] },
      { name: 'Both', value: ['file', 'url'] },
    ];;
    this.currentTab = this.tabs[2].value;
    
  }

  @ViewChild('joditValue') joditValue: any;

  widthCnfig = {
    width: '210mm',
    toolbarButtonSize: "small",
    hidePoweredByJodit: true,
    toolbarInlineForSelection: true,
		toolbarInlineDisabledButtons: ['source', 'bold'],
		popup: {
			selection: ['bold', 'italic', 'ul', 'ol', 'paragraph', 'table', 'link', 'spellcheck', 'source']
		},
    defaultActionOnPaste: "INSERT_AS_HTML",
		disabled: false,
		cleanHTML: {
			cleanOnPaste: true,
			replaceNBSP: true,
		},
    processPasteFromWord: false,
		processPasteHTML: true,
		nl2brInPlainText:false,
		askBeforePasteHTML: true,
		readonly: false,
		activeButtonsInReadOnly: ['source', 'fullsize', 'print', 'about', 'dots'],
		showCharsCounter: false,
		showWordsCounter: false,
  }

	config = {
		hidePoweredByJodit: true,
		toolbarInline: true,
		toolbarInlineForSelection: true,
		toolbarInlineDisabledButtons: ['source', 'bold'],
		popup: {
			selection: ['bold', 'italic', 'ul', 'ol', 'paragraph', 'table', 'link', 'spellcheck', 'source']
		},
		toolbarButtonSize: "small",
		defaultActionOnPaste: "INSERT_AS_HTML",
		disabled: false,
		cleanHTML: {
			cleanOnPaste: true,
			replaceNBSP: true,
		},
		controls: {
      bold: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path></svg>',
        tooltip: 'Bold'
      },
      italic: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z"></path></svg>',
        tooltip: 'Italic'
      },
      underline: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 3V12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12V3H18V12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12V3H8ZM4 20H20V22H4V20Z"></path></svg>',
        tooltip: 'Underline'
      },
			fontsize:
			{
				list: {
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
		nl2brInPlainText:false,
		askBeforePasteHTML: true,
		readonly: false,
		activeButtonsInReadOnly: ['source', 'fullsize', 'print', 'about', 'dots'],
		showCharsCounter: false,
		showWordsCounter: false,

		spellcheck: true,
		height: '30vh',
    width: '100%',
		toolbar: true,
		enter: "DIV",
		style: {
			font: '16px Arial',
			color: '#0c0c0c'
		},
		editorStyle: {
			font: '16px Arial',
			color: '#0c0c0c'
		},



	};



  image: any = null;

  onFileChanged(event: any){
    const file = event.target.files[0];

    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        this.image = base64String ;
      });
    }
  }

  copyText(){
    async function writeClipboardText(text: any) {
      try {
        await navigator.clipboard.writeText(text);
        
      } catch (error: any) {
        console.error(error.message);
      }
    }

    writeClipboardText(this.image || '');
    this.alertSrvc.showSuccess("Text Copied");
  }




  ngOnInit(): void {

  }

  print() {

  }





  printTestMobile(htmlContent: any = this.cont){
    const newTab = window.open();
    newTab!.document.write(htmlContent);
    newTab!.document.close();
  }

  cont: any = `
 
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">
        <style>
          .inter-font{
            font-family: "Nunito", sans-serif !important;
            font-style: normal;
            font-weight: 500px;
            font-size: 12px !important;
          }
          @media print {
            @page{
              size: 210mm 297mm;
              margin: 10px 10px 25px 10px;
            }
            .inter-font{
              font-family: "Nunito", sans-serif !important;
              font-style: normal;
              font-weight: 500px;
              font-size: 12px !important;
            }
            .patientPrintHeader{
                padding: 2px !important;
                font-size: 11px !important;
            }
            .patientPrintColumn{
              padding: 2px !important
            }
            .lineHeight{
              line-height: 0.9 !important;
            }
          }
        </style>
        </head>
        <body class="inter-font">

        <div>
      <table id="excelReport" border="1" style=" width: 100%; ">
        <thead style="background-color: rgb(239, 243, 254) !important; border: none;">
          <tr style="font-size: 11px !important">
            <th class="patientPrintColumn" style="text-align: center; font-weight: bold; border: 0.25px solid #dee2e6; " colspan="16">Patient List (Paid)</th>
          </tr>

          
  
          
        <tr style="font-size: 11px !important; line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th style="text-align: center; font-weight: bold;" colspan="8">
            Date - 2 Jan 2025 to 9 Jan 2025
          </th>
          <th colspan="8">Printed - 9 Jan 2025, 10:47 AM</th>
        </tr>
      
  
          <tr style="font-size: 11px !important">
            <th class="patientPrintColumn" style="width:10px; border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold;">#</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Reg Date</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Visit Id</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Ptn Name</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Age</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Gender</th>

            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Mobile No.</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Tests</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Packages</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-wrap: nowrap;">Ref Dr.</th>

            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-align: right;">Total(₹)</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-align: right;">Discount</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-align: right; text-wrap: nowrap;">Net Total</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-align: right;">Paid</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-align: right;">Refund</th>
            <th class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  background-color: rgb(239, 243, 254) !important; font-weight: bold; text-align: right; text-wrap: nowrap;">Total Due</th>
          </tr>
        </thead>
        <tbody>
    
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>1.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>08-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250108-3</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SHAFI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Caring Package</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2500.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2500</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2500.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>2.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>08-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250108-2</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>3.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>08-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250108-1</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>TEST</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Ultrasound Abdomen,
Ultrasound Abdomen,
TIFFA</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>3000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>3000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>3000.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>4.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-5</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>5.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-6</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAIRA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>6.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-7</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAIRAM</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>7.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-8</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAIRAMA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>8.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-4</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>JINITH JAIN</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                25 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>8977791088</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP,
Liver Function Test  LFT,
Complete Urine Examination CUE,
Ultrasonography KUB  Female</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>4000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>4000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>4000.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>9.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-3</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>PARVATHI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                35 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0022222222</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>100.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>900.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>10.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-2</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>NAINA JAJU</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                45 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>2323212254</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>600.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>600</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>600.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>11.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>07-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250107-1</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>VAIBHAV SHARMA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                34 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>8767443215</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>600.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>600</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>600.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>12.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>06-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250106-5</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>MURTHY OP</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>49995.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>49995</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>39000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>10995.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>13.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>06-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250106-4</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SHAFI OP</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1300.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1300</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>22.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1278.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>14.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>06-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250106-3</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>KRISHNA VENI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1300.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1300</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1300.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>15.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>06-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250106-2</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>TEST PATIENT FIVE HUNDRED</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                24 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>6281182436</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Liver Function Test  LFT,
Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>16.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>06-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250106-1</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>KRISHNAVENI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                23 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9059746759</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>17.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>05-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250105-1</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAMEER</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9700730044</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Liver Function Test  LFT,
Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2800.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2800</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2800.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>18.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>03-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250103-1</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SHAFI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Serum Creatinine,
Free  T4</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>47600.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>47600</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>800.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>46800.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>19.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-26</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>VAIRAAA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                2 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>CBP(Complete Blood Picture)</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>350.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>350</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>300.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>50.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>20.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>UMA SHANKAR YELLANA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                43 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9875435678</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>21.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-24</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAIRAAAAA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>COMPLETE BLOOD PICTURE / AEC</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>650.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>650</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>50.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>600.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>22.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-27</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>UMA MANISH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                34 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>6281182436</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP,
Ultrasonography A P Male</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1100.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>900.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>23.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-22</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>TEST PATIENT THREE THOUSAND</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                34 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>6281182436</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>24.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-21</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>JAAT YAARA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                34 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>6281182436</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Liver Function Test  LFT,
Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>25.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-20</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>INDRAJEET VERMA SHARMA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                34 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>6281182436</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP,
COMPLETE BLOOD PICTURE / AEC</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1650.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1650</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>650.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>26.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-19</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>MALAR</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>COMPLETE BLOOD PICTURE /ESR/MP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>900.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>900</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>500.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>400.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>27.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-18</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SAIRAMAN</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture (CBP),
CBP(Complete Blood Picture)</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>550.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>550</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>550.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>28.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-17</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>JULU</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>TIFFA,
Ultrasound Tiffa,
Complete Urine Examination CUE,
Complete Stool Examination  CSE,
Complete Urine Examination CUE</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>4000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>4000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>4500.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>500.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>29.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-16</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>LOKESH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                35 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0245578678</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>30.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-15</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>VEERA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture (CBP)</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>200.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>200</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>200.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>31.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-14</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>KAMALESH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                45 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0245757575</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>32.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-13</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>DEV RA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                26 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0000000000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>33.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-12</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>TARUNI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                38 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0245245578</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>34.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-11</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>PARU</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                29 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0154244555</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Liver Function Test  LFT</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>35.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-10</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>ROOPA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                36 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0542785757</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Liver Function Test  LFT</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1000</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>100.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>900.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>36.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-9</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>RAMESH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                29 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>0056659599</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small>Serum Creatinine,
Complete Blood Picture CBP</small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>8799.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>8799</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1650.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>7149.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>37.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-8</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>UMESH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                36 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9059746759</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>38.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-7</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>RAJESH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                33 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>39.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-6</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SHAFI IN</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>40.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-5</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>NARESH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                35 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9059746759</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>41.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-4</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SUSHRUTH</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                23 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9059746759</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>42.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-3</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>JAYA</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                23 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9059746759</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>43.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-2</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>KRISHNAVENI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                23 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Female</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9059746759</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>

        </tr>
      
        <tr style="background-color: rgb(239, 243, 254) !important;">
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;"><small>44.</small></td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>02-01-25</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: left;">
            <small class="text-nowrap"><small>250102-1</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  font-weight: bold;  line-height: 1;">
            <small class="null"><small>SHAFI</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small><small class="text-nowrap">
                                22 Y
            </small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>Male</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6; ">
            <small class="null"><small>9440267786</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <div style="display: flex; flex-direction: column;">
              <small class="null"><small></small></small>
            </div>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  line-height: 1; ">
            <small class="null"><small></small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>2800.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1570.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>1230</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>822.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>0.00</small></small>
          </td>
          <td class="patientPrintColumn" style="border: 0.25px solid #dee2e6;  text-align: right;">
            <small class="null"><small>408.00</small></small>
          </td>

        </tr>
      
      <tr style="background-color: rgb(239, 243, 254) !important; border: none;">
        <td colspan="10" style="border: 0.25px solid #dee2e6;  text-wrap: nowrap; text-align: right; font-weight: bold;">
          <small>Totals : </small>
        </td>
        <td style="border: 0.25px solid #dee2e6;  text-align: right;font-weight: bold; ">
          <small>1,54,594</small>
        </td>
        <td style="border: 0.25px solid #dee2e6;  text-align: right;font-weight: bold;">
          <small>1,570</small>
        </td>
        <td style="border: 0.25px solid #dee2e6;  text-align: right;font-weight: bold;">
          <small>1,53,024</small>
        </td>
        <td style="border: 0.25px solid #dee2e6;  text-align: right;font-weight: bold;">
          <small>68,944</small>
        </td>
        <td style="border: 0.25px solid #dee2e6;  text-align: right;font-weight: bold;">
          <small>500</small>
        </td>
        <td style="border: 0.25px solid #dee2e6;  text-align: right;font-weight: bold;">
          <small>84,580</small>
        </td>
      </tr>
    </tbody></table></div>
  </body>

  <script>
		function printer() {
		window.print();
		}

		setTimeout(() => {
		printer();
		}, 500);

</script>
  </html>
  `

}
