import { Controller, Get, Post } from '@nestjs/common';

@Controller('menu-items')
export class MenuItemsController {


    @Post()
    create() {
        
    }

    @Get()
    findAll() {}

}
