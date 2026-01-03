
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { LabtechnicianComponent } from './components/labtechnician/labtechnician.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: 'labtechnicians', component: LabtechnicianComponent,
     canActivate: [PageGuard] 
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class LabtechnicianRoutingModule { }
