// ==UserScript==
// @version      3.0.1
// @description  twitch-picture-in-picture
// ==/UserScript==

// @import{registerEventListener}
// @import{registerDomNodeInsertedUnique}
// @import{createElementExtended}
// @import{getElements}

registerDomNodeInsertedUnique(() => getElements('.top-nav__prime'), (nav_menu) => {
    createElementExtended('div', {
        text: 'PiP',
        classnames: ['pip-button'],
        nextSibling: nav_menu,
        onCreated: (pipNode) => {
            pipNode.style.fontWeight = 'bold'
            pipNode.style.cursor = 'pointer'
            registerEventListener(pipNode, 'click', () => {
                (
                    getElements('video').reduce(
                        (prev, current) => (prev.offsetHeight > current.offsetHeight) ? prev : current,
                        {
                            requestPictureInPicture: () => Promise.reject('No video found')
                        }
                    ).requestPictureInPicture()
                ).catch(err => alert(err))
            }, false)
        }
    })
})
