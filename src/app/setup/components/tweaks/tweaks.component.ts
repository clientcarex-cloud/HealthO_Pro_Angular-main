import { Component, Input, ElementRef, TemplateRef, OnInit } from '@angular/core';


@Component({
  selector: 'app-tweaks',
  templateUrl: './tweaks.component.html',
  styleUrls: ['./tweaks.component.scss']
})
export class TweaksComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  active = 'Dashboard';

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

  options=[
    { label: 'Patient Image', text: 'Capture patient image by camera while registration'},
    { label: 'Attach Patient File', text: 'Enable to add patient prescription img or pdf'},
    { label: 'Bar Code', text: 'Generate Bar-code of patient visit for Invoices/Reports/others' },
    { label: 'Auto Bill-Receipt Print', text: 'Print Bill Receipt automatically by conditions' },
    { label: 'Emergency on Lab Tests', text: 'Enable to prior for sample collection and performing lab culture'},
    { label: 'Cancel the Patient', text: 'User can cancel the patient but it will not get delete permanently '},
    { label: 'Auto Home Service', text: 'Enable auto Home Service for all Patients'},
    { label: 'Relationship Management', text: 'Enable smart patient relationship management'},
    { label: 'Insurance System', text: 'Enable insurance management system'},
    { label: 'User Discount Limit', text: 'Enable Discount Limit by Users (set limit in Employee Permissions)'},
    { label: 'Higher Discount Approval', text: 'For Higher Discount by user limits, need to get approval from selected Admin User'},
  
  ]



}
