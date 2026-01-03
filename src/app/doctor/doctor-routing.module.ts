
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { DoctorDetailsComponent } from './components/doctor-details/doctor-details.component';
import { DoctorViewComponent } from './components/doctor-view/doctor-view.component';
import { PageGuard } from './doctor.auth';
import { ManageAmountComponent } from './components/manage-amount/manage-amount.component';

const routes: Routes = [
    {
        path: 'doctors', component: MainComponent,
        canActivate: [PageGuard]
    },
    {
        path: 'add', component: DoctorDetailsComponent,
        canActivate: [PageGuard]
    },
    {
        path: 'view', component: DoctorViewComponent,
        canActivate: [PageGuard]
    },
    {
        path: 'manage_doctor_amount', component: ManageAmountComponent,
        canActivate: [PageGuard]
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class DoctorRoutingModule { }
