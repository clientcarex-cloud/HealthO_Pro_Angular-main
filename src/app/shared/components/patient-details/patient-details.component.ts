import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss'
})
export class PatientDetailsComponent {

  @Input() name: any = "";
  @Input() title: any = null;
  @Input() time: any = null;
  @Input() insertTime: any = null;
  @Input() query: any = ''
  @Input() trnc_word: any = null;

  @Input() trnc_length: any = 175 ;

  @Input() trnc_class:any = "text-truncate fw-medium";
  @Input() timeClass: any = "text-nowrap td-color";
  @Input() nameClass="text-black text-nowrap fs-6 fw-medium"

}
