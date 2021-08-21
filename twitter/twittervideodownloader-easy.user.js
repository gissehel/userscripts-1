// ==UserScript==
// @name         twittervideodownloader-easy
// @namespace    http://tampermonkey.net/
// @version      1.2.4
// @description  twittervideodownloader.com easy
// @author       gissehel
// @match        http://twittervideodownloader.com/*
// @match        https://twittervideodownloader.com/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    console.log('twittervideodownloader-easy start');

    const input = document.querySelectorAll('input[name=tweet]')[0];
    if (input) {
        input.focus();
    }

    document.body.onkeyup = (e) => {
        if (e.code == 'KeyV' && e.ctrlKey) {
            const button = document.querySelectorAll('input[type=submit]')[0];
            if (button) {
                button.click();
            }
        }
    };

    const download = async (url, name) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const urlContent = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = urlContent;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(urlContent);
    };

    const domSizes = [...document.querySelectorAll('.small-6 p.float-left')];
    if (domSizes.length) {
        const maxDomSize = domSizes.map((domSize) => {
            let [width, height] = domSize.outerText.split(' : ')[0].split('x').map(z => 1 * z);
            return { domSize, area: width * height };
        }).sort((result1, result2) => result2.area - result1.area)[0].domSize;
        const link = maxDomSize.parentElement.parentElement.getElementsByTagName('a')[0];
        link.style.backgroundColor = 'red';
        const url = link.getAttribute('href');
        const filename = url.split('/').slice(-1)[0].split('?')[0];
        download(url, filename);
    }

    console.log('twittervideodownloader-easy activated');
})();
