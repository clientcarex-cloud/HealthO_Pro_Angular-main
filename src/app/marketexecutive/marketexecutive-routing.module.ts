
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMarketExecutiveComponent } from './components/add-market-executive/add-market-executive.component';
import { MainComponent } from './components/main/main.component';

import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: '', component: MainComponent, canActivate : [PageGuard] },
    { path: 'view', component: AddMarketExecutiveComponent, canActivate: [PageGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MarketExecutiveRoutingModule { }
