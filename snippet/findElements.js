/**
 * Find HTML Element in a page
 * @param {string} query The css query
 * @returns Element[]
 */
const findElements = (query) => [...document.querySelectorAll(query)];
