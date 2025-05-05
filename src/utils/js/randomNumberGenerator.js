/**
 * Genera un array de números aleatorios entre 0 y 50
 * @param {number} cantidad - La cantidad de números aleatorios a generar
 * @returns {number[]} - Un array con los números aleatorios generados
 */
export const generarNumerosAleatorios = (cantidad) =>
    Array.from({ length: cantidad }, () => Math.floor(Math.random() * 51))
