import { isVarHasValue } from "./data"

export function toggleAttribute(value: unknown, showValue: boolean = false): string | undefined {
    if (!isVarHasValue(value)) 
        return undefined

    if (typeof value == 'boolean' && !showValue)
        return value? '' : undefined

    return showValue? `${ value }` : ''
}