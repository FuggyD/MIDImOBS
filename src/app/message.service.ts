// Declare SockJS and Stomp
declare var SockJS;
declare var Stomp;

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  stompClient: any;
  msg: any;

  constructor() {
    this.initializeWebSocketConnection();
   }

   initializeWebSocketConnection() {
    const serverUrl = 'http://127.0.0.1:59650/api';
    const ws = new SockJS(serverUrl);
    this.stompClient = Stomp.over(ws);
    const that = this;
    // tslint:disable-next-line:only-arrow-functions
    this.stompClient.connect({}, function(frame) {
      that.stompClient.subscribe('/message', (message) => {
        if (message.body) {
          that.msg.push(message.body);
        }
      });
    });
  }
  
  sendMessage(message) {
    this.stompClient.send('/app/send/message' , {}, message);
  }
}
