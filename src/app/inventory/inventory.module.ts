import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { InventoryComponent } from './components/inventory/inventory.component';
import { InventoryRoutingModule } from './inventory-routing.module';


@NgModule({
  declarations: [   
InventoryComponent
  ],
  imports: [
    SharedModule,
    InventoryRoutingModule
  ],
  providers: [
    
  ]
})

export class InventoryModule { }