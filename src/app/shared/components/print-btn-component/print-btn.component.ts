import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-print-btn',
  templateUrl: './print-btn.component.html',
  styleUrls: ['./print-btn.component.scss']
})
export class PrintBtnComponent implements OnInit {

  constructor() { }

  @Input() buttonText: string = 'Print'
  @Input() classVal: string = 'btn btn-success rounded-3'
  @Input() dateDisplay: boolean = false;
  @Input() dateText: string = ''
  ngOnInit(): void {
  }

}
