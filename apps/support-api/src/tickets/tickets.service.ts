import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { Ticket } from './interfaces/ticket.interface';
import { TicketFile } from './interfaces/ticket-file.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './enums/ticket-status.enum';
import { TicketPriority } from './enums/ticket-priority.enum';

@Injectable()
export class TicketsService {
  private tickets: Ticket[] = [
    {
      id: 'a1b2c3d4-1111-4000-a000-000000000001',
      title: 'Не работает страница входа',
      description:
        'После последнего деплоя пользователи не могут авторизоваться в системе',
      status: TicketStatus.NEW,
      priority: TicketPriority.HIGH,
      createdAt: '2025-01-15T10:00:00.000Z',
      updatedAt: '2025-01-15T10:00:00.000Z',
    },
    {
      id: 'a1b2c3d4-2222-4000-a000-000000000002',
      title: 'Отсутствует переключатель тёмной темы',
      description:
        'В настройках профиля нет возможности переключить тему на тёмную',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      createdAt: '2025-01-14T08:30:00.000Z',
      updatedAt: '2025-01-15T09:00:00.000Z',
    },
    {
      id: 'a1b2c3d4-3333-4000-a000-000000000003',
      title: 'Обновить год в копирайте',
      description: 'В подвале сайта всё ещё указан 2024 год',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      createdAt: '2025-01-10T12:00:00.000Z',
      updatedAt: '2025-01-12T16:00:00.000Z',
    },
  ];

  private files: TicketFile[] = [];

  findAll(status?: TicketStatus): Ticket[] {
    if (status) {
      return this.tickets.filter((t) => t.status === status);
    }
    return this.tickets;
  }

  findOne(id: string): Ticket {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) {
      throw new NotFoundException(`Заявка с id "${id}" не найдена`);
    }
    return ticket;
  }

  create(dto: CreateTicketDto): Ticket {
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: TicketStatus.NEW,
      createdAt: now,
      updatedAt: now,
    };
    this.tickets.push(ticket);
    return ticket;
  }

  update(id: string, dto: UpdateTicketDto): Ticket {
    const ticket = this.findOne(id);
    const index = this.tickets.indexOf(ticket);

    const updated: Ticket = {
      ...ticket,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.tickets[index] = updated;
    return updated;
  }

  remove(id: string): void {
    this.findOne(id);
    const ticketFiles = this.files.filter((f) => f.ticketId === id);
    for (const file of ticketFiles) {
      this.deleteFileFromDisk(file.storedName);
    }
    this.files = this.files.filter((f) => f.ticketId !== id);
    this.tickets = this.tickets.filter((t) => t.id !== id);
  }

  addFile(ticketId: string, file: Express.Multer.File): TicketFile {
    this.findOne(ticketId);
    const ticketFile: TicketFile = {
      id: randomUUID(),
      ticketId,
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    this.files.push(ticketFile);
    return ticketFile;
  }

  findFiles(ticketId: string): TicketFile[] {
    this.findOne(ticketId);
    return this.files.filter((f) => f.ticketId === ticketId);
  }

  findOneFile(ticketId: string, fileId: string): TicketFile {
    this.findOne(ticketId);
    const file = this.files.find(
      (f) => f.id === fileId && f.ticketId === ticketId,
    );
    if (!file) {
      throw new NotFoundException(`Файл с id "${fileId}" не найден`);
    }
    return file;
  }

  removeFile(ticketId: string, fileId: string): void {
    const file = this.findOneFile(ticketId, fileId);
    this.deleteFileFromDisk(file.storedName);
    this.files = this.files.filter((f) => f.id !== fileId);
  }

  private deleteFileFromDisk(storedName: string): void {
    try {
      unlinkSync(join(process.cwd(), 'uploads', storedName));
    } catch {
      //deleted file
    }
  }
}
