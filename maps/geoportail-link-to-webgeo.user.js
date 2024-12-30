// ==UserScript==
// @name        geoportail-link-to-webgeo
// @namespace   https://github.com/gissehel/userscripts
// @version     3.0.1
// @description geoportail-link-to-webgeo
// @author      gissehel
// @homepage    https://github.com/gissehel/userscripts
// @supportURL  https://github.com/gissehel/userscripts/issues
// @match       https://geoportail.gouv.fr/*
// @match       https://www.geoportail.gouv.fr/*
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

// @main_begin{geoportail-link-to-webgeo}
registerDomNodeMutatedUnique(() => document.querySelectorAll('#reverse-geocoding-coords'), (coords) => {
    const parent = coords?.parentElement;
    if (parent) {
        createElementExtended('div', {
            id: 'reverse-geocoding-link-to-webgeo',
            parent: parent,
            children: [
                createElementExtended('a', {
                    attributes: {
                        href: '#'
                    },
                    children: [
                        createElementExtended('img', {
                            attributes: {
                                src: 'https://webgiss.github.io/webgeo/earth-16.png',
                                width: '16',
                                height: '16',
                            },
                            classnames: ['webgeo-icon'],
                        }),
                        createElementExtended('span', {
                            text: 'Link to WebGeo',
                        }),
                    ],
                    classnames: ['nav-link'],
                    onCreated: (link) => {
                        registerClickListener(link, () => {
                            const coords = document.querySelectorAll('#reverse-geocoding-coords')[0]
                            if (coords) {
                                const text = coords.textContent;
                                const [lat, lon] = text.split(',').map((str) => str.replace(' ', ''))
                                const element = document.querySelector('#numeric-scale')
                                element.dispatchEvent(new MouseEvent('mouseover'))
                                const zoom = element?.getAttribute('title')?.split('\n')?.filter(x => x.startsWith('Zoom : '))?.map(x => x.split(' : '))?.[0]?.[1] || 18
                                const osmPosition = `map=${zoom}/${lat}/${lon}`;
                                openLinkInNewTab(`https://webgiss.github.io/webgeo/#${osmPosition}`)
                                return true;
                            }
                            return false;
                        }, false)
                    },
                })
            ],
        })
        return true
    }
    return false
})

addStyle('.webgeo-icon { vertical-align: sub; margin-right: 3px; margin-top: 4px; }')
// @main_end{geoportail-link-to-webgeo}

console.log(`End - ${script_id}`)
