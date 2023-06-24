// ==UserScript==
// @name         nightcafe-add-hot-new-buttons
// @namespace    https://github.com/gissehel/userscripts
// @version      1.1.0
// @description Add buttons for 'Hot' and 'New' explorer entries
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://creator.nightcafe.studio/*
// @icon         https://creator.nightcafe.studio/favicon-32x32.png
// @grant        none
// ==/UserScript==

(() => {
    const script_name = GM_info?.script?.name || 'no-name'
    const script_version = GM_info?.script?.version || 'no-version'
    const script_id = `${script_name} ${script_version}`
    console.log(`Begin - ${script_id}`)

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

    /**
     * Add a DOMNodeInserted on the document. Handle the fact that the callback can't be called while aleady being called (no stackoverflow). Use the register pattern thus return the unregister function as a result
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

    const explorerButtonSet = new Set()

    const onNodeChanged = (() => {
        const explorerButtons = [...document.querySelectorAll('[data-testid=ExploreBtn]')]
        for (let explorerButton of explorerButtons) {
            if (!explorerButtonSet.has(explorerButton)) {
                const liExplorer = explorerButton.parentElement
                createElementExtended('li', {
                    children: [
                        createElementExtended('a', {
                            attributes: { 'href': '/explore?q=hottest' },
                            text: 'Hot',
                        })
                    ],
                    prevSibling: liExplorer
                })
                createElementExtended('li', {
                    children: [
                        createElementExtended('a', {
                            attributes: { 'href': '/explore?q=new' },
                            text: 'New',
                        })
                    ],
                    prevSibling: liExplorer
                })

                explorerButtonSet.add(explorerButton)
            }
        }
    })

    registerDomNodeInserted(onNodeChanged)

    console.log(`End - ${script_id}`)
})()
