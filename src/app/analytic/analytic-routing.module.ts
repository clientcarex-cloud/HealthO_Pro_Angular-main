
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageGuard } from './page.guard';
import { MainComponentComponent } from './component/main-component/main-component.component';

const routes: Routes = [
    { path: 'analytics', component: MainComponentComponent,  canActivate: [PageGuard] },
    { path: '', redirectTo: '/analytics', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AnayticRoutingModule { }
