import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { ManagepaymentRoutingModule } from './managepayment-routing';
import { ManagepaymentsComponent } from './components/managepayments/managepayments.component';
@NgModule({
  declarations: [   
    
    ManagepaymentsComponent
  ],
  imports: [
    ManagepaymentRoutingModule,
    SharedModule,
  ],
  providers: [
  ]
})

export class ManagepaymentModule { }