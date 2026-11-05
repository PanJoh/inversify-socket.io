import { Client, Data, SocketIoHandler, UseMessageGuard, type ISocketIoHandler } from "inversify-socket-io";
import type { Socket } from "socket.io";


@SocketIoHandler('echo-sum')
export class EchoSumHandler implements ISocketIoHandler {
    handleEvent(@Data('a') a: number, @Data('b') b: number, @Client() client: Socket) {
        client.emit('echo', {result: a + b});
    }
}