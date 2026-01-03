import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select-print',
  templateUrl: './select-print.component.html',
  styleUrls: ['./select-print.component.scss']
})
export class SelectPrintComponent implements OnInit {
  @Input() placeHolderText : string = "Select an option";
  @Input() buttonText: string = "Select & Print" ;
  @Input() iconClassVal: string = "d-none"

  @Input() items: any[] = [];
  @Input() isLoading: boolean = false ;
  @Input() disableSelect: boolean = false ;
  @Output() reportSelected = new EventEmitter<any>();
  @Output() printClicked = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  selectReport(event: any) {
    this.reportSelected.emit(event);
  }

  onPrintClick() {
    this.printClicked.emit();
  }
}
