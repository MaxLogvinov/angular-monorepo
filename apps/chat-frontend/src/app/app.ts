import { Component } from '@angular/core';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  template: '<app-chat />',
})
export class App {}
