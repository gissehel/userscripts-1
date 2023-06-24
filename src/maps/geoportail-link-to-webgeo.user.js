// ==UserScript==
// @name         geoportail-link-to-webgeo
// @namespace    https://github.com/gissehel/userscripts
// @version      1.1.0
// @description  geoportail-link-to-webgeo
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://geoportail.gouv.fr/*
// @match        https://www.geoportail.gouv.fr/*
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
    link.textContent = 'Link to WebGeo';
    link.classList.add('nav-link');
    const navLink = document.createElement('li');
    navLink.appendChild(link);
    const realLink = document.createElement('a');
    realLink.setAttribute('href', '#');
    realLink.setAttribute('target', '_blank');
    let coords = null;

    const ondomchanged = () => {
        if (allowChanges) {
            allowChanges = false;
            coords = document.querySelector('#reverse-geocoding-coords');
            if (coords) {
                const parent = coords.parentElement;
                const section = document.createElement('div');
                section.id = 'reverse-geocoding-link-to-webgeo'
                parent.append(section);
                section.appendChild(link);
            } else {
                allowChanges = true;
            }
        }
    };

    const onGoToWebgeo = (e) => {
        e.preventDefault();
        if (coords) {
            const text = coords.textContent;
            const [lat, lon] = text.split(',').map((str) => str.replace(' ', ''))
            const osmPosition = `map=${18}/${lat}/${lon}`;
            realLink.setAttribute('href', `https://webgiss.github.io/webgeo/#${osmPosition}`);
            realLink.click();
            return true;
        }
        return false;
    }

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log(`End - ${script_id}`)
})()
