// ==UserScript==
// @version         3.0.0
// @description     Auto Zoom 1 + mouse = move
// @match           https://sallevirtuelle.cotesdarmor.fr/EC/ecx/consult.aspx?*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=cotesdarmor.fr
// ==/UserScript==

// @import{delay}
// @import{readyPromise}

readyPromise
    .then(() => delay(500))
    .then(() => {
        DoTool('move');
        ZoomerPhoto(1);
    })
