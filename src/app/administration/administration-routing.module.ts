import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IDConfigComponent } from './components/id-config/idconfig.component';
import { DepartmentGroupComponent } from './components/dept-group/deptgroup.component';
import { DepartmentComponent } from './components/department/department.component';
import { SMSTransTypeComponent } from './components/sms-transtype/sms-transtype.component';
import { SMSConfigComponent } from './components/sms-config/sms-config.component';

const routes: Routes = [
    {
        path: 'idsettings',
        component: IDConfigComponent
    },
    {
        path: 'deptgroups',
        component: DepartmentGroupComponent
    },
    {
        path: 'depts',
        component: DepartmentComponent
    },
    {
        path: 'smstranstypes',
        component: SMSTransTypeComponent
    },
    {
        path: 'smsconfigs',
        component: SMSConfigComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AdministrationRoutingModule { }
