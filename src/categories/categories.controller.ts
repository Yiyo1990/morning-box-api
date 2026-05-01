import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category';
import { Roles } from '@auth/decorators/roles.decorator';

@ApiTags("categories")
@Roles(Role.ADMIN)
@Controller('categories')
export class CategoriesController {
    constructor(private category: CategoriesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva categoría' })
    create(@Body() dto: CreateCategoryDto, @Req() req) {
        return this.category.create(dto, req.user.sub)
    }

    @Delete(":id")
    @ApiOperation({ summary: 'Eliminar una categoría'})
    delete(@Param("id") id: string){
        return this.category.delete(id)
    }

    @Patch(":id")
    @ApiOperation({ summary: 'Actualiza una categoria'})
    update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
        return this.category.update(id, dto)
    }

    @Get()
    @ApiOperation({summary: 'Obtener listado de categorias'})
    findAll() {
        return this.category.findAll()
    }

    @Get('pagination')
    @ApiOperation({ summary: 'Obtener categorias con paginación y búsqueda por nombre' })
    findPagination(@Query('txtSearch') txtSearch: string = "", @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10) {
        return this.category.findPagination(txtSearch, page, limit)
    }
}
