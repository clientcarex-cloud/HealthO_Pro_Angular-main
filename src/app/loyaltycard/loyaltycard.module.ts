import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { LoyaltyCardRoutingModule } from './loyaltycard-routing.module';
import { LoyaltycardComponent } from './components/loyaltycard/loyaltycard.component';
import { MainComponent } from './components/main/main.component';
import { CardComponent } from './components/card/card.component';
import { MembersComponent } from "./components/members/members.component";
import { MemberShipComponent } from "./components/member-ship/member-ship.component";
import { UsgHistoryComponent } from './components/usg-history/usg-history.component';


@NgModule({
  declarations: [   
    MainComponent,
    LoyaltycardComponent, 
    CardComponent,
    MembersComponent,
    MemberShipComponent,
    UsgHistoryComponent
  ],
  imports: [
    LoyaltyCardRoutingModule,
    SharedModule,
   
],
  providers: [
    
  ]
})

export class LoyaltyCardModule { }