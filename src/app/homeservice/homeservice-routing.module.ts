import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeservicesComponent } from './components/homeservices/homeservices.component';

const routes: Routes = [
    { path: 'homeservices', component: HomeservicesComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class HomeserviceRoutingModule { }
