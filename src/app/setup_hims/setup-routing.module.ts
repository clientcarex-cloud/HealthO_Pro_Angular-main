
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    {path : '', component: MainComponent, canActivate : [PageGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class HIMSSetupRoutingModule { }
