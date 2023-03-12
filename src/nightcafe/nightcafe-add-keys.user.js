// ==UserScript==
// @name        nightcafe-add-keys
// @namespace   https://github.com/gissehel/userscripts
// @match       https://creator.nightcafe.studio/*
// @grant       none
// @version     1.0.10
// @author      none
// @description Add keys to nightcafe.studio. Alt+s : Like/Unlike ; Alt+f : Shade or Unshade the liked images
// ==/UserScript==

const registerKeyStruct = (() => {
    const getNormalizedBool = (x) => x ? true : false

    const normalizeKeyStruct = (keyStruct) => {
        let { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = keyStruct
        altKey = getNormalizedBool(altKey)
        shiftKey = getNormalizedBool(shiftKey)
        ctrlKey = getNormalizedBool(ctrlKey)
        metaKey = getNormalizedBool(metaKey)
        isComposing = getNormalizedBool(isComposing)
        return { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing }
    }

    const getKeyStructKeyId = (keyStruct) => {
        const { key, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (key) {
            return `${key}-undefined-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }

    const getKeyStructCodeId = (keyStruct) => {
        const { code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (code) {
            return `undefined-${code}-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }

    const getKeyStructIds = (keyStruct) => {
        return [getKeyStructKeyId, getKeyStructCodeId].map((f) => f(keyStruct)).filter((keyStruct) => keyStruct !== null)
    }

    const keyBindings = {}

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


const likeOrUnlike = (e) => {
    const likeOrUnlikeButtons = [...document.querySelectorAll('[data-testid="JobPopup"] button[title=Unlike]'), ...document.querySelectorAll('[data-testid="JobPopup"] button[title=Like]')]
    if (likeOrUnlikeButtons.length > 0) {
        likeOrUnlikeButtons[0].click()
    }

    e.preventDefault()
}

const parentsElement = (element, depth) => {
    let current_element = element
    for (let index = 0; index < depth; index++) {
        current_element = current_element?.parentElement
    }
    return current_element
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

registerDomNodeInserted(onDomChanged)

const unregisterLikeOrUnlike = registerKeyStruct({ key: 's', altKey: true }, likeOrUnlike);
const unregisterShadeOrUnshadeLiked = registerKeyStruct({ key: 'f', altKey: true }, shadeOrUnshadeLiked);

addStyle('.shadeLiked .isLiked { opacity: 0.3; }')
addStyle('.hidden-element { display: none !important; } ')
addStyle('.isNotLiked .mdi-icon[width="28"] { width: 100px; height: 100px; }')
addStyle('.isNotLiked .mdi-icon[width="30"] { display: none; }')

