// ==UserScript==
// @version      3.0.1
// @description  googlemaps-link-to-webgeo
// @match        https://google.com/maps/*
// @match        https://www.google.com/maps/*
// @match        https://google.com/maps
// @match        https://www.google.com/maps
// ==/UserScript==

// @import{addStyle}
// @import{registerClickListener}
// @import{registerDomNodeMutatedUnique}
// @import{createElementExtended}
// @import{openLinkInNewTab}

registerDomNodeMutatedUnique(() => document.querySelectorAll('[data-ogsr-up]'), (panel) => {
    const firstLink = panel?.children?.[0]?.children?.[0];
    if (firstLink) {
        createElementExtended('a', {
            attributes: {
                href: '#'
            },
            classnames: [...firstLink.classList, 'webgeo'],
            children: [
                createElementExtended('img', {
                    attributes: {
                        src: 'https://webgiss.github.io/webgeo/earth-32.png',
                        width: '32',
                        height: '32',
                    }
                })
            ],
            nextSibling: firstLink,
            onCreated: (link) => {
                registerClickListener(link, () => {
                    let googlePosition = document.URL.split('/').filter(part => part.startsWith('@'))[0];
                    if (googlePosition.endsWith('m')) {
                        const [alat, lon, distance] = googlePosition.split(',')
                        const lat = Number.parseFloat(alat.slice(1))
                        const m = Number.parseInt(distance.slice(0, distance.length - 1))
                        const z = Math.log(156543.03392 * Math.cos(lat * Math.PI / 180) * document.body.clientHeight / m) / Math.log(2)
                        googlePosition = `${alat},${lon},${z}z`
                    }
                    if (googlePosition) {
                        openLinkInNewTab(`https://webgiss.github.io/webgeo/#google=${googlePosition}`)
                    }
                    return false;
                })
            }
        })

        return true
    }
    return false
})

addStyle('.webgeo { padding: 0px !important; }')
addStyle('.webgeo:hover { text-decoration: none; }')
