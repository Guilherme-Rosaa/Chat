import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, empty } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: WebSocketSubject<any> | null = null;

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    const websocketURL = 'ws://localhost:8081';
    this.socket = webSocket(websocketURL);
  }
  sendMessage(message: any) {
    this.socket?.next(message);
  }
}
