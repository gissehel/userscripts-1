// ==UserScript==
// @version      1.0.0
// @description  thecorner-list
// @match        https://clients.boursobank.com/thecorner/toutes-les-offres
// ==/UserScript==

// @import{getSubElements}
// @import{registerDomNodeMutatedUnique}
// @import{cleanupString}
// @import{downloadData}

registerDomNodeMutatedUnique(() => document.querySelectorAll('#marketplaceProductList'), (container) => {
    const date = new Date()
    const dateiso = date.toISOString()
    const dateunix = date.getTime()/1000
    const dateid = dateiso.replace(/\..*/, '').replace(/[-:]/g, '').replace(/T/, '-')

    const infos = {
        date: {
            iso: dateiso,
            unix: dateunix,
            id: dateid
        },
        items: getSubElements(container, '.boursoshop-universe-product__card').map((card) => {
            const info = {}
            info.id = card.getAttribute('data-product-id')
            for (let attribute of ['name', 'description']) {
                getSubElements(card, `.boursoshop-universe-product__${attribute}`).map((element) => {
                    info[attribute] = cleanupString(element.textContent)
                })
            }
            for (let attribute of ['CTA', 'tag']) {
                getSubElements(card, `.boursoshop-universe-product__${attribute}`).map((element) => {
                    info[attribute] = cleanupString(element.childNodes[0].childNodes[0].textContent)
                })
            }
            const favorite_icon = getSubElements(card, '.boursoshop-universe-product__favorite i.c-icon')[0]
            info.favorite = favorite_icon.classList.contains('c-icon--like-full')

            return info
        })
    }

    const json = JSON.stringify(infos,null,2)
    const csv = [
        ['id', 'name', 'description', 'CTA', 'tag', 'favorite'].join(';'),
        ...infos.items.map(({id, name, description, CTA, tag, favorite}) => `"${id}";"${name}";"${description}";"${CTA}";"${tag}";"${favorite}"`)
    ].join('\r\n')

    downloadData(`thecorner-list-${dateid}.json`, json, { mimetype: 'application/json', encoding: 'utf-8' })
    downloadData(`thecorner-list-${dateid}.csv`, csv, { mimetype : 'text/csv', encoding: 'windows-1252' })

    console.log(infos)
    console.log(json)
    console.log(csv)

    return true
})
