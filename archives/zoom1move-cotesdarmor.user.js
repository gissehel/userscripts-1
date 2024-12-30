// ==UserScript==
// @name        zoom1move-cotesdarmor
// @namespace   https://github.com/gissehel/userscripts
// @version     3.0.0
// @description Auto Zoom 1 + mouse = move
// @author      gissehel
// @homepage    https://github.com/gissehel/userscripts
// @supportURL  https://github.com/gissehel/userscripts/issues
// @match       https://sallevirtuelle.cotesdarmor.fr/EC/ecx/consult.aspx?*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=cotesdarmor.fr
// @grant       none
// ==/UserScript==

const script_name = GM_info?.script?.name || 'no-name'
const script_version = GM_info?.script?.version || 'no-version'
const script_id = `${script_name} ${script_version}`
console.log(`Begin - ${script_id}`)


// @imported_begin{delay}
/**
 * @param {Number} timeout The timeout in ms
 * @param {Object} data The data to return after the timeout
 * @returns 
 */
const delay = (timeout, data) =>
    new Promise((resolve) =>
        setTimeout(() =>
            resolve(data), timeout
        )
    )
// @imported_end{delay}

// @imported_begin{readyPromise}
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
// @imported_end{readyPromise}

// @main_begin{zoom1move-cotesdarmor}
readyPromise
    .then(() => delay(500))
    .then(() => {
        DoTool('move');
        ZoomerPhoto(1);
    })
// @main_end{zoom1move-cotesdarmor}

console.log(`End - ${script_id}`)
