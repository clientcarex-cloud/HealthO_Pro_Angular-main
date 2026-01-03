import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { ReferalLabComponent } from './components/referal-lab/referal-lab.component';
import { ReferralLabRoutingModule } from './referrallab-routing.module';


@NgModule({
  declarations: [   
    ReferalLabComponent
  ],
  imports: [
    SharedModule,
    ReferralLabRoutingModule
  ],
  providers: [
    
  ]
})

export class ReferralLabModule { }