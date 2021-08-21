// ==UserScript==
// @name         twitter-image-downloader
// @namespace    http://github.com/gissehel/userscripts
// @version      1.4.8
// @description  Twitter image/video downloader
// @author       gissehel
// @homepage     https://github.com/gissehel/userscripts
// @supportURL   https://github.com/gissehel/userscripts/issues
// @match        https://twitter.com/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    console.log('twitter-image-downloader start');
    let el = document.documentElement;
    let allowChanges = true;

    const exp = (elements) => Object.keys(elements).forEach((elementKey) => window[elementKey] = elements[elementKey]);

    const isStatusUrl = (url) => (url.indexOf('/status/') >= 0) && ([...url].filter(z => z === '/').length === 3);

    const debug = [];

    exp({ debug, isStatusUrl, exp });

    const ondomchanged = () => {
        if (allowChanges) {
            allowChanges = false;
            // console.log('tid-change-start');
            let images = document.querySelectorAll('[aria-labelledby=modal-header] img[alt=Image]');
            [...images].forEach(async (image) => {
                let p = image.parentElement;
                if (p.tagName === 'DIV') {
                    console.log('tid-event-start');
                    const url = image.attributes.src.value;
                    const name = url.split('?')[0].split('/').slice(-1)[0];
                    let ext = '.jpg';
                    let imgParams = url.split('?')[1];
                    if (imgParams) {
                        const format = imgParams.split('&').filter(x => x.startsWith('format='))[0];
                        if (format) {
                            ext = `.${format.split('=')[1]}`
                        }
                    }
                    let a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('target', '_blank');
                    a.setAttribute('download', name + ext);
                    p.removeChild(image);
                    p.appendChild(a);
                    a.appendChild(image);
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const urlContent = window.URL.createObjectURL(blob);
                    a.setAttribute('href', urlContent);
                    console.log('tid-event-stop');
                }
            });

            let articles = document.querySelector('[aria-labelledby*=accessible-list]');

            exp({ articles });

            if (articles) {
                let articleList = [...articles.getElementsByTagName('article')];
                articleList.forEach((article) => {
                    const debugItem = {};
                    window.debug.push(debugItem);
                    let statusUrls = [...article.querySelectorAll('[role=link]')].filter(x => x.getAttribute('href') && isStatusUrl(x.getAttribute('href')));
                    let txt = null;
                    let isTop = true;
                    debugItem.article = article;
                    debugItem.statusUrls = statusUrls;
                    debugItem.articleList = articleList;
                    if (statusUrls.length == 0) {
                        txt = window.location.pathname;
                    } else if (statusUrls.length > 0) {
                        txt = statusUrls[0].getAttribute('href');
                    }
                    // console.log('txt',txt)
                    if (txt !== null) {
                        if ([...article.querySelectorAll('input')].length === 0 && [...article.querySelectorAll('video')].length > 0) {
                            // console.log('has-video and no input', article);
                            let input = document.createElement('input');
                            input.readOnly = true;
                            input.value = 'https://twitter.com' + txt;
                            input.onclick = (e) => input.select();
                            // console.log('has-video and no input : input', article, input);
                            let doc = null;
                            let text = [...article.querySelectorAll('[lang]')][0];
                            if (text) {
                                doc = text.parentElement;
                            }
                            debugItem.doc = doc;
                            debugItem.isList = isTop;
                            debugItem.articleList = articleList;
                            if (doc) {
                                doc.append(input);
                                input.onkeyup = ((e) => {
                                    if (e.code === 'KeyC' && e.ctrlKey) {
                                        // console.log('onkeyup Ctrl+C start')
                                        let link = document.createElement('a');
                                        link.setAttribute('href', 'http://twittervideodownloader.com/');
                                        link.setAttribute('target', '_blank');
                                        link.text = 'open http://twittervideodownloader.com/';
                                        doc.append(link);
                                        link.focus();
                                        // console.log('onkeyup Ctrl+C stop')
                                    }
                                });
                            }
                        }
                    }
                })
            }
            // console.log('tid-change-stop');
            allowChanges = true;
        }
    };

    const findBiggestArticlesContainer = (article) => {
        let element = article;
        if (!element.parentElement) {
            return element;
        }
        let lastElement = element;
        element = element.parentElement;
        while (true) {
            if ([...element.querySelectorAll('article')].length !== 1) {
                return lastElement;
            }
            if (!element.parentElement) {
                return element;
            }
            lastElement = element;
            element = element.parentElement;
        }
    }

    const changePosition = (isForward) => {
        let scrollOffset = 53;

        let bigHeader = document.querySelector('div.r-aqfbo4.r-1g40b8q');

        if (!bigHeader) {
            bigHeader = document.querySelector('header.css-1dbjc4n.r-1g40b8q');
        }

        if (bigHeader) {
            const boundingClientRect = bigHeader.getBoundingClientRect();
            scrollOffset = boundingClientRect.height;
        }

        const mainContainer = document.querySelector('[aria-labelledby*=accessible-list]').querySelectorAll('[aria-label]')[0]
        const articles = [...mainContainer.querySelectorAll('article')]
        let mainList = null;
        if (articles.length > 1) {
            mainList = articles.map(findBiggestArticlesContainer);
        } else {
            mainList = [...mainContainer.children];
        }

        const items = mainList.filter((item) => [...item.querySelectorAll('article')].length > 0)
        const tops = items.map(x => x.getBoundingClientRect().top);
        console.log('items', items);

        window.items = items;
        console.log('tops', tops);
        window.tops = tops;
        let before = null;
        let after = null;
        tops.forEach((top, index) => {
            if (top < 0) {
                before = index;
            }
            if (top > scrollOffset + 1 && after === null) {
                after = index;
            }
        })

        console.log([isForward, before, after])
        const scrollTo = (index) => {
            if (index !== null) {
                const child = items[index];
                if (child) {
                    child.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
                    window.scrollTo({ top: -document.documentElement.getBoundingClientRect().top - scrollOffset, behavior: "auto" })
                    const input = child.querySelector('input');
                    if (input) {
                        input.select();
                    }
                }

            }
        }

        if (isForward) {
            scrollTo(after);
        } else {
            scrollTo(before);
        }
    };

    const onKeyDown = (e) => {
        if (e.code === 'ArrowLeft' && (!e.ctrlKey) && (!e.shiftKey) && !(e.altKey) && !(e.metaKey) && !(e.isComposing)) {
            changePosition(false);
        } else if (e.code === 'ArrowRight' && (!e.ctrlKey) && (!e.shiftKey) && !(e.altKey) && !(e.metaKey) && !(e.isComposing)) {
            changePosition(true);
        }
    };

    el.addEventListener('DOMNodeInserted', ondomchanged, false);
    el.addEventListener('keydown', onKeyDown, false);
    ondomchanged();
    console.log('twitter-image-downloader activated');

    window.ondomchanged = ondomchanged;
})();