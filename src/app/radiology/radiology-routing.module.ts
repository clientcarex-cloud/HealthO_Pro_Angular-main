
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RadiologistsComponent } from './components/radiologists/radiologists.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: 'radiologists', component: RadiologistsComponent, 
    canActivate: [PageGuard] 
},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RadiologyRoutingModule { }
