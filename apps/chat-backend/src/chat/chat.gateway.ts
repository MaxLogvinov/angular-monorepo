import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';

export interface ChatMessage {
  username: string;
  text: string;
  timestamp: number;
}

@WebSocketGateway({ path: '/chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: WebSocket) {
    this.logger.log('Client connected');
    this.send(client, {
      type: 'connected',
      message: 'Добро пожаловать в чат!',
    });
  }

  handleDisconnect() {
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(_client: WebSocket, payload: ChatMessage): void {
    const message: ChatMessage = {
      username: payload.username,
      text: payload.text,
      timestamp: Date.now(),
    };
    this.broadcast({ type: 'message', ...message });
  }

  private send(client: WebSocket, data: object): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  private broadcast(data: object): void {
    const json = JSON.stringify(data);
    this.server.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    });
  }
}
