import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category';

@ApiTags("categories")
@Roles(Role.ADMIN)
@Controller('categories')
export class CategoriesController {
    constructor(private category: CategoriesService) { }

    @Post()
    @ApiOperation({ description: 'Crear una nueva categoría' })
    create(@Body() dto: CreateCategoryDto) {
        return this.category.create(dto)
    }

    @Delete(":id")
    @ApiOperation({ description: 'Eliminar una categoría'})
    delete(@Param("id") id: string){
        return this.category.delete(id)
    }

    @Patch(":id")
    @ApiOperation({ description: 'Actualiza una categoria'})
    update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
        return this.category.update(id, dto)
    }

    @Get()
    @ApiOperation({description: 'Obtener todas las categorias'})
    findAll() {
        return this.category.findAll()
    }

    @Get('pagination')
    @ApiOperation({ description: 'Obtener listado de categorias - páginado'})
    findPagination(@Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10) {
        return this.category.findPagination(page, limit)
    }
}
