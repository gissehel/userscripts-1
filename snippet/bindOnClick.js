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
        }
    }
    element.addEventListener('click', onClick, false);

    return () => {
        element.removeEventListener('click', onClick, false);
    }
}
