// ==UserScript==
// @version      3.0.1
// @description  twittervideodownloader-easy
// @match        http://twittervideodownloader.com/*
// @match        https://twittervideodownloader.com/*
// @icon         https://abs.twimg.com/favicons/twitter.2.ico
// ==/UserScript==

const input = document.querySelectorAll('input[name=tweet]')[0];
if (input) {
    input.focus();
}

document.body.onkeyup = (e) => {
    if (e.code == 'KeyV' && e.ctrlKey) {
        const button = document.querySelectorAll('button[type=submit]')[0];
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

const domSizes = [...document.querySelectorAll('.btn.fw-bold.tw-btn.btn-sm')];
if (domSizes.length) {
    const maxDomSize = domSizes.map((domSize) => {
        let [width, height] = domSize.outerText.split(': ')[0].split(' ')[1].split('x').map(z => 1 * z);
        return { domSize, area: width * height };
    }).sort((result1, result2) => result2.area - result1.area)[0].domSize;
    const link = maxDomSize
    link.style.backgroundColor = 'red';
    const url = link.getAttribute('href');
    const filename = url.split('/').slice(-1)[0].split('?')[0];
    // download doesn't work anymore as cors forbids automatic download
    // download(url, filename);
}
