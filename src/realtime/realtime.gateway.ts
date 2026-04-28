import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class RealtimeGateway {

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string; role?: string }, @ConnectedSocket() client: Socket) {
    const payload = Array.isArray(data) ? data[0] : data;
    const { userId, role } = payload;

    if (userId) {
      client.join(`user:${userId}`);
      console.log(`Usuario ${userId} unido a sala de usuario`);
    }

    if (role) {
      client.join(`role:${role}`);
      console.log(`Usuario unido a sala de rol: ${role}`);
    }

    return { ok: true, joined: { userId, role } };
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToRole(role: string, event: string, payload: any) {
    this.server.to(`role:${role}`).emit(event, payload);
  }
}
