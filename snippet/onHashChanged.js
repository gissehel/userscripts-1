const {setHashChanged, setLocationHash, getCurrentLocationHash} = (() => {
    let onHashChanged = null;
    let currentHash = null;
    const executeHashChanged = () => {
        if (onHashChanged) {
            onHashChanged(currentHash);
        }
    }
    const updateCurrentHash = (hash) => {
        currentHash = hash;
        executeHashChanged();
    }
    const setLocationHash = (hash) => {
        if (hash !== currentHash) {
            location.hash = hash;
            updateCurrentHash(location.hash);
        }
    }
    window.onhashchange = () => {
        if (location.hash !== currentHash) {
            updateCurrentHash(location.hash);
        }
    };
    currentHash = location.hash;
    const setHashChanged = (event) => {
        onHashChanged = event;
        executeHashChanged();
    }
    const getCurrentLocationHash = () => currentHash;
    return {setHashChanged, setLocationHash, getCurrentLocationHash};
})();

