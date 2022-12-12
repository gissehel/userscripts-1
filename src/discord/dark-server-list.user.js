// ==UserScript==
// @name         Dark server list
// @namespace    http://github.com/gissehel/userscripts
// @version      1.0
// @description  Dark server list
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @match        https://discord.com/channels/@me
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

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

    addStyle('.scroller-3X7KbA { background-color: #6e6a7e }')
})();