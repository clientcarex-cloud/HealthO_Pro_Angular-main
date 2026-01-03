import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})

export class FileService {

  constructor() { }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };


  excelToJson(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const data = reader.result;
        const workBook = XLSX.read(data, { type: 'binary' });
  
        // Get the first sheet's name
        const firstSheetName = workBook.SheetNames[0];
  
        // Get the first sheet data
        const sheet = workBook.Sheets[firstSheetName];
  
        // Convert the sheet to JSON and resolve the promise with it
        resolve(XLSX.utils.sheet_to_json(sheet));
      };
  
      // In case of an error reading the file
      reader.onerror = (error) => {
        reject(error);
      };
  
      // Read the file as a binary string
      reader.readAsBinaryString(file);
    });
  }
  

  downloadFile(base64String: any, fileName: any) {
    const linkSource = base64String;
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = '_self';
    downloadLink.download = fileName;
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }


  openPdfInNewWindow(pdf: any, title: string) {
    const windowOptions = "width=800,height=600,scrollbars=yes,resizable=yes"; // Set the new window's dimensions and options
    const newWindow = window.open("", "_blank", windowOptions); // Open a new window with specified options

    if (newWindow) {
      const pdfUrlWithRestrictions = pdf + '#toolbar=0&navpanes=0&scrollbar=0&disableprint=true&disabledownload=true';
        // Set the document content to show the PDF
        newWindow.document.write(`<html><head><title>${title}</title><body>`);
        newWindow.document.write('<embed src="' + pdfUrlWithRestrictions + '" type="application/pdf" width="100%" height="100%">');
        newWindow.document.write('</body></html>');
        newWindow.document.close();
    } else {
      alert("Pop-up blocked! Please allow pop-ups for this site.");
    }
  }

}