import type { Socket } from "socket.io";

export interface ParameterDecoratorHandler<T, A = void> {
    get(client: Socket, data: unknown): T | Promise<T>;
}
