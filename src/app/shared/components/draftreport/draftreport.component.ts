import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-draftreport',
  templateUrl: './draftreport.component.html',
  styleUrls: ['./draftreport.component.scss']
})
export class DraftreportComponent implements OnInit {

  @Input() buttonText: string = 'Draft Report'
  @Input() classVal: string = 'btn btn-sm btn-warning rounded-3 text-nowrap'
  @Input() isLoading: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
