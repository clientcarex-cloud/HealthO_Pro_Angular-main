import { Injectable } from '@angular/core';
import { PushNotificationsService } from 'ng-push'; //import the module

@Injectable({
  providedIn: 'root'
})

export class MessageService {

    constructor(private _pushNotifications: PushNotificationsService) {
        this._pushNotifications.requestPermission();
      }

      notify() {
        //our function to be called on click
        let options = {
          //set options
          body: "The truth is, I'am common man!",
          icon: 'assets/images/ironman.png', //adding an icon
        };
        this._pushNotifications.create('Iron Man', options).subscribe(
          //creates a notification
          // (res: any) => console.log(res),
          // (err : any) => console.log(err)
        );
      }

}
