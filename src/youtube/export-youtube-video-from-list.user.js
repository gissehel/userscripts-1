// ==UserScript==
// @name         export-youtube-video-from-list
// @namespace    http://github.com/gissehel/userscripts
// @version      1.0.0
// @description  Export youtube video information in markdown format
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://youtube.com/*/videos
// @grant        none
// ==/UserScript==

(() => {
    const script_name = GM_info.script.name
    const script_version = GM_info.script.version
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

    addStyle('.eyvfl-export-button { width: 60px; height: 30px; position: absolute; bottom: 0px; right: 0px; }')

    registerDomNodeInsertedUnique(()=>getElements('ytd-rich-item-renderer'), (richItemRenderer) => {
        const button = document.createElement('button')
    	const videoTitle = getSubElements(richItemRenderer,'[id=video-title]')[0]?.textContent
    	const videoLink = getSubElements(richItemRenderer,'#video-title-link')[0]?.href
        if ((videoTitle === undefined) || (videoLink === undefined) || (videoTitle === '') || (videoLink === '')) {
        	return false
        }
        button.classList.add('eyvfl-export-button')
        button.textContent='➡️📋'
        button.addEventListener('click', (e)=>{
            const markdown = `- TODO ${videoTitle}\n  - {{video ${videoLink}}}`
            console.log(`Copying [${markdown}]`)
            copyTextToClipboard(markdown)
            e.preventDefault()
        }, false);

        richItemRenderer.appendChild(button)
    })

    console.log(`End - ${script_id}`)
})()
