/**
 * Transforms a value to a specified type.
 *
 * @param {string} type - The type to transform the value to. Can be 'number', 'boolean', or any other type which will default to 'string'.
 * @param {*} value - The value to be transformed.
 * @returns {*} - The transformed value in the specified type.
 *
 * @example
 * transformTypes('number', '123'); // returns 123
 * transformTypes('boolean', 'true'); // returns true
 * transformTypes('string', 123); // returns '123'
 */
export function transformTypes(type, value) {
    type.toLowerCase()
    switch (type) {
        case 'number':
            return Number(value)
        case 'boolean':
            return Boolean(value)
        default:
            return String(value)
    }
}
