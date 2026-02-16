import { IsString, IsObject, IsBoolean, IsOptional } from 'class-validator';

export class CreateConnectorDto {
  @IsString()
  name: string; // "Indeed", "求人ボックス" etc.

  @IsString()
  type: string; // "indeed", "kyujin-box", etc.

  @IsObject()
  config: Record<string, any>; // API認証情報など
}

export class UpdateConnectorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
