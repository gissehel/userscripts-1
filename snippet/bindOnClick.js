/**
 * Bind an onClick handler an element. Returns uninstall handler
 * 
 * @param {HtmlElement} element The element to bind the handler
 * @param {()=>boolean|undefined} callback The onClick handler
 * @returns {()=>{}}
 */
const bindOnClick = (element, callback) => {
    const onClick = (e) => {
        const result = callback()
        if (result !== false) {
            e.preventDefault()
            e.stopImmediatePropagation()
        }
    }
    element.addEventListener('click', onClick, true);

    return () => {
        element.removeEventListener('click', onClick, true);
    }
}
