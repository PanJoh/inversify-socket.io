import { injectable, type Newable } from "inversify";
import type { SocketIoHandlerMessageGuard } from "./socket-io-handler-message-guard.interface.js";
import { SocketIoHandlerMessageParamToken, SocketIoHandlerMessagGuardToken, SocketIoHandlerToken } from "./tokens.js";
import type { ParameterDecoratorHandler } from "./parameter-decorator-handler.interface.js";
import type { ISocketIoHandler } from "./socket-io-handler.interface.js";
import type { Socket } from "socket.io";


export function UseMessageGuard(guard: Newable<SocketIoHandlerMessageGuard>) {
    return (target: Newable<ISocketIoHandler>) => {
        Reflect.defineMetadata(SocketIoHandlerMessagGuardToken, guard, target);
    }
}

export function createParamDecorator<T>(handler: Newable<ParameterDecoratorHandler<T>>) {
    return (target: Object, _propertyKey: string, parameterIndex: number) => {
        const params = Reflect.getOwnMetadata(SocketIoHandlerMessageParamToken, target.constructor) ?? new Map<number, ParameterDecoratorHandler<unknown>>();
        params.set(parameterIndex, new handler());
        Reflect.defineMetadata(SocketIoHandlerMessageParamToken, params, target.constructor);
    }
}

export function SocketIoHandler(name: string) {
    return (target: Newable<ISocketIoHandler>) => {
        injectable()(target);
        Reflect.defineMetadata(SocketIoHandlerToken, name, target);
    }
}

class ClientParamDecoratorHandler implements ParameterDecoratorHandler<Socket> {
    get(client: Socket, data: any) {
        return client;
    }
}

class DataParamDecoratorHandler implements ParameterDecoratorHandler<any> {
    get(client: Socket, data: any) {
        return data;
    }
}

export const Client = createParamDecorator(ClientParamDecoratorHandler);

export const Data = createParamDecorator(DataParamDecoratorHandler);

