// ==UserScript==
// @name         googlemaps-link-to-webgeo
// @namespace    http://github.com/gissehel/userscripts
// @version      1.0.0
// @description  googlemaps-link-to-webgeo
// @author       none
// @homepage     https://github.com/gissehel/userscripts
// @match        https://www.google.com/maps/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    console.log('googlemaps-link-to-webgeo start');
    let allowChanges = true;
    let el = document.documentElement;
    const link = document.createElement('a');
    link.setAttribute('href','#');
    link.textContent = 'W';
    const realLink = document.createElement('a');
    realLink.setAttribute('href','#');
    realLink.setAttribute('target','_blank');

    const ondomchanged = () => {
        if (allowChanges) {
            allowChanges = false;
            const panel = document.querySelector('[data-ogsr-up]');
            if (panel) {
                const subpanel = panel.children[0];
                const firstLink = subpanel.children[0];
                if (firstLink) {
                    const className = firstLink.className;
                    link.className = className;
                    subpanel.insertBefore(link, firstLink);

                    return ;
                }
            }
            allowChanges = true;
        }
    };

    const onGoToWebgeo = () => {
        const googlePosition = document.URL.split('/').filter(part => part.startsWith('@'))[0];
        if (googlePosition) {
            realLink.setAttribute('href',`https://webgiss.github.io/webgeo/#google=${googlePosition}`);
            realLink.click();
            return true;
        }
        return false;
    }

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log('googlemaps-link-to-webgeo installed');
})();

