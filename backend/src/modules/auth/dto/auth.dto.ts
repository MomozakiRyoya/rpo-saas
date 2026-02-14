import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '山田太郎' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'my-company' })
  @IsString()
  @IsNotEmpty()
  tenantSlug: string;

  @ApiProperty({ example: 'My Company', required: false })
  @IsString()
  @IsOptional()
  tenantName?: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'MANAGER', 'MEMBER'], required: false })
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER'])
  @IsOptional()
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER';
}
