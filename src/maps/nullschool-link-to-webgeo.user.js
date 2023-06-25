// ==UserScript==
// @name         nullschool-link-to-webgeo
// @namespace    https://github.com/gissehel/userscripts
// @version      1.2.2
// @description  nullschool-link-to-webgeo
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://earth.nullschool.net/*
// @match        https://classic.nullschool.net/*
// @icon         https://github.com/webgiss/webgeo/raw/master/res/earth-64.png
// @grant        none
// ==/UserScript==

(() => {
    const script_name = GM_info?.script?.name || 'no-name'
    const script_version = GM_info?.script?.version || 'no-version'
    const script_id = `${script_name} ${script_version}`
    console.log(`Begin - ${script_id}`)

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

        return registerDomNodeInserted(() => {
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

    const title = createElementExtended('h1', {
        children: [
            createElementExtended('a', {
                attributes: {
                    href: '#'
                },
                classnames: ['nav-link'],
                children: [
                    createElementExtended('button', {
                        attributes: {
                            class: 'card no-touch-tt',
                            'data-name': 'webgeo',
                            'aria-controls': 'menu',
                            'aria-labelledby': 'webgeo webgeo-tt',
                            'data-tooltip': 'webgeo-tt',
                            title: 'Go to webgeo',
                            'aria-expanded': 'true',
                        },
                        children: [
                            createElementExtended('span', {
                                text: 'WebGeo',
                            }),
                        ],
                    }),
                ],
                onCreated: (link) => {
                    registerEventListener(link, 'click', (e) => {
                        e.preventDefault();
                        const locs = location.hash.split('/').filter(x => x.startsWith('loc='));
                        if (locs.length > 0) {
                            const loc = locs[0].substring('loc='.length)
                            const [lon, lat] = loc.split(',').map(x => Number(x))
                            const osmPosition = `map=${12}/${lat}/${lon}`;
                            realLink.setAttribute('href', `https://webgiss.github.io/webgeo/#${osmPosition}`);
                            realLink.click();
                        }
                        return true;
                    })
                }
            })
        ],
    })

    const realLink = createElementExtended('a', {
        attributes: {
            href: '#',
            target: '_blank',
        },
    })

    registerDomNodeInsertedUnique(() => document.querySelectorAll('h1'), (titleBase) => {
        const parent = titleBase.parentElement;
        if (parent) {
            parent.append(title);
            return true
        }
        return false
    })

    

    console.log(`End - ${script_id}`)
})()
