import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { LanguageService } from '../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

// Component pages
import { LayoutComponent } from './layout.component';
import { VerticalComponent } from './vertical/vertical.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { RightsidebarComponent } from './rightsidebar/rightsidebar.component';
import { SharedModule } from '@sharedcommon/shared.module';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { ErrorComponent } from './error/error.component';
import { OfflineComponent } from './offline/offline.component';
import { PrintPageComponent } from './print-page/print-page.component';
import { SubscriptionNoticeComponent } from './subscription-notice/subscription-notice.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PushNotificationModule } from 'ng-push-notification';
// import { MessageService } from './message.services';



@NgModule({
  declarations: [
    LayoutComponent,
    VerticalComponent,
    TopbarComponent,
    SidebarComponent,
    FooterComponent,
    RightsidebarComponent,
    ErrorComponent,
    OfflineComponent,
    PrintPageComponent,
    SubscriptionNoticeComponent,
  ],
  imports: [
    NgOtpInputModule,
    CommonModule,
    RouterModule,
    NgbDropdownModule,
    NgbNavModule,
    SimplebarAngularModule,
    TranslateModule,
    SharedModule,
    AutocompleteLibModule,
    ForgotPasswordComponent,
    PushNotificationModule.forRoot()
    // MessageService
 
  ],
  exports:
  [
    SidebarComponent
    // ForgotPasswordComponent
  ],
  providers: [LanguageService]
})
export class LayoutsModule { }
