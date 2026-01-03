import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { MarketExecutiveRoutingModule } from './marketexecutive-routing.module';
import { AddMarketExecutiveComponent } from './components/add-market-executive/add-market-executive.component';
import { MainComponent } from './components/main/main.component';
import { ExecutivesComponent } from './components/executives/executives.component';
import { ExecutiveVisitsComponent } from './components/executive-visits/executive-visits.component';
import { AddtaskComponent } from './components/addtask/addtask.component';
import { AddTargetComponent } from './components/add-target/add-target.component';
import { TargetsComponent } from './components/targets/targets.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { VisualizeChartsComponent } from './components/visualize-charts/visualize-charts.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { PayrollComponent } from './components/payroll/payroll.component';
import { LeaveRequestsComponent } from './components/leave-requests/leave-requests.component';
import { DoctorModule } from '../doctor/doctor.module';
import { LeavePolicyComponent } from './components/leave-policy/leave-policy.component';

@NgModule({
  declarations: [
    MainComponent,
    AddMarketExecutiveComponent,
    ExecutivesComponent,
    ExecutiveVisitsComponent,
    AddtaskComponent,
    AddTargetComponent,
    TargetsComponent,
    AttendanceComponent,
    VisualizeChartsComponent,
    PayrollComponent,
    LeaveRequestsComponent,
    LeavePolicyComponent
  ],
  imports: [
    MarketExecutiveRoutingModule,
    DoctorModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  exports: [
    PayrollComponent,
    ExecutivesComponent
  ],
  providers: [
  ]
})

export class MarketingExecutiveModule { }