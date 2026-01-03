import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NablcompComponent } from './components/nablcomp/nablcomp.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    {path: 'nablcomp', component: NablcompComponent, 
    canActivate: [PageGuard]
}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class NablRoutingModule { }
