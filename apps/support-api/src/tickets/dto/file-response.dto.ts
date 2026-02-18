import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({ example: 'f1e2d3c4-5678-4a9b-bcde-f01234567890' })
  id: string;

  @ApiProperty({ example: 'b5a7c8d1-1234-4f5e-9a2b-abc123def456' })
  ticketId: string;

  @ApiProperty({ example: 'screenshot.png' })
  originalName: string;

  @ApiProperty({ example: 'image/png' })
  mimeType: string;

  @ApiProperty({ example: 204800 })
  size: number;

  @ApiProperty({ example: '2025-01-15T11:00:00.000Z' })
  uploadedAt: string;
}
