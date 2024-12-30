// ==UserScript==
// @name        nightcafe-add-keys
// @namespace   https://github.com/gissehel/userscripts
// @version     3.0.10
// @description Add keys to nightcafe.studio. Alt+s : Like/Unlike ; Alt+f : Shade or Unshade the liked images
// @author      gissehel
// @homepage    https://github.com/gissehel/userscripts
// @supportURL  https://github.com/gissehel/userscripts/issues
// @match       https://creator.nightcafe.studio/*
// @icon        https://creator.nightcafe.studio/favicon-32x32.png
// @grant       none
// ==/UserScript==

const script_name = GM_info?.script?.name || 'no-name'
const script_version = GM_info?.script?.version || 'no-version'
const script_id = `${script_name} ${script_version}`
console.log(`Begin - ${script_id}`)


// @imported_begin{registerKeyStruct}
/**
 * @typedef {Object} KeyStruct A key event
 * @property {string} key The key value of the key represented by the event
 * @property {string} code The code value of the key represented by the event
 * @property {boolean} altKey  Whether the ALT key was pressed when this event was fired
 * @property {boolean} shiftKey Whether the SHIFT key was pressed when this event was fired
 * @property {boolean} ctrlKey Whether the CTRL key was pressed when this event was fired
 * @property {boolean} metaKey Whether the META key was pressed when this event was fired
 * @property {boolean} isComposing Whether the key is being held down such that it is automatically repeating
 */

/**
 * @typedef {Object} KeyActionEvent
 * @property {()=>{}} preventDefault Prevent the default action of the key event
 */

/**
 * @typedef {(event: KeyActionEvent)=>{}} KeyAction The action to associate with a key event
 */


/**
 * Register a keyStruct with an action
 * 
 * @param {KeyStruct} keyStruct 
 * @param {KeyAction} action 
 * @returns {void}
 */
const registerKeyStruct = (() => {

    /**
     * Return a boolean that is always true or false even if the input is not a boolean but has a truthy or falsy value
     * 
     * @param {boolean} x The input value
     * @returns {boolean}
     */
    const getNormalizedBool = (x) => x ? true : false

    /**
     * Ensure the keyStruct has the correct format
     * 
     * @param {KeyStruct} keyStruct 
     * @returns {KeyStruct}
     */
    const normalizeKeyStruct = (keyStruct) => {
        let { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = keyStruct
        altKey = getNormalizedBool(altKey)
        shiftKey = getNormalizedBool(shiftKey)
        ctrlKey = getNormalizedBool(ctrlKey)
        metaKey = getNormalizedBool(metaKey)
        isComposing = getNormalizedBool(isComposing)
        return { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing }
    }

    /**
     * Get a unique id for the keyStruct based on the key value
     * Be sure that two different KeyStructs with the same key value have the same id
     * 
     * @param {KeyStruct} keyStruct The keyStruct to get the id for
     * @returns {string}
     */
    const getKeyStructKeyId = (keyStruct) => {
        const { key, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (key) {
            return `${key}-undefined-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }

    /**
     * Get a unique id for the keyStruct based on the code value
     * Be sure that two different KeyStructs with the same code value have the same id
     * 
     * @param {KeyStruct} keyStruct The keyStruct to get the id for
     * @returns 
     */
    const getKeyStructCodeId = (keyStruct) => {
        const { code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (code) {
            return `undefined-${code}-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }


    /**
     * Get the ids for the keyStruct (the key one, the code one or both)
     * @param {KeyStruct} keyStruct The keyStruct to get the ids for
     * @returns {string[]}
     */
    const getKeyStructIds = (keyStruct) => {
        return [getKeyStructKeyId, getKeyStructCodeId].map((f) => f(keyStruct)).filter((keyStruct) => keyStruct !== null)
    }

    /**
     * @type {Object.<string, {keyStruct: KeyStruct, actions: KeyAction[]}>}
     */
    const keyBindings = {}

    /**
     * Register a keyStruct with an action
     * 
     * @param {KeyStruct} keyStruct 
     * @param {KeyAction} action 
     * @returns {void}
     */
    const registerKeyStruct = (keyStruct, action) => {
        for (let keyStructId of getKeyStructIds(keyStruct)) {
            if (!keyBindings[keyStructId]) {
                keyBindings[keyStructId] = {
                    keyStruct: normalizeKeyStruct(keyStruct),
                    actions: [],
                }
            }
            keyBindings[keyStructId].actions.push(action)
            return () => {
                const index = keyBindings[keyStructId].actions.indexOf(action)
                if (index >= 0) {
                    keyBindings[keyStructId].actions.splice(index, 1)
                }
            }
        }
    }

    const onKeyDown = (e) => {
        let handled = false
        for (let keyStructId of getKeyStructIds(e)) {
            if (!handled) {
                if (keyBindings[keyStructId]) {
                    for (let code of keyBindings[keyStructId].actions) {
                        code({
                            preventDefault: () => e.preventDefault(),
                        })
                        handled = true
                        return
                    }
                }
            }
        }
    }

    document.addEventListener('keydown', onKeyDown)
    window.keyBindings = keyBindings

    return registerKeyStruct;
})()
// @imported_end{registerKeyStruct}

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

// @imported_begin{parentsElement}
/**
 * Get the depth'th parent of the element
 * 
 * @param {HTMLElement} element 
 * @param {Number} depth 
 * @returns {HTMLElement}
 */
const parentsElement = (element, depth) => {
    let current_element = element
    for (let index = 0; index < depth; index++) {
        current_element = current_element?.parentElement
    }
    return current_element
}
// @imported_end{parentsElement}

// @main_begin{nightcafe-add-keys}
const likeOrUnlike = (e) => {
    const likeOrUnlikeButtons = [...document.querySelectorAll('[data-testid="JobPopup"] button[title=Unlike]'), ...document.querySelectorAll('[data-testid="JobPopup"] button[title=Like]')]
    if (likeOrUnlikeButtons.length > 0) {
        likeOrUnlikeButtons[0].click()
    }

    e.preventDefault()
}

const onDomChanged = () => {
    const images = [...document.querySelectorAll('.renderIfVisible')]
    for (let image of images) {
        const parentElementClassList = image.parentElement.classList
        const liked = [...image.querySelectorAll('path[d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"]')]
        if (liked.length > 0) {
            parentElementClassList.add('isLiked')
            parentElementClassList.remove('isNotLiked')
        } else {
            parentElementClassList.add('isNotLiked')
            parentElementClassList.remove('isLiked')
        }
    }
    for (let [pattern, depth] of [["[href*='https://reddit.com/r/nightcafe']", 8], ["[style*='lounge-bg.jpg']", 3], ["[href*='/pricing#pro']", 2]]) {
        const spamZones = [...document.querySelectorAll(pattern)]
        for (let spamZone of spamZones) {
            const zoneToSuppress = parentsElement(spamZone, depth)
            if (zoneToSuppress && !zoneToSuppress.classList.contains('hidden-element')) {
                zoneToSuppress.classList.add('hidden-element')
            }
        }
    }
}

const shadeOrUnshadeLiked = (e) => {
    if (document.body.classList.contains('shadeLiked')) {
        document.body.classList.remove('shadeLiked')
    } else {
        document.body.classList.add('shadeLiked')
    }
    e.preventDefault()
}

const minimiseOrUnminimiseLiked = (e) => {
    if (document.body.classList.contains('minimiseLiked')) {
        document.body.classList.remove('minimiseLiked')
    } else {
        document.body.classList.add('minimiseLiked')
    }
    e.preventDefault()
}

registerDomNodeMutated(onDomChanged)
document.body.classList.add('shadeLiked')

const unregisterLikeOrUnlike = registerKeyStruct({ key: 's', altKey: true }, likeOrUnlike);
const unregisterShadeOrUnshadeLiked = registerKeyStruct({ key: 'f', altKey: true }, shadeOrUnshadeLiked);
const unregisterMinimiseOrUnminimiseLiked = registerKeyStruct({ key: 'm', altKey: true }, minimiseOrUnminimiseLiked);

addStyle('html, body { overflow: auto !important; }')
addStyle('.css-l316jd { position: fixed !important; }')
addStyle('.css-1s2cce1, .css-12ih86r, .css-7hfamk { margin-top: 60px; }')
addStyle('.shadeLiked .isLiked { opacity: 0.3; }')
addStyle('.minimiseLiked .isLiked { height: 10px; overflow: hidden; }')
addStyle('.hidden-element { display: none !important; } ')
addStyle('.css-1ntkoiw { margin-bottom: 1000px; }')
addStyle('.isNotLiked .mdi-icon[width="28"] { width: 100px; height: 100px; }')
addStyle('.isNotLiked .mdi-icon[width="30"] { display: none; }')
// @main_end{nightcafe-add-keys}

console.log(`End - ${script_id}`)
