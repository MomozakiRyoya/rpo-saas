// Sentry は他のimportより先に初期化する必要がある
import "./instrument";

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

console.log("=".repeat(80));
console.log(
  "🚨 DEPLOYMENT CHECK: Code version 2026-02-16-20:00 - DEBUG BUILD 🚨",
);
console.log("=".repeat(80));
console.log("Environment variables:");
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  PORT: ${process.env.PORT}`);
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`);
console.log(
  `  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "SET" : "NOT SET"}`,
);
console.log(
  `  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? "SET" : "NOT SET"}`,
);
console.log(`  REDIS_HOST: ${process.env.REDIS_HOST || "NOT SET"}`);
console.log("=".repeat(80));

async function bootstrap() {
  try {
    console.log("🔧 Starting application bootstrap...");
    console.log("Step 1: Creating NestJS application...");

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ["error", "warn", "log", "debug"],
    });

    console.log("✅ NestJS application created successfully");

    console.log("Step 2: Configuring static assets...");
    // 静的ファイル配信（画像）
    try {
      app.useStaticAssets(join(__dirname, "..", "public"));
      console.log("✅ Static assets configured");
    } catch (error) {
      console.warn("⚠️  Static assets configuration failed:", error.message);
    }

    console.log("Step 3: Enabling CORS...");
    // CORS設定
    app.enableCors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    });
    console.log("✅ CORS enabled");

    console.log("Step 4: Setting up global validation...");
    // グローバルバリデーション
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    console.log("✅ Global validation configured");

    console.log("Step 5: Setting up Swagger documentation...");
    // Swagger設定
    const config = new DocumentBuilder()
      .setTitle("RPO-SaaS API")
      .setDescription("RPO会社向けSaaS MVP API Documentation")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
    console.log("✅ Swagger documentation configured");

    const port = process.env.PORT || 3001;
    console.log(`Step 6: Starting server on port ${port}...`);
    await app.listen(port);
    console.log("=".repeat(80));
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log("=".repeat(80));
  } catch (error) {
    console.error("❌ Failed to bootstrap application:", error);
    console.error("Error stack:", error.stack);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error("❌ Unhandled error during bootstrap:", error);
  process.exit(1);
});
