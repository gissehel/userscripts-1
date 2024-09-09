// ==UserScript==
// @version      3.0.2
// @description  Export youtube video information in markdown format
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// ==/UserScript==

// @import{getSubElements}
// @import{getElements}
// @import{addStyle}
// @import{registerDomNodeMutatedUnique}
// @import{copyTextToClipboard}
// @import{createElementExtended}
// @import{bindOnClick}

addStyle('.eyvfl-export-button { width: 60px; height: 30px; position: absolute; bottom: 0px; right: 0px; }')
addStyle('.eyvfl-export-button2 { width: 60px; height: 30px; position: absolute; bottom: 0px; right: 70px; }')

const getVideoTitle = (richItemRenderer) => getSubElements(richItemRenderer, '[id=video-title]')?.map(x=>x.textContent)?.join(' ')?.trim()
const getVideoLink = (richItemRenderer) => getSubElements(richItemRenderer, '#video-title-link')[0]?.href

let buffer = ''

registerDomNodeMutatedUnique(() => getElements('ytd-rich-item-renderer'), (richItemRenderer) => {
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
