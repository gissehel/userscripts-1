/**
 * Add a DOMNodeInserted on the document. 
 * Handle the fact that the callback can't be called while aleady being called (no stackoverflow). 
 * Use the register pattern thus return the unregister function as a result
 * @param {EventListener} callback 
 * @return {()=>{}} The unregister function
 */
 const registerDomNodeInserted = (callback) => {
    let nodeChangeInProgress = false

    /** @type{EventListener} */
    const onNodeChanged = (e) => {
        if (!nodeChangeInProgress) {
            nodeChangeInProgress = true
            callback(e)
            nodeChangeInProgress = false
        }

    }
    document.documentElement.addEventListener('DOMNodeInserted', onNodeChanged, false);
    onNodeChanged()
    return () => {
        document.documentElement.removeEventListener('DOMNodeInserted', onNodeChanged, false);
    }
}

/**
 * Add a DOMNodeInserted on the document. 
 * Handle the fact that the callback can't be called while aleady being called (no stackoverflow). 
 * Use the register pattern thus return the unregister function as a result
 * 
 * Ensure that when an element matching the query elementProvider, the callback is called with the element 
 * exactly once for each element
 * @param {()=>[HTMLElement]} elementProvider 
 * @param {(element: HTMLElement)=>{}} callback 
 */
const registerDomNodeInsertedUnique = (elementProvider, callback) => {
    const domNodesHandled = new Set()
    
    return registerDomNodeInserted(()=>{
        for (let element of elementProvider()) {
            if (! domNodesHandled.has(element)) {
                domNodesHandled.add(element)
                const result = callback(element)
                if (result === false) {
                    domNodesHandled.delete(element)
                }
            }
        }
    })
}
