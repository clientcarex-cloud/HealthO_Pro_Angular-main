
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { SupplierComponent } from './components/supplier/supplier.component';
import { AddPharmacyPatientBillingComponent } from './components/add-pharmacy-patient-billing/add-pharmacy-patient-billing.component';
import { PharmacyStandardViewComponent } from './components/pharmacy-standard-view/pharmacy-standard-view.component';


import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: '', component: SupplierComponent, canActivate : [PageGuard]  },
    { path: 'addpatient', component: AddPharmacyPatientBillingComponent, canActivate : [PageGuard] },
    { path: 'pharmacybilling', component: PharmacyStandardViewComponent, canActivate : [PageGuard]  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PharmacyRoutingModule { }
