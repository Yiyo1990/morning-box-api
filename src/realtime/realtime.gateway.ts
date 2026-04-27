import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class RealtimeGateway {

  @WebSocketServer()
  server: Server;


  // Cliente manda su userId para unirse a su "room"
  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    if (data?.userId) client.join(`user:${data.userId}`);
    return { ok: true };
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToRole(role: string, event: string, payload: any) {
    this.server.to(`role:${role}`).emit(event, payload);
  }
}
