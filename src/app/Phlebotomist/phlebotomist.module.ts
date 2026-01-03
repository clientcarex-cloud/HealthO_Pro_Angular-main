import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { PhlebotomistRoutingModule } from './phlebotomist-routing.module';
import { PhlebotomistsComponent } from './components/phlebotomists/phlebotomists.component';
import { PatientWiseCollectionComponent } from './components/patient-wise-collection/patient-wise-collection.component';

@NgModule({
  declarations: [
    PhlebotomistsComponent,
    PatientWiseCollectionComponent
  ],
  imports: [
    PhlebotomistRoutingModule,
    SharedModule,
  ],
  providers: [
  ]
})

export class PhlebotomistModule { }