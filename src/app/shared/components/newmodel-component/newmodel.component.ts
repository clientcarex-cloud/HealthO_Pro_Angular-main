import { Component, Input } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-newmodel',
  templateUrl: './newmodel.component.html',
  styleUrls: ['./newmodel.component.scss'],
})
export class NewModelComponent {
  @Input() modelTitle: string = "Title";
  @Input() closeButtonText: string = "Close";
  @Input() saveButtonText: string = "Save";
  @Input() showSaveButton: boolean = true;
  @Input() modal!: NgbModalRef;
  @Input() formId!: string;
}