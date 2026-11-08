import { Socket } from 'socket.io';

export interface SocketIoHandlerMessageGuard {
    canActivate(socket: Socket): boolean | Promise<boolean>;
}
