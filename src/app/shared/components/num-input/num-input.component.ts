import { Component, Input, Output, EventEmitter, forwardRef, OnInit, AfterViewInit, OnDestroy, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, UntypedFormControl } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import * as Util from '@sharedcommon/base/utils';

@Component({
  selector: 'app-num-input',
  templateUrl: './num-input.component.html',
  styleUrl: "./num-input.componenent.scss"
})

export class NumInputComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {

  @Input() styleVal: string = '';
  @Input() classVal: string = 'form-control fw-light rounded-3 py-2 fs-5 fw-semibold';
  @Input() disableInput: boolean = false;
  @Input() inputValue: any = '';
  @Input() ControlName: any = '';
  @Input() maintainLimit: boolean = true;
  @Input() limit: any = 100;
  @Input() placeHolder = "";
  @Input() removeLabel: boolean = true;
  @Input() formSubmitted: boolean = false;

  @Input() labelClass: string = 'form-label';
  @Input() labelText: string = '';
  @Input() imp: boolean = false;
  @Input() inputId: any = ''

  backupnumber: any;
  @Output() inputValueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() lostFocus: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Optional() @Self() public controlDir: NgControl, private capitalSrvc: CaptilizeService) {
    if (this.controlDir) {
      this.controlDir.valueAccessor = this;
    }

  }

  inputControl!: UntypedFormControl;
  ngOnInit() {
    if (this.controlDir) {
      const control = this.controlDir.control;
      this.inputControl = control as UntypedFormControl;
      this.inputValue = this.inputControl.value;
    }

    if(this.inputId == '') this.inputId = Util.getRandomString(10);
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    this.inputValue = "";
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.inputValue = value;
  }

  registerOnChange(fn: any): void {
    this.inputValueChange.subscribe(fn);
  }

  registerOnTouched(fn: any): void { }

  setDisabledState(isDisabled: boolean): void {
    this.disableInput = isDisabled;
  }

  get inputErrors() {
    return this.inputControl?.errors;
  }

  onBlur(){
    this.lostFocus.emit({})
  }

  validateInput(event: any) {

    const inputNumber: string = event.target.value.replace(/[^\d.]/g, '');

    // Handle case where input consists only of a single decimal point
    if (inputNumber.toString().length === 1 && inputNumber.toString() === ".") {
      event.target.value = "";
      event.preventDefault();
      this.inputValueChange.emit("");
    } else {
      // Count the number of decimal points in the input
      let count = {
        start: false,
        counter: 0,
        dot: 0
      };

      inputNumber.split("").forEach((char: any) => {

        if (char === ".") {
          count.start = true
          count.dot += 1;
        }

        if (count.start) {
          count.counter += 1
        }
      });

      // Ensure there is at most one decimal point
      if (count.dot <= 1 && count.counter < 4) {

        event.target.value = inputNumber;

        // Check if limit maintenance is enabled
        if (!this.maintainLimit) {
          this.inputValue = inputNumber;
          this.backupnumber = inputNumber
          this.inputValueChange.emit(inputNumber);
        } else {
          // If maintaining limit, enforce the limit if exceeded
          if (parseFloat(inputNumber) > parseFloat(this.limit)) {
            this.inputValue = this.limit.toString();
            event.target.value = this.limit.toString();
            this.inputValueChange.emit(this.limit.toString());
          } else {
            this.inputValue = inputNumber;
            this.backupnumber = inputNumber
            this.inputValueChange.emit(inputNumber);
          }
        }
      } else {
        // If more than one decimal point, prevent further input and revert to previous value
        event.target.value = this.backupnumber;
        this.inputValue = this.backupnumber;
        this.inputValueChange.emit(this.backupnumber);
        event.preventDefault();
      }
    }
  }

}
