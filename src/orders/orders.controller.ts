import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrderStatus, Role } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import type { Request } from 'express';
import type { RequestUser } from '../auth/types/request-user.type';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {

    constructor(private orders: OrdersService) { }

    /**
     * Create Order: WAITER
     * @param dto 
     * @param req 
     * @returns 
     */
    @Roles(Role.WAITER)
    @Post()
    create(@Body() dto: CreateOrderDto, @Req() req: Request) {
        const user = req.user as RequestUser;
        return this.orders.create(dto, user);
    }

    /**
     * ADMIN/KITCHEN/WAITER: listar (WAITER solo ve las suyas por regla en service)
     * @param req 
     * @param status 
     * @param tableId 
     * @param mine 
     * @returns
     */
    @Roles(Role.ADMIN, Role.KITCHEN, Role.WAITER)
    @Get()
    findMany(
        @Req() req: Request,
        @Query('status') status?: OrderStatus,
        @Query('tableId') tableId?: string,
        @Query('mine') mine?: string,
    ) {
        const user = req.user as RequestUser;
        return this.orders.findMany(user, {
            status,
            tableId,
            mine: mine === 'true',
        });
    }

    /**
     * KITCHEN/ADMIN: cambiar status NEW->IN_PROGRESS->READY
     * @param id 
     * @param dto 
     * @param req 
     * @returns 
     */
    @Roles(Role.KITCHEN, Role.ADMIN)
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Req() req: Request) {
        const user = req.user as RequestUser;
        return this.orders.updateStatus(id, dto, user);
    }

    /**
     * WAITER: entregar READY->DELIVERED (solo dueño)
     * @param id 
     * @param req 
     * @returns 
     */
    @Roles(Role.WAITER)
    @Patch(':id/deliver')
    deliver(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as RequestUser;
        return this.orders.deliver(id, user);
    }

}
