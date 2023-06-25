// ==UserScript==
// @name         googlemaps-link-to-webgeo
// @namespace    https://github.com/gissehel/userscripts
// @version      1.2.1
// @description  googlemaps-link-to-webgeo
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://google.com/maps/*
// @match        https://www.google.com/maps/*
// @icon         https://github.com/webgiss/webgeo/raw/master/res/earth-64.png
// @grant        none
// ==/UserScript==

(() => {
    const script_name = GM_info?.script?.name || 'no-name'
    const script_version = GM_info?.script?.version || 'no-version'
    const script_id = `${script_name} ${script_version}`
    console.log(`Begin - ${script_id}`)

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

    const link = createElementExtended('a', {
        attributes: {
            href: '#'
        },
        text: 'W',
    })

    const realLink = createElementExtended('a', {
        attributes: {
            href: '#',
            target: '_blank'
        }
    })

    registerDomNodeInsertedUnique(() => document.querySelectorAll('[data-ogsr-up]'), (panel) => {
        const subpanel = panel?.children?.[0];
        const firstLink = subpanel?.children?.[0];
        if (firstLink) {
            const className = firstLink.className;
            link.className = `${className} webgeo`;

            subpanel.insertBefore(link, firstLink);

            return false;
        }
    })

    registerEventListener(link, 'click', (e) => {
        e.preventDefault();
        const googlePosition = document.URL.split('/').filter(part => part.startsWith('@'))[0];
        if (googlePosition) {
            realLink.setAttribute('href', `https://webgiss.github.io/webgeo/#google=${googlePosition}`);
            realLink.click();
        }
        return false;
    })

    addStyle('.webgeo { background-color: #fff; border-radius: 50px; padding: 9px !important; border: 1px solid #ccc; font-weight: bold; color: }')
    addStyle('.webgeo:hover { text-decoration: none; border: 1px solid #888; }')

    console.log(`End - ${script_id}`)
})()
