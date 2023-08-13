// ==UserScript==
// @version      3.0.0
// @description  nullschool-link-to-webgeo
// @match        https://earth.nullschool.net/*
// @match        https://classic.nullschool.net/*
// ==/UserScript==

// @import{addStyle}
// @import{registerClickListener}
// @import{registerDomNodeInsertedUnique}
// @import{createElementExtended}
// @import{openLinkInNewTab}

const title = createElementExtended('h1', {
    children: [
        createElementExtended('a', {
            attributes: {
                href: '#'
            },
            classnames: ['nav-link'],
            children: [
                createElementExtended('button', {
                    attributes: {
                        'data-name': 'webgeo',
                        'aria-controls': 'menu',
                        'aria-labelledby': 'webgeo webgeo-tt',
                        'data-tooltip': 'webgeo-tt',
                        'title': 'Go to webgeo',
                        'aria-expanded': 'true',
                    },
                    classnames: ['card', 'no-touch-tt'],
                    children: [
                        createElementExtended('img', {
                            attributes: {
                                src: 'https://webgiss.github.io/webgeo/earth-16.png',
                                width: '16',
                                height: '16',
                            },
                            classnames: ['webgeo-icon'],
                        }),
                        createElementExtended('span', {
                            text: 'WebGeo',
                        }),
                    ],
                }),
            ],
            onCreated: (link) => {
                registerClickListener(link, () => {
                    const locs = location.hash.split('/').filter(x => x.startsWith('loc='));
                    if (locs.length > 0) {
                        const loc = locs[0].substring('loc='.length)
                        const [lon, lat] = loc.split(',').map(x => Number(x))
                        const osmPosition = `map=${12}/${lat}/${lon}`
                        openLinkInNewTab(`https://webgiss.github.io/webgeo/#${osmPosition}`)
                    }
                    return true
                })
            }
        })
    ],
})

registerDomNodeInsertedUnique(() => document.querySelectorAll('h1'), (titleBase) => {
    const parent = titleBase.parentElement;
    if (parent) {
        parent.append(title);
        return true
    }
    return false
})

addStyle('.webgeo-icon { margin-right: 0.5em; }')
