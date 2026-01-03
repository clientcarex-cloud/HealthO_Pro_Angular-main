import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { DocDashboardComponent } from './components/doc-dashboard/doc-dashboard.component';
import { DoctorDashboardRoutingModule } from './doctor-dashboard-routing.module';

@NgModule({
  declarations: [   
    DocDashboardComponent
  ],
  imports: [
    DoctorDashboardRoutingModule,
    SharedModule,
  ],
  providers: [
  ]
})

export class DoctorDashboardModule { }