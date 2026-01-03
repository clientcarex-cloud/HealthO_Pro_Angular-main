import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { PatientsComponent } from './components/patients/patients.component';
import { AddpatientComponent } from './components/addpatient/addpatient.component';
import { PatientsService } from './services/patients.service';
import { PatientRoutingModule } from './patient-routing.module'
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientPageComponent } from './components/patient-page/patient-page.component';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { NgbDropdownConfig, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientOffcanvasComponent } from './components/patient-offcanvas/patient-offcanvas.component';
import { DoctorModule } from '../doctor/doctor.module';
import { ShiftReportComponent } from './components/shift-report/shift-report.component';
import { ViewVisitComponent } from './components/view-visit/view-visit.component';
import { NewSessionComponent } from './components/new-session/new-session.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { AddAppointmentComponent } from './components/add-appointment/add-appointment.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { ActivityLogsComponent } from './components/activity-logs/activity-logs.component';
import { PndtFormComponent } from './components/pndt-form/pndt-form.component';
import { PopLoyaltyComponent } from './components/pop-loyalty/pop-loyalty.component';
import { RefundComponent } from './components/refund/refund.component';
import { AddPrescriptionComponent } from './components/add-prescription/add-prescription.component';

@NgModule({
  declarations: [
    PatientsComponent,
    AddpatientComponent,
    PatientPageComponent,
    PatientOffcanvasComponent,
    ShiftReportComponent,
    ViewVisitComponent,
    NewSessionComponent,
    AppointmentsComponent,
    AddAppointmentComponent,
    PaymentHistoryComponent,
    ActivityLogsComponent,
    PndtFormComponent,
    PopLoyaltyComponent,
    RefundComponent,
    AddPrescriptionComponent,
  ],
  imports: [
    CdkDrag,
    DragDropModule,
    PatientRoutingModule,
    SharedModule,
    AutocompleteLibModule,
    NgbTypeaheadModule,
    DoctorModule,
    NgbDropdownModule,
  ],
  exports: [
    PatientOffcanvasComponent,
    ShiftReportComponent,
    NewSessionComponent,
    PatientsComponent,
    PaymentHistoryComponent,
    ActivityLogsComponent,
    AppointmentsComponent,
    PndtFormComponent,
    PopLoyaltyComponent,
    RefundComponent,
    AddPrescriptionComponent,
  ],
  providers: [
    NgbDropdownConfig
  ]
})

export class PatientModule { }