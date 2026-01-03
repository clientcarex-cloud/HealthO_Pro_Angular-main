// websocket.service.ts
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieStorageService } from '../core/services/cookie-storage.service';
import { AppAuthService } from '../core/services/appauth.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$!: WebSocketSubject<any>;

  constructor(
    private cookieSrvc: CookieStorageService,
    private authService: AppAuthService
  ) {

    // this.authService.refreshLabSpark_token().subscribe((res: any)=>{
      
    // });

    const token = this.cookieSrvc.getCookieData().access;
    this.socket$ = webSocket(`${environment.webSocketUrl}/ws_chat/?token=${token}`);

    this.socket$.subscribe({
      next: (message) => {
        // console.log('Message received:', message);
      },
      error: (err) => {
        // console.log("Websocket error")
      },
      complete: () => {
        // console.log('WebSocket connection closed');
      }
    });
  }



  // Perform handshake or authentication if needed
  performHandshake() {
    const handshakeMessage = {
      type: "get_messaging_user",
      room_group_name: "",
      data: ""
    };
    this.sendMessage(handshakeMessage);
  }


  getCombinedChat() {
    const message = {
      type: "get_combined_chats",
      room_group_name: "",
      data: {}
    };
    this.sendMessage(message);
  }

  public sendMessage(message: any): void {
    this.socket$.next(message);
  }



























  public getTotalMessagesCount(roomGroupName: string): void {
    const message = {
      type: 'get_total_messages_count',
      room_group_name: roomGroupName,
      data: {}
    };
    this.sendMessage(message);
  }

  public getMessages(): Observable<any> {
    return this.socket$.asObservable();
  }

  public close(): void {
    this.socket$.complete();
  }
}
