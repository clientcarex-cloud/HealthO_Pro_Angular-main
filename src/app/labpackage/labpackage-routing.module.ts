import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabpackagesComponent } from './components/labpackages/labpackages.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    {path: 'labpackages', component: LabpackagesComponent, 
    canActivate: [PageGuard]
}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class LabpackageRoutingModule { }
