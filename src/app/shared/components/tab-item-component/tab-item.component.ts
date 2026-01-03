import { Component, Input, ElementRef, TemplateRef } from '@angular/core';

@Component({
    selector: 'app-tabcontent',
    templateUrl: './tab-item.component.html',
    styleUrls: ['./tab-item.component.scss'],
})
export class TabContentComponent {
    @Input() contentTemplate!: TemplateRef<any>;
    @Input() tabIndex: number = 0;
    tabId: string = "";
    onTabChanged!: (tabIndex: number, template: TemplateRef<any>) => void;

    constructor(private el: ElementRef) {
    }

    ngOnInit() {
        let nativeElement: HTMLElement = this.el.nativeElement;
        let parentElement: HTMLElement = this.el.nativeElement.parentElement;

        // get all children and move them out of the element
        while (nativeElement.firstChild) {
            parentElement.insertBefore(nativeElement.firstChild, nativeElement);
        }
        
        // remove the empty element(the host)
        parentElement.removeChild(nativeElement);
    }

    tabClicked(): void {
        if (this.onTabChanged) {
            this.onTabChanged(this.tabIndex, this.contentTemplate);
        }
    }
}