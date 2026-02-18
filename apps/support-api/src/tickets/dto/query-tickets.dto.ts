import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../enums/ticket-status.enum';

export class QueryTicketsDto {
  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Фильтр по статусу заявки',
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
