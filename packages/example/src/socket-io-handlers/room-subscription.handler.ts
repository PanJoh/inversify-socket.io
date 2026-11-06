import { Client, Data, SocketIoHandler, type ISocketIoHandler } from "@panjoh/inversify-socket-io";
import type { Socket } from "socket.io";

@SocketIoHandler('sub-to-room')
export class RoomSubscriptionHanlder implements ISocketIoHandler {
    handleEvent(@Client() client: Socket, @Data() room: string): void {
        client.join(room);
    }
    

}