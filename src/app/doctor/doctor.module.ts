import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { ConsultingComponent } from './components/consulting/consulting/consulting.component';
import { ReferralComponent } from './components/referral/referral/referral.component';
import { DoctorRoutingModule } from './doctor-routing.module';
import { MainComponent } from './components/main/main.component';
import { DoctorDetailsComponent } from './components/doctor-details/doctor-details.component';
import { DoctorViewComponent } from './components/doctor-view/doctor-view.component';
import { ManageAmountComponent } from './components/manage-amount/manage-amount.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { DoctorConsultationComponent } from './components/doctor-consultation/doctor-consultation.component';
import { StaffModule } from '../staff/staff.module';
import { StaffDetailsComponent } from '../staff/components/staff-details/staff-details.component';
import { StaffViewComponent } from '../staff/components/staff-view/staff-view.component';

@NgModule({
  declarations: [   
    ConsultingComponent, 
    ReferralComponent, 
    MainComponent, 
    DoctorDetailsComponent, 
    DoctorViewComponent,
    ManageAmountComponent,
    DoctorConsultationComponent
  ],
  imports: [
   SharedModule,
   DoctorRoutingModule,
   AutocompleteLibModule,
    // StaffModule
    StaffDetailsComponent,
    StaffViewComponent
  ],
  exports:[
    DoctorDetailsComponent,
    ReferralComponent,
  ],
  providers: [
  ]
})

export class DoctorModule { }