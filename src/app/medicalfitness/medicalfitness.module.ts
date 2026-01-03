import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { PatientTitleComponent } from '../labtechnician/components/patient-title/patient-title.component';
import { MedicalFitnessComponent } from './components/medical-fitness/medical-fitness.component';
import { MedicalFitnessRoutingModule } from './medicalfitness-routing';
import { LabtechnicianModule } from '../labtechnician/labtechnician.module';
import { MedfitComponent } from './components/medfit/medfit.component';

@NgModule({
  declarations: [   
    MedicalFitnessComponent,
    MedfitComponent
  ],
  imports: [
    MedicalFitnessRoutingModule,
    PatientTitleComponent,
    SharedModule,
    LabtechnicianModule
  ],
  providers: [
  ]
})

export class MedicalFitnessModule { }