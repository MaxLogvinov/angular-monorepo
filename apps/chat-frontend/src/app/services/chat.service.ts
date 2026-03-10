import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  type: 'message' | 'connected';
  username?: string;
  text?: string;
  timestamp?: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private socket: WebSocket | null = null;

  readonly messages$ = new Subject<ChatMessage>();
  readonly connected$ = new Subject<boolean>();

  connect(): void {
    if (this.socket) return;

    this.socket = new WebSocket(environment.wsUrl);

    this.socket.onopen = () => {
      this.connected$.next(true);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const data: ChatMessage = JSON.parse(event.data as string);
      this.messages$.next(data);
    };

    this.socket.onclose = () => {
      this.connected$.next(false);
      this.socket = null;
    };

    this.socket.onerror = () => {
      this.connected$.next(false);
    };
  }

  sendMessage(username: string, text: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({ event: 'message', data: { username, text } }),
      );
    }
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
