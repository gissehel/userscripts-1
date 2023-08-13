/**
 * Request some sub elements from an element
 *
 * @param {HtmlElement} element The element to query
 * @param {string} query The query
 * @returns {[HtmlElement]}
 */
const getSubElements = (element, query) => [...element.querySelectorAll(query)]
