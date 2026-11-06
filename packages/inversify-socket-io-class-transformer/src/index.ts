import { type PipeTransform } from '@panjoh/inversify-socket-io';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate, validateOrReject, ValidationError} from 'class-validator';

export class TransformValidationError extends Error {
    constructor(private err: ValidationError[]) {
        super('validation error');
    }
}

function checkValidationError(err: unknown): err is ValidationError[] {
    if (!Array.isArray(err)) {
        return false;
    }

    for (const item of err) {
        if (!(item instanceof ValidationError)) {
            return false;
        }
    }

    return true;
}

export class ClassTransformerPipe<O extends object> implements PipeTransform<O> {

    constructor(private cls: ClassConstructor<O>) {}

    async transform<I>(input: I): Promise<O> {
        const transformed = plainToInstance(this.cls, input);
        try {
            await validateOrReject(transformed)
        } catch (err) {
            if (checkValidationError(err)) {
                throw new TransformValidationError(err);
            } else {
                throw new Error('An unknown error occured');
            }
        } 
        return transformed;
    }
}
