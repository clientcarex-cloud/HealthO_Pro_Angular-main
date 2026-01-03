import { NgModule } from '@angular/core';
import { SharedModule } from '@sharedcommon/shared.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { BillingsComponent } from './components/billings/billings.component';

import { BillingRoutingModule } from './billing-routing.module';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { AddconsultationComponent } from './components/addconsultation/addconsultation.component';
import { PatientModule } from '../patient/patient.module';
import { DoctorModule } from '../doctor/doctor.module';
import { BillingStandardViewComponent } from './components/billing-standard-view/billing-standard-view.component';
import { PatientRoomComponent } from './components/patient-room/patient-room.component';
import { PrescriptionComponent } from './components/prescription/prescription.component';


@NgModule({
  declarations: [   
    BillingsComponent,
    BillingStandardViewComponent,
    AddconsultationComponent,
    PrescriptionComponent,
    PatientRoomComponent,
  ],
  imports: [
    BillingRoutingModule,
    SharedModule,
    NgbModalModule,
    AutocompleteLibModule,
    PatientModule,
    DoctorModule,
  ],
  exports: [
    BillingStandardViewComponent,
    PrescriptionComponent,
    PatientRoomComponent,
  ],
  providers: [
    
  ]
})

export class BillingModule { }