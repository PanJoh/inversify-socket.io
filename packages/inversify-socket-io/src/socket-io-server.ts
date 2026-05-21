import { Server as IoServer, Socket } from 'socket.io';
import { Server } from 'node:http'; 
import type { ISocketIoHandler } from './socket-io-handler.interface.js';
import type { Container, Newable } from 'inversify';
import { SocketIoHandlerMessageParamToken, SocketIoHandlerMessagGuardToken, SocketIoHandlerToken } from './tokens.js';
import type { SocketIoHandlerMessageGuard } from './socket-io-handler-message-guard.interface.js';
import type { ParameterDecoratorHandler } from './parameter-decorator-handler.interface.js';

export class SocketIoServer {
    private io: IoServer;
    private handlers?: ISocketIoHandler[];

    constructor(httpServer: Server, private readonly container: Container) {
        this.io = new IoServer(httpServer);
    }

    bindHandler(handler: Newable<ISocketIoHandler>) {
        this.container.bind<ISocketIoHandler>(SocketIoHandlerToken).to(handler);
    }

    run() {
        if (this.handlers == null) {
            this.handlers = this.container.getAll<ISocketIoHandler>(SocketIoHandlerToken);
        }
        
        this.io.on('connect', (socket) => {
            for (const handler of this.handlers!) {
                if (handler.onConnect) {
                    handler.onConnect(socket);
                }

                let name = Reflect.getMetadata(SocketIoHandlerToken, handler.constructor);
                socket.on(name, this.handleMessage.bind(this, handler, socket));
            }
        })
    }

    private async handleMessage(handler: ISocketIoHandler, socket: Socket, data: string) {
        const guardCtor = Reflect.getOwnMetadata(SocketIoHandlerMessagGuardToken, handler.constructor) as Newable<SocketIoHandlerMessageGuard> | undefined;

        if (guardCtor) {
            const guard = this.container.get(guardCtor);
            const canActivate = await Promise.try(() => guard.canActivate(socket));
            if (!canActivate) {
                return;
            }
        }

        const paramHandlers = Reflect.getOwnMetadata(SocketIoHandlerMessageParamToken, handler.constructor) as Map<number, ParameterDecoratorHandler<unknown>>;

        const params: any[] = [];

        if (paramHandlers) {
            const paramIndexes = new Array<number>();
            const keys = paramHandlers.keys();
            for (const key of keys) {
                paramIndexes.push(key);
            }

            paramIndexes.sort((a, b) => a - b);

            let lastIdx: number | null = null;

            for (const idx of paramIndexes) {
                if (lastIdx == null && idx != 0) {
                    console.error('param indexes must start from zero');
                    return;
                }

                if (lastIdx != null && idx != (lastIdx + 1)) {
                    console.error('param indexes are not consecutive');
                    return;
                }

                lastIdx = idx;

                const value = paramHandlers.get(idx)!.get(socket, data);

                params.push(value);
            } 
        }  
        
        await Promise.try(() => handler.handleEvent(...params));
    }
}