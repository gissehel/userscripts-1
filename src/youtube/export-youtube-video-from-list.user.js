// ==UserScript==
// @name         export-youtube-video-from-list
// @namespace    https://github.com/gissehel/userscripts
// @version      1.1.1
// @description  Export youtube video information in markdown format
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @icon         https://www.youtube.com/s/desktop/0e9d1cf9/img/favicon.ico
// @grant        none
// ==/UserScript==

(() => {
    const script_name = GM_info?.script?.name || 'no-name'
    const script_version = GM_info?.script?.version || 'no-version'
    const script_id = `${script_name} ${script_version}`
    console.log(`Begin - ${script_id}`)

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
     * Copy some text to clipboard
     * 
     * @param {string} text text to copy to clipboard
     * @returns 
     */
    const copyTextToClipboard = async (text) => {
        if (!navigator.clipboard) {
            console.log(`Can't copy [${test}] : No navigator.clipboard API`)
            return;
        }

        await navigator.clipboard.writeText(text)
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

    addStyle('.eyvfl-export-button { width: 60px; height: 30px; position: absolute; bottom: 0px; right: 0px; }')
    addStyle('.eyvfl-export-button2 { width: 60px; height: 30px; position: absolute; bottom: 0px; right: 70px; }')

    const getVideoTitle = (richItemRenderer) => getSubElements(richItemRenderer, '[id=video-title]')[0]?.textContent
    const getVideoLink = (richItemRenderer) => getSubElements(richItemRenderer, '#video-title-link')[0]?.href

    let buffer = ''

    registerDomNodeInsertedUnique(() => getElements('ytd-rich-item-renderer'), (richItemRenderer) => {
        const videoTitle = getVideoTitle(richItemRenderer)
        const videoLink = getVideoLink(richItemRenderer)
        if ((videoTitle === undefined) || (videoLink === undefined) || (videoTitle === '') || (videoLink === '')) {
            return false
        }

        const buttonCreator = (label, classname, preAction) => createElementExtended('button', {
            parent: richItemRenderer,
            classnames: [classname],
            text: label,
            onCreated: (button) => {
                bindOnClick(button, () => {
                    // BUGFIX : Those may have changed, get latest values !
                    const videoTitle = getVideoTitle(richItemRenderer)
                    const videoLink = getVideoLink(richItemRenderer)

                    if (preAction !== undefined) {
                        preAction()
                    }
                    const markdown = `- TODO ${videoTitle}\n  - {{video ${videoLink}}}\n`
                    buffer += markdown
                    console.log(`Copying [${buffer}]`)
                    copyTextToClipboard(buffer)
                })
            }
        })

        buttonCreator('➡️📋', 'eyvfl-export-button', () => buffer = '')
        buttonCreator('➕📋', 'eyvfl-export-button2')
    })

    console.log(`End - ${script_id}`)
})()
