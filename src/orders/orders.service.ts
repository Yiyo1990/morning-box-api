import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { RequestUser } from 'src/auth/types/request-user.type';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService, private realtime: RealtimeGateway) { }


    /**
     * Create Order (WAITER)
     * @param dto 
     * @param user 
     * @returns 
     */
    async create(dto: CreateOrderDto, user: RequestUser) {
        if (!user.roles.includes(Role.WAITER)) {
            throw new ForbiddenException('Solo un mesero puede crear órdenes');
        }

        if (!dto.items?.length && dto.items.length == 0) {
            throw new BadRequestException('La orden debe tener al menos un producto');
        }

        // Verificar mesa activa
        const table = await this.prisma.table.findUnique({
            where: { id: dto.tableId },
            select: { id: true, isActive: true, name: true },
        });

        if (!table) throw new NotFoundException('Mesa no encontrada');
        if (!table.isActive) throw new BadRequestException('La mesa está inactiva');

        // Traer items del menú y validar activos
        const menuIds = dto.items.map(i => i.menuItemId);
        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: menuIds }, isActive: true },
            select: { id: true, price: true, name: true, description: true },
        });

        if (menuItems.length !== new Set(menuIds).size) {
            throw new BadRequestException('Uno o más productos no existen o están inactivos');
        }

        const priceMap = new Map(menuItems.map(mi => [mi.id, mi.price]));

        const created = await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    tableId: dto.tableId,
                    waiterId: user.sub,
                    status: OrderStatus.NEW,
                    notes: dto.notes,
                    items: {
                        create: dto.items.map((it) => ({
                            menuItemId: it.menuItemId,
                            quantity: it.quantity,
                            unitPrice: priceMap.get(it.menuItemId)!,
                            notes: it.notes,
                        })),
                    },
                },
                include: {
                    table: { select: { id: true, name: true } },
                    waiter: { select: { id: true, name: true, email: true } },
                    items: {
                        include: { menuItem: { select: { id: true, name: true, description: true } } },
                    }
                },
            });

            return order;
        });        

        const response = {
            orderId: created.id,
            status: created.status,
            table: created.table,
            createdAt: created.createdAt,
            generalNotes: created.notes,
            waiter: created.waiter,
            items: created.items.map((itm) => {
                return {
                    name: itm.menuItem.name,
                    price: itm.unitPrice,
                    quantity: itm.quantity,
                    notes: itm.notes
                }
            })
        }

        // Eventos socket
        // 1) a cocina (broadcast por rol)
        this.realtime.emitToRole('KITCHEN', 'order.new', response);

        // 2) al mesero dueño
        this.realtime.emitToUser(created.waiterId, 'order.created', response);

        return created;
    }


    /**
     * List Orders (filters + Permissions)
     * @param user 
     * @param params 
     * @returns 
     */
    async findMany(user: RequestUser, params: { status?: OrderStatus; tableId?: string; mine?: boolean }) {
        const where: Prisma.OrderWhereInput = {};

        if (params.status) where.status = params.status;
        if (params.tableId) where.tableId = params.tableId;


        // Permisos:
        // - ADMIN: ve todo
        // - KITCHEN: ve todo (normalmente NEW/IN_PROGRESS/READY)
        // - WAITER: solo las suyas (o mine=true)
        if (user.roles.includes(Role.WAITER)) {
            where.waiterId = user.sub;
        } else if (params.mine === true) {
            // Si admin/kitchen usan ?mine=true, les devolvemos "nada especial" o solo sus órdenes.
            // Esto es opcional; si quieres, lo podemos quitar.
            where.waiterId = user.sub;
        }

        return this.prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                table: { select: { id: true, name: true } },
                waiter: { select: { id: true, name: true } },
                items: { include: { menuItem: { select: { id: true, name: true } } } },
            },
        });
    }

    async updateStatus(orderId: string, dto: UpdateOrderStatusDto, user: RequestUser) {

        const rolesPermitidos: Role[] = [Role.KITCHEN, Role.ADMIN];

        if (!user.roles.some(r => rolesPermitidos.includes(r))) {
            throw new ForbiddenException('Solo cocina o admin pueden cambiar el estado');
        }

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                table: { select: { id: true, name: true } },
            },
        });

        if (!order) throw new NotFoundException('Orden no encontrada');

        // Reglas de transición (estrictas para cocina)
        // NEW -> IN_PROGRESS -> READY
        // (ADMIN podría permitir otras, pero aquí lo dejamos igual de estricto)
        const allowed = this.isValidKitchenTransition(order.status, dto.status);
        if (!allowed) {
            throw new BadRequestException(`Transición inválida: ${order.status} -> ${dto.status}`);
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: dto.status },
            include: {
                table: { select: { id: true, name: true } },
                waiter: { select: { id: true, name: true } },
                items: { include: { menuItem: { select: { id: true, name: true } } } },
            },
        });

        // Eventos socket según estado
        if (dto.status === OrderStatus.IN_PROGRESS) {
            this.realtime.emitToRole('KITCHEN', 'order.in_progress', { orderId: updated.id });
            this.realtime.emitToUser(updated.waiterId, 'order.in_progress', { orderId: updated.id });
        }

        if (dto.status === OrderStatus.READY) {
            // Notificar al mesero específico
            this.realtime.emitToUser(updated.waiterId, 'order.ready', {
                orderId: updated.id,
                table: updated.table,
            });
            // También a cocina por si tienen tablero
            this.realtime.emitToRole('KITCHEN', 'order.ready', { orderId: updated.id });
        }

        return updated;
    }

    /**
     * 
     * @param orderId 
     * @param user 
     * @returns 
     */
    async deliver(orderId: string, user: RequestUser) {
        if (!user.roles.includes(Role.WAITER)) {
            throw new ForbiddenException('Solo un mesero puede entregar órdenes');
        }

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { table: { select: { id: true, name: true } } },
        });

        if (!order) throw new NotFoundException('Orden no encontrada');

        if (order.waiterId !== user.sub) {
            throw new ForbiddenException('No puedes entregar una orden que no es tuya');
        }

        if (order.status !== OrderStatus.READY) {
            throw new BadRequestException('Solo puedes entregar órdenes en estado READY');
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.DELIVERED },
            include: {
                table: { select: { id: true, name: true } },
                waiter: { select: { id: true, name: true } },
                items: { include: { menuItem: { select: { id: true, name: true } } } },
            },
        });

        this.realtime.emitToRole('KITCHEN', 'order.delivered', { orderId: updated.id });
        this.realtime.emitToUser(updated.waiterId, 'order.delivered', { orderId: updated.id });

        return updated;
    }

    private isValidKitchenTransition(from: OrderStatus, to: OrderStatus) {
        const allowed: Record<OrderStatus, OrderStatus[]> = {
            NEW: [OrderStatus.IN_PROGRESS],
            IN_PROGRESS: [OrderStatus.READY],
            READY: [],       // cocina no debería pasar a DELIVERED
            DELIVERED: [],
            CANCELED: [],
        };

        return allowed[from]?.includes(to) ?? false;
    }
}
