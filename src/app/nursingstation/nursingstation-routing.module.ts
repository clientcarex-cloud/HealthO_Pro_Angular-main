import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StationviewComponent } from './components/stationview/stationview.component';
import { NursingViewComponent } from './components/nursing-view/nursing-view.component';
import { PageGuard } from './page.guard';

const routes: Routes = [
    { path: '', component: NursingViewComponent, canActivate: [PageGuard] },
    { path: 'stationview', component: StationviewComponent, canActivate: [PageGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class NursingStationRoutingModule { }