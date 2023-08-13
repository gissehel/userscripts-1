// ==UserScript==
// @version      3.0.0
// @description  Display all streamers followed in the side bar
// ==/UserScript==

// @import{addStyle}
// @import{registerDomNodeInsertedUnique}
// @import{delay}

const getFollowedChannelZone = () => {
    return document.querySelector('[aria-label="Followed Channels"]')
}

const showMoreChannels = (followedChannelZone) => {
    const button = followedChannelZone.querySelector('[data-a-target="side-nav-show-more-button"]')
    if (button) {
        button.click()
        return true
    }
    return false
}

const showAllChannels = async (followedChannelZone) => {
    let cont = true
    while (cont) {
        console.log('cont')
        cont = showMoreChannels(followedChannelZone)
        await delay(50)
    }
}

const openAllChannels = async () => {
    return new Promise((resolve) => {
        registerDomNodeInsertedUnique(() => [getFollowedChannelZone()], (followedChannelZone) => {
            console.log({ followedChannelZone })
            showAllChannels(followedChannelZone).then(() => resolve())
        })
    })
}

const main = () => {
    console.log({ message: 'in main' })
    openAllChannels().then(() => console.log('x'))

}

addStyle(`.side-nav-card:has(> a > .side-nav-card__avatar--offline) { height: 20px; } `)
addStyle(`.side-nav-card:has(> a > .side-nav-card__avatar--offline):hover { height: 42px; } `)
addStyle(`.side-nav-card__avatar--offline { overflow: hidden; transform: scale(0.5); }`)
main()
