import { Client, Data, SocketIoHandler, type ISocketIoHandler } from "@panjoh/inversify-socket-io";
import type { Socket } from "socket.io";

@SocketIoHandler('unsub-from-room')
export class RoomUnsubscribeHandler implements ISocketIoHandler {
    handleEvent(@Client() client: Socket, @Data() room: string): void {
        client.leave(room);
    }
}