import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsConfiguration } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';

import { UserDashboardComponent } from './components/user-dashboard/userdashboard.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DashGraphComponent } from './components/dash-graph/dash-graph.component';
import { FinancialStatsComponent } from './components/financial-stats/financial-stats.component';
import { NetCollectionsComponent } from './components/net-collections/net-collections.component';


@NgModule({
  declarations: [
   UserDashboardComponent, DashGraphComponent, FinancialStatsComponent, NetCollectionsComponent
  ],
  imports: [
    DashboardRoutingModule,
    SharedModule,
    NgApexchartsModule,
    DragDropModule,
    
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [
  ]
})

export class DashboardModule { }