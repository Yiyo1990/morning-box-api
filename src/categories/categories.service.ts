import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category';
import { capitalizeWords, normalizeText, trim } from '@common/Utils';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio para gestionar las categorias del restaurante. Proporciona métodos para crear, actualizar, eliminar y obtener categorias, incluyendo la funcionalidad de paginación y búsqueda por texto.
 * @author Mau Lopez
 * @version 1.0.0
 * @since 2024-06-01
 */
@Injectable()
export class CategoriesService {

    constructor(private prisma: PrismaService) { }

    /**
     * Crear una nueva categoria
     * @param dto Objeto categoria
     * @returns 
     */
    async create(dto: CreateCategoryDto, userId: string) {
        const categoryName = trim(capitalizeWords(dto.name.toLowerCase()))
        const textSearch = normalizeText(categoryName.toLowerCase())

        const exist = await this.prisma.category.findFirst({ where: { name: { equals: categoryName, mode: 'insensitive' } } })

        if (exist) throw new BadRequestException(`La categoría ${dto.name} ya existe.`);

        dto = { ...dto, name: categoryName }

        try {

            const category = await this.prisma.category.create({
                data: { ...dto, textSearch: textSearch, createdBy: userId },
                select: { id: true, name: true, isActive: true }
            })

            return category

        } catch (error) {
            throw new BadRequestException("No se pudo guardar la categoría, intente mas tarde")
        }

    }

    /**
     * Actualiza una categoria
     * @param id Id de la categoria
     * @param dto Objeto categoria
     */
    async update(id: string, dto: UpdateCategoryDto) {
        const existId = await this.prisma.category.findUnique({ where: { id } })
        if (!existId) throw new NotFoundException("La categoría que intenta actualizar no existe");

        const categoryName = trim(capitalizeWords(dto.name!.toLowerCase()))
        const existName = await this.prisma.category.findFirst({ where: { name: { equals: categoryName, mode: 'insensitive' } } })
        if (existName && existId.id != existName.id) throw new NotFoundException(`La categoría ${dto.name} ya existe.`);

        const normalizeTextSearch = normalizeText(dto.name!.toLowerCase())

        try {
            return this.prisma.category.update({
                where: { id },
                data: { ...dto, textSearch: normalizeTextSearch },
                select: { id: true, name: true, isActive: true }
            })
        } catch (error) {
            throw new BadRequestException("No se pudo actualizar la categoría, intente más tarde")
        }
    }

    /**
     * Elimina unca categoría
     * @param id Id de la categoría
     */
    async delete(id: string) {
        const exist = await this.prisma.category.findUnique({ where: { id } })

        if (!exist) throw new NotFoundException("La categoría que intenta elminar no existe.");

        try {
            await this.prisma.category.delete({
                where: { id }
            })

            return { message: 'La categoría se ha eliminado correctamente' };
        } catch (error) {
            throw new BadRequestException("No se pudo eliminar la categoría, intente más tarde")
        }
    }

    /**
     * Regresa listado de todas las categorias
     * @returns - Una lista de todas las categorias.
     */
    findAll() {
        return this.prisma.category.findMany({
            select: { id: true, name: true, isActive: true },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Regresa listado paginado de las categorias según texto de búsqueda
     * @param txtSearch - Texto de búsqueda
     * @param page - Número de página
     * @param limit - Límite de resultados por página
     * @returns - Un objeto con la lista de categorias y la información de paginación.
     */
    async findPagination(txtSearch: string = "", page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        txtSearch = normalizeText(txtSearch.toLowerCase())

        const where: Prisma.CategoryWhereInput = txtSearch
            ? {
                OR: [{ textSearch: { contains: txtSearch, mode: 'insensitive' } }]
            }
            : {};

        const selectedFields = { id: true, name: true, isActive: true };

        const [total, data] = await Promise.all([
            this.prisma.category.count({ where }),
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                select: selectedFields,
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
