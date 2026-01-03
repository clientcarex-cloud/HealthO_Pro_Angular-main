
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingsComponent } from './components/billings/billings.component';

import { AddconsultationComponent } from './components/addconsultation/addconsultation.component';
import { BillingStandardViewComponent } from './components/billing-standard-view/billing-standard-view.component';
import { PageGuard } from './page.guard';
// import { MainComponentComponent } from './component/main-component/main-component.component';

const routes: Routes = [
    
    { path: 'billings', component: BillingsComponent, canActivate: [PageGuard] },
    { path: 'addnewconsultation', component: AddconsultationComponent, canActivate: [PageGuard] },
    { path: 'patientbilling', component: BillingStandardViewComponent, canActivate: [PageGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class BillingRoutingModule { }
