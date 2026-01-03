import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { AdministrationRoutingModule } from './administration-routing.module';
import { IDConfigComponent } from './components/id-config/idconfig.component';
import { DepartmentGroupComponent } from './components/dept-group/deptgroup.component';
import { DepartmentComponent } from './components/department/department.component';
import { SMSTransTypeComponent } from './components/sms-transtype/sms-transtype.component';
import { SMSConfigComponent } from './components/sms-config/sms-config.component';

@NgModule({
  declarations: [   
    IDConfigComponent,
    DepartmentGroupComponent,
    DepartmentComponent,
    SMSTransTypeComponent,
    SMSConfigComponent
  ],
  imports: [
    AdministrationRoutingModule,
    SharedModule,
  ],
  providers: [
  ]
})

export class AdministrationModule { }