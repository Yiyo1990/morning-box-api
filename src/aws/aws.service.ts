import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private s3Client!: S3Client
  private bucketName!: string

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!
      },
    });

    this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME')!
  }

  /**
   * Subir un archivo a AWS S3 y retornar su URL pública
   * @param file archivo a subir
   * @param folder folder dentro del bucket donde se guardará el archivo (opcional, por defecto 'menu')
   * @returns retorna la URL pública del archivo subido
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'menu'): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException('Error al subir la imagen');
    }
  }

  /**
   * Eliminar un archivo de AWS S3 dado su URL
   * @param fileUrl URL pública del archivo a eliminar
   */
  async deleteFile(fileUrl: string) {
    const key = fileUrl.split('.com/')[1];
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException('Error al eliminar la imagen');
    }
  }
}
