import { Client, Data, SocketIoHandler, UseMessageGuard, type ISocketIoHandler } from "inversify-socket-io";
import { AuthGuardSocketIo, CurrentUserSocketIo } from "../guards/auth-guard-socket-io.js";
import { Socket } from "socket.io";
import type { UserEntity } from "../models/User.entity.js";

@SocketIoHandler('echo')
@UseMessageGuard(AuthGuardSocketIo)
export class EchoHandler implements ISocketIoHandler {
    handleEvent(@Client() client: Socket, @Data() data: any, @CurrentUserSocketIo() user: UserEntity): void {
        client.emit('echo', `Hello ${user.name}\nYou sent:\n${data}`);
    }
}