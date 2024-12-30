// ==UserScript==
// @name        openstreetmap-link-to-webgeo
// @namespace   https://github.com/gissehel/userscripts
// @version     3.0.1
// @description openstreetmap-link-to-webgeo
// @author      gissehel
// @homepage    https://github.com/gissehel/userscripts
// @supportURL  https://github.com/gissehel/userscripts/issues
// @match       https://openstreetmap.org/*
// @match       https://www.openstreetmap.org/*
// @icon        https://webgiss.github.io/webgeo/earth-64.png
// @grant       none
// ==/UserScript==

const script_name = GM_info?.script?.name || 'no-name'
const script_version = GM_info?.script?.version || 'no-version'
const script_id = `${script_name} ${script_version}`
console.log(`Begin - ${script_id}`)


// @imported_begin{addStyle}
/**
 * Add a new css string to the page
 * 
 * @param {string} styleText The CSS string to pass
 * @returns {void}
 */
 const addStyle = (() => {
    let styleElement = null;
    let styleContent = null;

    /**
     * Add a new css string to the page
     * 
     * @param {string} styleText The CSS string to pass
     * @returns {void}
     */
    return (styleText) => {
        if (styleElement === null) {
            styleElement = document.createElement('style');
            styleContent = "";
            document.head.appendChild(styleElement);
        } else {
            styleContent += "\n";
        }

        styleContent += styleText;
        styleElement.textContent = styleContent;
    };
})();
// @imported_end{addStyle}

// @imported_begin{registerEventListener}
/**
 * Wrap addEventListener and removeEventListener using a pattern where the unregister function is returned
 * @param {EventTarget} eventTarget The object on which to register the event
 * @param {string} eventType The event type
 * @param {EventListenerOrEventListenerObject} callback The callback to call when the event is triggered
 * @param {boolean|AddEventListenerOptions=} options The options to pass to addEventListener
 */
const registerEventListener = (eventTarget, eventType, callback, options) => {
    if (eventTarget.addEventListener) {
        eventTarget.addEventListener(eventType, callback, options);
    }
    return () => {
        if (eventTarget.removeEventListener) {
            eventTarget.removeEventListener(eventType, callback, options);
        }
    }
}
// @imported_end{registerEventListener}

// @imported_begin{registerClickListener}
/**
 * Wrap addEventListener and removeEventListener using a pattern where the unregister function is returned for click events
 * @param {EventTarget} eventTarget The object on which to register the event
 * @param {EventListenerOrEventListenerObject} callback The callback to call when the event is triggered
 * @param {boolean|AddEventListenerOptions=} options The options to pass to addEventListener
 * @returns 
 */
const registerClickListener = (eventTarget, callback, options) => {
    return registerEventListener(eventTarget, 'click', (e) => {
        e.preventDefault()
        const result = callback(e)
        if (result === false) {
            return false
        }
        return true
    }, options);
}
// @imported_end{registerClickListener}

// @imported_begin{registerDomNodeMutated}
/**
 * Call the callback when the document change
 * Handle the fact that the callback can't be called while aleady being called (no stackoverflow). 
 * Use the register pattern thus return the unregister function as a result
 * @param {()=>()} callback 
 * @return {()=>{}} The unregister function
 */
const registerDomNodeMutated = (callback) => {
    let callbackInProgress = false

    const action = () => {
        if (!callbackInProgress) {
            callbackInProgress = true
            callback()
            callbackInProgress = false
        }
    }

    const mutationObserver = new MutationObserver((mutationsList, observer) => { action() });
    action()
    mutationObserver.observe(document.documentElement, { childList: true, subtree: true });

    return () => mutationObserver.disconnect()
}
// @imported_end{registerDomNodeMutated}

// @imported_begin{registerDomNodeMutatedUnique}
/**
 * Call the callback once per element provided by the elementProvider when the document change
 * Handle the fact that the callback can't be called while aleady being called (no stackoverflow). 
 * Use the register pattern thus return the unregister function as a result
 * 
 * Ensure that when an element matching the query elementProvider, the callback is called with the element 
 * exactly once for each element
 * @param {()=>[HTMLElement]} elementProvider 
 * @param {(element: HTMLElement)=>{}} callback 
 */
const registerDomNodeMutatedUnique = (elementProvider, callback) => {
    const domNodesHandled = new Set()

    return registerDomNodeMutated(() => {
        for (let element of elementProvider()) {
            if (!domNodesHandled.has(element)) {
                domNodesHandled.add(element)
                const result = callback(element)
                if (result === false) {
                    domNodesHandled.delete(element)
                }
            }
        }
    })
}
// @imported_end{registerDomNodeMutatedUnique}

// @imported_begin{createElementExtended}
/**
 * Create a new element, and add some properties to it
 * 
 * @param {string} name The name of the element to create
 * @param {object} params The parameters to tweek the new element
 * @param {object.<string, string>} params.attributes The propeties of the new element
 * @param {string} params.text The textContent of the new element
 * @param {HTMLElement[]} params.children The children of the new element
 * @param {HTMLElement} params.parent The parent of the new element
 * @param {string[]} params.classnames The classnames of the new element
 * @param {string} params.id The classnames of the new element
 * @param {HTMLElement} params.prevSibling The previous sibling of the new element (to insert after)
 * @param {HTMLElement} params.nextSibling The next sibling of the new element (to insert before)
 * @param {(element:HTMLElement)=>{}} params.onCreated called when the element is fully created
 * @returns {HTMLElement} The created element
 */
const createElementExtended = (name, params) => {
    /** @type{HTMLElement} */
    const element = document.createElement(name)
    if (!params) {
        params = {}
    }
    const { attributes, text, children, parent, classnames, id, prevSibling, nextSibling, onCreated } = params
    if (attributes) {
        for (let attributeName in attributes) {
            element.setAttribute(attributeName, attributes[attributeName])
        }
    }
    if (text) {
        element.textContent = text;
    }
    if (children) {
        for (let child of children) {
            element.appendChild(child)
        }
    }
    if (parent) {
        parent.appendChild(element)
    }
    if (classnames) {
        for (let classname of classnames) {
            element.classList.add(classname)
        }
    }
    if (id) {
        element.id = id
    }
    if (prevSibling) {
        prevSibling.parentElement.insertBefore(element, prevSibling.nextSibling)
    }
    if (nextSibling) {
        nextSibling.parentElement.insertBefore(element, nextSibling)
    }
    if (onCreated) {
        onCreated(element)
    }
    return element
}
// @imported_end{createElementExtended}

// @imported_begin{openLinkInNewTab}
/**
 * Open a link in a new tab
 * @param {string} url 
 */
const openLinkInNewTab = (url) => {
    const link = createElementExtended('a', {
        attributes: {
            href: url,
            target: '_blank',
        },
    })
    link.click();
}
// @imported_end{openLinkInNewTab}

// @main_begin{openstreetmap-link-to-webgeo}
const navLink = createElementExtended('li', {
    children: [
        createElementExtended('a', {
            attributes: {
                href: '#',
            },
            children: [
                createElementExtended('img', {
                    attributes: {
                        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADdgAAA3YBfdWCzAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAJuSURBVDiNlZLLS1RRHMc/9555+B5v1JhK6PigRZrGWFlSUSlRumjjJgPBgnYt2kW7/oHAXEjkItoUlBsLe0guWhiiaeAYWDI+0GEcBx0nnevce+5tMTY+kqDv6nDO9/v9ffl9j8Ie+KEauA1cBkq3rmeAAQWejsDETr7y51ABbg88wuG9g/euiqcZMipTj/oUxN7C0mOpmEvdCbgXgGTaYEvcj9Z6kZIeELl7g6Ug4zDbASuvPulwNQBJAeCDLrTWVspeguoGYLP8Ha7mTpwNrzGLRjDDRxDJQtBaQQ/4hD6phaBf8UM1Du84VT9VRC7J0kHcDb0Un17A5Xakh899yyD5pBvVzAK5BhMVUjUjNaIIHnD4fr2dfx7jykNKbvRxqDKBcKi70ucVGESiy4j5+lRKW1et+OCmCjSS34Je84yDZ8bY+GUSDetEwzqxtQSmNFPbVhRy64a3HT0tKNCk+CHOiXgOag7SGQPFSnMsVUdq09ieBYTbhLUCXMHG7YWO58UdgI1tAyAMz67YAnCGCiG0XyU2gK0C82xO71/bv5DSzKnAR2Jv/t8g1gfwQamDKjtVo7AdmRjnOsmpHSO5WERy+BquuQt/i2UMJiqkZS4fF4uwVGyte21j6pTZ8YWj1yfxeCVa+SrZdUOsOMcRPy6x/ettCLbBxmjXV3guADQYcCW+nzUPZpSpvmyy8lJkp1PlQGWU8GICR6g2NTnYhr3aO6BAewgsARABqcELV2BWW/8c8a9QrOpuE0uRSNtgfcZAHRqG4E3JxmiXAu2jYLAjVxon4ZiEWwo0yUx8lguccWaweG9BzxhM7uT/BkHD6xG17TgoAAAAAElFTkSuQmCC',
                        width: '16',
                        height: '16',
                    },
                    classnames: ['webgeo-icon'],
                }),
                createElementExtended('span', {
                    text: 'WebGeo',
                }),
            ],
            classnames: ['nav-link'],
            onCreated: (link) => {
                registerClickListener(link, () => {
                    const urlArgs = document.URL.split('#')[1];
                    let osmPosition = null;
                    if (urlArgs) {
                        osmPosition = urlArgs.split('&').filter(part => part.startsWith('map='));
                    }
                    if (osmPosition) {
                        openLinkInNewTab(`https://webgiss.github.io/webgeo/#${osmPosition}`);
                        return true;
                    }
                    return false;
                }, false)
            },
        })
    ],
})

registerDomNodeMutatedUnique(() => document.querySelectorAll('nav.secondary'), (panel) => {
    const subpanel = panel.children[0];
    const firstLink = subpanel.children[0];
    if (firstLink) {
        const className = firstLink.className;
        navLink.className = `${className} webgeo`;
        subpanel.insertBefore(navLink, firstLink);

        return;
    }
})

addStyle('.webgeo-icon { vertical-align: sub; margin-right: 3px; margin-top: 5px; }')
// @main_end{openstreetmap-link-to-webgeo}

console.log(`End - ${script_id}`)
