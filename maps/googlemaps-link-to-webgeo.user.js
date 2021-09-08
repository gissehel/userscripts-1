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
                    link.className = `${className} webgeo`;
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

    addStyle('.webgeo { background-color: #fff; border-radius: 50px; padding: 9px !important; border: 1px solid #ccc; }')
    addStyle('.webgeo:hover { ; }')
    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    link.addEventListener('click', onGoToWebgeo, false);
    ondomchanged();

    console.log('googlemaps-link-to-webgeo installed');
})();
