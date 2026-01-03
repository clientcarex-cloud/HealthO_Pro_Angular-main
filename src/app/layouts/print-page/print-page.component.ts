import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-print-page',
  templateUrl: './print-page.component.html',
  styleUrls: ['./print-page.component.scss']
})
export class PrintPageComponent implements OnInit {

  @Input() htmlString! : string ;

  constructor() { }

  ngOnInit(): void {
  }

}
