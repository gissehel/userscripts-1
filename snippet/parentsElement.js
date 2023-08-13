/**
 * Get the depth'th parent of the element
 * 
 * @param {HTMLElement} element 
 * @param {Number} depth 
 * @returns {HTMLElement}
 */
const parentsElement = (element, depth) => {
    let current_element = element
    for (let index = 0; index < depth; index++) {
        current_element = current_element?.parentElement
    }
    return current_element
}

