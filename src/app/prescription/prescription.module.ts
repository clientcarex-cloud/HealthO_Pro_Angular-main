import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { PrescriptionRoutingModule } from './precsription-routing.module';
import { PrecsriptionsComponent } from './components/precsriptions/precsriptions.component';
import { PatientModule } from '../patient/patient.module';
import { AddPrescriptionComponent } from './components/add-prescription/add-prescription.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@NgModule({
  declarations: [
    PrecsriptionsComponent,
    AddPrescriptionComponent
  ],
  imports: [
    SharedModule,
    // PatientModule
    PrescriptionRoutingModule,
    AutocompleteLibModule
  ],
  providers: [
  ]
})

export class PrescriptionModule { }