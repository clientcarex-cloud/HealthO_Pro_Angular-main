import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-receive-btn',
  templateUrl: './receive-btn.component.html',
  styleUrls: ['./receive-btn.component.scss']
})
export class ReceiveBtnComponent implements OnInit {

  @Input() buttonText: string = 'Received'
  @Input() classVal: string = 'd-flex flex-column justify-content-start'
  @Input() dateDisplay: boolean = false;
  @Input() dateText: string = ''

  constructor() { }

  ngOnInit(): void {
  }

}
