import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Filtro de excepciones global para debuguear errores 500 en producción
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // CORS - Permitir localhost, IPs de red privada y el dominio de Vercel
  app.enableCors({
    origin: (origin, callback) => {
      // Si no hay origen (ej. Postman o herramientas del mismo servidor), permitir
      if (!origin) return callback(null, true);

      const allowedOriginPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
        /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/,
        /\.vercel\.app$/, // Permitir cualquier subdominio de vercel.app
      ];

      const isAllowed = allowedOriginPatterns.some(pattern => pattern.test(origin));

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Para producción, permitir orígenes definidos en env vars o dominios conocidos
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (allowedOrigins.includes(origin) || origin.includes('valery-port')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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

  // Trust proxy for production (important for getting real IP and secure cookies behind Render/Vercel/Railway)
  if (process.env.NODE_ENV === 'production') {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);
  }

  const port = process.env.PORT ?? 3000;
  // Escuchar en 0.0.0.0 para permitir acceso desde la red local o contenedores
  await app.listen(port, '0.0.0.0');

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Backend running on port ${port}`);
    console.log(`🌐 Acceso local: http://localhost:${port}`);
    console.log(`🌐 Acceso en red: http://(tu-ip-local):${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
