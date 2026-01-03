import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-editbutton',
    templateUrl: './edit-btn.component.html',
    styleUrls: ['./edit-btn.component.scss'],
})
export class EditButtonComponent {
    @Input() buttonText: string = "Edit";
    @Input() buttonDisabled: boolean = false;
    @Input() content: any = "";
    @Input() iconRemove:boolean= false;
    @Input() classVal: string = 'btn btn-sm btn-soft-primary edit-item-btn'
    @Input() icon: any = "ri-edit-line align-middle";
    @Input() textRemove:boolean = false;
    @Output() onEditClick: EventEmitter<string> = new EventEmitter<string>();

    editItem(content: any): void {
        this.onEditClick.emit(this.content);
    }
}