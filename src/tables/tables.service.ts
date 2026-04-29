import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTableDto } from './dto/create.table.dto';
import { capitalizeWords, trim } from 'src/common/Utils';
import { equals } from 'class-validator';
import { UpdateTableDto } from './dto/update.table.dto';

@Injectable()
export class TablesService {

    constructor(private prisma: PrismaService) { }

    /**
     * Crear una nueva mesa
     * @param dto 
     * @returns 
     */
    async create(dto: CreateTableDto) {
        const tableName = trim(capitalizeWords(dto.name.toLowerCase()))

        const exist = await this.prisma.table.findFirst({ where: { name: { equals: tableName, mode: 'insensitive' } } })

        if (exist) throw new BadRequestException(`La mesa ${dto.name} ya existe.`);

        dto = { ...dto, name: tableName }

        try {
            const table = await this.prisma.table.create({
                data: dto,
                select: { id: true, name: true, isActive: true }
            })

            return table
        } catch (error) {
            throw new BadRequestException("No se pudo guardar la mesa, intente más tarde.")
        }
    }

    /**
     * Actualizar una mesa
     * @param id 
     * @param dto 
     * @returns 
     */
    async update(id: string, dto: UpdateTableDto) {
        const existId = await this.prisma.table.findUnique({ where: { id } })
        if (!existId) throw new NotFoundException("La mesa que intenta actualizar no existe");

        const tableName = trim(capitalizeWords(dto.name!.toLowerCase()))
        const existName = await this.prisma.table.findFirst({ where: { name: { equals: tableName, mode: 'insensitive' } } })
        
        if (existName && existId.id != existName.id) throw new BadRequestException(`La mesa ${dto.name} ya existe.`);

        try {
            return this.prisma.table.update({
                where: { id },
                data: dto,
                select: { id: true, name: true, isActive: true }
            })
        } catch (error) {
            throw new BadRequestException("No se pudo actualizar la mesa, intente mas tarde.")
        }
    }

    /**
     * Eliminar una mesa
     * @param id 
     * @returns 
     */
    async delete(id: string) {
        const exist = await this.prisma.table.findUnique({ where: {id}})

        if(!exist) throw new NotFoundException("La mesa que se intenta eliminar no existe.");

        try {
            await this.prisma.table.delete({
                where: {id}
            })

            return { message: 'La mesa se ha eliminado correctamente.'}
        } catch(error) {
            throw new BadRequestException("No se pudo eliminar la mesa, intente mas tarde.")
        }
    }

    /**
     * Regresa listado de todas las mesas
     * @returns 
     */
    findAll() {
        return this.prisma.table.findMany({
            select: { id: true, name: true, isActive: true},
            orderBy: { createdAt: 'desc'}
        })
    }

    /**
     * Regresa listado paginado de las mesas
     * @param page 
     * @param limit 
     * @returns 
     */
    async findPagination(page: number = 1, limit: number = 10) {
        const skip = (page -1) * limit;
        
        const [total, data] = await Promise.all([
            this.prisma.table.count(),
            this.prisma.table.findMany({
                skip,
                take: limit,
                select: {id: true, name: true, isActive: true},
                orderBy: { createdAt: 'desc'}
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
        }
    }
}
