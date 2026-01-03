import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-deletebutton',
    templateUrl: './delete-btn.component.html',
    styleUrls: ['./delete-btn.component.scss'],
})
export class DeleteButtonComponent {
    @Input() buttonText: string = "Delete";
    @Input() buttonDisabled: boolean = false;
    @Input() content: any = "";
    @Input() btnClassVal:string = 'btn btn-sm btn-soft-danger remove-item-btn';
    @Input() deleteIconClass: string = 'ri-delete-bin-5-line align-middle';
    @Output() onDeleteClick: EventEmitter<string> = new EventEmitter<string>();

    deleteItem(content: any): void {
        this.onDeleteClick.emit(this.content);
    }
}