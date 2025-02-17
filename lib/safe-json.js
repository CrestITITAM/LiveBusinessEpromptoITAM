"use strict"

/**
 * A custom JSON utility object that mimics the functionality of `JSON.parse()` and `JSON.stringify()`
 * while also handling errors gracefully.
 */
const safeJSON = {
    /**
     * Parses a JSON string into an object.
     * If the string is invalid, an error object with the error message is returned.
     *
     * @param {string} jsonString - The JSON string to parse.
     * @param {function} [reviver] - Optional function that can transform the parsed result.
     * @returns {object} - The parsed object or an error object if the JSON is invalid.
     */
    parse(text, reviver = undefined) {
        try {
            return reviver ? JSON.parse(text, reviver) : JSON.parse(text)
        } catch (error) {
            console.log('ERROR on iJSON.parse:', { text: text.toString() || `${text}`, reviver })
            return {}
        }
    },

    /**
     * Converts a JavaScript object into a JSON string.
     * If the object contains circular references or any other issues, an error object is returned.
     *
     * @param {object} value - The object to stringify.
     * @param {function} [replacer] - Optional function or array used to transform the result.
     * @param {number|string} [space] - Optional value to add whitespace (for formatting).
     * @returns {string|object} - The resulting JSON string or an error object if there are issues.
     */
    stringify(value, replacer = undefined, space = undefined) {
        try {
            return JSON.stringify(value, replacer, space)
        } catch (error) {
            console.log('ERROR on iJSON.stringify:', { value, replacer, space })
            return ''
        }
    }
}

module.exports = safeJSON
