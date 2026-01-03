import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { OrgComponent } from './components/org/org.component';
import { GlobalSettingsComponent } from './components/global-settings/global-settings.component';

const routes: Routes = [
    { path: '', component: ClientsComponent },
    { path: 'org', component: OrgComponent },
    { path: 'gs', component: GlobalSettingsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ClientRoutingModule { }
