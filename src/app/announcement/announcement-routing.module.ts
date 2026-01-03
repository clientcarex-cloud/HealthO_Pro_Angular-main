
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmsComponent } from './components/sms/sms.component';
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';
import { MainComponent } from './components/main/main.component';
import { PageGuard } from './page.guard';
const routes: Routes = [
    { path: '', component: MainComponent, canActivate: [PageGuard]},
    { path: 'sms', component: SmsComponent, canActivate: [PageGuard]},
    { path: 'whatsapp', component: WhatsappComponent, canActivate: [PageGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AnnouncementRoutingModule { }
