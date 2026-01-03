import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-export-btn',
  templateUrl: './export-btn.component.html',
  styleUrls: ['./export-btn.component.scss']
})
export class ExportBtnComponent implements OnInit {

  constructor() { }

  @Input() buttonText: string = 'Export'
  @Input() classVal: string = 'btn btn-primary rounded-3'
  ngOnInit(): void {
  }

}
