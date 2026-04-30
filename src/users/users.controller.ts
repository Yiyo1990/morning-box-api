import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.do';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@auth/decorators/roles.decorator';

@ApiTags("users")
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
    constructor(private users: UsersService) { }

    @Post()
    @ApiOperation({description: 'Crear un nuevo usuario.'})
    create(@Body() dto: CreateUserDto, @Req() req) {
        return this.users.create(dto, req.user.sub)
    }

    @Get()
    @ApiOperation({description: 'Obtener todos los usuarios.'})
    findAll() {
        return this.users.findAll()
    }

    @Get('pagination')
    @ApiOperation({description: 'Obtener usuarios con paginación.'})
    findPagination(@Query('textSearch') textSearch: string, @Query('page') page: number, @Query('limit') limit: number) {
        return this.users.findPagination(textSearch, page, limit);
    }

    @Delete(":id")
    @ApiOperation({description: 'Eliminar un usuario.'})
    delete(@Param("id") id: string , @Req() req) {
        const adminId = req.user.sub;
        return this.users.delete(id, adminId)
    }

    @Patch(":id")
    @ApiOperation({description: 'Actualizar un usuario.'})
    update(@Param("id") id: string, @Body() dto: UpdateUserDTO) {
        return this.users.update(id, dto)
    }
}
