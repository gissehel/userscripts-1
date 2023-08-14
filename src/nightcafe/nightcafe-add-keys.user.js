// ==UserScript==
// @version      3.0.1
// @description  Add keys to nightcafe.studio. Alt+s : Like/Unlike ; Alt+f : Shade or Unshade the liked images
// ==/UserScript==

// @import{registerKeyStruct}
// @import{addStyle}
// @import{registerDomNodeInserted}
// @import{parentsElement}

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

registerDomNodeInserted(onDomChanged)

const unregisterLikeOrUnlike = registerKeyStruct({ key: 's', altKey: true }, likeOrUnlike);
const unregisterShadeOrUnshadeLiked = registerKeyStruct({ key: 'f', altKey: true }, shadeOrUnshadeLiked);

addStyle('.shadeLiked .isLiked { opacity: 0.3; }')
addStyle('.hidden-element { display: none !important; } ')
addStyle('.isNotLiked .mdi-icon[width="28"] { width: 100px; height: 100px; }')
addStyle('.isNotLiked .mdi-icon[width="30"] { display: none; }')

