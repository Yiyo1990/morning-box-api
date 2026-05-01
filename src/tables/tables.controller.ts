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
    @ApiOperation({ summary: "Crea una nueva mesa" })
    create(@Body() dto: CreateTableDto, @Req() req) {
        return this.tables.create(dto, req.user.sub)
    }

    @Get()
    @ApiOperation({summary: "Obtener el listado de mesas"})
    findAll() {
        return this.tables.findAll()
    }

    @Get('pagination')
    @ApiOperation({summary: "Obtener el listado paginado de mesas, con búsqueda por texto"})
    findPagination(@Query('textSearch') textSearch: string, @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10){
        return this.tables.findPagination(textSearch, page, limit)
    }

    @Delete(":id")
    @ApiOperation({summary: "Elimina una mesa"})
    delete(@Param("id") id: string) {
        return this.tables.delete(id)
    }

    @Patch(':id')
    @ApiOperation({summary: "Actualiza una mesa"})
    update(@Param("id") id: string, @Body() dto: UpdateTableDto) {
        return this.tables.update(id, dto)
    }
}
