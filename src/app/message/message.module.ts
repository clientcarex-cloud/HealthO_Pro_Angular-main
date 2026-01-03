import { NgModule } from '@angular/core';
import { MessagesComponent } from './components/messages.component';
import { SharedModule } from '@sharedcommon/shared.module';
import { MessageRoutingModule } from './message-routing.module';
import { NgxEditorModule } from 'ngx-editor';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { IncomingMsgComponent } from './components/incoming-msg/incoming-msg.component';
import { OutgoingMsgComponent } from './components/outgoing-msg/outgoing-msg.component';
import { MorefeaturesComponent } from './components/morefeatures/morefeatures.component';
// import { SidebarComponent } from '../layouts/sidebar/sidebar.component';
// import { LayoutsModule } from '../layouts/layouts.module';


@NgModule({
  declarations: [   
    MessagesComponent,
    IncomingMsgComponent,
    OutgoingMsgComponent,
    MorefeaturesComponent
  ],
  imports: [
    SharedModule,
    MessageRoutingModule,
    NgxEditorModule,
    AutocompleteLibModule,
    // LayoutsModule
  ],
  providers: [
  ]
})

export class MessageModule { }