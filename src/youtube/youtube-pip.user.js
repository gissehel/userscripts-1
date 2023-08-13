// ==UserScript==
// @version      3.0.0
// @description  youtube-pip
// @match        https://youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// ==/UserScript==

// @import{registerDomNodeMutated}
// @import{registerDomNodeMutatedUnique}
// @import{createElementExtended}
// @import{addStyle}
// @import{getSubElements}
// @import{getElements}
// @import{bindOnClick}

registerDomNodeMutatedUnique(() => [
    ...getElements('#buttons.ytd-masthead'),
    ...getElements('#actions-inner>#menu>ytd-menu-renderer'),
    // ...getElements('.slim-video-action-bar-actions'),
    ...getElements('ytm-slim-owner-renderer'),
], (buttons) => {
    if (buttons && buttons.childElementCount >= 1) {
        const subbuttons = getSubElements(buttons, '.pip-text-button')
        if (subbuttons.length > 0) {
            return false
        }
        const pipButton = createElementExtended('div', {
            attributes: {
                title: 'Picture in Picture',
                'use-keyboard-focused': '',
                'is-icon-button': '',
                'has-no-text': '',
            },
            classList: ['style-scope', 'ytd-masthead', 'style-default'],
            children: [
                createElementExtended('a', {
                    attributes: {
                        'aria-label': 'Picture in Picture',
                        'href': '#',
                    },
                    classnames: ['pip-link-button'],
                    children: [
                        createElementExtended('div', {
                            attributes: {
                                'icon': 'PiP',
                            },
                            text: 'PiP',
                            classnames: ['style-scope', 'ytd-topbar-menu-button-renderer', 'pip-text-button'],
                        }),
                    ],
                    onCreated: (element) => {
                        bindOnClick(element, () => {
                            const video = getElements('video')[0]
                            if (video) {
                                video.requestPictureInPicture()
                            }
                            return true
                        })
                    },
                })
            ],
            parent: buttons,
        })
        return false
    } else {
        return false
    }
})

addStyle(`.pip-text-button { width: 36px; height: 36px; text-align: center; alignment-baseline: middle; line-height: 36px; color: #0f0f0f; background-color: #f0f0f0; border-radius: 50%; font-weight: bold; margin-left: 5px; }`)
addStyle(`.pip-link-button { text-decoration: none; }`)

// Disable stopping the video when tab changes
document.addEventListener("visibilitychange", (e) => { e.stopImmediatePropagation(); }, true);
