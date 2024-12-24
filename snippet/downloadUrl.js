/**
 * 
 * @param {String} url The url to download
 * @param {String} filename The filename to use to save the file
 * @returns
 */
const downloadUrl = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const urlContent = window.URL.createObjectURL(blob);
    const a = createElementExtended('a', {
        attributes: {
            href: urlContent,
            target: '_blank',
            download: filename,
        },
    })
    a.click()
}