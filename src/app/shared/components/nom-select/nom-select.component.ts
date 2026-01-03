import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-nom-select',
  templateUrl: './nom-select.component.html',
  styleUrl: './nom-select.component.scss'
})
export class NomSelectComponent {

  @Input() selectItems: any = [] ;
  @Input() bindValue: string = "id";
  @Input() bindLabel: string = "name" ;
  @Input() selectedValue: any = null ;
  @Input() showDisabled: boolean = false;
  @Input() inputDisabled: boolean = false ;

  @Input() classVal : any = "form-select-control border-light-blue px-2 py-1 rounded"

  @Output() valueChanged : EventEmitter<any> = new EventEmitter<any>() ;

  emitValue(e: any){
    this.valueChanged.emit(e.target.value)
  }
}
