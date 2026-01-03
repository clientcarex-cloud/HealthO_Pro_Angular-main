import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-patient-title',
  standalone: true,
  imports: [NgbDropdown, NgbDropdownMenu, NgbDropdownToggle, NgIf],
  templateUrl: './patient-title.component.html',
})
export class PatientTitleComponent {
  @Input() patient: any ;
  @Input() title : any = '';
  @Input() techPage: boolean = true;

  constructor(
    public timeSrvc: TimeConversionService
  ){

  }
}
