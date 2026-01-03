import { Component, Input, OnInit, AfterViewInit, OnDestroy, Optional, Self, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';
import * as Util from '@sharedcommon/base/utils';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';

@Component({
  selector: 'app-textarea-input',
  templateUrl: './textarea-input.component.html',
  styleUrl: './textarea-input.component.scss'
})


export class TextareaInputComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @Input() inputType = "text";
  @Input() columns: number = 5;
  @Input() rows: number = 1;
  @Input() defaultRows: any = null;

  @Input() inputLength:number = 2000;
  @Input() styleVal:string="";
  @Input() isRequired: boolean = true;
  @Input() isReadOnly: boolean = false;
  @Input() placeHolder: string = "Enter input field value";
  @Input() labelText: string = "Input field";
  @Input() removeLabel: boolean = false;
  @Input() imp:boolean = false;
  @Input() classVal: string = 'form-control fw-light rounded-3';
  @Input() labelClass: any="form-label"
  @Input() formSubmitted: boolean = false;
  @Input() requiredMessage: string = "Input is required";
  @Input() minLengthMessage: string = "Input min. length required";
  @Input() maxLengthMessage: string = "Input exceeded max. length";
  @Input() emailMessage: string = "Valid Email is required";
  @Input() inputValue: any = "";
  @Input() removeCloseIcon: boolean = false;
  // auto focus directive
  @Input() applyAutoFocus: boolean = false;

  @Input() alphabetOnly: boolean = false;


  @Input() formatLetter: boolean = false;

  // letters directive
  @Input() applyAllowLettersOnly: boolean = false;
  @Input() applyAllowUnderScore: boolean = false;
  @Input() applyEmptySpace: boolean = false;
  @Input() applyNumbers: boolean = false;
  @Input() applySpecialChars: boolean = false;
  @Input() applyUpperCase: boolean = false;

  @Input() applyDot: boolean = true;

  // numbers directive
  @Input() applyAllowNumbersOnly: boolean = false;

  inputControl!: UntypedFormControl;
  inputElement!: HTMLInputElement | null;
  inputCallback!: () => void;
  @Input() inputId: string = "";

  disabled = true;

  @Input() inputDisable: boolean = false;

  onChange: any = () => { };
  onTouched: any = () => { };

  @Output() onValueChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Optional() @Self() public controlDir: NgControl, private capitalSrvc: CaptilizeService) {
      if (this.controlDir) {
          this.controlDir.valueAccessor = this;
      }

      this.inputId = Util.getRandomString(10);
  }

  ngOnInit() {
      if (this.controlDir) {
          const control = this.controlDir.control;
          this.inputControl = control as UntypedFormControl;
          this.inputValue = this.inputControl.value;

        if(this.inputValue){
            const newlineCount = this.inputValue.split('\n').length - 1;
            this.rows = newlineCount!= 0 ? newlineCount : 1;
        }

        if(this.defaultRows){
            this.rows += this.defaultRows
        }

      }
  }

  ngAfterViewInit(): void {
      if (this.applyAutoFocus) {
          Util.setInputFocus(this.inputId);
      }

      if (this.applyAllowNumbersOnly ||
          this.applyAllowLettersOnly) {
          this.inputElement = document.getElementById(this.inputId) as HTMLInputElement;
          if (this.inputElement) {
              this.inputCallback = this.fn_InputHandler.bind(this);
              this.inputElement.addEventListener("input", this.inputCallback);
          }
      }
  }

  writeValue(value: any): void {
      //this.inputControl?.setValue(value);
      this.inputValue = value;
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

  get inputErrors() {
      return this.inputControl?.errors;
  }

  onInputChange(event: any): void {
      if(this.applyUpperCase && this.inputValue) {
          this.inputValue = this.inputValue.toUpperCase();
      }

      this.onChange(this.inputValue);

      const newlineCount = this.inputValue.split('\n').length - 1;
      this.rows = newlineCount!= 0 ? newlineCount : 1;
      this.onValueChanged.emit(this.inputValue);
  }

  onClearInput(): void {
      this.inputValue = "";
      
      this.onChange(this.inputValue);

      const newlineCount = this.inputValue.split('\n').length - 1;

      this.rows = newlineCount!= 0 ? newlineCount : 1;
      this.onValueChanged.emit("");
  }

  onLostFocus(): void {
      if (this.inputValue) {
          if (this.applyAllowNumbersOnly) {
              this.inputValue = Util.keepOnlyNumbers(this.inputValue, this.applyDot);
              // this.inputValue.includes('.') ? this.inputValue.replace('.', "") : null ;
              this.onChange(this.inputValue);
          }

          if (this.applyAllowLettersOnly) {
              this.inputValue =
                  Util.keepOnlyLetters(
                      this.inputValue,
                      this.applyAllowUnderScore,
                      this.applyEmptySpace,
                      this.applyNumbers,
                      this.applySpecialChars, this.formatLetter);

                  if(this.formatLetter){
                      
                      this.inputValue = this.capitalSrvc.AutoName(this.inputValue);
                      this.onChange(this.capitalSrvc.AutoName(this.inputValue));
                  }else{
                      this.onChange(this.inputValue);
                  }

          }
      }
  }

  fn_InputHandler() {
      if (this.applyAllowNumbersOnly) {
          this.inputValue = Util.keepOnlyNumbers(this.inputValue, this.applyDot);
          this.onChange(this.inputValue);
      }

      if (this.applyAllowLettersOnly) {
          this.inputValue =
              Util.keepOnlyLetters(
                  this.inputValue,
                  this.applyAllowUnderScore,
                  this.applyEmptySpace,
                  this.applyNumbers,
                  this.applySpecialChars,
                  this.applyDot, this.formatLetter);
          this.onChange(this.inputValue);
      }
  }

  ngOnDestroy(): void {
      if (this.inputElement && this.inputCallback) {
          this.inputElement.removeEventListener("input", this.inputCallback);
      }
  }

  
}