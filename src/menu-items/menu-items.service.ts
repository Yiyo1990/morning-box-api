import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create.menu-item.dto';
import { PrismaService } from '@prisma/prisma.service';
import { AwsService } from '@aws/aws.service';
import { Prisma } from '@prisma/client';
import { capitalizeWords, normalizeText, trim } from '@common/Utils';
import { UpdateMenuItemDto } from './dto/update.menu-item.dto';
/**
 * Servicio para gestionar los items de menú. Proporciona métodos para crear, actualizar, eliminar y obtener items de menú, incluyendo la funcionalidad de subir imágenes a AWS S3.
 * @author Mau Lopez
 * @version 1.0.0
 * @since 2024-06-01
 */
@Injectable()
export class MenuItemsService {

    constructor(private prisma: PrismaService, private awsService: AwsService) { }

    /**
     * Crea un nuevo item de menú. Si se proporciona un archivo, se sube a AWS S3 y se guarda la URL en la base de datos.
     * @param dto - Data Transfer Object que contiene la información del nuevo item de menú.
     * @param file - Archivo opcional que representa la imagen del item de menú. Si se proporciona, se sube a AWS S3.
     * @returns El item de menú creado en la base de datos, incluyendo la URL de la imagen si se proporcionó un archivo.
     */
    async create(dto: CreateMenuItemDto, file: Express.Multer.File, userId: string) {
        let imageUrl: string = "";
        const itemName = trim(capitalizeWords(dto.name.toLowerCase()))

        if (file) imageUrl = await this.awsService.uploadFile(file, 'products');

        const existItem = await this.prisma.menuItem.findFirst({
            where: {
                name: { equals: itemName, mode: 'insensitive' }
            }
        });

        if (existItem) throw new BadRequestException('El item ya existe');

        const textSearch = normalizeText(itemName.toLowerCase().concat(dto.description!.toLowerCase()))

        try {
            return this.prisma.menuItem.create({
                data: {
                    ...dto,
                    name: itemName,
                    imageUrl,
                    price: new Prisma.Decimal(dto.price),
                    textSearch,
                    createdBy: userId
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    imageUrl: true,
                    isActive: true,
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new BadRequestException('Error al crear el item, intente nuevamente mas tarde');
        }
    }

    /**
     * Actualiza un item de menú por su ID. Si se proporciona un archivo, se sube a AWS S3 y se actualiza la URL en la base de datos.
     * @param id - El ID del item de menú a actualizar.
     * @param dto - Data Transfer Object que contiene la información actualizada del item de menú.
     * @param file - Archivo opcional que representa la nueva imagen del item de menú. Si se proporciona, se sube a AWS S3 y se actualiza la URL en la base de datos.
     * @returns El item de menú actualizado en la base de datos.
     */
    async update(id: string, dto: UpdateMenuItemDto, file: Express.Multer.File) {
        let imageUrl: string = "";

        const itemName = (dto.name) ? trim(capitalizeWords(dto.name!.toLowerCase())) : "";

        if (file) imageUrl = await this.awsService.uploadFile(file, 'products');

        const existingItem = await this.prisma.menuItem.findUnique({
            where: {
                id
            }
        });

        const findByName = await this.prisma.menuItem.findFirst({
            where: {
                name: { equals: itemName, mode: 'insensitive' }
            }
        });

        if (!existingItem) throw new NotFoundException('El item que desea actualizar no existe');

        if (findByName && ((itemName == findByName?.name) && existingItem.id !== findByName.id)) throw new BadRequestException('El nombre del item ya existe');

        const textSearch = normalizeText(itemName.toLowerCase());

        try {
            return this.prisma.menuItem.update({
                where: {
                    id
                },
                data: {
                    ...dto,
                    name: itemName ? itemName : existingItem.name,
                    imageUrl,
                    price: dto.price ? new Prisma.Decimal(dto.price!) : existingItem.price,
                    textSearch
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    imageUrl: true,
                    isActive: true,
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error(error);
            throw new BadRequestException('Error al actualizar el item, intente nuevamente mas tarde');
        }
    }

    /**
     * Elimina un item de menú por su ID.
     * @param id - El ID del item de menú a eliminar.
     * @returns El item de menú eliminado de la base de datos.
     */
    async delete(id: string) {
        const existingItem = await this.prisma.menuItem.findUnique({
            where: {
                id
            }
        });

        if (!existingItem) throw new NotFoundException('El item que desea eliminar no existe');

        try {
            await this.prisma.menuItem.delete({
                where: {
                    id
                }
            });
            return { message: 'Item eliminado correctamente' };
        } catch (error) {
            throw new BadRequestException('Error al eliminar el item, intente nuevamente mas tarde');
        }
    }

    /**
     * Obtiene todos los items de menú.
     * @returns - Una lista de todos los items de menú.
     */
    async findAll() {
        return this.prisma.menuItem.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isActive: true,
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Obtiene una lista paginada de items de menú.
     * @param page - El número de página a obtener (predeterminado: 1).
     * @param limit - El número de items por página (predeterminado: 10).
     * @returns - Una lista paginada de items de menú.
     */
    async findPagination(txtSearch: string = "", page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        txtSearch = trim(capitalizeWords(txtSearch.toLowerCase()))

        const where: Prisma.MenuItemWhereInput = txtSearch
            ? { OR: [{ textSearch: { contains: txtSearch, mode: 'insensitive' } }] }
            : {};

        const selectFields = {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            isActive: true,
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        };

        const [total, data] = await Promise.all([
            this.prisma.menuItem.count({ where }),
            this.prisma.menuItem.findMany({
                where,
                skip,
                take: limit,
                select: selectFields,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                lastPage,
                limit
            }
        };
    }
}
