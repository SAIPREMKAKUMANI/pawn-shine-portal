import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

function classToPlain<T>(input: T): Record<string, unknown> {
    return JSON.parse(JSON.stringify(input));
}

export function toCamelCase<T>(input: unknown): T {
    const plain = classToPlain(input);
    return camelcaseKeys(plain, { deep: true }) as T;
}

export function toSnakeCase<T>(input: T): Record<string, unknown> {
    const plain = classToPlain(input);
    return snakecaseKeys(plain, { deep: true });
}
