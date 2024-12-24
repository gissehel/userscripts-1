// ==UserScript==
// @version      1.0.2
// @description  thecorner-list
// @match        https://clients.boursobank.com/thecorner/toutes-les-offres
// ==/UserScript==

// @import{getSubElements}
// @import{registerDomNodeMutatedUnique}
// @import{cleanupString}
// @import{downloadData}

const isNumOnly = (str) => [...str].filter(c => c < '0' || c > '9').length === 0
const isFrDecimal = (str) => {
    const nonNumChars = [...str].filter(c => c < '0' || c > '9')
    return (nonNumChars.length === 0) || (nonNumChars.length === 1 && nonNumChars[0] === ',')
}
const isSignedFrDecimal = (str) => {
    if (str.startsWith('-')) {
        return isFrDecimal(str.slice(1))
    } else {
        return isFrDecimal(str)
    }
}
const getFrDecimalAsCents = (str) => parseFloat(str.replace(',', '.'))*100
const isNegPercentOnly = (str) => str.length >= 3 && str[0] === '-' && str[str.length - 1] === '%' && isNumOnly(str.slice(1, -1))
const isAInverval = (str) => str.indexOf(' à ') > 0 && str.split(' à ').length === 2 && isNegPercentOnly(str.split(' à ')[0]) && isNegPercentOnly(str.split(' à ')[1])
const isDeAInverval = (str) => str.startsWith('De ') && isAInverval(str.slice(3))
const isJusquAInverval = (str) => (str.startsWith('Jusqu\'à ') || str.startsWith('Jusqu’à ')) && isNegPercentOnly(str.slice(8))

const isEuroAmount = (str) => str.endsWith('€') && isSignedFrDecimal(str.slice(0,-1))

const getInfluxString = (str) => `"${str.replaceAll('"', '\\"')}"`
const getInfluxBoolean = (str) => `${str === true}`
const getInfluxInteger = (str) => `${str}i`


/**
 * Extracts additional information from a string that represents a negative percentage value.
 * 
 * @param {string} str - The input string to be analyzed.
 * @returns {object} An object containing the extracted information, or an empty object if the input string does not represent a valid negative percentage.
 */
const getExtraInfo = (str) => {
    if (isNegPercentOnly(str)) {
        const value = parseInt(str.slice(0, -1))
        return {
            minRedux: value,
            maxRedux: value,
            parsed: true
        }
    }
    if (isAInverval(str)) {
        const minRedux = parseInt(str.split(' à ')[0].slice(0, -1))
        const maxRedux = parseInt(str.split(' à ')[1].slice(0, -1))
        return {
            minRedux,
            maxRedux,
            parsed: true
        }
    }
    if (isDeAInverval(str)) {
        const minRedux = parseInt(str.slice(3, -1))
        const maxRedux = parseInt(str.split(' à ')[1].slice(0, -1))
        return {
            minRedux,
            maxRedux,
            parsed: true
        }
    }
    if (isJusquAInverval(str)) {
        const minRedux = 0
        const maxRedux = parseInt(str.split('à ')[1].slice(0, -1))
        return {
            minRedux,
            maxRedux,
            parsed: true
        }
    }
    if (isEuroAmount(str)) {
        const value = -Math.abs(getFrDecimalAsCents(str.slice(0,-1)))
        return {
            amount: value,
            parsed: true
        }
    }
    return {
        parsed: false
    }
}

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
            /** @type {Object} */
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
            if (info.CTA) {
                Object.assign(info, getExtraInfo(info.CTA))
            }
            return info
        })
    }

    const json = JSON.stringify(infos,null,2)
    const csv = [
        ['id', 'name', 'description', 'CTA', 'tag', 'favorite'].join(';'),
        ...infos.items.map(({id, name, description, CTA, tag, favorite}) => `"${id}";"${name}";"${description}";"${CTA}";"${tag}";"${favorite}"`)
    ].join('\r\n')
    const influx = [
        ...infos.items.map(({id, name, description, CTA, tag, favorite, minRedux, maxRedux, amount}) => {
            fields = {}
            fields.id = getInfluxString(id)
            fields.name = getInfluxString(name)
            fields.description = getInfluxString(description)
            fields.CTA = getInfluxString(CTA)
            fields.tag = getInfluxString(tag)
            fields.favorite = getInfluxBoolean(favorite)
            if (minRedux) {
                fields.minRedux = getInfluxInteger(minRedux)
                fields.maxRedux = getInfluxInteger(maxRedux)
            }
            if (amount) {
                fields.amount = getInfluxInteger(amount)
            }
            return `boursobank_thecorner ${Object.entries(fields).map(([k,v])=>`${k}=${v}`).join(',')} ${infos.date.unix*1000000000}`
        })
    ].join('\n')

    // infos.items.map(x=>x.CTA).filter(x=>!(isNegPercentOnly(x) || isAInverval(x) || isDeAInverval(x) || isJusquAInverval(x))).forEach(x=>console.log(x))
    infos.items.map(x=>x.CTA).forEach(x=>console.log(x, getExtraInfo(x)))

    downloadData(`thecorner-list-${dateid}.json`, json, { mimetype: 'application/json', encoding: 'utf-8' })
    downloadData(`thecorner-list-${dateid}.csv`, csv, { mimetype : 'text/csv', encoding: 'windows-1252' })
    downloadData(`thecorner-list-${dateid}.influx`, influx, { mimetype : 'text/plain', encoding: 'utf-8' })

    console.log(infos)
    console.log(json)
    console.log(csv)
    console.log(influx)

    return true
})
