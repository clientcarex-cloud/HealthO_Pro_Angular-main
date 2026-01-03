
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocDashboardComponent } from './components/doc-dashboard/doc-dashboard.component';
// import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: 'docdshbrd', component: DocDashboardComponent, 
},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class DoctorDashboardRoutingModule { }
