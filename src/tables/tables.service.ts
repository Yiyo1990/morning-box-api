import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTableDto } from './dto/create.table.dto';
import { UpdateTableDto } from './dto/update.table.dto';
import { PrismaService } from '@prisma/prisma.service';
import { capitalizeWords, trim } from '@common/Utils';
import { Prisma } from '@prisma/client';

/**
 * Servicio para gestionar las mesas del restaurante. Proporciona métodos para crear, actualizar, eliminar y obtener mesas, incluyendo la funcionalidad de paginación y búsqueda por texto.
 * @author Mau Lopez
 * @version 1.0.0
 * @since 2024-06-01
 */
@Injectable()
export class TablesService {

    constructor(private prisma: PrismaService) { }

    /**
     * Crear una nueva mesa
     * @param dto - Objeto con los datos de la mesa a crear
     * @param userId - ID del usuario que crea la mesa, para registrar quién la creó
     * @returns - La mesa creada, incluyendo su ID, nombre e estado de actividad
     */
    async create(dto: CreateTableDto, userId: string) {
        const tableName = trim(capitalizeWords(dto.name.toLowerCase()))

        const exist = await this.prisma.table.findFirst({ where: { name: { equals: tableName, mode: 'insensitive' } } })

        if (exist) throw new BadRequestException(`La mesa ${dto.name} ya existe.`);

        dto = { ...dto, name: tableName}

        try {
            const table = await this.prisma.table.create({
                data: {...dto, createdBy: userId },
                select: { id: true, name: true, isActive: true }
            })

            return table
        } catch (error) {
            throw new BadRequestException("No se pudo guardar la mesa, intente más tarde.")
        }
    }

    /**
     * Actualizar una mesa
     * @param id - ID de la mesa a actualizar
     * @param dto - Objeto con los datos actualizados
     * @returns - La mesa actualizada, incluyendo su ID, nombre e estado de actividad
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
     * Eliminar una mesa por su ID
     * @param id - ID de la mesa a eliminar
     * @returns - Un mensaje de éxito si la mesa fue eliminada correctamente
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
     * @returns - Lista de mesas
     */
    findAll() {
        return this.prisma.table.findMany({
            select: { id: true, name: true, isActive: true},
            orderBy: { createdAt: 'desc'}
        })
    }

    /**
     * Regresa listado paginado de las mesas con búsqueda por texto en el nombre
     * @param textSearch - Texto a buscar en el nombre de las mesas
     * @param page - Número de página a mostrar
     * @param limit - Cantidad de mesas por página
     * @returns - Lista de mesas paginada y filtrada por texto de búsqueda
     */
    async findPagination(textSearch: string, page: number = 1, limit: number = 10) {
        const skip = (page -1) * limit;

        const where: Prisma.TableWhereInput = textSearch ? 
        { OR: [{ textSearch: { contains: textSearch, mode: 'insensitive' } }] } 
        : {};

        const [total, data] = await Promise.all([
            this.prisma.table.count({where}),
            this.prisma.table.findMany({
                where,
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
