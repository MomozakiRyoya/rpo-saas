import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: 'Webエンジニア募集' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'customer-id-here' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'Ruby on Railsでの開発経験者募集...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '東京都渋谷区', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '年収500-800万円', required: false })
  @IsString()
  @IsOptional()
  salary?: string;

  @ApiProperty({ example: '正社員', required: false })
  @IsString()
  @IsOptional()
  employmentType?: string;

  @ApiProperty({ example: 'Ruby on Rails経験3年以上', required: false })
  @IsString()
  @IsOptional()
  requirements?: string;
}

export class UpdateJobDto {
  @ApiProperty({ example: 'Webエンジニア募集', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Ruby on Railsでの開発経験者募集...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '東京都渋谷区', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '年収500-800万円', required: false })
  @IsString()
  @IsOptional()
  salary?: string;

  @ApiProperty({ example: '正社員', required: false })
  @IsString()
  @IsOptional()
  employmentType?: string;

  @ApiProperty({ example: 'Ruby on Rails経験3年以上', required: false })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({
    example: 'DRAFT',
    enum: ['DRAFT', 'GENERATED', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHING', 'PUBLISHED', 'PUBLISH_FAILED', 'STOPPED'],
    required: false
  })
  @IsEnum(['DRAFT', 'GENERATED', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHING', 'PUBLISHED', 'PUBLISH_FAILED', 'STOPPED'])
  @IsOptional()
  status?: string;
}
