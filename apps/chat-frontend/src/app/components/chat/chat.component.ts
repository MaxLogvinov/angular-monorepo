import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef<HTMLDivElement>;

  private readonly chatService = inject(ChatService);
  private readonly destroyRef = inject(DestroyRef);

  readonly username = signal('');
  readonly messageText = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly isConnected = signal(false);
  readonly hasJoined = signal(false);

  ngOnInit(): void {
    this.chatService.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msg) => {
        this.messages.update((prev) => [...prev, msg]);
      });

    this.chatService.connected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        this.isConnected.set(status);
      });
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

  trackMessage(msg: ChatMessage): string {
    return `${msg.timestamp ?? 0}_${msg.username ?? 'system'}`;
  }

  private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {
      // ignore
    }
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}
