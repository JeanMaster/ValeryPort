import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Permitir localhost y también IPs de red privada para modo LAN
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOriginPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // LAN IPs comunes
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // Otros rangos privados
        /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/
      ];

      const isAllowed = allowedOriginPatterns.some(pattern => pattern.test(origin));

      if (isAllowed) {
        return callback(null, true);
      }

      // En desarrollo, podrías querer ser más permisivo o usar env vars
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Valery Corporativo API')
    .setDescription('API REST para el sistema ERP Valery Corporativo - Migración Web')
    .setVersion('1.0')
    .addTag('health', 'Endpoints de salud del sistema')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  // Escuchar en 0.0.0.0 para permitir acceso desde la red local
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`🌐 Acceso local: http://localhost:${port}`);
  console.log(`🌐 Acceso en red: http://(tu-ip-local):${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
