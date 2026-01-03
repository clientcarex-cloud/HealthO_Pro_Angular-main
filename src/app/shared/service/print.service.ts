import { Injectable } from '@angular/core';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { AlertService } from './alert.service';
import { SubSink } from "subsink";
import printJS from 'print-js';

@Injectable({
  providedIn: 'root'
})

export class PrintService {

  settings: any = {
    header_height: 5,
    footer_height: 0,
    margin_left: 0,
    margin_right: 0,
    display_letterhead: false,
  };

  subsink = new SubSink();
  bg_img = '';
  paged_header = "";
  footer = `
  </body>
  </html>`
  header: any = ""

  constructor(
    private masterEndpoint: MasterEndpoint,
    private cookieSrvc: CookieStorageService,
    private alertSrvc: AlertService
  ) { }



  async setHeaderWithDiv(hea: any, pageNums: boolean = true, watermark: boolean = false) {

    this.header = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/devexpress-richedit@24.1.5/dist/dx.richedit.min.css" rel="stylesheet">
        <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
        <style>
          @media print {
           .hide_from_dom{display: none} 
            .break_page{
              break-after: page;
            }
            .dxrePageArea {
              break-after: page;
              position: relative !important;
              overflow: visible;
              background-color: transparent !important;
            }
            @page {
              size: 210mm 297mm;
              margin: ${parseInt(this.getHeight(hea)) + parseInt(this.settings.header_height)}px ${this.settings.margin_right}px ${this.settings.footer_height}px ${this.settings.margin_left}px;
              ${this.settings.display_letterhead ? `background-image: url('${this.bg_img}');` : ``}
              background-size: cover;
              font-family: "Trebuchet MS", sans-serif;
            }
    
            @page {
              @top-center {
                content: element(headerContent);
                vertical-align: top;
              }
              ${watermark? this.watermark : ''}
              ${pageNums ? this.pageNums : ``}
            }
            .printHead {
              position: running(headerContent);
              text-align: left;
            }
          }
        </style>
        </head>
        <body>
         
        ` + `<div class='printHead' style="padding-top: ${this.settings.header_height}px">` + hea + "</div>";

  }

  async setHeader() {
    this.header = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/devexpress-richedit@24.1.5/dist/dx.richedit.min.css" rel="stylesheet">
        <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
        <style>
          @media print {
            @page {
              size: 210mm 297mm;
              margin: ${this.settings.header_height}px ${this.settings.margin_right}px ${this.settings.footer_height}px ${this.settings.margin_left}px;
              ${this.settings.display_letterhead ? `background-image: url('${this.bg_img}');` : ''}
              background-size: cover;
            }
            @page {
              @bottom-center {
                content: 'Page ' counter(page); 
                font-size: 12pt;
                font-weight: 600;
                color: #000000;
              }
              
            }

          }
        </style>
        <script>
        document.addEventListener("DOMContentLoaded", function() {
          PagedPolyfill.on('after', (flow) => {
            const totalPages = flow.total;
            const pages = document.querySelectorAll(".pagedjs_page");
            if (pages.length > 0) {
              for (let i = 0; i < pages.length; i++) {
                if (i === pages.length - 1) {
                  pages[i].classList.add("pagedjs_last_page");
                } else {
                  pages[i].classList.add("not_last_page");
                }
              }
            }
          });
        });
        </script>
        </head>
        <body>
        `
  }

  async setHeaderWithBootstrap() {
    this.header = `
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
              margin: ${this.settings.header_height}px ${this.settings.margin_right}px ${this.settings.footer_height}px ${this.settings.margin_left}px;
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

        `
  }

  getHeight(content: string): any {
    // Create a hidden container
    const container = document.createElement('div');
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Set the innerHTML of the hidden container
    container.innerHTML = content;

    // Measure the height after rendering the content
    const height = container.scrollHeight;

    // Remove the container from the DOM
    document.body.removeChild(container);

    return height
  }

  printHeader(content: any, header: any, reload: boolean = false, time: any = 1000, show_letterhead : boolean | null = null) {
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      if (data.length !== 0) {
        this.settings.header_height = data[0].header_height;
        this.settings.footer_height = data[0].footer_height;
        this.settings.margin_left = data[0].margin_left;
        this.settings.margin_right = data[0].margin_right;
        this.settings.display_letterhead = data[0].display_letterhead;

        if(show_letterhead == null){
          if (data[0].display_letterhead) {
            this.bg_img = data[0].letterhead;
          }
        }else if(show_letterhead == true){
          this.settings.display_letterhead = true ;
          this.bg_img = data[0].letterhead;
        }else if(show_letterhead == false){
          this.settings.display_letterhead = false ;
          this.bg_img = "" ;
        }

        this.setHeaderWithDiv(header, data[0].display_page_no);
        this.printer(content, reload, true, time)

        // this.previewIframe(content, header, data[0],  data[0].letterhead, false);
      } else {
        this.printer(content, reload)
      }
    }, (error) => {
      this.printer(content, reload)
    })
  }

  print(content: any, reload: boolean = false) {
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      if (data.length !== 0) {
        this.settings.header_height = data[0].header_height;
        this.settings.footer_height = data[0].footer_height;
        this.settings.margin_left = data[0].margin_left;
        this.settings.margin_right = data[0].margin_right;
        this.settings.display_letterhead = data[0].display_letterhead;

        if (data[0].display_letterhead) {
          this.bg_img = data[0].letterhead;
        }

        this.setHeaderWithDiv("");
        this.printer(content, reload)

      } else {
        this.printer(content, reload)
      }
    }, (error) => {
      this.printer(content, reload)
    })
  }

  printRcpts(content: any, reload: boolean = false) {
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      if (data.length !== 0) {

        this.settings.margin_left = data[0].margin_left;
        this.settings.margin_right = data[0].margin_right;
        this.settings.display_letterhead = data[0].display_letterhead;

        if (data[0].display_letterhead) {
          this.bg_img = data[0].letterhead;
        }

        if (data[0].receipt_space) {
          this.settings.header_height = data[0].header_height;
          this.settings.footer_height = data[0].footer_height;
          this.setHeaderWithDiv("");
        } else {
          this.settings.display_letterhead = false;
          this.settings.header_height = 5;
          this.settings.footer_height = 0;
  
          this.setHeaderWithDiv("", false);
        }
        this.printer(content, reload)
      } else {
        this.printer(content, reload)
      }
    }, (error) => {
      this.printer(content, reload)
    })
  }

  printInvoice(content: any, reload: boolean = false) {
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      if (data.length !== 0) {
        this.settings.margin_left = data[0].margin_left;
        this.settings.margin_right = data[0].margin_right;
        this.settings.display_letterhead = data[0].display_letterhead;

        if (data[0].display_letterhead) {
          this.bg_img = data[0].letterhead;
        }

        if (data[0].invoice_space) {
          this.settings.header_height = data[0].header_height;
          this.settings.footer_height = data[0].footer_height;
          this.setHeaderWithDiv("");
        } else {
          this.settings.display_letterhead = false;
          this.settings.header_height = 5;
          this.settings.footer_height = 0;

          this.setHeaderWithDiv("", false);
        }
        this.printer(content, reload)

      } else {
        this.printer(content, reload)
      }
    }, (error) => {
      this.printer(content, reload)
    })
  }

  printZeroWithBootstrap(content: any, reload: boolean = false) {
    this.settings.header_height = 10;
    this.settings.footer_height = 25;
    this.settings.margin_left = 10;
    this.settings.margin_right = 10;
    this.settings.display_letterhead = false

    this.setHeaderWithBootstrap();
    // this.printer(content, reload)
    const iframe = document.createElement('iframe') ;
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const data = this.header + `<div>${content}</div>` + this.footer ;

    if(iframe.contentDocument){
      iframe.contentDocument.write(data);
      iframe.contentDocument.close();

      setTimeout(() => {
        iframe.contentWindow?.print();
        // document.body.removeChild(iframe);
        if (reload) window.location.reload()
      }, 1000);
    }

  }

  printWithoutFooter(content: any, reload: boolean = false) {
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      if (data.length !== 0) {
        this.settings.header_height = data[0].header_height;
        this.settings.footer_height = data[0].footer_height;
        this.settings.margin_left = data[0].margin_left;
        this.settings.margin_right = data[0].margin_right;
        this.settings.display_letterhead = data[0].display_letterhead;

        this.setHeader();
        this.printer(content, reload)

      } else {
        this.printer(content, reload)
      }
    }, (error) => {
      this.printer(content, reload)
    })
  }

  async printer(content: any, reload: boolean = false, headFoot: boolean = true, time: any = 1000) {
    // const iframe = document.getElementById('printFrame') as HTMLIFrameElement;
    const iframe = document.createElement('iframe') ;
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    if (iframe?.contentDocument) {
      iframe.contentDocument.open();
  
      if (headFoot) {
        const data = this.header + `<div>${content}</div>` + this.pgdjsprintScript + this.footer ;

        iframe.contentDocument.write(data);
        iframe.contentDocument.close();

      } else {
        const styleClasses = `
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/devexpress-richedit@24.1.5/dist/dx.richedit.min.css" rel="stylesheet">
            <style type="text/css"> 
              .hide_from_dom{display: none}
              .dxrePageArea {
                break-after: page;
                position: relative !important;
                overflow: visible;
                background-color: transparent !important;
              }
            </style>
          </head>
        <body>

        `
        iframe.contentDocument.write(styleClasses + content + this.footer);
        iframe.contentDocument.close();
  
        setTimeout(() => {
          iframe.contentWindow?.print();
          // document.body.removeChild(iframe);
          if (reload) window.location.reload()
        }, time);
      }
    }
  }
  

  printTabular(header_content: any, body_content: any, footer_content: any, show_letterhead: boolean, settings: any = null ){

    let html = ``;
    let letterhead =  '';

    if(!settings){
      this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
        settings = data[0] ; 

        if(show_letterhead) letterhead = `background-image : url('${settings.letterhead}');`
        html = this.getTabularHtml(header_content, body_content, footer_content, settings, letterhead) ;

        console.log(html)
        const iframe = document.createElement('iframe');
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
    
        if (iframe?.contentDocument) {
          iframe.contentDocument.open();
          iframe.contentDocument.write(html);
          iframe.contentDocument.close();
          // iframe.contentWindow?.print();
          // document.body.removeChild(iframe);
        }
      })
    }else{
      if(show_letterhead) letterhead = `background-image : url('${settings.letterhead}');`;
      html = this.getTabularHtml(header_content, body_content, footer_content, settings, letterhead) ;

      console.log(html)
      const iframe = document.createElement('iframe');
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
  
      if (iframe?.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(html);
        iframe.contentDocument.close();
        // iframe.contentWindow?.print();
        // document.body.removeChild(iframe);
      }
    }


  }

  getTabularHtml(header_content: any, body_content: any, footer_content: any, settings: any, letterhead: any){
    let html = `
    <!DOCTYPE html>
      <html>

      <head>
        <style>
          @media print {
            .break_page{page-break-after: always}
            @page{
              size: 210mm 297mm;
              margin: 0;
            }
            body {
              margin: 0px;
              background-size: 210mm 297mm;
              ${letterhead}
              background-repeat: repeat; 
              
            }
            .tableTHeadTH{
              padding-top: ${settings.header_height}px;
            }

            .printTable {
              width: 100%;
              margin: 0;
              padding: 0px ${settings.margin_right}px 0px ${settings.margin_left}px;
            }

            .tableTfootTD{
              padding-bottom: ${settings.footer_height}px;
            }

            .tableHeader{
              display: table-header-group;
              text-align: left;
            }

            .tableFooter{
              display: table-footer-group;
              text-align: left;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>

      <body>

        <table class="printTable">

          <thead class="tableHeader">
            <tr>
              <th class="tableTHeadTH">
                ${header_content}
              </th>
            </tr>
          </thead>
          <tbody class="tableBody">
            <tr>
              <td class="tableTDBody">
                ${body_content}
              </td>
            </tr>
          </tbody>
          <tfoot class="tableFooter">
            <tr>
              <td class="tableTfootTD">
              ${footer_content}
              </td>
            </tr>
          </tfoot>
        </table>

        ${this.printScript}
      </body>

      </html>
    `

    return html ;
  }

  exportToExcel(excelContent: any, fileName: any = "combined_tables") {
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Export Table to Excel</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.0/xlsx.full.min.js"></script>
      </head>
      <body>
        ${excelContent}  
        <script>
      function exportToExcel() {
      // Dynamically get all tables in the body
      let tables = document.querySelectorAll('table');
      let combinedData = '<html><head><meta charset="UTF-8"></head><body>';



      // Iterate over each table and append its HTML content to combinedData
      tables.forEach(table => {
        combinedData += table.outerHTML + "<table><tbody><tr><td ></td></tr><tr><td></td></tr><tr><td ></td></tr></tbody></table>";
      });

      combinedData += '</body></html>';

      // Create a blob with the combined data
      let blob = new Blob([combinedData], { type: 'application/vnd.ms-excel' });

      // Create a link element, set the URL of the blob as its href attribute, and trigger a download
      let a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = '${fileName}.xls';
      a.click();
    }

    exportToExcel(); // Automatically trigger the export function
        </script>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    console.log(content)
    // Write content to iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    iframeDoc!.open();
    iframeDoc!.write(content);
    iframeDoc!.close();
  }

  retunrContent(content: any, header: any, data: any) {
    this.settings.header_height = data.header_height;
    this.settings.footer_height = data.footer_height;
    this.settings.margin_left = data.margin_left;
    this.settings.margin_right = data.margin_right;
    this.settings.display_letterhead = true;
    this.bg_img = data.letterhead
    this.setHeaderWithDiv(header);

    return this.header + content + this.footer
  }

  setHeaderWithMinimizedContent(hea: any, watermark: boolean = false) {
    this.header = `
        <!DOCTYPE>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/devexpress-richedit@24.1.5/dist/dx.richedit.min.css" rel="stylesheet">
          <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
          <style>
            ::-webkit-scrollbar {
              width: 15px;
              border-radius: 50px;
            }
              
            ::-webkit-scrollbar-track {
              border: 5px solid transparent;
              border-radius: 50px;
            }

            ::-webkit-scrollbar-thumb {
              background: #555;
              border-radius: 50px;
              border: 3px solid #EFF2F7;
              border-radius: 50px !important;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #555;
              border-radius: 50px !important;
            }
            
            ::-webkit-scrollbar-button {
              height: 20px;
              background: transparent;
              border: 0px solid #888;
            }
            
            ::-webkit-scrollbar-button:vertical:decrement {
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 8L18 14H6L12 8Z'%3E%3C/path%3E%3C/svg%3E") no-repeat center center;
            }
            
            ::-webkit-scrollbar-button:vertical:increment {
              background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 16L6 10H18L12 16Z'%3E%3C/path%3E%3C/svg%3E") no-repeat center center;
            }

            ${watermark ? '' : this.pageSetup}

            @media print {
              .break_page{
                break-after: page;
              }
              .dxrePageArea {
                break-after: page;
                position: relative !important;
                overflow: visible;
                background-color: transparent !important;
              }
              @page {
                size: 210mm 297mm;
                margin: ${parseInt(this.getHeight(hea)) + parseInt(this.settings.header_height)}px ${this.settings.margin_right}px ${this.settings.footer_height}px ${this.settings.margin_left}px;
                ${this.settings.display_letterhead ? `background-image: url('${this.bg_img}');` : '/assets/images/blank.png'}
                background-size: cover;
                font-family: Arial, sans-serif !important;
                font-size: 16px;
              }
            
              @page {  
                @top-center {
                  content: element(headerContent);
                  vertical-align: top;
                }
                ${watermark ? this.watermark : ''}
                @bottom-right {
                  content: 'Page ' counter(page);
                  font-size: 12pt;
                  font-weight: 600;
                  color: #000000;
                  text-wrap: nowrap;
                  width: 100px;
                  padding-bottom: 40px;
                  font-family: "Trebuchet MS", Tahoma, sans-serif;
                }
              }
              .printHead {
                position: running(headerContent);
                text-align: left;
              }
            }

          </style>
          <script>
            document.addEventListener("DOMContentLoaded", function() {
              PagedPolyfill.on('after', (flow) => {
                const totalPages = flow.total;
                const pages = document.querySelectorAll(".pagedjs_page");
                if (pages.length > 0) {
                  for (let i = 0; i < pages.length; i++) {
                    if (i === pages.length - 1) {
                      pages[i].classList.add("pagedjs_last_page");
                    } else {
                      pages[i].classList.add("not_last_page");
                    }
                  }
                }
              });
            });
          </script>
        </head>
        <body>
         
        ` + `<div class='printHead' style="padding-top: ${this.settings.header_height}px">` + hea + "</div>";


  }

  previewIframe(content: any, header: any, data: any, bg_img: any, watermark: boolean = false) {
    this.settings.header_height = data.header_height;
    this.settings.footer_height = data.footer_height;
    this.settings.margin_left = data.margin_left;
    this.settings.margin_right = data.margin_right;
    this.settings.display_letterhead = data?.display_letterhead;
  
    this.bg_img = bg_img;

    this.setHeaderWithDiv(header, this.settings?.display_page_no || false, watermark);
    this.printer(content, false);

    return this.header + content + this.footer
  }

  setMiniView(content: any, header: any, data: any, bg_img: any, watermark: boolean = false) {
    if(data){
      this.settings.header_height = data.header_height;
      this.settings.footer_height = data.footer_height;
      this.settings.margin_left = data.margin_left;
      this.settings.margin_right = data.margin_right;
      this.settings.display_letterhead = this.settings?.display_letterhead;
    }

    this.bg_img = this.settings?.letterhead || '#fff';

    this.setHeaderWithMinimizedContent(header, watermark);
    return this.header + content + this.footer
  }

  printBase64PDF(base64PDF: any) { 
    printJS({
      printable: base64PDF,
      type: 'pdf',
      base64: true,
      showModal: false,
    });
  }


  printScript = `
<script>
  function printer() {
    window.print();
  }

  window.onload = () => {
    setTimeout(() => {
      printer();
    }, 1000);
  };
</script>

  `;


  // <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  pgdjsprintScript = `

  <script>
    class printReport extends Paged.Handler {
      constructor(chunker, polisher, caller) { super(chunker, polisher, caller) }
      afterPreview(pages){ window.print() }
    }

    Paged.registerHandlers(printReport)
  </script>

  `
  watermark = `
    @left-top {
      content: 'NOT FOR PRINT';
      font-size: 60pt;
      font-weight: 600;
      color: #000000;
      text-wrap: nowrap;
      z-index: 100000;
      padding-left: 50px;
      filter: opacity(0.2);
      transform: rotate(45deg);
      font-family: "Arial", Tahoma, sans-serif;
  }
  `

  pageSetup: any = `
    .pagedjs_pages{
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 25px 0px;
      transform: scale(0.8);
      transform-origin: top center;

    }
    .pagedjs_page{
      border: 0.5px solid #000;
      background-color: #fff;
    }
  `

  pageNums: any = `
   @bottom-right {
      content: 'Page ' counter(page);
      font-size: 10pt;
      font-weight: 600;
      color: #000000;
      text-wrap: nowrap;
      width: 100px;
      padding-bottom: 40px;
      vertical_align: top;
      font-family: "Segoe UI", Tahoma, sans-serif;
  }
  `

}
