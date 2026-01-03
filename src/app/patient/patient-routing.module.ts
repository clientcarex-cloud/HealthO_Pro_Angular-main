import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientsComponent } from './components/patients/patients.component';
import { AddpatientComponent } from './components/addpatient/addpatient.component';
import { PatientPageComponent } from './components/patient-page/patient-page.component';
import { PageGuard } from './patient-auth.guard';
import { ViewVisitComponent } from './components/view-visit/view-visit.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { AppointmentPageGuard } from './appointments-guard.guard';


const routes: Routes = [
    // { path: '', redirectTo: 'patients', },
  { path: 'patients', component: PatientsComponent,  canActivate:[PageGuard] },
  { path: 'addpatients', component: AddpatientComponent, canActivate:[PageGuard] },
  { path: 'patient_standard_view', component: PatientPageComponent,  canActivate:[PageGuard] },
  { path: 'appointments', component: AppointmentsComponent, canActivate:[AppointmentPageGuard] },
  { path: 'view_vist', component: ViewVisitComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PatientRoutingModule { }
