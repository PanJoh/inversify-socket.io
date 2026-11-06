import { injectable, type Newable } from "inversify";
import type { SocketIoHandlerMessageGuard } from "./socket-io-handler-message-guard.interface.js";
import { SocketIoHandlerMessageParamToken, SocketIoHandlerMessagGuardToken, SocketIoHandlerToken } from "./tokens.js";
import type { ParameterDecoratorHandler } from "./parameter-decorator-handler.interface.js";
import type { ISocketIoHandler } from "./socket-io-handler.interface.js";
import type { Socket } from "socket.io";
import type { PipeTransform } from "./validation-transformation.js";

export const HandlerMetadataKey = Symbol('handler-metadata-key');

function updateHandlerMetadata(target: Newable<ISocketIoHandler>) {
    const handlers = (Reflect.getOwnMetadata(HandlerMetadataKey, Reflect) ?? []) as Newable<ISocketIoHandler>[];
    const updatedHandlers = [...handlers, target];
    Reflect.defineMetadata(HandlerMetadataKey, updatedHandlers, Reflect);

}

export function UseMessageGuard(guard: Newable<SocketIoHandlerMessageGuard>) {
    return (target: Newable<ISocketIoHandler>) => {
        Reflect.defineMetadata(SocketIoHandlerMessagGuardToken, guard, target);
    }
}

export function createParamDecorator<T, A = void>(handler: Newable<ParameterDecoratorHandler<T, A>, [A]>) {
    return (arg: A) => 
            (target: Object, _propertyKey: string, parameterIndex: number) => {
            const params = Reflect.getOwnMetadata(SocketIoHandlerMessageParamToken, target.constructor) ?? new Map<number, ParameterDecoratorHandler<unknown>>();
            params.set(parameterIndex, new handler(arg));
            Reflect.defineMetadata(SocketIoHandlerMessageParamToken, params, target.constructor);
    }
}

export function SocketIoHandler(name: string) {
    return (target: Newable<ISocketIoHandler>) => {
        injectable()(target);
        Reflect.defineMetadata(SocketIoHandlerToken, name, target);
        updateHandlerMetadata(target);
    }
}

class ClientParamDecoratorHandler implements ParameterDecoratorHandler<Socket> {
    get(client: Socket, _data: unknown) {
        return client;
    }
}

type DataParamDecoratorHandlerOptions<O> = {
    member?: string;
    pipe?: PipeTransform<O>
}

class DataParamDecoratorHandler<O> implements ParameterDecoratorHandler<O, DataParamDecoratorHandlerOptions<O> | void> {
    constructor(private arg: DataParamDecoratorHandlerOptions<O> | void) {}
    
    get(_client: Socket, data: unknown) {
        let input: unknown;
        if (this.arg != undefined) {
            if (this.arg.member) {
                const dataObj = data as {[k: string]: unknown};
                if (dataObj[this.arg.member] == null) {
                    throw new Error(`socket message has no member ${this.arg}`)
                } else {
                    input = dataObj[this.arg.member];
                }
            } else {
                input = data;
            }

            if (this.arg.pipe) {
                return this.arg.pipe.transform(input);
            }

            return input as O;
        }
        return data as O;
    }
}

export const Client = createParamDecorator(ClientParamDecoratorHandler);

export function Data<O>(): ParameterDecorator;
export function Data<O>(member: string): ParameterDecorator;
export function Data<O>(member: string, tranform: PipeTransform<O>): ParameterDecorator;
export function Data<O>(transform: PipeTransform<O>): ParameterDecorator;
export function Data<O>(mt: string | PipeTransform<O> | void, transform: PipeTransform<O> | void) {
    let member: string | undefined;
    let effectiveTransform: PipeTransform<O> | undefined;
    if (mt != null) {
        if (typeof mt === 'string') {
            member = mt;
            if (transform != null) {
                effectiveTransform = transform;
            }
        } else {
            effectiveTransform = mt;
        }
    }


    if (member != null || effectiveTransform != null) {
        let options: DataParamDecoratorHandlerOptions<O> = {};

        if (member != null) {
            options = {...options, member};
        }

        if (effectiveTransform != null) {
            options = {...options, pipe: effectiveTransform};
        }

        const paramDecorator = createParamDecorator(DataParamDecoratorHandler<O>);
        const decorator = paramDecorator(options);
        
        console.log(decorator);

        return decorator;
    }

    const paramDecorator = createParamDecorator(DataParamDecoratorHandler);
    return paramDecorator();
}

