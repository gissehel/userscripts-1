// ==UserScript==
// @name         Auto Zoom 1 for archives of cotesdarmor.fr
// @namespace    http://github.com/gissehel/userscripts
// @version      1.0
// @description  Auto Zoom 1 + mouse = move
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @match        https://sallevirtuelle.cotesdarmor.fr/EC/ecx/consult.aspx?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cotesdarmor.fr
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    /**
     * A promise that is resolved when the html DOM is ready.
     * Should be part of any browser, but is not.
     *
     * @type {Promise<void>} A promise that is resolved when the html DOM is ready
     */
    const readyPromise = new Promise((resolve, reject) => {
        if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
            setTimeout(() => resolve(), 1);
        } else {
            const onContentLoaded = () => {
                resolve();
                document.removeEventListener('DOMContentLoaded', onContentLoaded, false);
            }
            document.addEventListener('DOMContentLoaded', onContentLoaded, false);
        }
    })

    const delay = (timeout, data) =>
        new Promise((resolve) =>
            setTimeout(() =>
                resolve(data), timeout
            )
        )

    readyPromise
        .then(() => delay(500))
        .then(() => {
            DoTool('move');
            ZoomerPhoto(1);
        })

})();