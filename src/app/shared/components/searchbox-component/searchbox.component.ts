import { Component, EventEmitter, Output, AfterViewInit, Input } from '@angular/core';
import * as Util from '@sharedcommon/base/utils';

@Component({
    selector: 'app-searchbox',
    templateUrl: './searchbox.component.html',
    styleUrls: ['./searchbox.component.scss'],
})
export class SearchBoxComponent implements AfterViewInit {
    // auto focus directive
    @Input() applyAutoFocus: boolean = true;
    @Input() imp: boolean = false;
    @Input() classVal: string = "form-control search font-Readex fw-light rounded-3 bg-white"
    @Output() searchTermChange: EventEmitter<string> = new EventEmitter<string>();
    @Input() placeholder: string = '';
    @Input() searchTerm: string = "";
    searchId: string = "";


    constructor() {
        this.searchId = Util.getRandomString(10);
    }

    ngAfterViewInit(): void {
        if (this.applyAutoFocus) {
            Util.setInputFocus(this.searchId);
        }
    }

    onSearchChange(event: any): void {
        this.searchTermChange.emit(this.searchTerm);
    }

    onClearText(): void {
        this.searchTerm = "";
        this.searchTermChange.emit(this.searchTerm);
    }
}