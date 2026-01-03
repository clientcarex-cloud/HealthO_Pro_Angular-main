import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as Util from '@sharedcommon/base/utils';

@Component({
    selector: 'app-submitbutton',
    templateUrl: './submit-btn.component.html',
    styleUrls: ['./submit-btn.component.scss'],
})
export class SubmitButtonComponent {
    @Input() formId: string = "";
    @Input() buttonText: string = "Save";
    @Input() buttonDisabled: boolean = false;
    @Input() content: any = "";
    @Input() icon: any = "ri-edit-line align-middle";
    @Input() classVal:string ="btn btn-soft-primary";
    @Output() onSubmitClick: EventEmitter<string> = new EventEmitter<string>();

    constructor() {
        if(!this.formId)
        this.formId = Util.getRandomString(10);
    }

    submitItem(content: any): void {
        this.onSubmitClick.emit(this.content);
    }
}