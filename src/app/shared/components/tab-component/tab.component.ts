import { Component, ElementRef, OnInit, AfterContentInit, ContentChildren, QueryList, TemplateRef, Input } from '@angular/core';
import { TabContentComponent } from '../tab-item-component/tab-item.component';
import * as Util from '@sharedcommon/base/utils';

@Component({
    selector: 'app-tabs',
    templateUrl: './tab.component.html',
    styleUrls: ['./tab.component.scss'],
})
export class TabsComponent implements OnInit, AfterContentInit {
    @ContentChildren(TabContentComponent, { descendants: true }) tabContentComps!: QueryList<TabContentComponent>;
    @Input() selectedTabIdx: Number = 0;
    @Input() contentDisplay: boolean = true;
    private id: string = "";
    activeTabIdx: Number = 0;
    contentTemplate!: TemplateRef<any>;
    private initLink!: HTMLAnchorElement;
    private initTabIdx: Number = -1;

    constructor(private el: ElementRef) {
        this.id = Util.getRandomString(10);
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

    ngAfterContentInit(): void {
        let idx = 0;
        if (this.tabContentComps) {
            this.tabContentComps.forEach((tabContentComp: TabContentComponent) => {
                idx = idx + 1;
                tabContentComp.tabIndex = idx;
                tabContentComp.tabId = `${this.id}_navitem_${idx}`;
                tabContentComp.onTabChanged = (tabIndex: number, template: TemplateRef<any>) => {
                    // remove manually added active class and
                    // let handle by ngb nav
                    if (this.initTabIdx != tabIndex) {
                        this.initTabIdx = 1;
                        this.initLink.classList.remove("active");
                    }

                    this.activeTabIdx = tabIndex;
                    this.contentTemplate = template;
                };
            })
        }

        if (this.selectedTabIdx == 0) {
            this.selectedTabIdx = 1;
        }

        setTimeout(() => {
            this.setActiveTab(this.selectedTabIdx);
        }, 250);
    }

    private setActiveTab(tabIdx: Number): void {
        this.initTabIdx = tabIdx;
        let tabId = `${this.id}_navitem_${tabIdx}`;
        let eleTab = document.getElementById(tabId);
        if (eleTab) {
            let links = eleTab.getElementsByTagName("a");
            if (links.length) {
                this.initLink = links[0];
                this.initLink.classList.add("active");
                eleTab.click();
            }
        }
    }
}