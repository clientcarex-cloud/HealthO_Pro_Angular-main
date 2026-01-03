
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferalLabComponent } from './components/referal-lab/referal-lab.component';
// import { PageGuard } from './page.guard';

const routes: Routes = [
    {
        path: 'labs', component: ReferalLabComponent,
        // canActivate: [PageGuard] 
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ReferralLabRoutingModule { }
