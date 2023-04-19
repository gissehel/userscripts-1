/**
 * Request some sub elements from an element
 *
 * @param {HtmlElement} element The element to query
 * @param {string} query The query
 * @returns {[HtmlElement]}
 */
const getSubElements = (element, query) => [...element.querySelectorAll(query)]

/**
 * Request some elements from the current document
 *
 * @param {string} query The query
 * @returns {[HtmlElement]}
 */
const getElements = (query) => getSubElements(document, query)
