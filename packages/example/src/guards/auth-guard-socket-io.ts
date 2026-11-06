import { inject, injectable } from "inversify";
import { IncomingMessage } from "node:http";
import { createParamDecorator, type SocketIoHandlerMessageGuard } from "@panjoh/inversify-socket-io";
import type { Socket } from "socket.io";
import { AuthService } from "../services/auth.service.js";
import type { UserEntity } from "../models/User.entity.js";
import type { ParameterDecoratorHandler } from "@panjoh/inversify-socket-io";

const BearerRegExp = /^Bearer (.*)$/

const currentUserMap = new WeakMap<IncomingMessage, UserEntity>();

@injectable()
export class AuthGuardSocketIo implements SocketIoHandlerMessageGuard {
    constructor(@inject(AuthService) private readonly authService: AuthService) {}

    canActivate(socket: Socket): boolean {
        if (socket.request.headers.authorization == null) {
            socket.emit('err', "no authorizaiton header");
            return false;
        }

        const authHeader = socket.request.headers.authorization;

        const matches = BearerRegExp.exec(authHeader);
        if (!matches) {
            socket.emit('err', "invalide authorization header");
            return false
        }

        const user = this.authService.verify(matches[1]!)

        if (!user) {
            socket.emit('err', "not authorized");
            return false;
        }

        currentUserMap.set(socket.request, user);
        return true;
    }
}

class CurrentUserParamHandler implements ParameterDecoratorHandler<UserEntity | undefined> {
    get(socket: Socket) {
        return currentUserMap.get(socket.request);
    }
}

export const CurrentUserSocketIo = createParamDecorator(CurrentUserParamHandler);