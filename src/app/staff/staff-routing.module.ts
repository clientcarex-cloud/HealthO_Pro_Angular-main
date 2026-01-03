
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { MainComponent } from './components/main/main.component';
import { StaffDetailsComponent } from './components/staff-details/staff-details.component';
import { StaffViewComponent } from './components/staff-view/staff-view.component';
import { PageGuard } from './page.guard';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';


const routes: Routes = [
    { path: 'main', component: MainComponent, 
    canActivate: [PageGuard]
},
    { path: 'overview', component: OverviewComponent, 
    canActivate: [PageGuard]
 },
    { path: 'employees', component: EmployeesComponent, 
    canActivate: [PageGuard]
 },
    { path: 'add', component:  StaffDetailsComponent, 
    canActivate: [PageGuard]
},
    { path: 'view', component: StaffViewComponent, 
    canActivate: [PageGuard]
},
{ 
    path: 'profile', 
    component: EditProfileComponent, 
},


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class StaffRoutingModule { }
