import { Server as IoServer, Socket, type ServerOptions } from 'socket.io';
import { Server } from 'node:http'; 
import type { ISocketIoHandler } from './socket-io-handler.interface.js';
import type { Container, Newable } from 'inversify';
import { IoServerToken, SocketIoHandlerMessageParamToken, SocketIoHandlerMessagGuardToken, SocketIoHandlerToken } from './tokens.js';
import type { SocketIoHandlerMessageGuard } from './socket-io-handler-message-guard.interface.js';
import type { ParameterDecoratorHandler } from './parameter-decorator-handler.interface.js';
import { HandlerMetadataKey } from './decorators.js';

export class SocketIoServer {
    private io: IoServer;
    private errorEvent?: string;

    constructor(httpServer: Server, private readonly container: Container, options?: Partial<ServerOptions>) {
        this.io = new IoServer(httpServer, options);
        container.bind(IoServerToken).toConstantValue(this.io);
    }

    setErrorEvent(errorEvent: string) {
        this.errorEvent = errorEvent;
    }

    unsetErrorEvent() {
        delete this.errorEvent;
    }

    async run() {
        const handlers = await this.getHandlers();
        this.io.on('connect', (socket) => {
            for (const handler of handlers) {
                if (handler.onConnect) {
                    handler.onConnect(socket);
                }

                let name = Reflect.getMetadata(SocketIoHandlerToken, handler.constructor);
                socket.on(name, this.handleMessage.bind(this, handler, socket));
            }
        })
    }

    private async handleMessage(handler: ISocketIoHandler, socket: Socket, data: unknown) {
        const guardCtor = Reflect.getOwnMetadata(SocketIoHandlerMessagGuardToken, handler.constructor) as Newable<SocketIoHandlerMessageGuard> | undefined;

        if (guardCtor) {
            const guard = this.container.get(guardCtor);
            let canActivate: boolean; 

//           console.debug('executing guard');

            try {
                canActivate = await Promise.try(() => guard.canActivate(socket));
            } catch (err) {

                this.handleError(err, socket);
                return;
            }
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

                try {
                    const value = await Promise.try(() => paramHandlers.get(idx)!.get(socket, data));
                    params.push(value);
                } catch (err) {
                    this.handleError(err, socket);
                    return;
                }

            } 
        }  
        
        try {
            await Promise.try(() => handler.handleEvent(...params));
        } catch (err) {
            this.handleError(err, socket);
        }
    }

    private async getHandlers() {
        const potentialHandlers = (Reflect.getOwnMetadata(HandlerMetadataKey, Reflect) ?? []) as Newable<ISocketIoHandler>[];

        const handlers = [] as ISocketIoHandler[];

        for (const handlerCtor of potentialHandlers) {
            if (!this.container.isBound(handlerCtor)) {
                continue;
            }
            handlers.push(await this.container.getAsync(handlerCtor));
        }

        return handlers;
    }

    private handleError(err: unknown, socket: Socket) {
        console.error(err);
        if (this.errorEvent) {
            if (err instanceof Error) {
                socket.emit(this.errorEvent, err.message);
            } else {
                socket.emit(this.errorEvent, 'unknown error occured');
            }
        }
    }
}