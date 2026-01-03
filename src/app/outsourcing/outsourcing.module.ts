import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { OutsourcingsComponent } from './components/outsourcings/outsourcings.component';
import { OutsourcingsRoutingModule } from './outsourcing-routing.module';
import { PatientsMainComponent } from './components/main/main.component';
import { LabPartnerComponent } from './components/lab-partner/lab-partner.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { PartnershipsComponent } from './components/partnerships/partnerships.component';
import { CollabsComponent } from './components/collabs/collabs.component';
import { RequestsLabsComponent } from './components/requests-labs/requests-labs.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientsComponent } from './components/patients/patients.component';
import { BillsComponent } from './components/bills/bills.component';
import { AddLabComponent } from './components/add-lab/add-lab.component';
import { SetupModule } from '../setup/setup.module';
import { LabtechnicianModule } from '../labtechnician/labtechnician.module';
import { AddCompanyComponent } from './components/add-company/add-company.component';
import { CompanyComponent } from './components/company/company.component';
import { UploadPatientFilesComponent } from './components/upload-patient-files/upload-patient-files.component';
import { SendEmailComponent } from './components/send-email/send-email.component';
import { SourcingTestsComponent } from './components/sourcing-tests/sourcing-tests.component';
import { AdvancePaymentsComponent } from './components/advance-payments/advance-payments.component';

@NgModule({
  declarations: [   
   PartnershipsComponent,
   PatientsMainComponent,
   OutsourcingsComponent,
   LabPartnerComponent,
   CollabsComponent,
   RequestsLabsComponent,
   PatientsComponent,
   BillsComponent,
   AddLabComponent,
   AddCompanyComponent,
   CompanyComponent, 
   UploadPatientFilesComponent,
   SendEmailComponent,
   SourcingTestsComponent,
   AdvancePaymentsComponent
  ],
  imports: [
    OutsourcingsRoutingModule,
    SharedModule,
    AutocompleteLibModule,
    NgbAccordionModule,
    LabtechnicianModule,
    SetupModule
  ],
  providers: [
  ]
})

export class OutsourcingModule { }