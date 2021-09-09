// ==UserScript==
// @name         openstreetmap-link-to-webgeo
// @namespace    http://github.com/gissehel/userscripts
// @version      1.0.0
// @description  openstreetmap-link-to-webgeo
// @author       none
// @homepage     https://github.com/gissehel/userscripts
// @match        https://openstreetmap.org/*
// @match        https://www.openstreetmap.org/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    console.log('openstreetmap-link-to-webgeo start');

    /**
     * Add a new css string to the page
     *
     * @param {string} styleText The CSS string to pass
     * @returns {void}
     */
    const addStyle = (() => {
        let styleElement = null;
        let styleContent = null;

        /**
         * Add a new css string to the page
         *
         * @param {string} styleText The CSS string to pass
         * @returns {void}
         */
        return (styleText) => {
            if (styleElement === null) {
                styleElement = document.createElement('style');
                styleContent = "";
                document.head.appendChild(styleElement);
            } else {
                styleContent += "\n";
            }

            styleContent += styleText;
            styleElement.textContent = styleContent;
        };
    })();

    let allowChanges = true;
    let el = document.documentElement;
    const link = document.createElement('a');
    link.setAttribute('href','#');
    link.textContent = 'WebGeo';
    link.classList.add('nav-link');
    const navLink = document.createElement('li');
    navLink.appendChild(link);
    const realLink = document.createElement('a');
    realLink.setAttribute('href','#');
    realLink.setAttribute('target','_blank');

    const ondomchanged = () => {
        if (allowChanges) {
            allowChanges = false;
            const panel = document.querySelector('nav.secondary');
            if (panel) {
                const subpanel = panel.children[0];
                const firstLink = subpanel.children[0];
                if (firstLink) {
                    const className = firstLink.className;
                    navLink.className = `${className} webgeo`;
                    subpanel.insertBefore(navLink, firstLink);

                    return ;
                }
            }
            allowChanges = true;
        }
    };

    const onGoToWebgeo = (e) => {
        e.preventDefault();
        const urlArgs = document.URL.split('#')[1];
        let osmPosition = null;
        if (urlArgs) {
            osmPosition = urlArgs.split('&').filter(part => part.startsWith('map='));
        }
        if (osmPosition) {
            realLink.setAttribute('href',`https://webgiss.github.io/webgeo/#${osmPosition}`);
            realLink.click();
            return true;
        }
        return false;
    }

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log('openstreetmap-link-to-webgeo installed');
})();
