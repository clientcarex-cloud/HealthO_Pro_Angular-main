import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientsMainComponent } from './components/main/main.component';
import { PartnershipsComponent } from './components/partnerships/partnerships.component';
import { PageGuard } from './page.guard';
import { OSPageGuard } from './ospage.guard';

const routes: Routes = [
    {path: 'patients', component: PatientsMainComponent, canActivate: [PageGuard]},
    {path: 'sourcings', component: PartnershipsComponent, canActivate: [OSPageGuard]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class OutsourcingsRoutingModule { }
