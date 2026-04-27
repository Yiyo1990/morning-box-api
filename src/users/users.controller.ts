import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.do';

@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
    constructor(private users: UsersService) { }

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.users.create(dto)
    }

    @Get()
    findAll() {
        return this.users.findAll()
    }

    @Delete()
    delete(@Body() dto: {id: string }, @Req() req) {
        const adminId = req.user.sub;
        return this.users.delete(dto.id, adminId)
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() dto: UpdateUserDTO) {
        return this.users.update(id, dto)
    }
}
