
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkmessagingComponent } from './components/bulkmessaging/bulkmessaging.component';
// import { PageGuard } from './page.guard';

const routes: Routes = [
    {
        path: '', component: BulkmessagingComponent,
        // canActivate: [PageGuard] 
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class BulkMessagingRoutingModule { }
