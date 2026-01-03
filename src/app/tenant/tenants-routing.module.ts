import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { TenantComponent } from "./components/tenant/tenant.component";
import { CountryComponent } from './components/country/country.component';
import { StateComponent } from './components/state/state.component';
import { CityComponent } from './components/city/city.component';
import { BranchComponent } from './components/branch/branch.component';

const routes: Routes = [
    {
        path: '',
        component: TenantComponent
    },
    {
        path: 'country',
        component: CountryComponent
    },
    {
        path: 'state',
        component: StateComponent
    },
    {
        path: 'city',
        component: CityComponent
    },
    {
        path: 'branch',
        component: BranchComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class TenantRoutingModule { }
