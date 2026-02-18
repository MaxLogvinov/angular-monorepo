import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef<HTMLDivElement>;

  private readonly chatService = inject(ChatService);
  private readonly subs = new Subscription();

  readonly username = signal('');
  readonly messageText = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly isConnected = signal(false);
  readonly hasJoined = signal(false);

  ngOnInit(): void {
    this.subs.add(
      this.chatService.messages$.subscribe((msg) => {
        this.messages.update((prev) => [...prev, msg]);
      }),
    );
    this.subs.add(
      this.chatService.connected$.subscribe((status) => {
        this.isConnected.set(status);
      }),
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  join(): void {
    const name = this.username().trim();
    if (!name) return;
    this.chatService.connect();
    this.hasJoined.set(true);
  }

  sendMessage(): void {
    const text = this.messageText().trim();
    if (!text || !this.isConnected()) return;
    this.chatService.sendMessage(this.username(), text);
    this.messageText.set('');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {
      // ignore
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.chatService.disconnect();
  }
}
