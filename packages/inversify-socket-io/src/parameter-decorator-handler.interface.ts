import type { Socket } from "socket.io";

export interface ParameterDecoratorHandler<T> {
    get(client: Socket, data: unknown): T;
}
