import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TicketPriority } from '../enums/ticket-priority.enum';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Заголовок заявки',
    example: 'Не работает страница входа',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Подробное описание проблемы',
    example: 'После последнего деплоя пользователи не могут авторизоваться',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: TicketPriority,
    description: 'Приоритет заявки',
    example: TicketPriority.HIGH,
  })
  @IsEnum(TicketPriority)
  priority: TicketPriority;
}
