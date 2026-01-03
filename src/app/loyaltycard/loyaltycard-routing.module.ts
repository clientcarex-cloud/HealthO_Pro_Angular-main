import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoyaltycardComponent } from './components/loyaltycard/loyaltycard.component';
import { MainComponent } from './components/main/main.component';
import { PageGuard } from './page.gurad';

const routes: Routes = [
    { path: '', component: MainComponent, canActivate: [PageGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class LoyaltyCardRoutingModule { }
