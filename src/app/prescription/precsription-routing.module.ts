
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrecsriptionsComponent } from './components/precsriptions/precsriptions.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: '', component: PrecsriptionsComponent, canActivate: [PageGuard] },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PrescriptionRoutingModule { }
