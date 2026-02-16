// Use pre-built dist folder
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('../dist/src/app.module');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

let cachedApp;

async function bootstrap() {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn'] }
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

    // Swagger設定 (開発環境のみ)
    if (process.env.NODE_ENV !== 'production') {
      const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
      const config = new DocumentBuilder()
        .setTitle('RPO-SaaS API')
        .setDescription('RPO会社向けSaaS MVP API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
    cachedApp = expressApp;
  }

  return cachedApp;
}

module.exports = async (req, res) => {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
