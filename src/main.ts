import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger para la documentación de la API
  const config = new DocumentBuilder()
    .setTitle("MorningBox API")
    .setDescription("Esta API REST es el núcleo funcional para la gestión operativa de un restaurante, centrada en el control de usuarios y el ciclo de vida de los pedidos.")
    .setVersion("1.0")
    .build()

  // Configuración global de validación de datos
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }))

  // Configuración de Swagger
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  // Configuración de CORS para permitir solicitudes desde el frontend
  app.enableCors({ origin: true, credentials: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
