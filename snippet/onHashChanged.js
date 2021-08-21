const {setHashChanged, setLocationHash, getCurrentLocationHash} = (() => {
    /**
     * A callback that should be called each time the hash has changed, or the first time the callback is installed
     * @type {(hash: string) => void}
     */
    let onHashChanged = null;

    /**
     * The current hash in the page
     * @type {string}
     */
    let currentHash = null;

    /**
     * Force execute the callback "onHashChanged" if any
     */
    const executeHashChanged = () => {
        if (onHashChanged) {
            onHashChanged(currentHash);
        }
    }
    /**
     * Update the current hash with a new value
     * @param {string} hash The new value of the hash to set.
     */
    const updateCurrentHash = (hash) => {
        currentHash = hash;
        executeHashChanged();
    }
    /**
     * Set the location hash, executing the callback only if the new hash is different from the old one.
     * @param {string} hash 
     */
    const setLocationHash = (hash) => {
        if (hash !== currentHash) {
            location.hash = hash;
            updateCurrentHash(location.hash);
        }
    }
    // Install the hash change callback
    window.onhashchange = () => {
        if (location.hash !== currentHash) {
            updateCurrentHash(location.hash);
        }
    };
    currentHash = location.hash;
    /**
     * Add a callback when the hash has changed.
     * @param {(hash: string) => void} event The callback to call when the hash has changed
     */
    const setHashChanged = (event) => {
        onHashChanged = event;
        executeHashChanged();
    }
    const getCurrentLocationHash = () => currentHash;
    return {setHashChanged, setLocationHash, getCurrentLocationHash};
})();
