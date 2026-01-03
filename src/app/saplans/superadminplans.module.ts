import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { PlansComponent } from './components/plans/plans.component';
import { SAPlansRoutingModule } from './superadminplans-routing.module';

@NgModule({
    declarations: [ PlansComponent ],
    imports: [ SAPlansRoutingModule, SharedModule ],
    providers: [ ]
})

export class SAPlansModule { }