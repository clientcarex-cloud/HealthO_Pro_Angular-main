
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhlebotomistsComponent } from './components/phlebotomists/phlebotomists.component';
import { PageGuard } from './page.guard';
import { PatientWiseCollectionComponent } from './components/patient-wise-collection/patient-wise-collection.component';

const routes: Routes = [
    { path: 'samplecollection', component: PhlebotomistsComponent, canActivate: [PageGuard] },
    { path: 'phlebotomists', component: PatientWiseCollectionComponent, canActivate: [PageGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PhlebotomistRoutingModule { }
