import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
// import { StaffsComponent } from './components/staffs/staffs.component';
import { StaffRoutingModule } from './staff-routing.module';
import { OverviewComponent } from './components/overview/overview.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { MainComponent } from './components/main/main.component';
import { StaffDetailsComponent } from './components/staff-details/staff-details.component';
import { StaffViewComponent } from './components/staff-view/staff-view.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { MarketingExecutiveModule } from '../marketexecutive/marketexecutive.module';

@NgModule({
  declarations: [
    MainComponent, 
    // StaffDetailsComponent, 
    // StaffViewComponent, 
    OverviewComponent, 
    EmployeesComponent, 
    EditProfileComponent
  ],
  imports: [
    SharedModule,
    StaffRoutingModule,
    MarketingExecutiveModule
  ],
  exports: [

  ],
})

export class StaffModule { }