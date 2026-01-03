
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrauthorizationComponent } from './components/drauthorization/drauthorization.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: 'authorization', component: DrauthorizationComponent, 
    canActivate:[PageGuard]
},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class DrauthorizationRoutingModule { }
