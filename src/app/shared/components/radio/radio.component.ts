import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
})
export class RadioComponent implements OnInit {

  constructor() { }

  @Input() labelText:string = 'Input field';
  @Input() checkValue: boolean = false;
  @Input() removeLabel: boolean = false;
  @Input() labelClass: any = 'form-check-label fw-light';

  @Output() checkValueChange: EventEmitter<boolean> = new EventEmitter<boolean>();


  ngOnInit(): void {
  }

  onCheckChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checkValue = input.checked;
    this.checkValueChange.emit(this.checkValue);
  }

  changeValue(){
    this.checkValue = !this.checkValue ;
    this.checkValueChange.emit(this.checkValue);
  }

}
