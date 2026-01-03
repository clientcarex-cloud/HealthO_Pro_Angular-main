import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagepaymentsComponent } from './components/managepayments/managepayments.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    {path: 'managepayments', component: ManagepaymentsComponent, 
    canActivate: [PageGuard]
}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ManagepaymentRoutingModule { }
