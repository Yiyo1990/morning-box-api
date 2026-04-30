import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';
import { Roles } from '@auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Roles(Role.ADMIN) // Solo los administradores pueden subir imágenes
@Controller('aws')
export class AwsController {
    constructor(private readonly awsService: AwsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file')) // El campo en Postman debe llamarse 'file'
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha enviado ningún archivo');
    }

    // Validar que sea imagen
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    const url = await this.awsService.uploadFile(file, 'menu-items');
    return { url };
  }
}
