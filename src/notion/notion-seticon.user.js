// ==UserScript==
// @version      1.0.2
// @description  Fix notion "set icon" that randomly don't set page icon to tab icon
// ==/UserScript==

// @import{registerDomNodeMutatedUnique}
// @import{getSubElements}
// @import{getElements}

registerDomNodeMutatedUnique(() => getElements('.pseudoSelection>.notion-record-icon'), (icon_container) => {
    const hrefs = getSubElements(icon_container, 'img')
        .map((image)=>image.getAttribute('src'))
        .filter((href)=>href.startsWith('https://'))

    if (hrefs.length === 0) {
        return false
    }
    const href = hrefs[hrefs.length - 1]

    const xicons = getElements('head > [type="image/x-icon"]')
    if (xicons.length === 0) {
        return false
    }
    const xicon = xicons[xicons.length - 1]

    xicon.setAttribute('href', href)

    return true
})
