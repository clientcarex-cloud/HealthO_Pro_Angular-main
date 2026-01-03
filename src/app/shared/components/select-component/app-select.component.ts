import { Component, EventEmitter, Input, OnInit, AfterViewInit, Output, Self, Optional, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as Util from '@sharedcommon/base/utils';

@Component({
    selector: 'app-select',
    templateUrl: './app-select.component.html',
    styleUrls: ['./app-select.component.scss'],
})
export class AppSelectComponent implements ControlValueAccessor, OnInit, AfterViewInit {
    @Input() inputType = "text";

    @Input() closeOnSelect: boolean = true ;

    @Input() removeMessage: boolean = false;
    @Input() isRequired: boolean = true;
    @Input() placeHolder: string = "Enter input field value";
    @Input() labelText: any = "";
    @Input() imp: boolean = false;
    @Input() formSubmitted: boolean = false;
    @Input() requiredMessage: string = "Select item from list";
    @Input() selectBindLabel: string = "type_name";
    @Input() selectBindId: string = "id";
    @Input() selectItems: any[] = [];
    @Input() selectValue: any = null;
    @Input() isLoading: boolean = false;
    @Input() emptyFound: boolean = false;
    @Input() classVal: string = "fw-light ng-select-container border-0  rounded-3";
    @Input() multipleSelect: boolean = false;
    @Input() applyAutoFocus: boolean = false;
    @Input() inputDisable: boolean = false; 
    @Input() isClearable : boolean = true ;
    @Input() notFound: string = " Not Found";

    @Input() labelClass: any = "form-label"

    @Input() initTypingPlaceHolder = 'Start typing...'
    

    @Input() dropPosition: any = 'auto';
    @Input() appendTo: any = '';
    @Input() autoClear: boolean = false;


    selectControl!: UntypedFormControl;
    selectId: string = "";

    @Input() disabled = false;

    onChange: any = () => { };
    onTouched: any = () => { };

    @Output() onSelectionChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCustomSearch: EventEmitter<string> = new EventEmitter<string>(); // New output event for custom search
    @ViewChild(NgSelectComponent) ngSelectComponent!: NgSelectComponent

    constructor(@Optional() @Self() public controlDir: NgControl) {
        if (controlDir) {
            this.controlDir.valueAccessor = this;
        }

        this.selectId = Util.getRandomString(10);
    }

    ngOnInit() {
        if (this.controlDir) {
            const control = this.controlDir.control;
            this.selectControl = control as UntypedFormControl;
            if (!this.selectValue) {
                this.selectControl.reset(); // Reset the control if no initial value is provided
            } else {
                this.selectControl.setValue(this.selectValue); // Set the value of the FormControl
            }
        }
    }

    ngAfterViewInit(): void {
        if (this.applyAutoFocus) {
            Util.setSelectFocus(this.selectId);
        }
    }

    writeValue(value: any): void {
        //this.selectControl?.setValue(value);
        this.selectValue = value;
        //this.selectControl?.updateValueAndValidity();
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

    get selectErrors() {
        return this.selectControl?.errors;
    }

    clearInput(){
        this.searchTm = "";
        this.onCustomSearch.emit(""); // Emit the searchTerm
    }

    clearAll(){
        this.ngSelectComponent.handleClearClick();
    }

    searchTm :any = "";
    customSearch(searchTerm: any,) {
        this.searchTm = searchTerm.term
        this.onCustomSearch.emit(searchTerm.term); // Emit the searchTerm
    }

    onSelectChange(event: any): void {
        this.onChange(this.selectValue);
        this.onSelectionChanged.emit(this.selectValue);

        if(this.autoClear){
            this.selectValue = [];
            this.selectItems = [];
        }
    }
}