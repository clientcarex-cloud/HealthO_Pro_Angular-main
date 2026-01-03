import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { BulkmessagingComponent } from './components/bulkmessaging/bulkmessaging.component';
import { BulkMessagingRoutingModule } from './bulkmessaging-routing.module';


@NgModule({
  declarations: [   
    BulkmessagingComponent
  ],
  imports: [
    BulkMessagingRoutingModule,
    SharedModule,
  ],
  providers: [
    
  ]
})

export class BulkMessagingModule { }