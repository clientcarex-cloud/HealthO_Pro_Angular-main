import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as Util from '@sharedcommon/base/utils';

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements AfterViewInit {
    @Input() expandPanel: Boolean = false;
    @Input() panelTitle: string = "Title";

    showContent: Boolean = false;
    lblId: string = Util.getRandomString(10);
    pnlId: string = Util.getRandomString(10);

    @ViewChild('pnl') pnl!: ElementRef;
    @ViewChild('chk') chk!: ElementRef;

    ngAfterViewInit(): void {
        if(this.expandPanel) {
            this.toggleContent();
            if(this.chk && this.chk.nativeElement){
                this.chk.nativeElement.checked = true;
            }
        }
    }

    toggleContent(): void {
        this.showContent = !this.showContent;
        this.showHideContent();
    }

    private showHideContent(): void {
        let width = "0px";
        if (this.showContent) {
            width = "100vh";
        }

        if (this.pnl && this.pnl.nativeElement) {
            this.pnl.nativeElement.style.maxHeight = width;
        }
    }
}