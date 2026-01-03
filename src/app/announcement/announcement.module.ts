import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { AnnouncementRoutingModule } from './announcement-routing.module';
import { SmsComponent } from './components/sms/sms.component';
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';
import { MainComponent } from './components/main/main.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { BulkHistoryComponent } from './components/bulk-history/bulk-history.component';
@NgModule({
  declarations: [
    SmsComponent, WhatsappComponent, MainComponent, BulkHistoryComponent
  ],
  imports: [
    AnnouncementRoutingModule,
    SharedModule,
    NgbNavModule
  ],
  providers: [
    // PatientsService
  ]
})

export class AnnouncementModule { }