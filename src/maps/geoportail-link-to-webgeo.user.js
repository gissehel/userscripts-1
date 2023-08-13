// ==UserScript==
// @version      3.0.0
// @description  geoportail-link-to-webgeo
// @match        https://geoportail.gouv.fr/*
// @match        https://www.geoportail.gouv.fr/*
// ==/UserScript==

// @import{addStyle}
// @import{registerClickListener}
// @import{registerDomNodeInsertedUnique}
// @import{createElementExtended}
// @import{openLinkInNewTab}

registerDomNodeInsertedUnique(() => document.querySelectorAll('#reverse-geocoding-coords'), (coords) => {
    const parent = coords?.parentElement;
    if (parent) {
        createElementExtended('div', {
            id: 'reverse-geocoding-link-to-webgeo',
            parent: parent,
            children: [
                createElementExtended('a', {
                    attributes: {
                        href: '#'
                    },
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
                            text: 'Link to WebGeo',
                        }),
                    ],
                    classnames: ['nav-link'],
                    onCreated: (link) => {
                        registerClickListener(link, () => {
                            const coords = document.querySelectorAll('#reverse-geocoding-coords')[0]
                            if (coords) {
                                const text = coords.textContent;
                                const [lat, lon] = text.split(',').map((str) => str.replace(' ', ''))
                                const element = document.querySelector('#numeric-scale')
                                element.dispatchEvent(new MouseEvent('mouseover'))
                                const zoom = element?.getAttribute('title')?.split('\n')?.filter(x => x.startsWith('Zoom : '))?.map(x => x.split(' : '))?.[0]?.[1] || 18
                                const osmPosition = `map=${zoom}/${lat}/${lon}`;
                                openLinkInNewTab(`https://webgiss.github.io/webgeo/#${osmPosition}`)
                                return true;
                            }
                            return false;
                        }, false)
                    },
                })
            ],
        })
        return true
    }
    return false
})

addStyle('.webgeo-icon { vertical-align: sub; margin-right: 3px; margin-top: 4px; }')
