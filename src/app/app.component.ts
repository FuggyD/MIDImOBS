import { Component, Inject } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import 'rxjs/Rx';
import {inputById, MIDI_INPUT, MIDI_OUTPUT, outputByName} from '@ng-web-apis/midi';
import { Input } from './interfaces/input';
import * as socketIo from 'socket.io-client';
import * as rpcSock from 'rpc-websockets';
import { RpcClient } from 'jsonrpc-ts';
import { MessageService } from './message.service';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MIDImOBS';
  devices: any;
  messages: any;
  cd: any;
  promise: any;
  MIDI: any;
  socket: any;
  socketID: any;
  // serverURL: any = 'ws://127.0.0.1:59650';
  serverURL: any = 'ws://localhost:59650?token=d9a5f079c06736d551a2c9d945bf47590302b';
  apiToken: string = 'd9a5f079c06736d551a2c9d945bf47590302b';

  rpcClient: any;
  input: any;
  

  // newServer = 'https://sockets.streamlabs.com?token=d9a5f079c06736d551a2c9d945bf47590302b';
  newServer = 'ws://127.0.0.1:59650/api';
  // newServer = 'http://127.0.0.1:59650?token=d9a5f079c06736d551a2c9d945bf47590302b';

  counter: number = 1;

  constructor(
    // private sock: rpcSock.Client(this.serverURL)
    private messageService: MessageService
  ) {    
    this.initMidiStream();


    // fe80::4b6:253c:a4cb:ef15, 10.0.1.192, fe80::1e6f:290f:8221:e95b

    //this.socket = socketIo(this.newServer);
    //this.socket = new rpcSock.Client(this.newServer)
    //this.socket.connect();

    //this.openSocket();

  }

  sendMessage() {
    if (this.input) {
      this.messageService.sendMessage(this.input);
      this.input = '';
    }
  }

//   getSocketId() {
//     console.log(this.socket.id)
//     console.log(this.socket.connected)
//   }

//   async request(resourceId, methodName, ...args) {
//     let requestBody = {
//         jsonrpc: '2.0',
//         id: this.counter,
//         method: methodName,
//         params: { resource: resourceId, args }
//     };
//     console.log('send request')
//     await this.sendMessage(requestBody);
//     this.counter++;
// }
// async sendMessage(message) {
//   let requestBody = message;
//   if (typeof message === 'string') {
//       try {
//           requestBody = JSON.parse(message);
//       } catch (e) {
//           alert('Invalid JSON');
//           return;
//       }
//   }
//   console.log(message)
//   this.socket.emit(JSON.stringify(requestBody), (callback) => {
//     console.log('callback')
//     console.log(callback)
//   });
// }

//   public getScenes() {
//     this.request('SourcesService','getSources');
//   }

//   async openSocket() {
//     console.log('open socket')
//     // this.socket = socketIo(this.serverURL);

//     await this.request('TcpServerService', 'auth', this.apiToken);
//     // this.socket.connect();
//     console.log(this.socket.connected);

//     // this.socket = new rpcSock.Client(this.serverURL);
//     // // this.socket = new rpcSock.Client(this.newServer);
//     // this.socket.connect();
//     // console.log(this.socket)
//     // this.socket.on('open', () => {
//     //   console.log('is open')
//     // })
   
  
//     // this.socket.on('open', function(huhu) {
//     //   this.socket.login({token: this.apiToken})
//     //   this.socket.call('sum', [5, 3]).then(function(result) {
//     //     // require('assert').equal(result, 8)
//     //   })
//     // })

//     let authReq = {
//       "jsonrpc": "2.0",
//       "id": 5,
//       "method": "auth",
//       "params": {
//           "resource": "TcpServerService",
//           "args": [
//               "d9a5f079c06736d551a2c9d945bf47590302b"
//           ]
//       }
//     }

//     // this.socket.emit('', authReq);

//     // this.socket.emit(authReq);

//     // this.socket = socketIo(this.serverURL); 

//     // this.socket.emit('/onboarding/here-i-am');
//   }

//   public getMyScenes() {
//     let sceneReq = {"jsonrpc": "2.0","id": 3,"method": "getScenes","params": {"resource": "ScenesService","args": []}}
//     console.log('socket call')
//     this.socket.emit('event',JSON.stringify(sceneReq));

//     // this.socket.emit('', sceneReq);
//     // this.socket.emit(sceneReq, function (answer) {
//     //   console.log('answer: ')
//     //   console.log(answer)
//     // })
//     console.log('emitted')
//   }

//   public sendAuth() {
//     let auth = {
//       "jsonrpc": "2.0",
//       "id": 2,
//       "method": "auth",
//       "params": {
//           "resource": "TcpServerService",
//           "args": [
//               "d9a5f079c06736d551a2c9d945bf47590302b"
//           ]
//       }
     
//   }
//   this.socket.send(auth);  
// }

  private initMidiStream() {
    const midiAccess$ = from(navigator.requestMIDIAccess());
    const inputStream$ = midiAccess$.map((midi: any) => midi.inputs.values().next().value); // grab the first controller
  
    const messages$ = inputStream$
      .filter(input => input !== undefined)
      .flatMap(input => this.midiMessageAsObservable(input))
      .map((message: any) => ({
        status: message.data[0] & 0xf0,
        data: [
          message.data[1],
          message.data[2],
        ],
        sonstiges: message
      }))
      .subscribe((message) => {
        // 144 = key pressed
        if(message.status === 144) {
          let input: Input = {
            key: message.data[0],
            intense: message.data[1]
          }; 

          console.log('pushed key: ' + input.key)
          console.log('pushed intensity: ' + input.intense)
          console.log(input)
          console.log(message)
        }
        // console.log(message)
        // this.messages.unshift(message);
        // this.cd.detectChanges();
      });
  }

  private midiMessageAsObservable(input) {
    const source = new Subject();
    input.onmidimessage = note => source.next(note);
    return source.asObservable();
  }
}
