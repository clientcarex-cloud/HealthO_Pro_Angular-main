import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { CKEditorModule } from 'ckeditor4-angular'

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CKEditorModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})

export class EditorComponent implements AfterViewInit {

  @Input() htmlData: string = '';
  @Output() wordDataChange = new EventEmitter<any>();
  ckEditorConfig: any;

  wordData: string = '';

  ngAfterViewInit(): void {
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


    this.ckEditorConfig = {
      toolbar: [
        // Undo and redo
        ['Undo', 'Redo'],
        // Text formatting
        ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript'],
        // Styles and formatting
        ['Styles', 'Format', 'Font', 'FontSize'],
        // Text and background color
        ['TextColor', 'BGColor'],
        // Copy and paste
        ['Cut', 'Copy',],
        // Search and selection
        ['Find', 'Replace', 'SelectAll', 'Scayt'],
        // Lists and indentation
        ['NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'CreateDiv', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'BidiLtr', 'BidiRtl'],
        // Links and anchors
        ['Link', 'Unlink', 'Anchor'],
        // Media and special characters
        ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],

        // View and options
        ['Maximize', 'ShowBlocks'],
        // Other options
        ['Templates', 'CopyFormatting', 'Source',],

        // ['NewPage', 'Print', 'Preview', 'Save', 'SelectAll', 'SpellChecker', 'StylesCombo', 'Templates', 'TemplatesPreview', 'Undo', 'Redo', 'Maximize', 'ShowBlocks', 'Table', 'SpecialChar']
      ],
      extraPlugins:
        'dialogui,dialog,a11yhelp,about,basicstyles,bidi,blockquote,clipboard,' +
        'button,panelbutton,panel,floatpanel,colorbutton,colordialog,menu,' +
        'contextmenu,dialogadvtab,div,elementspath,enterkey,entities,popup,' +
        'filebrowser,find,fakeobjects,flash,floatingspace,listblock,richcombo,' +
        'font,format,forms,horizontalrule,htmlwriter,iframe,image,indent,' +
        'indentblock,indentlist,justify,link,list,liststyle,magicline,' +
        'maximize,newpage,pagebreak,pastefromword,pastetext,preview,print,' +
        'removeformat,resize,save,menubutton,scayt,selectall,showblocks,' +
        'showborders,smiley,sourcearea,specialchar,stylescombo,tab,table,' +
        'tabletools,templates,toolbar,undo,wsc,wysiwygarea',
      // contentsCss: ['src/styles.css']
      addContentsCss: ['src/styles.scss'],
      uiColor: '#ffffff',
    
      resize: false,
      undoStackSize : 50,
    };
  }


  public ReportInput({ editor }: any) {
    this.wordData = editor.getData();
    this.wordDataChange.emit(this.wordData);
  }

}
