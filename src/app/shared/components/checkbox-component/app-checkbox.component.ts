import { Component, EventEmitter, Input, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';
import * as Util from '@sharedcommon/base/utils';

@Component({
    selector: 'app-checkbox',
    templateUrl: './app-checkbox.component.html',
    styleUrls: ['./app-checkbox.component.scss'],
})
export class AppCheckboxComponent implements ControlValueAccessor, OnInit {    
    @Input() isReadOnly: boolean = false;    
    @Input() labelText: string = "Input field";
    @Input() showLabel: boolean = true;
    @Input() removeLabel: boolean = false;
    @Input() activeText: string = "Active";
    @Input() inactiveText: string = "Inactive";
    @Input() formSubmitted: boolean = false;   
    @Input() checkboxValue: boolean = false;
    @Input() removeActInc:boolean = true;
    @Input() classVal:string = "form-check form-switch form-check-lg";

    @Input() tab_idx = '0';

    @Input() mainLabel: any = 'form-label'
    @Input() labelClass : string = "form-check-label fw-light ps-1";
    checkboxControl!: UntypedFormControl;   
    checkboxId: string = "";

    @Input() inputDisabled = false;

    onChange: any = () => { };
    onTouched: any = () => { };

    @Output() onCheckboxValueChanged: EventEmitter<any> = new EventEmitter<any>();

    constructor(@Optional() @Self() public controlDir: NgControl) {
        if (this.controlDir) {
            this.controlDir.valueAccessor = this;
        }

        this.checkboxId = Util.getRandomString(10);
    }

    ngOnInit() {
        if (this.controlDir) {
            const control = this.controlDir.control;
            this.checkboxControl = control as UntypedFormControl;
            this.checkboxValue = this.checkboxControl.value;
        }
    }    

    writeValue(value: any): void {
        this.checkboxValue = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.inputDisabled = isDisabled;
    }

    get checkboxErrors() {
        return this.checkboxControl?.errors;
    }

    onCheckedChange(event: any): void {
        this.onChange(this.checkboxValue);
        this.onCheckboxValueChanged.emit(this.checkboxValue);
    }
}