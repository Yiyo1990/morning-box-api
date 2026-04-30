import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create.table.dto';
import { UpdateTableDto } from './dto/update.table.dto';
import { Roles } from '@auth/decorators/roles.decorator';

@ApiTags("tables")
@Roles(Role.ADMIN)
@Controller('tables')
export class TablesController {
    constructor(private tables: TablesService) {}

    @Post()
    @ApiOperation({ description: "Crear una nueva mesa"})
    create(@Body() dto: CreateTableDto, @Req() req) {
        return this.tables.create(dto, req.user.sub)
    }

    @Get()
    @ApiOperation({description: "Obtener todas las mesas"})
    findAll() {
        return this.tables.findAll()
    }

    @Get('pagination')
    @ApiOperation({description: "Obtener las mesas con paginado"})
    findPagination(@Query('textSearch') textSearch: string, @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10){
        return this.tables.findPagination(textSearch, page, limit)
    }

    @Delete(":id")
    @ApiOperation({description: "Eliminar una mesa"})
    delete(@Param("id") id: string) {
        return this.tables.delete(id)
    }

    @Patch(':id')
    @ApiOperation({description: "Actualiza una mesa"})
    update(@Param("id") id: string, @Body() dto: UpdateTableDto) {
        return this.tables.update(id, dto)
    }
}
