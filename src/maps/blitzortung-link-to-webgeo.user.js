// ==UserScript==
// @name         blitzortung-link-to-webgeo
// @namespace    https://github.com/gissehel/userscripts
// @version      1.1.0
// @description  blitzortung-link-to-webgeo
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://map.blitzortung.org/*
// @icon         https://github.com/webgiss/webgeo/raw/master/res/earth-64.png
// @grant        none
// ==/UserScript==

(() => {
    const script_name = GM_info?.script?.name || 'no-name'
    const script_version = GM_info?.script?.version || 'no-version'
    const script_id = `${script_name} ${script_version}`
    console.log(`Begin - ${script_id}`)

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
            const osmPosition = `map=${zoom + 1}/${lat}/${lon}`;
            realLink.setAttribute('href', `https://webgiss.github.io/webgeo/#${osmPosition}`);
            realLink.click();
        }
        return true;
    }

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log(`End - ${script_id}`)
})()
