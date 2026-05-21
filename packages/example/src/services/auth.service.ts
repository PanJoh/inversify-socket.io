import { injectable } from "inversify";
import crypto from 'node:crypto';
import process from 'node:process';
import jwt from 'jsonwebtoken';
import { UserEntity } from "../models/User.entity.js";

@injectable()
export class AuthService {
    login(name: string) {
        const id = crypto.randomUUID({disableEntropyCache: true});
        const payload = { sub: id, name};
        const token = jwt.sign(payload, process.env.JWT_SECRET ?? '', {
            algorithm: 'HS512',
        });

        return token;
    }

    verify(token: string) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET ?? '') as { sub: string, name: string};
            const user = new UserEntity(payload.sub, payload.name);
            return user;
        } catch (err) {
            console.error(err);
            return null;
        }
        
    }
}