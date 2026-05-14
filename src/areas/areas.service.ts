import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { capitalizeWords, normalizeText, trim } from '@common/Utils';
import { normalize } from 'path';
import { Prisma } from '@prisma/client';

@Injectable()
export class AreasService {

    constructor(private prisma: PrismaService) { }

    /**
     * Crea una nueva área
     * @param dto - Objeto con los datos del área a crear
     * @returns - El área creada, incluyendo su ID, nombre e estado de actividad
     */
    async create(dto: CreateAreaDto) {
        const areaName = trim(capitalizeWords(dto.name.toLowerCase()))

        const exist = await this.prisma.area.findFirst({ where: { name: { equals: areaName, mode: 'insensitive' } } })
        if (exist) throw new BadRequestException(`El área ${dto.name} ya existe.`);

        dto = { ...dto, name: areaName }

        try {
            const area = await this.prisma.area.create({
                data: dto,
                select: { id: true, name: true, isActive: true }
            })

            return area
        } catch (error) {
            console.error(error)
            throw new BadRequestException("No se pudo guardar el área, intente más tarde.")
        }
    }

    /**
     * Actualiza una área existente
     * @param id - ID del área a actualizar
     * @param dto - Objeto con los datos actualizados del área
     * @returns - El área actualizada, incluyendo su ID, nombre e estado de actividad
     */
    async update(id: string, dto: CreateAreaDto) {
        const existId = await this.prisma.area.findUnique({ where: { id } })
        if (!existId) throw new NotFoundException("El área que intenta actualizar no existe");
        const areaName = trim(capitalizeWords(dto.name.toLowerCase()))
        const existName = await this.prisma.area.findFirst({ where: { name: { equals: areaName, mode: 'insensitive' } } })
        if (existName && existId.id != existName.id) throw new BadRequestException(`El área ${dto.name} ya existe.`);

        try {
            return this.prisma.area.update({
                where: { id },
                data: dto,
                select: { id: true, name: true, isActive: true }
            })
        } catch (error) {
            console.error(error)
            throw new BadRequestException("No se pudo actualizar el área, intente más tarde.")
        }
    }


    /**
     * Elimina una área existente
     * @param id - ID del área a eliminar
     * @returns - Un mensaje indicando que el área fue eliminada correctamente
     */
    async delete(id: string) {
        const existId = await this.prisma.area.findUnique({ where: { id } })
        if (!existId) throw new NotFoundException("El área que intenta eliminar no existe");
        try {
            await this.prisma.area.delete({ where: { id } })

            return { message: "Área eliminada correctamente" }
        } catch (error) {
            console.error(error)
            throw new BadRequestException("No se pudo eliminar el área, intente más tarde.")
        }
    }

    /**
     * Obtiene todas las áreas
     * @returns - Una lista de todas las áreas
     */
    findAll() {
        return this.prisma.area.findMany({
            select: { id: true, name: true, isActive: true },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Obtiene áreas con paginación y búsqueda por texto
     * @param txtSearch- Texto de búsqueda para filtrar áreas por nombre
     * @param page- Número de página para la paginación
     * @param limit - Número de áreas por página para la paginación
     * @returns - Un objeto que contiene la lista de áreas filtradas y la información de paginación
     */
    async findPagination(txtSearch: string = "", page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit
        txtSearch = normalizeText(txtSearch.toLowerCase())

        const where: Prisma.AreaWhereInput = txtSearch 
        ? {
            OR: [{ textSearch: { contains: txtSearch, mode: 'insensitive' } }]
        } : {}

        const selectedFields = { id: true, name: true, isActive: true }

        const [total, data] = await Promise.all([
            this.prisma.area.count({ where }),
            this.prisma.area.findMany({
                where,
                select: selectedFields,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ])

        const lastPage = Math.ceil(total / limit);
        return {
            data,
            meta: {
                total,
                page,
                lastPage,
                limit
            }
        }
    }
}
