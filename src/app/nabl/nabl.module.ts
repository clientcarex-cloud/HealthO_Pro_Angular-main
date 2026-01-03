import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { NablRoutingModule } from './nabl-routing.module';
import { NablcompComponent } from './components/nablcomp/nablcomp.component';
@NgModule({
  declarations: [   
    NablcompComponent
  ],
  imports: [
    NablRoutingModule,
    SharedModule,
  ],
  providers: [
  ]
})

export class NablModule { }