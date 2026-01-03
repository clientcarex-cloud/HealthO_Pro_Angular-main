import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { HomeserviceRoutingModule } from './homeservice-routing.module';
import { HomeservicesComponent } from './components/homeservices/homeservices.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [   
    HomeservicesComponent
  ],
  imports: [
    HomeserviceRoutingModule,
    SharedModule,
    LeafletModule,
    HttpClientModule
  ],
  providers: [
  ]
})

export class HomeserviceModule { }