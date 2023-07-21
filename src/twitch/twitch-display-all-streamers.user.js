// ==UserScript==
// @name         twitch-display-all-streamers
// @namespace    https://github.com/gissehel/userscripts
// @version      1.0.0
// @description  Display all streamers followed in the side bar
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://twitch.tv/*
// @match        https://www.twitch.tv/*
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



    const delay = (timeout, data) => new Promise((resolve) => {
        setTimeout(() => {
            resolve(data)
        }, timeout)
    })

    const getFollowedChannelZone = () => {
        return document.querySelector('[aria-label="Followed Channels"]')
    }

    const showMoreChannels = (followedChannelZone) => {
        const button = followedChannelZone.querySelector('[data-a-target="side-nav-show-more-button"]')
        if (button) {
            button.click()
            return true
        }
        return false
    }

    const showAllChannels = async (followedChannelZone) => {
        let cont = true
        while (cont) {
            console.log('cont')
            cont = showMoreChannels(followedChannelZone)
            await delay(50)
        }
    }

    const openAllChannels = async () => {
        return new Promise((resolve) => {
            registerDomNodeInsertedUnique(() => [getFollowedChannelZone()], (followedChannelZone) => {
                console.log({ followedChannelZone })
                showAllChannels(followedChannelZone).then(() => resolve())
            })
        })
    }

    const main = () => {
        console.log({ message: 'in main' })
        openAllChannels().then(() => console.log('x'))

    }

    addStyle(`.side-nav-card:has(> a > .side-nav-card__avatar--offline) { height: 20px; } `)
    addStyle(`.side-nav-card:has(> a > .side-nav-card__avatar--offline):hover { height: 42px; } `)
    addStyle(`.side-nav-card__avatar--offline { overflow: hidden; transform: scale(0.5); }`)
    main()

    console.log(`End - ${script_id}`)
})()
