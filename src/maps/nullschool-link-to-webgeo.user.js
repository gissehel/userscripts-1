// ==UserScript==
// @name         nullschool-link-to-webgeo
// @namespace    http://github.com/gissehel/userscripts
// @version      1.0.0
// @description  nullschool-link-to-webgeo
// @author       none
// @homepage     https://github.com/gissehel/userscripts
// @match        https://earth.nullschool.net/*
// @match        https://classic.nullschool.net/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    console.log('nullschool-link-to-webgeo start');

    let allowChanges = true;
    let el = document.documentElement;
    const link = document.createElement('a');
    link.setAttribute('href', '#');
    link.classList.add('nav-link');
    const title = document.createElement('h1');
    title.appendChild(link);
    const button = document.createElement('button');
    button.setAttribute('class', 'card no-touch-tt')
    button.setAttribute('data-name', 'webgeo')
    button.setAttribute('aria-controls', 'menu')
    button.setAttribute('aria-labelledby', 'webgeo webgeo-tt')
    button.setAttribute('data-tooltip', 'webgeo-tt')
    button.setAttribute('title', 'Go to webgeo')
    button.setAttribute('aria-expanded', 'true')
    link.appendChild(button);
    const spanTitle = document.createElement('span');
    spanTitle.textContent = 'WebGeo';
    button.appendChild(spanTitle);

    const realLink = document.createElement('a');
    realLink.setAttribute('href', '#');
    realLink.setAttribute('target', '_blank');

    const ondomchanged = () => {
        if (allowChanges) {
            allowChanges = false;
            const titleBase = document.querySelector('h1');
            if (titleBase) {
                const parent = titleBase.parentElement;
                parent.append(title);
            } else {
                allowChanges = true;
            }
        }
    };

    const onGoToWebgeo = (e) => {
        e.preventDefault();

        const locs = location.hash.split('/').filter(x => x.startsWith('loc='));
        if (locs.length > 0) {
            const loc = locs[0].substring('loc='.length)
            const [lon, lat] = loc.split(',').map(x => Number(x))
            const osmPosition = `map=${12}/${lat}/${lon}`;
            realLink.setAttribute('href', `https://webgiss.github.io/webgeo/#${osmPosition}`);
            realLink.click();
        }
        return true;
    }

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log('nullschool-link-to-webgeo installed');
})();
