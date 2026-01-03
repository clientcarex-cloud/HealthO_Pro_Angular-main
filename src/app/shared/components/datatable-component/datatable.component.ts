import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
})
export class DataTableComponent {
  @Input() removeHeader: boolean = false;
  @Input() tableClass: string = 'table table-hover';
  @Input() tableHeaderClass: string = "text-muted bg-white";
  @Input() tableBodyClass: string = "bg-white";
  @Input() height: any = 100 ;

  @Input() divClass : string = "table-responsive overflow-auto table-card mt-0 mb-0 border rounded-3 bg-white";
}