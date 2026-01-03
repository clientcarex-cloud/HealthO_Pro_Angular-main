import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { GlobalsettingsComponent } from './components/globalsettings/globalsettings.component';
import { GlobalSettingRoutingModule } from './globalsetting-routing.module';


@NgModule({
    declarations: [ 
        GlobalsettingsComponent
    ],
    imports: [ 
        SharedModule,
        GlobalSettingRoutingModule
     ],
    providers: [ ]
})

export class GlobalSettingModule { }