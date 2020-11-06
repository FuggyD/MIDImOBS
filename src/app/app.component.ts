import { Component, Inject } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import 'rxjs/Rx';
import {inputById, MIDI_INPUT, MIDI_OUTPUT, outputByName} from '@ng-web-apis/midi';
import { Input } from './interfaces/input';
// import * as OBSWebSocket from 'obs-websocket-js';
import OBSWebSocket from 'obs-websocket-js/dist/obs-websocket';


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
  obs: any;

  input: any;
  
  counter: number = 1;
  scenes: string[];
  currentScene: string;
  bindings: any = [
    {
      device: {
        manufacturer: "MIDIPLUS", 
        name: "Origin25"
      },
      key: 48,
      action: {
        type: '',
        command: 'SetCurrentScene',
        payload: 'Starting'
      }
    }
]

  constructor(

  ) {    
    this.initMidiStream();

    this.obs = new OBSWebSocket();
    this.obs.connect({ address: 'localhost:4444', password: '12345' }).then(() => {
      console.log(`Success! We're connected & authenticated.`);

      return this.obs.send('GetSceneList');
    })
    .then(data => {
      this.scenes = data.scenes;
      this.currentScene = data.currentScene;
        console.log(this.scenes);
        console.log(data)

        
        // obs.send('SetCurrentScene', {
        //     'scene-name': scene.name
        // });

    })


  //   obs.onopen = function() {
  //     console.log('open');
  //     obs.send('test');
  // };
  
  // obs.onmessage = function(e) {
  //     console.log('message', e.data);
  //     obs.close();
  // };
  
  // obs.onclose = function() {
  //     console.log('close');
  // };

  }


  pause() {
    this.obs.send('SetCurrentScene', {
      'scene-name': 'Pause'
    });
  }

  starting() {
    this.obs.send('SetCurrentScene', {
      'scene-name': 'Starting'
    });
  }

  live() {
    this.obs.send('SetCurrentScene', {
      'scene-name': 'Live'
    });
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
          if(input.key == 48) {
            this.pause();
          } else if (input.key == 50) {
            this.starting();
          } else if (input.key == 52) {
            this.live();
          }
        }
      });
  }



  private midiMessageAsObservable(input) {
    const source = new Subject();
    input.onmidimessage = note => source.next(note);
    return source.asObservable();
  }
}
