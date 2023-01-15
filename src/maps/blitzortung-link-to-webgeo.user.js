// ==UserScript==
// @name         blitzortung-link-to-webgeo
// @namespace    https://github.com/gissehel/userscripts
// @version      1.0.2
// @description  blitzortung-link-to-webgeo
// @author       none
// @homepage     https://github.com/gissehel/userscripts
// @match        https://map.blitzortung.org/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    console.log('blitzortung-link-to-webgeo start');

    let allowChanges = true;
    let el = document.documentElement;
    const link = document.createElement('a');
    link.setAttribute('href', '#');
    link.setAttribute('style', 'right: 88px;background-image: url(\'https://github.com/webgiss/webgeo/raw/master/res/earth-32.png\'); background-repeat: round; border-radius: 50px');
    link.classList.add('MenuButtonDiv');

    const realLink = document.createElement('a');
    realLink.setAttribute('href', '#');
    realLink.setAttribute('target', '_blank');

    const ondomchanged = () => {
        if (allowChanges) {
            allowChanges = false;
            const menuBase = document.querySelector('#MenuButtonDiv');
            if (menuBase) {
                const parent = menuBase.parentElement;
                parent.append(link);
            } else {
                allowChanges = true;
            }
        }
    };

    const onGoToWebgeo = (e) => {
        e.preventDefault();

        const params = location.hash.substring(1).split('/')
        if (params.length > 0) {
            const [zoom, lat, lon] = params.map(x => Number(x))
            const osmPosition = `map=${zoom+1}/${lat}/${lon}`;
            realLink.setAttribute('href', `https://webgiss.github.io/webgeo/#${osmPosition}`);
            realLink.click();
        }
        return true;
    }

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log('blitzortung-link-to-webgeo installed');
})();
