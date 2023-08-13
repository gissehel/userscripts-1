// ==UserScript==
// @version      3.0.0
// @description  blitzortung-link-to-webgeo
// @match        https://map.blitzortung.org/*
// ==/UserScript==

// @import{registerEventListener}
// @import{registerClickListener}
// @import{registerDomNodeInsertedUnique}
// @import{createElementExtended}
// @import{openLinkInNewTab}

registerDomNodeInsertedUnique(() => document.querySelectorAll('#MenuButtonDiv'), (menuBase) => {
    createElementExtended('a', {
        attributes: {
            href: '#',
            style: 'right: 88px;background-image: url(\'https://webgiss.github.io/webgeo/earth-32.png\'); background-repeat: round; border-radius: 50px',
        },
        parent: menuBase.parentElement,
        classnames: ['MenuButtonDiv'],
        onCreated: (element) => {
            registerClickListener(element, () => {
                const params = location.hash.substring(1).split('/')
                if (params.length > 0) {
                    const [zoom, lat, lon] = params.map(x => Number(x))
                    const osmPosition = `map=${zoom + 1}/${lat}/${lon}`;
                    openLinkInNewTab(`https://webgiss.github.io/webgeo/#${osmPosition}`)
                }
                return true;
            }, false);
        }
    })

})