import { Client, Data, SocketIoHandler, UseMessageGuard, type ISocketIoHandler } from "@panjoh/inversify-socket-io";
import { AuthGuardSocketIo, CurrentUserSocketIo } from "../guards/auth-guard-socket-io.js";
import { Socket } from "socket.io";
import type { UserEntity } from "../models/User.entity.js";
import { inject } from "inversify";


@SocketIoHandler('echo')
@UseMessageGuard(AuthGuardSocketIo)
export class EchoHandler implements ISocketIoHandler {
    constructor(@inject('server-name') private serverName: string) {}

    handleEvent(@Client() client: Socket, @Data() data: any, @CurrentUserSocketIo() user: UserEntity): void {
        console.log('got echo event');
        client.emit('echo', `Hello ${user.name}\nYou sent:\n${data}\nto ${this.serverName}`);
    }
}