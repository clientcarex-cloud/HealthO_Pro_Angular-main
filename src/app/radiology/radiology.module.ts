import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { RadiologyRoutingModule } from './radiology-routing.module';
import { RadiologistsComponent } from './components/radiologists/radiologists.component';
import { PatientTitleComponent } from '../labtechnician/components/patient-title/patient-title.component';
import { PatientModule } from '../patient/patient.module';
import { MultiPrintComponent } from '../labtechnician/components/multi-print/multi-print.component';
import { LabtechnicianModule } from '../labtechnician/labtechnician.module';

@NgModule({
  declarations: [   
    RadiologistsComponent
  ],
  imports: [
    RadiologyRoutingModule,
    PatientTitleComponent,
    SharedModule,
    LabtechnicianModule
  ],
  providers: [
  ]
})

export class RadiologyModule { }