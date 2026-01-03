import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertService } from '@sharedcommon/service/alert.service';

@Component({
  selector: 'app-morefeatures',
  templateUrl: './morefeatures.component.html',
  styleUrls: ['./morefeatures.component.scss']
})
export class MorefeaturesComponent {
  @Input() chat: any; // Example input property
  @Output() forwardMessageEvent = new EventEmitter<any>(); // Example output event

  opended: boolean = false

  constructor(private alertSrvc: AlertService) { }

  forwardMessageToChat(chat: any) {
    // Perform logic to forward message to chat
    this.forwardMessageEvent.emit(chat); // Emitting the event with data
  }

  openXl(forwardMessage: any, param: string) {
    // Your openXl logic
  }

  copyText(){
    async function writeClipboardText(text: any) {
      try {
        await navigator.clipboard.writeText(text);
        
      } catch (error: any) {
        console.error(error.message);
      }
    }

    writeClipboardText(this.chat.text);
    this.alertSrvc.showSuccess("Text Copied")
  }
}
