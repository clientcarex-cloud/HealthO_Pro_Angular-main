import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class TimeConversionService {

  constructor() { }

  getAddedOnTime(Ymd: any){
    const date = new Date(); // Get the current date and time
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${Ymd}T${hours}:${minutes}:${seconds}`;
  }

  getOnlyTime(timestamp: string, dYJformat: boolean = false){
    const inputDate = new Date(timestamp);
    return `${this.formatTime(inputDate)}`
  }

  decodeTimestamp(timestamp: string, dYJformat: boolean = false): string {
    const currentDate = new Date();
    const inputDate = new Date(timestamp);

    if (dYJformat) {
      // Otherwise, return the date in the format DD-MMM-YYYY ~ HH:MMAM/PM
      return `${this.formatDate(inputDate)}, ${this.formatTime(inputDate)}`;
    }

    // Check if the date is today's date
    if (
      inputDate.getDate() === currentDate.getDate() &&
      inputDate.getMonth() === currentDate.getMonth() &&
      inputDate.getFullYear() === currentDate.getFullYear()
    ) {
      return `Today, ${this.formatTime(inputDate)}`;
    }

    // Check if the date is yesterday's date
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    if (
      inputDate.getDate() === yesterday.getDate() &&
      inputDate.getMonth() === yesterday.getMonth() &&
      inputDate.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday, ${this.formatTime(inputDate)}`;
    }

    // Otherwise, return the date in the format DD-MMM-YYYY ~ HH:MMAM/PM
    return `${this.formatDate(inputDate)}, ${this.formatTime(inputDate)}`;
  }

  decodeTimestampWithSlash(timestamp: any): string {
    const currentDate = new Date();
    const inputDate = new Date(timestamp);

    // Check if the date is today's date
    if (
      inputDate.getDate() === currentDate.getDate() &&
      inputDate.getMonth() === currentDate.getMonth() &&
      inputDate.getFullYear() === currentDate.getFullYear()
    ) {
      return `Today, ${this.formatTime(inputDate)}`;
    }

    // Check if the date is yesterday's date
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    if (
      inputDate.getDate() === yesterday.getDate() &&
      inputDate.getMonth() === yesterday.getMonth() &&
      inputDate.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday, ${this.formatTime(inputDate)}`;
    }

    // Otherwise, return the date in the format DD-MMM-YYYY ~ HH:MMAM/PM
    return `${this.formatDateWithDiv(timestamp)}, ${this.formatTime(inputDate)}`;
  }

  formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    const formattedMinutes = minutes.toString().padStart(2, '0'); // Add leading zero if needed
    return `${formattedHours}:${formattedMinutes}${amOrPm}`;
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }


  formatDateWithDiv(timestamp: any, div: any = '-', time: boolean = false): any {
    const inputDate = new Date(timestamp);
    const day = inputDate.getDate().toString().padStart(2, '0');
    const month = (inputDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = inputDate.getFullYear().toString().slice(-2);

    if(time) return `${day}${div}${month}${div}${year}, ${this.formatTime(inputDate)}`;

    return `${day}${div}${month}${div}${year}`;
  }


  getFormattedDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentDateTime() {
    const currentDate = new Date();
    const today = new Date().toLocaleDateString('en-GB');
    const currentTime = currentDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    // Check if the date is today's date
    if (this.isToday(currentDate)) {
      return `Today, ${currentTime}`;
    } else {
      return currentDate.toISOString();
    }
  }

  getTodaysDate(): string {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = currentDate.getFullYear();
    return `${year}-${month}-${day}`;
  }

  getTommorowDate(dateString: any) {
    // let dateString = "2024-06-27"; // Your input date string
    let inputDate = new Date(dateString); // Create a Date object from the input string
    // Increment the date by one day
    inputDate.setDate(inputDate.getDate() + 1);
    // Get the next day's date in the format "YYYY-MM-DD"
    let nextDayDateString = inputDate.toISOString().slice(0, 10);

    return nextDayDateString
  }


  getTodaysDateAsObject(): any {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = currentDate.getFullYear();
    // `${year}-${month}-${day}`
    return {
      year: year,
      month: month,
      day: day
    };
  }

  getTodaysDatePNDT(): string {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = currentDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getYesterdayDate(): string {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1); // Subtract one day from current date
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = currentDate.getFullYear();
    return `${year}-${month}-${day}`;
  }

  getLast7Days(): { startDate: string, endDate: string } {
    const endDate = new Date(); // Today's date

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // Subtract 6 more days to get the start date

    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };

    const startDateString = formatDate(startDate);
    const endDateString = formatDate(endDate);

    return { startDate: startDateString, endDate: endDateString };
  }



  isToday(someDate: Date) {
    const today = new Date();
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear();
  }


  nablDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    } else if (date.toDateString() === dayBeforeYesterday.toDateString()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    }
  }

  NablPatientDate(dateStr: string): string {
    const [datePart, timePart] = dateStr.split(', ');
    const [day, month, year] = datePart.split('-').map(Number);
    const [time, period] = timePart.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date(year, month - 1, day, period === 'AM' ? hours : hours + 12, minutes);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      const formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year.toString()}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      return formattedDate;
    }
  }

  djangoFormat() {
    const date = new Date(); // Get the current date and time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  djangoFormatWithT() {
    const date = new Date(); // Get the current date and time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }


  djangoFormatWithTimeReturn(dateTimeString: any, time: boolean = true) {
    // Split the string into date and time parts
    const [dateString, timeString] = dateTimeString.split(',').map((part: any) => part.trim());

    // Split date and time into individual components
    const [year, month, day] = dateString.split('-').map((part: any) => part.padStart(2, '0'));


    // Format the date and time into the desired Django format
    if (time) {
      const [hours, minutes] = timeString.split(':').map((part: any) => part.padStart(2, '0'));
      const seconds = '00'; // Add seconds if needed
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } else {
      return `${year}-${month}-${day}`
    }

  }


  getStringDate(dateString: any) {

    const date = new Date(dateString);

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    return formattedDate
  }

  hasThreeDaysGap(timestamp1: string, timestamp2: string): any {
    const date1: Date = new Date(timestamp1);
    const date2: Date = new Date(timestamp2);

    // Calculate the difference in milliseconds
    const differenceMs: number = Math.abs(date2.getTime() - date1.getTime());

    // Convert milliseconds to days
    const differenceDays: number = differenceMs / (1000 * 60 * 60 * 24);

    const differenceDaysRounded = Math.ceil(differenceDays);

    // Check if the difference is at least 3 days
    return { bool: differenceDays >= 3, value: differenceDaysRounded };
  }

  dateAsString(timestamp: any, getTime: boolean = true, slice: boolean = false): string {
    let date = new Date() ;
    if(timestamp){
      date = new Date(timestamp);
    }
    const day = date.getDate();
    const month = date.toLocaleString('en-us', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; 
    const formattedMinutes = minutes.toString().padStart(2, '0'); 

    if (getTime) {
      if (slice) {
        return `${day} ${month.slice(0, 3)} ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
      } else {
        return `${day} ${month} ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
      }

    } else {
      return `${day} ${month.toString().slice(0, 3)} ${year}`;
    }

  }

  hasCrossedSpecifiedDateTime(specifiedTimestamp: string): boolean {
    const specifiedDate = new Date(specifiedTimestamp);
    const currentDate = new Date();
    return currentDate.getTime() > specifiedDate.getTime();
  }

  convertToReadableFormat(dateTimeString: any) {
    // Split the string into date and time parts
    const [datePart, timePart] = dateTimeString.split('T');
    // Extract hours and minutes from the time part
    const [hours, minutes] = timePart.split(':');
    // Format and return the result
    return `${datePart}, ${hours}:${minutes}`;
  }

  convertToDate(dateString: any) {
    // Split the date string into parts
    const parts = dateString.split('-');

    // Create a new Date object using the parts
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    return date;
  }


  howManyDaysBack(timestamp: any) {

    function calculateDaysBack(dateString: any) {

      const givenDate: any = new Date(dateString);
      const currentDate: any = new Date();
      const differenceInMs = currentDate - givenDate;
      const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

      return differenceInDays;
    }

    return calculateDaysBack(this.dateAsString(timestamp, true, true))

  }




  calculateDaysBack(dateString: string): string {
    const currentDate = new Date();
    const inputDate = new Date(dateString);

    // Calculate the difference in milliseconds
    const differenceMs = currentDate.getTime() - inputDate.getTime();

    // Calculate the difference in days
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    // Return the result based on the difference
    if (differenceDays === 0) {
      return 'Today';
    } else if (differenceDays === 1) {
      return 'Yesterday';
    } else if (differenceDays <= 7) {
      return `${differenceDays} days ago`;
    } else if (differenceDays <= 30) {
      const weeksAgo = Math.floor(differenceDays / 7);
      return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
    } else if (differenceDays <= 90) {
      return 'One month ago';
    } else if (differenceDays <= 365) {
      const monthsAgo = Math.floor(differenceDays / 30);
      return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
    } else {
      const yearsAgo = Math.floor(differenceDays / 365);
      return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
    }
  }

  calculateAge(years: any, dob: any, age: any): number {

    function getAge(dateOfBirth: string) {
      const dob = new Date(dateOfBirth);
      const now = new Date();

      let age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    }
    if (years) {
      return getAge(dob);
    }
    else {
      return age;
    }
  }



  getTAT(dateStr: any){
    const givenDate: any = new Date(dateStr);
    const currentDate: any = new Date();
    const timeDiffMs = currentDate - givenDate;
    const days = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    if(days != 0){
      return `${days} Days ${hours} Hours ${minutes} Mins` ;
    }else{
      if(hours != 0){
        return `${hours} Hours ${minutes} Mins` ;
      }else{
        return `${minutes} Mins` ;
      }
    }

  }
}
