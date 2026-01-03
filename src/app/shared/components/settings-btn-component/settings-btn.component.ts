import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-settingsbutton',
    templateUrl: './settings-btn.component.html',
    styleUrls: ['./settings-btn.component.scss'],
})
export class SettingsButtonComponent {
    @Input() buttonText: string = "Delete";
    @Input() buttonDisabled: boolean = false;
    @Input() content: any = "";
    @Output() onSettingsClick: EventEmitter<string> = new EventEmitter<string>();

    openSettings(content: any): void {
        this.onSettingsClick.emit(this.content);
    }
}