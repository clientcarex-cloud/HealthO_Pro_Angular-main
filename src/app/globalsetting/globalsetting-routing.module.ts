import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalsettingsComponent } from './components/globalsettings/globalsettings.component';


const routes: Routes = [
    { path: '', component: GlobalsettingsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class GlobalSettingRoutingModule { }
