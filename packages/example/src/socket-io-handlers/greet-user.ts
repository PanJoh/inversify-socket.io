import { Client, Data, SocketIoHandler, type ISocketIoHandler } from "@panjoh/inversify-socket-io";
import { ClassTransformerPipe } from '@panjoh/inversify-socket-io-class-transfomer';
import { IsString } from 'class-validator';
import type { Socket } from "socket.io";

class PersonDto {
    @IsString()
    firstName!: string;

    @IsString()
    lastName!: string;
}

@SocketIoHandler('greet')
export class GreetHandler implements ISocketIoHandler {
    handleEvent(@Data(new ClassTransformerPipe(PersonDto)) person: PersonDto, @Client() client: Socket): void {
        client.emit('greeting', `Hello "${person.firstName} ${person.lastName}`);
    }
}