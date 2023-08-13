// ==UserScript==
// @version      3.0.0
// @description  openstreetmap-link-to-webgeo
// @match        https://openstreetmap.org/*
// @match        https://www.openstreetmap.org/*
// ==/UserScript==

// @import{addStyle}
// @import{registerClickListener}
// @import{registerDomNodeInsertedUnique}
// @import{createElementExtended}
// @import{openLinkInNewTab}

const navLink = createElementExtended('li', {
    children: [
        createElementExtended('a', {
            attributes: {
                href: '#',
            },
            children: [
                createElementExtended('img', {
                    attributes: {
                        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADdgAAA3YBfdWCzAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAJuSURBVDiNlZLLS1RRHMc/9555+B5v1JhK6PigRZrGWFlSUSlRumjjJgPBgnYt2kW7/oHAXEjkItoUlBsLe0guWhiiaeAYWDI+0GEcBx0nnevce+5tMTY+kqDv6nDO9/v9ffl9j8Ie+KEauA1cBkq3rmeAAQWejsDETr7y51ABbg88wuG9g/euiqcZMipTj/oUxN7C0mOpmEvdCbgXgGTaYEvcj9Z6kZIeELl7g6Ug4zDbASuvPulwNQBJAeCDLrTWVspeguoGYLP8Ha7mTpwNrzGLRjDDRxDJQtBaQQ/4hD6phaBf8UM1Du84VT9VRC7J0kHcDb0Un17A5Xakh899yyD5pBvVzAK5BhMVUjUjNaIIHnD4fr2dfx7jykNKbvRxqDKBcKi70ucVGESiy4j5+lRKW1et+OCmCjSS34Je84yDZ8bY+GUSDetEwzqxtQSmNFPbVhRy64a3HT0tKNCk+CHOiXgOag7SGQPFSnMsVUdq09ieBYTbhLUCXMHG7YWO58UdgI1tAyAMz67YAnCGCiG0XyU2gK0C82xO71/bv5DSzKnAR2Jv/t8g1gfwQamDKjtVo7AdmRjnOsmpHSO5WERy+BquuQt/i2UMJiqkZS4fF4uwVGyte21j6pTZ8YWj1yfxeCVa+SrZdUOsOMcRPy6x/ettCLbBxmjXV3guADQYcCW+nzUPZpSpvmyy8lJkp1PlQGWU8GICR6g2NTnYhr3aO6BAewgsARABqcELV2BWW/8c8a9QrOpuE0uRSNtgfcZAHRqG4E3JxmiXAu2jYLAjVxon4ZiEWwo0yUx8lguccWaweG9BzxhM7uT/BkHD6xG17TgoAAAAAElFTkSuQmCC',
                        width: '16',
                        height: '16',
                    },
                    classnames: ['webgeo-icon'],
                }),
                createElementExtended('span', {
                    text: 'WebGeo',
                }),
            ],
            classnames: ['nav-link'],
            onCreated: (link) => {
                registerClickListener(link, () => {
                    const urlArgs = document.URL.split('#')[1];
                    let osmPosition = null;
                    if (urlArgs) {
                        osmPosition = urlArgs.split('&').filter(part => part.startsWith('map='));
                    }
                    if (osmPosition) {
                        openLinkInNewTab(`https://webgiss.github.io/webgeo/#${osmPosition}`);
                        return true;
                    }
                    return false;
                }, false)
            },
        })
    ],
})

registerDomNodeInsertedUnique(() => document.querySelectorAll('nav.secondary'), (panel) => {
    const subpanel = panel.children[0];
    const firstLink = subpanel.children[0];
    if (firstLink) {
        const className = firstLink.className;
        navLink.className = `${className} webgeo`;
        subpanel.insertBefore(navLink, firstLink);

        return;
    }
})

addStyle('.webgeo-icon { vertical-align: sub; margin-right: 3px; margin-top: 5px; }')
