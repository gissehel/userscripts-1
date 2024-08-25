// @import{createElementExtended}

/**
 * Download data as a file
 * 
 * @param {string} filename - The name of the file
 * @param {string} data - The data to download
 * @param {object} options - The options
 * @param {string} options.mimetype - The mimetype of the data
 * @param {string} options.encoding - The encoding to use on the text data if provided
 */
const downloadData = (filename, data, options) => {
    if (!options) {
        options = {}
    }
    const { mimetype, encoding } = options
    if (!mimetype) {
        mimetype = 'application/octet-stream'
    }
    if (encoding) {
        data = new TextEncoder(encoding).encode(data)
    }
    const element = createElementExtended('a', {
        attributes: {
            href: URL.createObjectURL(new Blob([data], { type: mimetype })),
            download: filename,
        }
    })
    element.click()
}
