import { Component, Input, Output,EventEmitter, OnInit, AfterViewInit, OnDestroy, Optional, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import * as Util from '@sharedcommon/base/utils';

@Component({
    selector: 'app-datepicker',
    templateUrl: './app-datepicker.component.html',
    styleUrls: ['./app-datepicker.component.scss'],
})
export class AppDatePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
    @Input() inputType = "text";
    @Input() removeIcon: boolean = false ;
    @Input() isRequired: boolean = true;
    @Input() isReadOnly: boolean = false;
    @Input() placeHolder: string = "Select date";
    @Input() labelText: string = "";
    @Input() labelClass: string = "form-label text-nowrap";
    @Input() imp: boolean = false;
    @Input() classVal:string = 'form-control font-Readex flatpickr-input rounded-3 fw-light ';
    @Input() styleVal: string = "";
    @Input() dateIcon: string = 'ri-calendar-line'; 
    classValDisabled : string = "form-control font-Readex flatpickr-input rounded-3 fw-light bg-light-blue"
    @Input() formSubmitted: boolean = false;
    @Input() requiredMessage: string = "Input is required";
    @Input() minDateMessage: string = "Min. date is not valid";
    @Input() maxDateMessage: string = "Max. date is not valid";
    @Input() datePickerFormat: string = "d-m-Y";
    @Input() convertDatePickerModelValue: boolean = true;
    @Input() dateValue: any = "";
    @Input() allowTime: boolean = false;
    @Input() showCalender: boolean = true;
    @Input() showCloseIcon: boolean = false ;


    @Input() spanClass: any = "d-flex align-items-center"
    @Input() disableDates: any = [];
    startValue: any = "";
    endValue: any = "";

    @Input() dateMode : any = "single"

    @Input() datePickerMinDate!: Date;
    @Input() datePickerMaxDate!: Date;

    @Input() setMax: boolean = true;
    @Input() setMin: boolean = false;
    @Input() disableDate: boolean = false;

    @Input() selectToday: boolean = false;

    // auto focus directive
    @Input() applyAutoFocus: boolean = false;

    @Output() dateValueChange: EventEmitter<any> = new EventEmitter<any>();

    @Output() clearDate: EventEmitter<any> = new EventEmitter<any>();

    datePickerControl!: UntypedFormControl;
    datePickerId: string = "";

    disabled = false;

    onChange: any = () => { };
    onTouched: any = () => { };

    constructor(@Optional() @Self() public controlDir: NgControl, config: NgbDropdownConfig) {
        if (this.controlDir) {
            this.controlDir.valueAccessor = this;
        }

        config.autoClose = false;
        this.datePickerId = Util.getRandomString(10);
    }

    @ViewChild('datePicker') datePicker: any;

    openDatePicker(event: MouseEvent) {
        this.onClearInput();
        event.stopPropagation(); // Prevent the click event from bubbling up
        Util.setDatePickerFocus(this.datePickerId);
    }

    getClass(): string {
        return this.disableDate ? this.classValDisabled : this.classVal;
    }

    ngOnInit() {
        if (this.controlDir) {
            const control = this.controlDir.control;
            this.datePickerControl = control as UntypedFormControl;
            this.dateValue = this.datePickerControl.value;
        }

        const today = new Date();

        if(this.selectToday) this.dateValue = today;

        if(!this.allowTime){
            if(this.setMax) this.datePickerMaxDate = today; 
            if(this.setMin) this.datePickerMinDate = today;
        }
        
    }

    setMinimumDate(date: any, clearDate: any){
        if(clearDate){
            this.onClearInput();
        }
        this.datePickerMinDate = new Date(date);
    }

    selectTodaysDate(){
        const today = new Date();
        this.dateValue = today;

        this.onChange(this.dateValue);
        this.emitDateValueChange()
    }

    ngAfterViewInit(): void {
        if (this.applyAutoFocus && !this.isReadOnly) {
            setTimeout(() => {
                Util.setDatePickerFocus(this.datePickerId);
            }, 500);
        }
    }

    writeValue(value: any): void {
        this.dateValue = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    get datePickerErrors() {
        return this.datePickerControl?.errors;
    }

    onInputChange(event: any): void {
        this.dateValue = event.target.value;
        this.writeValue(event.target.value)
        this.onChange(this.dateValue); // Notify Angular forms about the change
        this.onTouched(); // Notify Angular forms that the input has been touched
        this.emitDateValueChange(); // Emit a custom event to notify the parent component or service
      }
      
      private emitDateValueChange(): void {
        // You can emit an event with the updated date value here
        // Example:
        this.dateValueChange.emit(this.dateValue);
      }
      

    onClearInput(): void {
        this.dateValue = "";
        this.onChange(this.dateValue);
        this.dateValueChange.emit("");
    }

    ngOnDestroy(): void {
        
    }
}