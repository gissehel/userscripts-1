// ==UserScript==
// @name         geoportail-link-to-webgeo
// @namespace    http://github.com/gissehel/userscripts
// @version      1.0.2
// @description  geoportail-link-to-webgeo
// @author       none
// @homepage     https://github.com/gissehel/userscripts
// @match        https://geoportail.gouv.fr/*
// @match        https://www.geoportail.gouv.fr/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    console.log('geoportail-link-to-webgeo start');

    let allowChanges = true;
    let el = document.documentElement;
    const link = document.createElement('a');
    link.setAttribute('href','#');
    link.textContent = 'Link to WebGeo';
    link.classList.add('nav-link');
    const navLink = document.createElement('li');
    navLink.appendChild(link);
    const realLink = document.createElement('a');
    realLink.setAttribute('href','#');
    realLink.setAttribute('target','_blank');
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
            const [lat, lon] = text.split(',').map((str) => str.replace(' ',''))
            const osmPosition = `map=${18}/${lat}/${lon}`;
            realLink.setAttribute('href',`https://webgiss.github.io/webgeo/#${osmPosition}`);
            realLink.click();
            return true;
        }
        return false;
    }

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log('geoportail-link-to-webgeo installed');
})();
