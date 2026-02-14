import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export default async (req: any, res: any) => {
  // キャッシュされたインスタンスを使用
  if (!(global as any).app) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // CORS設定
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });

    // グローバルバリデーション
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger設定
    const config = new DocumentBuilder()
      .setTitle('RPO-SaaS API')
      .setDescription('RPO会社向けSaaS MVP API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    (global as any).app = expressApp;
  }

  return (global as any).app(req, res);
};
