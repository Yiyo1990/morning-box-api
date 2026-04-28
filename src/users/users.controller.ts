import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.do';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags("users")
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
    constructor(private users: UsersService) { }

    @Post()
    @ApiOperation({description: 'Crear un nuevo usuario.'})
    @ApiResponse({ status: 201, description: 'Usuario creado existosamente.'})
    @ApiResponse({ status: 403, description: 'Prohibido.'})
    create(@Body() dto: CreateUserDto) {
        return this.users.create(dto)
    }

    @Get()
    @ApiOperation({description: 'Obtener todos los usuarios.'})
    @ApiResponse({ status: 201, description: 'Listado exitoso.'})
    @ApiResponse({ status: 403, description: 'Prohibido.'})
    findAll() {
        return this.users.findAll()
    }

    @Delete(":id")
    @ApiOperation({description: 'Eliminar un usuario.'})
    @ApiResponse({ status: 201, description: 'Usuario eliminado existosamente.'})
    @ApiResponse({ status: 403, description: 'Prohibido.'})
    delete(@Param("id") id: string , @Req() req) {
        const adminId = req.user.sub;
        return this.users.delete(id, adminId)
    }

    @Patch(":id")
    @ApiOperation({description: 'Actualizar un usuario.'})
    @ApiResponse({ status: 201, description: 'Usuario actualizado existosamente.'})
    @ApiResponse({ status: 403, description: 'Prohibido.'})
    @ApiResponse({ status: 404, description: 'El usuario no existe.'})
    update(@Param("id") id: string, @Body() dto: UpdateUserDTO) {
        return this.users.update(id, dto)
    }
}
