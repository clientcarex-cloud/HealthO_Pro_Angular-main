import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
})
export class MasterComponent {
  breadCrumbItems!: Array<{}>;
  @Input() pageTitle: string = "Items";
}