import { Component, Inject } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import 'rxjs/Rx';
import {inputById, MIDI_INPUT, MIDI_OUTPUT, outputByName} from '@ng-web-apis/midi';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [inputById('input-0'), outputByName('VirtualMIDISynth')],
})
export class AppComponent {
  title = 'MIDImOBS';
  devices: any;
  messages: any;
  cd: any;
  promise: any;
  MIDI: any;

  constructor(

  ) {    
    this.initMidiStream();
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
      .subscribe(message => {
        if(message.status === 144) {
          console.log('pushed key: ' + message.data[0])
          console.log('pushed intensity: ' + message.data[1])
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
