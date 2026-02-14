import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: '株式会社サンプル' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'IT企業、従業員100名', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCustomerDto {
  @ApiProperty({ example: '株式会社サンプル', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'IT企業、従業員100名', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
