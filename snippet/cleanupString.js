/**
 * Cleanup string by removing leading and trailing whitespaces and replacing multiple whitespaces with a single whitespace
 * 
 * @param {string} string The string to cleanup
 * @returns {string} The cleaned string
 */
const cleanupString = (string) => string.trim().replace(/\s+/g, ' ')

