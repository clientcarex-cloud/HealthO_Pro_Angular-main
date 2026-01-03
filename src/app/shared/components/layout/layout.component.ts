import { Component, OnInit, Input } from '@angular/core';
import * as L from 'leaflet';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  @Input() showNav:boolean = true;
  @Input() showMap:boolean = true;
  @Input() showPageTitle: boolean= true;
  @Input() displayInformation:boolean = true;
  @Input() labPackage:boolean = true;
  @Input() showSelectPrint: boolean = true;
  @Input() extraFilter: boolean = false;
  @Input() extraFilterSecond: boolean = false;
  @Input() showAdd: boolean = false ;
  breadCrumbItems!: Array<{}>;
  @Input() pageTitle: string = "";

  @Input() navSectionClass: string = "nav-section-custom";


  constructor(      private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    // this.extraFilter = !this.showSelectPrint
  }

}
