import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-patient-ids',
  templateUrl: './patient-ids.component.html',
  styleUrl: './patient-ids.component.scss'
})

export class PatientIdsComponent {
  @Input() mr_no: any = '';
  @Input() visit_id: any = '' ;
  @Input() query: any = '' ;

  // @Input() mrName="MR NO :"
}
