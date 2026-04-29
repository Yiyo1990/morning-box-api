import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeWords, trim } from 'src/common/Utils';
import { UpdateCategoryDto } from './dto/update.category';

@Injectable()
export class CategoriesService {

    constructor(private prisma: PrismaService) { }

    /**
     * Crear una nueva categoria
     * @param dto Objeto categoria
     * @returns 
     */
    async create(dto: CreateCategoryDto) {
        const categoryName = trim(capitalizeWords(dto.name.toLowerCase()))

        const exist = await this.prisma.category.findFirst({ where: { name: { equals: categoryName, mode: 'insensitive' } } })

        if (exist) throw new BadRequestException(`La categoría ${dto.name} ya existe.`);

        dto = { ...dto, name: categoryName }

        try {

            const category = await this.prisma.category.create({
                data: dto,
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
        const exist = await this.prisma.category.findUnique({ where: { id } })

        if (!exist) throw new NotFoundException("La categoría que intenta actualizar no existe");

        try {
            return this.prisma.category.update({
                where: { id },
                data: dto,
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
        } catch (error) {
            throw new BadRequestException("No se pudo eliminar la categoría, intente mas tarde")
        }
    }

    /**
     * Regresa listado de todas las categorias
     * @returns
     */
    findAll() {
        return this.prisma.category.findMany({
            select: { id: true, name: true, isActive: true },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Regresa listado paginado de las categorias
     * @returns 
     */
    async findPagination(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            this.prisma.category.count(),
            this.prisma.category.findMany({
                skip: skip,
                take: limit,
                select: { id: true, name: true, isActive: true },
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
