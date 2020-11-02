import { Component, Inject } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import 'rxjs/Rx';
import {inputById, MIDI_INPUT, MIDI_OUTPUT, outputByName} from '@ng-web-apis/midi';
import { Input } from './interfaces/input';
import * as socketIo from 'socket.io-client';
import * as rpcSock from 'rpc-websockets';

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

  // newServer = 'https://sockets.streamlabs.com?token=d9a5f079c06736d551a2c9d945bf47590302b';
  // newServer = 'https://sockets.streamlabs.com/api';
  newServer = 'http://127.0.0.1:59650?token=d9a5f079c06736d551a2c9d945bf47590302b';


  constructor(
    // private sock: rpcSock.Client(this.serverURL)
  ) {    
    this.initMidiStream();
    this.openSocket();

    // this.socket.on('startRecording', (response) => {
    //   console.log(response)
    // });

    this.socket.on('event', data => {
      console.log(data);
    });

    this.socket.on('connect', data => {
      console.log(data)
    })
  }

  getSocketId() {
    console.log(this.socket.id)
    console.log(this.socket.connected)
  }

  openSocket() {
    console.log('open socket')
    // this.socket = socketIo(this.serverURL);
   

    this.socket = socketIo(this.newServer);
    this.socket.connect();
    console.log(this.socket.connected);

    // this.socket = new rpcSock.Client(this.serverURL);
    // // this.socket = new rpcSock.Client(this.newServer);
    // this.socket.connect();
    // console.log(this.socket)
    // this.socket.on('open', () => {
    //   console.log('is open')
    // })
   
  
    // this.socket.on('open', function(huhu) {
    //   this.socket.login({token: this.apiToken})
    //   this.socket.call('sum', [5, 3]).then(function(result) {
    //     // require('assert').equal(result, 8)
    //   })
    // })

    let authReq = {
      "jsonrpc": "2.0",
      "id": 2,
      "method": "auth",
      "params": {
          "resource": "TcpServerService",
          "args": [
              "d9a5f079c06736d551a2c9d945bf47590302b"
          ]
      }
    }

    // this.socket.emit('', authReq);

    // this.socket.emit(authReq);

    // this.socket = socketIo(this.serverURL); 

    // this.socket.emit('/onboarding/here-i-am');
  }

  public getMyScenes() {
    let sceneReq = {"jsonrpc": "2.0","id": 3,"method": "getScenes","params": {"resource": "ScenesService","args": []}}
    console.log('socket call')
    this.socket.emit('event',JSON.stringify(sceneReq));

    // this.socket.emit('', sceneReq);
    // this.socket.emit(sceneReq, function (answer) {
    //   console.log('answer: ')
    //   console.log(answer)
    // })
    console.log('emitted')
  }

  public sendAuth() {
    let auth = {
      "jsonrpc": "2.0",
      "id": 2,
      "method": "auth",
      "params": {
          "resource": "TcpServerService",
          "args": [
              "d9a5f079c06736d551a2c9d945bf47590302b"
          ]
      }
     
  }
  this.socket.call(auth);  
}

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
