import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiBody,
  ApiProduces,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { FileResponseDto } from './dto/file-response.dto';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
};

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список всех заявок',
    description:
      'Возвращает список заявок с возможностью фильтрации по статусу (new, in_progress, closed)',
  })
  @ApiOkResponse({ type: [TicketResponseDto], description: 'Список заявок' })
  findAll(@Query() query: QueryTicketsDto) {
    return this.ticketsService.findAll(query.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заявку по ID' })
  @ApiOkResponse({ type: TicketResponseDto, description: 'Данные заявки' })
  @ApiNotFoundResponse({ description: 'Заявка не найдена' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Создать новую заявку',
    description:
      'Создаёт заявку с указанным заголовком, описанием и приоритетом. Статус устанавливается автоматически как "new"',
  })
  @ApiCreatedResponse({
    type: TicketResponseDto,
    description: 'Заявка создана',
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить заявку',
    description:
      'Позволяет изменить заголовок, описание, приоритет или статус заявки',
  })
  @ApiOkResponse({
    type: TicketResponseDto,
    description: 'Заявка обновлена',
  })
  @ApiNotFoundResponse({ description: 'Заявка не найдена' })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить заявку',
    description: 'Удаляет заявку и все прикреплённые к ней файлы',
  })
  @ApiNoContentResponse({ description: 'Заявка удалена' })
  @ApiNotFoundResponse({ description: 'Заявка не найдена' })
  remove(@Param('id') id: string) {
    this.ticketsService.remove(id);
  }

  @Post(':id/files')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({
    summary: 'Загрузить файл в заявку',
    description:
      'Прикрепляет файл (скриншот, лог, документ) к существующей заявке. Максимальный размер — 10 МБ',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    type: FileResponseDto,
    description: 'Файл загружен',
  })
  @ApiNotFoundResponse({ description: 'Заявка не найдена' })
  @ApiBadRequestResponse({ description: 'Файл не предоставлен' })
  uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл обязателен для загрузки');
    }
    return this.ticketsService.addFile(id, file);
  }

  @Get(':id/files')
  @ApiOperation({
    summary: 'Получить список файлов заявки',
    description: 'Возвращает метаданные всех файлов, прикреплённых к заявке',
  })
  @ApiOkResponse({
    type: [FileResponseDto],
    description: 'Список файлов',
  })
  @ApiNotFoundResponse({ description: 'Заявка не найдена' })
  findFiles(@Param('id') id: string) {
    return this.ticketsService.findFiles(id);
  }

  @Get(':id/files/:fileId')
  @ApiOperation({
    summary: 'Скачать файл',
    description: 'Скачивает конкретный файл, прикреплённый к заявке',
  })
  @ApiProduces('application/octet-stream')
  @ApiOkResponse({
    description: 'Содержимое файла',
    content: {
      'application/octet-stream': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Заявка или файл не найдены' })
  downloadFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const file = this.ticketsService.findOneFile(id, fileId);
    const filePath = join(process.cwd(), 'uploads', file.storedName);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });
    res.sendFile(filePath);
  }

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить файл из заявки',
    description: 'Удаляет конкретный файл, прикреплённый к заявке',
  })
  @ApiNoContentResponse({ description: 'Файл удалён' })
  @ApiNotFoundResponse({ description: 'Заявка или файл не найдены' })
  removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    this.ticketsService.removeFile(id, fileId);
  }
}
