export interface PipeTransform<O> {
    transform<I>(input: I): O | Promise<O>;
}

const isNumberPipeTransform: PipeTransform<number> = {
    transform<I>(input: I): number {
        if (typeof input === 'number') {
            return input;
        }

        throw new Error('Wrong parameter type: must be number');
    }
}

const isStringPipeTransform: PipeTransform<string> = {
    transform<I>(input: I): string {
        if (typeof input === 'string') {
            return input;
        }

        throw new Error('Wrong parameter type: must be string')
    }
}

const isBooleanPipeTransform: PipeTransform<boolean> = {
    transform<I>(input: I): boolean {
        if (typeof input === 'boolean') {
            return input;
        }

        throw new Error('Wrong parameter type: must be boolean');
    }
}

export function IsNumber(): PipeTransform<number> {
    return isNumberPipeTransform;
}

export function IsString(): PipeTransform<string> {
    return isStringPipeTransform;
}

export function IsBoolean(): PipeTransform<boolean> {
    return isBooleanPipeTransform;
}