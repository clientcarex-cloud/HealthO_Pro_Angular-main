import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dash-graph',
  templateUrl: './dash-graph.component.html',
})
export class DashGraphComponent {

  @Input() title: any = '';
  @Input() chart: any ;
  @Input() count: any = null;
  @Input() countLabel: any = null;
  @Input() icon : any = null ;
  
}
