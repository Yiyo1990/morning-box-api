import { Roles } from '@auth/decorators/roles.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';

@ApiTags("areas")
@Roles(Role.ADMIN)
@Controller('areas')
export class AreasController {

    constructor(private area: AreasService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva área' })
    create(@Body() dto: CreateAreaDto) {
        return this.area.create(dto)
    }

    @Delete(":id")
    @ApiOperation({ summary: 'Eliminar un área' })
    delete(@Param("id") id: string) {
        return this.area.delete(id)
    }

    @Patch(":id")
    @ApiOperation({ summary: 'Actualizar un área' })
    update(@Param("id") id: string, @Body() dto: CreateAreaDto) {
        return this.area.update(id, dto)
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las áreas' })
    findAll() {
        return this.area.findAll()
    }

    @Get('pagination')
    @ApiOperation({ summary: 'Obtener áreas con paginación y búsqueda por nombre' })
    findPagination(@Query('txtSearch') txtSearch: string = "", @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10) {
        return this.area.findPagination(txtSearch, page, limit)
    }
}
