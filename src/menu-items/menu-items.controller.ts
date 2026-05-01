import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create.menu-item.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '@auth/decorators/roles.decorator';
import { MenuItemsService } from './menu-items.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateMenuItemDto } from './dto/update.menu-item.dto';

@ApiTags("menu-items")
@Controller('menu-items')
export class MenuItemsController {

    constructor(private menuItemService: MenuItemsService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Crea un nuevo item del menú" })
    @UseInterceptors(FileInterceptor('file'))
    create(@Body() dto: CreateMenuItemDto, @UploadedFile() file: Express.Multer.File, @Req() req) {
        return this.menuItemService.create(dto, file, req.user.sub)
    }

    @Delete(':id')
    @ApiOperation({ summary: "Elimina un item del menú" })
    @Roles(Role.ADMIN)
    delete(@Param('id') id: string) {
        return this.menuItemService.delete(id)
    }

    @Patch(':id')
    @ApiOperation({ summary: "Actualiza un item del menú" })
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto, @UploadedFile() file: Express.Multer.File) {
        return this.menuItemService.update(id, dto, file)
    }

    @Get()
    @ApiOperation({ summary: "Regresa el listado de items del menú" })
    @Roles(Role.ADMIN, Role.WAITER)
    findAll() {
        return this.menuItemService.findAll()
    }

    @Get('pagination')
    @ApiOperation({ summary: "Regresa el listado paginado de items del menú" })
    @Roles(Role.ADMIN, Role.WAITER)
    findPagination(@Query('page') page: number, @Query('limit') limit: number, @Query('txtSearch') txtSearch: string) {
        return this.menuItemService.findPagination(txtSearch, page, limit)
    }

    @Get('category/:categoryId')
    @ApiOperation({ summary: "Regresa el listado de items del menú filtrado por categoría" })
    @Roles(Role.ADMIN, Role.WAITER)
    findByCategory(@Param('categoryId') categoryId: string, @Query('page') page: number, @Query('limit') limit: number, @Query('txtSearch') txtSearch: string) {
        return this.menuItemService.findByCategory(categoryId, txtSearch, page, limit)
    }
}
