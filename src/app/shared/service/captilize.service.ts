import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CaptilizeService {

  constructor() { }

  name!: string;
  description: string = "";
  expenseType!: string;
  incmTp!: string;

  captical(i: string): string {
    return i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()
  }

  capitalize(input: string) {
    this.name = input.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
  }

  // CAPITALIZE FIRST LETTER AFTER SPACE FIRST LETTER 
  capitalizeReturn(input: string) {
    return input.replace(/[^a-zA-Z0-9\s+.,()-]/g, '') // Remove non-letter, non-digit, and non-space characters except '+'
      .replace(/(^|\s)([a-zA-Z0-9+.,()-])/g, (match, p1, p2) => p1 + p2.toUpperCase()); // Capitalize first letter of each word
  }


 AutoName(input: string) {
    let cleanInput = input.replace(/[^a-zA-Z.\s]/g, '').toLowerCase();  
    // Remove consecutive dots and capitalize the first letter of each word
    return cleanInput.replace(/(^|\s|\.)([a-z])|(\.{2,})/g, (match, p1, p2, p3) => {
        if (p3) return '.'; // If consecutive dots found, replace with a single dot
        return p1 + p2.toUpperCase(); // Capitalize the first letter of each word
    });
}

AutoNameWithoutDot(input: string) {
  let cleanInput = input.replace(/[^a-zA-Z\s]/g, '').toLowerCase();  
  // Remove consecutive dots and capitalize the first letter of each word
  return cleanInput.replace(/(^|\s|\.)([a-z])|(\.{2,})/g, (match, p1, p2, p3) => {
      if (p3) return '.'; // If consecutive dots found, replace with a single dot
      return p1 + p2.toUpperCase(); // Capitalize the first letter of each word
  });
}
  capitalizeFirst(input: string): any {
    this.description = this.captical(input);
  }

  capitalizeReturnDesc(input: string) {
    this.description = input.toLowerCase().replace(/(^|\s|\.)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
  }


  typeExpCaptilize(input: string): any {
    this.expenseType = this.captical(input);
  }

  typeInmCapitalize(input: string): any {
    this.incmTp = this.captical(input);
  }

  formatIndianNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(number);
    return formattedNumber;
  }
}
