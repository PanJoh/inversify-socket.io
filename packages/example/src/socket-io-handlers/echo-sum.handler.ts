import { Client, Data, IsNumber, SocketIoHandler, UseMessageGuard, type ISocketIoHandler, type PipeTransform } from "@panjoh/inversify-socket-io";
import type { Socket } from "socket.io";

@SocketIoHandler('echo-sum')
export class EchoSumHandler implements ISocketIoHandler {
    handleEvent(@Data('a', IsNumber()) a: number, @Data('b', IsNumber()) b: number, @Client() client: Socket) {
        client.emit('echo', {result: a + b});
    }
}