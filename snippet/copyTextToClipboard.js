/**
 * Copy some text to clipboard
 * 
 * @param {string} text text to copy to clipboard
 * @returns 
 */
const copyTextToClipboard = async (text) => {
    if (!navigator.clipboard) {
        console.log(`Can't copy [${test}] : No navigator.clipboard API`)
        return;
    }

    await navigator.clipboard.writeText(text)
}
