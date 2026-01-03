import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './components/user-dashboard/userdashboard.component';
import { PageGuard } from './dashboard.guard';


const routes: Routes = [
    {
        path: '',
        component: UserDashboardComponent, 
        canActivate: [PageGuard]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class DashboardRoutingModule { }
