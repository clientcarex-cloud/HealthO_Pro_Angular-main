import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { ClientRoutingModule } from './client-routing.module';
import { ClientsComponent } from './components/clients/clients.component';
import { OrgComponent } from './components/org/org.component';
import { SetupModule } from '../setup/setup.module';
import { GlobalSettingsComponent } from './components/global-settings/global-settings.component';
import { UpdateTokenComponent } from './components/update-token/update-token.component';
import { DeleteOrganizationsComponent } from './components/delete-organizations/delete-organizations.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@NgModule({
    declarations: [ 
        ClientsComponent,
        OrgComponent,
        GlobalSettingsComponent,
        UpdateTokenComponent,
        DeleteOrganizationsComponent
    ],
    imports: [ 
        SetupModule,
        SharedModule,
        ClientRoutingModule,
        AutocompleteLibModule
     ],
    providers: [ ]
})

export class ClientModule { }