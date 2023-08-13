// ==UserScript==
// @version      3.0.0
// @description  bingmaps-link-to-webgeo
// @match        https://bing.com/maps
// @match        https://www.bing.com/maps
// ==/UserScript==

// @import{addStyle}
// @import{registerEventListener}
// @import{registerClickListener}
// @import{registerDomNodeInserted}
// @import{registerDomNodeInsertedUnique}
// @import{createElementExtended}
// @import{openLinkInNewTab}

registerDomNodeInsertedUnique(() => document.querySelectorAll('.top-right.subcontrol-container'), (container) => {
    if (container.querySelectorAll('[aria-label="Pitch Control"]').length === 0) {
        return false
    }
    createElementExtended('div', {
        classnames: ['azure-maps-control-container', 'light'],
        parent: container,
        children: [
            createElementExtended('a', {
                attributes: {
                    href: '#',
                },
                children: [
                    createElementExtended('img', {
                        attributes: {
                            src: 'https://webgiss.github.io/webgeo/earth-32.png',
                            width: '32px',
                            height: '32px',
                        },
                    })
                ],
                onCreated: (image) => {
                    registerClickListener(image, () => {
                        const bingPosition = Object.fromEntries(document.URL.split('?')[1].split('&').map(data => data.split('=')))
                        if (bingPosition) {
                            const [lat, lon] = bingPosition.cp.split('%7E')
                            const zoom = Number.parseInt(bingPosition.lvl)
                            openLinkInNewTab(`https://webgiss.github.io/webgeo/#map=${zoom}/${lat}/${lon}`)
                        }
                        return false;
                    })
                },
            })
        ],
    })
    return true
})
