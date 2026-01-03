
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MedicalFitnessComponent } from './components/medical-fitness/medical-fitness.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: '', component: MedicalFitnessComponent, canActivate: [PageGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MedicalFitnessRoutingModule { }
