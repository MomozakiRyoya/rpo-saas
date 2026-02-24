import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '山田 太郎' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: ['MANAGER', 'MEMBER'] })
  @IsEnum(['MANAGER', 'MEMBER'])
  role: 'MANAGER' | 'MEMBER';
}

export class UpdateRoleDto {
  @ApiProperty({ enum: ['MANAGER', 'MEMBER'] })
  @IsEnum(['MANAGER', 'MEMBER'])
  role: 'MANAGER' | 'MEMBER';
}
