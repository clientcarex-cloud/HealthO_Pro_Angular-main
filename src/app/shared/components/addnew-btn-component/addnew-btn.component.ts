import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-addnewbutton',
    templateUrl: './addnew-btn.component.html',
    styleUrls: ['./addnew-btn.component.scss'],
})
export class AddNewButtonComponent {
    @Input() buttonText: string = "Add New Item";
    @Input() buttonDisabled: boolean = false;
    @Input() content: any = "";
    @Input() classVal: string = "btn bg-white border rounded-3 text-nowrap ";
    @Output() onAddNewClick: EventEmitter<string> = new EventEmitter<string>();

    addItem(content: any): void {
        this.onAddNewClick.emit(this.content);
    }
}