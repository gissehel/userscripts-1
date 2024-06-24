// ==UserScript==
// @version      1.0.1
// @description  threads-image-downloader
// ==/UserScript==

// @import{createElementExtended}
// @import{registerDomNodeMutatedUnique}

registerDomNodeMutatedUnique(() => [...document.querySelectorAll('.xrvdsqn.x87ps6o.x5yr21d > img')], (image) => {
    const parent = image.parentElement;
    if (parent.tagName === 'DIV') {
        console.log('tid-event-start');
        const url = image.attributes.src.value;
        const name = url.split('?')[0].split('/').slice(-1)[0];
        image.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const response = await fetch(url);
            const blob = await response.blob();
            const urlContent = window.URL.createObjectURL(blob);
            const a = createElementExtended('a', {
                attributes: {
                    href: urlContent,
                    target: '_blank',
                    download: name,
                },
            })
            a.click()
        })
        console.log('tid-event-stop');
    }
})

