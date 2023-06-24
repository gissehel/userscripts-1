// ==UserScript==
// @name         twitch-picture-in-picture
// @namespace    https://github.com/gissehel/userscripts
// @version      1.1.0
// @description  twitch-picture-in-picture
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://twitch.tv/*
// @match        https://www.twitch.tv/*
// @icon         https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png
// @grant        none
// ==/UserScript==

(() => {
    const script_name = GM_info?.script?.name || 'no-name'
    const script_version = GM_info?.script?.version || 'no-version'
    const script_id = `${script_name} ${script_version}`
    console.log(`Begin - ${script_id}`)

    const installer = () => {
        const nav_menu = document.querySelector('.top-nav__prime')
        // console.log({nav_menu, timer})
        if (nav_menu !== null && timer !== null) {
            clearInterval(timer)
            timer = null
            const pipNode = document.createElement('div')
            pipNode.innerText = 'PiP'
            nav_menu.parentElement.insertBefore(pipNode, nav_menu)
            pipNode.style.fontWeight = 'bold'
            pipNode.style.cursor = 'pointer'
            // console.log({pipNode, nav_menu, timer})
            pipNode.addEventListener('click', () => {
                (
                    [...document.getElementsByTagName('video')].reduce(
                        (prev, current) => (prev.offsetHeight > current.offsetHeight) ? prev : current,
                        {
                            requestPictureInPicture: () => Promise.reject('No video found')
                        }
                    ).requestPictureInPicture()
                ).catch(err => alert(err))
            }, false)
        }
    }
    let timer = setInterval(() => installer(), 1000)

    console.log(`End - ${script_id}`)
})()
