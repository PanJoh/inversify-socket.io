import { inject, injectable } from "inversify";
import { IoServerToken } from "@panjoh/inversify-socket-io";
import { Server as IoServer } from 'socket.io'

@injectable()
export class BoradcastService {

    constructor(@inject(IoServerToken) private readonly ioServer: IoServer) {}

    broadcastToRoom(room: string, message: string) {
        this.ioServer.to(room).emit('broadcast', {message});
    }
}