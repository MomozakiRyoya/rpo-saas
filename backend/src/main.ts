import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

console.log('🚨 DEPLOYMENT CHECK: Code version 2026-02-16-17:15 🚨');

async function bootstrap() {
  try {
    console.log('🔧 Starting application bootstrap...');

    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // 静的ファイル配信（画像）
    app.useStaticAssets(join(__dirname, '..', 'public'));

    // CORS設定
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Failed to bootstrap application:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Unhandled error during bootstrap:', error);
  process.exit(1);
});
