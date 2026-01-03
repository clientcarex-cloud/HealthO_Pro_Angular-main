import { Component, Input, ElementRef, TemplateRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-masterrr',
  templateUrl: './masterrr.component.html',
  styleUrls: ['./masterrr.component.scss']
})
export class MasterrrComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // activeButton: string = 'Master';
  activeButton: string = 'departmentsTmpt';

  setActiveButton(buttonName: string) {
    this.activeButton = buttonName;
  }

  active = 'labTests';
  // active = 'businessTmpt'

  handleTabChange(tabIndex: number, template: TemplateRef<any>): void {
    // Your implementation here
  }

  menu = [
    'Patients Registration',
    'Report Delivery',
    'Payments',
    'Auto SMS',
    'Auto WhatsApp',
    'Auto Email'
  ]

  deleteRecords() {
    console.log("Delete Records button clicked");
  }

}
