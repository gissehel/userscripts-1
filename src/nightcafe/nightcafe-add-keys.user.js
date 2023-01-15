// ==UserScript==
// @name        nightcafe-add-keys
// @namespace   https://github.com/gissehel/userscripts
// @match       https://creator.nightcafe.studio/*
// @grant       none
// @version     1.0.0
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
        if (key) {
            return { key, altKey, shiftKey, ctrlKey, metaKey, isComposing }
        } else if (code) {
            return { code, altKey, shiftKey, ctrlKey, metaKey, isComposing }
        } else {
            return null
        }
    }

    const getKeyStructId = (keyStruct) => {
        const { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        return `${key}-${code}-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
    }

    const keyBindings = {}

    const registerKeyStruct = (keyStruct, code) => {
        const keyStructId = getKeyStructId(keyStruct)
        if (! keyBindings[keyStructId]) {
            keyBindings[keyStructId] = {
                keyStruct: normalizeKeyStruct(keyStruct),
                codes: [],
            }
        }
        keyBindings[keyStructId].codes.push(code)
        return () => {
            const index = keyBindings[keyStructId].codes.indexOf(code)
            if (index >= 0) {
                keyBindings[keyStructId].codes.splice(index, 1)
            }
        }
    }

    const onKeyDown = (e) => {
        const keyStructId = getKeyStructId(e)
        if (keyBindings[keyStructId]) {
            for(let code of keyBindings[keyStructId].codes) {
                code({
                    preventDefault: () => e.preventDefault(),
                })
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

const likeOrUnlike = (e) => {
    const likeOrUnlikeButtons = [ ...document.querySelectorAll('[data-testid="JobPopup"] button[title=Unlike]'), ...document.querySelectorAll('[data-testid="JobPopup"] button[title=Like]')]
    if (likeOrUnlikeButtons.length > 0) {
        likeOrUnlikeButtons[0].click()
    }

    e.preventDefault()
}

const findLikedImages = () => {
    const images = [...document.querySelectorAll('.renderIfVisible')]
    for (let image of images) {
        const parentElementClassList = image.parentElement.classList
        const liked = [...image.querySelectorAll('path[d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"]')]
        if (liked.length>0) {
            parentElementClassList.add('isLiked')
            parentElementClassList.remove('isNotLiked')
        } else {
            parentElementClassList.add('isNotLiked')
            parentElementClassList.remove('isLiked')
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


document.documentElement.addEventListener('DOMNodeInserted', findLikedImages, false);

const unregisterLikeOrUnlike = registerKeyStruct({key: 's', altKey: true}, likeOrUnlike);
const unregisterShadeOrUnshadeLiked = registerKeyStruct({key: 'f', altKey: true}, shadeOrUnshadeLiked);

addStyle('.shadeLiked .isLiked { opacity: 0.3; }')
