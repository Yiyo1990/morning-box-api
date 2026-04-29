import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/update-user.do';

@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService) { }

    /**
     * Registra un nuevo usuario
     * @param dto 
     * @returns 
     */
    async create(dto: CreateUserDto) {
        const exist = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exist) throw new BadRequestException('El correo ya esta registrado!');

        const { roles, ...data } = dto

        const hash = await bcrypt.hash(dto.password, 10);

        try {
            const user = await this.prisma.user.create({
                data: {
                    ...data,
                    roles: roles,
                    password: hash
                },
                select: { id: true, name: true, email: true, roles: true, isActive: true, createdAt: true }
            })

            return user;
        } catch (error) {
            throw new BadRequestException("No se pudo crear el usuario, intente más tarde")
        }

    }

    /**
     * Actualiza los datos de un usuario
     * @param dto 
     * @returns 
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
            throw new BadRequestException("No se pudo actualizar el usuario, intente más tarde")
        }
    }


    /**
     * Regresa listado de todos los usuarios
     * @returns 
     */
    findAll() {
        return this.prisma.user.findMany({
            select: { id: true, name: true, email: true, roles: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Elminar usuario
     * @param id  Id del usuario a eliminar
     * @returns mensaje de exito!
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
            throw new BadRequestException("No se pudo eliminar el usuario, intente más tarde")
        }

    }
}
