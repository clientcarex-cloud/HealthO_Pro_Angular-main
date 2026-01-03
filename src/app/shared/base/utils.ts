import { NgSelectComponent } from "@ng-select/ng-select";

export const setInputFocus = (inputId: string) => {
  const input = document.getElementById(inputId) as HTMLInputElement;
  if (input && !input.readOnly) {
    input.focus();
  }
};

export const setSelectFocus = (selectId: string) => {
  const select = document.getElementById(selectId);
  if (select) {
    const input = select.querySelector("input") as HTMLInputElement;
    if (input && !input.readOnly) {
      input.focus();
    }
  }
};

export const setDatePickerFocus = (datePickerId: string) => {
  const input = document.getElementById(datePickerId) as HTMLElement;
  if (input) {
    input.focus();
  }
};

export const getRandomString = (length: number): string => {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
};

export const keepOnlyLetters = (
  val: string,
  allowUnderScore: boolean = false,
  allowEmptySpace: boolean = false,
  allowNumbers: boolean = false,
  allowSpecialChars: boolean = false,
  allowDot:  boolean = false,
  formatLetter: boolean = false): any => {

  let params = "";

  if (allowUnderScore) {
    params = "_";
  }

  if (allowEmptySpace) {
    params = params + " " + ".";
  }

  if (allowNumbers) {
    params = params + "0-9";
  }

  if (allowDot) {
    params = params + ".";
  }

  if (allowSpecialChars) {
    params = params + "!@#$%^&*)(+=._-";
  }

  let pattern = `[^a-zA-Z${params}]*`;
  const regExp = new RegExp(pattern, "gi");

  //val = val.replace(/[^a-zA-Z]*/g, '');
  if(formatLetter){
    val = val.replace(regExp, '').replace(/[^a-zA-Z0-9\s+.,()-]/g, '') // Remove non-letter, non-digit, and non-space characters except '+'
    .replace(/(^|\s)([a-zA-Z0-9+.,()-])/g, (match, p1, p2) => p1 + p2.toUpperCase()); // Capitalize first letter of each word
  }else{
    val = val.replace(regExp, '');
  }

  return val;
};



export const keepOnlyNumbers = (val: string, dec: boolean = true): any => {
  if (val) {
    // val = val.replace(/[^0-9.]*/g, '');
    // val = val.replace(/[^\d.]/g, '');
    if(dec){
      val = val.replace(/[^\d.]/g, '');
    }else{
      val = val.replace(/[^0-9]*/g, '');
    }

  }

  return val;
};

export function convertLocalDateToUTCIgnoringTimezone(date: Date) {
  const timestamp = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );

  return new Date(timestamp);
};

export function convertUTCToLocalDateIgnoringTimezone(utcDate: Date) {
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
    utcDate.getUTCMilliseconds(),
  );
};

export function removeTimeFromDate(date: Date) {
  const timestamp = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );

  return new Date(timestamp);
};