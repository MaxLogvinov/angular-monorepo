import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';

export class TicketResponseDto {
  @ApiProperty({ example: 'b5a7c8d1-1234-4f5e-9a2b-abc123def456' })
  id: string;

  @ApiProperty({ example: 'Не работает страница входа' })
  title: string;

  @ApiProperty({
    example: 'После последнего деплоя пользователи не могут авторизоваться',
  })
  description: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.NEW })
  status: TicketStatus;

  @ApiProperty({ enum: TicketPriority, example: TicketPriority.HIGH })
  priority: TicketPriority;

  @ApiProperty({ example: '2025-01-15T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T10:00:00.000Z' })
  updatedAt: string;
}
