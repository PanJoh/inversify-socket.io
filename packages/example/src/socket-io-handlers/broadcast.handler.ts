import { Data, SocketIoHandler, type ISocketIoHandler } from "@panjoh/inversify-socket-io";
import { BoradcastService } from "../services/boradcast.service.js";
import { inject } from "inversify";

type BroadcastData = {
    room: string;
    message: string;
}

@SocketIoHandler('broadcast')
export class BoradcastHandler implements ISocketIoHandler {
    constructor(@inject(BoradcastService) private readonly broadcastService: BoradcastService) {}

    handleEvent(@Data() data: BroadcastData): void {
        this.broadcastService.broadcastToRoom(data.room, data.message);
    }
}