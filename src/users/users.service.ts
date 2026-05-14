import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/update-user.do';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio para gestionar los usuarios del sistema. Proporciona métodos para crear nuevos usuarios, actualizar sus datos, eliminar usuarios y listar usuarios con o sin paginación. Además, maneja la lógica de validación para evitar duplicados y asegurar la integridad de los datos.
 * @author Mau Lopez
 * @version 1.0.0
 * @since 2024-06-01
 */
@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService) { }

    /**
     * Registra un nuevo usuario
     * @param dto - Objeto con los datos del usuario a registrar
     * @returns - El usuario registrado, sin la contraseña
     */
    async create(dto: CreateUserDto, userId: string) {
        const exist = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exist) throw new BadRequestException('El correo ya esta registrado!');

        const { roles, ...data } = dto

        const hash = await bcrypt.hash(dto.password, 10);

        try {
            const user = await this.prisma.user.create({
                data: {
                    ...data,
                    roles: roles,
                    password: hash,
                    createdBy: userId
                },
                select: { id: true, name: true, email: true, roles: true, isActive: true, createdAt: true }
            })

            return user;
        } catch (error) {
            console.error(error)
            throw new BadRequestException("No se pudo crear el usuario, intente más tarde")
        }

    }

    /**
     * Actualiza los datos de un usuario
     * @param id - ID del usuario a actualizar
     * @param dto - Objeto con los datos actualizados
     * @returns - El usuario actualizado, sin la contraseña
     */
    async update(id: string, dto: UpdateUserDTO) {
        const exist = await this.prisma.user.findUnique({ where: { id } });
        if (!exist) throw new NotFoundException("El usuario no existe!");

        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        try {
            return this.prisma.user.update({
                where: { id },
                data: dto,
                select: { id: true, name: true, email: true, roles: true }
            });
        } catch (error) {
            console.error(error)
            throw new BadRequestException("No se pudo actualizar el usuario, intente más tarde")
        }
    }

    /**
     * Regresa listado de todos los usuarios
     * @returns - Lista de usuarios
     */
    findAll() {
        return this.prisma.user.findMany({
            select: { id: true, name: true, email: true, roles: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Regresa listado de usuarios con paginación y búsqueda por texto
     * @param textSearch - Texto a buscar en el nombre o correo de los usuarios
     * @param page - Número de página a mostrar
     * @param limit - Cantidad de usuarios por página
     * @returns - Lista de usuarios paginada y filtrada por texto
     */
    findPagination(textSearch: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = textSearch
            ? {
                OR: [
                    { name: { contains: textSearch, mode: 'insensitive' } },
                    { email: { contains: textSearch, mode: 'insensitive' } }
                ]
            }
            : {};

        return this.prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: { id: true, name: true, email: true, roles: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Elimina un usuario por su ID, no permite eliminarse a sí mismo
     * @param id - ID del usuario a eliminar
     * @param adminId - ID del usuario administrador que realiza la eliminación, para evitar que se elimine a sí mismo
     * @returns - Un mensaje de éxito si el usuario fue eliminado correctamente
     */
    async delete(id: string, adminId: string) {
        const exist = await this.prisma.user.findUnique({ where: { id } });

        if (!exist) throw new NotFoundException('El usuario no existe!');

        if (exist.id === adminId) {
            throw new ForbiddenException('No es posible elminar');
        }

        try {
            await this.prisma.user.delete({
                where: { id: exist.id }
            })

            return { message: 'Usuario eliminado correctamente' };
        } catch (error) {
            console.error(error)
            throw new BadRequestException("No se pudo eliminar el usuario, intente más tarde")
        }

    }
}
