import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus, Role } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import type { Request } from 'express';
import { Roles } from '@auth/decorators/roles.decorator';
import { RequestUser } from '@auth/types/request-user.type';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {

    constructor(private orders: OrdersService) { }

    /**
     * Create Order: WAITER
     * @param dto 
     * @param req 
     * @returns 
     */
    @Post()
    @ApiOperation({ summary: "Crea una nueva orden. Solo meseros pueden crear órdenes, y se asigna automáticamente al mesero que la creó. El estado inicial de la orden es NEW." })
    @Roles(Role.WAITER)
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
    @Get()
    @ApiOperation({ summary: "Lista las órdenes. Los meseros solo pueden ver sus propias órdenes, mientras que cocina y admin pueden ver todas. Se pueden filtrar por estado y mesa." })
    @Roles(Role.ADMIN, Role.KITCHEN, Role.WAITER)
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
    @Patch(':id/status')
    @ApiOperation({ summary: "Actualiza el estado de una orden. Solo cocina o admin pueden cambiar el estado, y deben seguir reglas estrictas de transición (NEW -> IN_PROGRESS -> READY -> DELIVERED)." })
    @Roles(Role.KITCHEN, Role.ADMIN)
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
    @Patch(':id/deliver')
    @ApiOperation({ summary: "Marca una orden como entregada por el mesero. Solo el mesero dueño de la orden puede hacer esta acción, y solo si la orden está en estado READY." })
    @Roles(Role.WAITER)
    deliver(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as RequestUser;
        return this.orders.deliver(id, user);
    }

}
