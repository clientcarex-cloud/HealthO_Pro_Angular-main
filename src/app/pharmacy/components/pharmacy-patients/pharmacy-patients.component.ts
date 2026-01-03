import { Component } from '@angular/core';

@Component({
  selector: 'app-pharmacy-patients',
  template:  `
  <app-patients [is_cms]="true" routeUrl="/billing/patientbilling/" [showTests]="false" [showServices]="false" [showDocCons]="false" 
  [showMeds]="true" [showNavBar]="false" [showDeptFilter]="false" ></app-patients>
  `,
})

export class PharmacyPatientsComponent {

}
