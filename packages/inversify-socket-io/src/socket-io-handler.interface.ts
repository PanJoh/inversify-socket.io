import type { Socket } from "socket.io";

export interface ISocketIoHandler {
    onConnect?(socket: Socket): void;

    handleEvent(...args: any[]): void;
}
