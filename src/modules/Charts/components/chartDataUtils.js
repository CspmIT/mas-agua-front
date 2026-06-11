// Helpers puros para mantener el array `chartData` del formulario de gráficos.
// Se extraen para poder testearlos de forma aislada (ver chartDataUtils.test.js).

/**
 * Inserta o reemplaza (por `key`) una entrada en la lista de chartData.
 * @param {Array<{key:string}>} list
 * @param {{key:string}} entry
 * @returns {Array}
 */
export const upsertEntry = (list, entry) => {
    const filtered = (list || []).filter(e => e.key !== entry.key)
    return [...filtered, entry]
}

/**
 * Elimina la entrada con la `key` indicada (lo que faltaba al destildar
 * "variable secundaria" o un "valor inferior").
 * @param {Array<{key:string}>} list
 * @param {string} key
 * @returns {Array}
 */
export const removeEntry = (list, key) => (list || []).filter(e => e.key !== key)
