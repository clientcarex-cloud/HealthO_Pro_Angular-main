import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as Util from '../../base/utils';

const FILTER_PAGE_REGEX = /[^0-9]/g;

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss'],
})
export class AppPagination {
    // @Input() page = 1;
    // @Input() pageSize = 5;
    // @Input() boundaryLinks = true;
    // @Input() collectionSize = 50;
    // paginationInputId: string = "";
    // paginationInputLabelId: string = "";

    // @Output() pageChange: EventEmitter<number> = new EventEmitter();

    // constructor() {
    //     this.paginationInputId = Util.getRandomString(10);
    //     this.paginationInputLabelId = Util.getRandomString(10);
    // }

    // selectPage(page: string) {
    //     this.page = parseInt(page, 10) || 1;
    //     this.pageChange.emit(this.page);
    // }

    // formatInput(input: HTMLInputElement) {
    //     input.value = input.value.replace(FILTER_PAGE_REGEX, '');
    // }

    @Input() collectionSize: number = 0;
    @Input() page: number = 1;
    @Input() pageSize: number = 10;
    @Input() paginationSize: any = ""
  
    @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  
    constructor() { }
  
    onPageChange(event: number): void {
      this.pageChange.emit(event);
    }
}