// ==UserScript==
// @version      3.0.0
// @description  Add buttons for 'Hot' and 'New' explorer entries
// ==/UserScript==

// @import{createElementExtended}
// @import{registerDomNodeInsertedUnique}

registerDomNodeInsertedUnique(() => [...document.querySelectorAll('[data-testid=ExploreBtn]')], (explorerButton) => {
    const liExplorer = explorerButton.parentElement
    createElementExtended('li', {
        children: [
            createElementExtended('a', {
                attributes: { 'href': '/explore?q=hottest' },
                text: 'Hot',
            })
        ],
        prevSibling: liExplorer
    })
    createElementExtended('li', {
        children: [
            createElementExtended('a', {
                attributes: { 'href': '/explore?q=new' },
                text: 'New',
            })
        ],
        prevSibling: liExplorer
    })
})
