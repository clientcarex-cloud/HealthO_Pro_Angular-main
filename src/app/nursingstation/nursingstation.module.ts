import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { NursingStationRoutingModule } from './nursingstation-routing.module';
import { StationviewComponent } from './components/stationview/stationview.component';
import { BillingModule } from '../billing/billing.module';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NursingViewComponent } from './components/nursing-view/nursing-view.component';
import { PatientModule } from '../patient/patient.module';

@NgModule({
  declarations: [   
    StationviewComponent,
    NursingViewComponent
  ],
  imports: [
    SharedModule,
    BillingModule,
    PatientModule,
    AutocompleteLibModule,
    NursingStationRoutingModule,
  ],
  providers: [
  ]
})

export class NursingStationModule { }