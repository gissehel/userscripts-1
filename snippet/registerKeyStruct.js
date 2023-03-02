const registerKeyStruct = (() => {
    const getNormalizedBool = (x) => x ? true : false

    const normalizeKeyStruct = (keyStruct) => {
        let { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = keyStruct
        altKey = getNormalizedBool(altKey)
        shiftKey = getNormalizedBool(shiftKey)
        ctrlKey = getNormalizedBool(ctrlKey)
        metaKey = getNormalizedBool(metaKey)
        isComposing = getNormalizedBool(isComposing)
        return { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing }
    }

    const getKeyStructKeyId = (keyStruct) => {
        const { key, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (key) {
            return `${key}-undefined-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }

    const getKeyStructCodeId = (keyStruct) => {
        const { code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (code) {
            return `undefined-${code}-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }

    const getKeyStructIds = (keyStruct) => {
        return [getKeyStructKeyId, getKeyStructCodeId].map((f) => f(keyStruct)).filter((keyStruct) => keyStruct !== null)
    }

    const keyBindings = {}

    const registerKeyStruct = (keyStruct, action) => {
        for (let keyStructId of getKeyStructIds(keyStruct)) {
            if (!keyBindings[keyStructId]) {
                keyBindings[keyStructId] = {
                    keyStruct: normalizeKeyStruct(keyStruct),
                    actions: [],
                }
            }
            keyBindings[keyStructId].actions.push(action)
            return () => {
                const index = keyBindings[keyStructId].actions.indexOf(action)
                if (index >= 0) {
                    keyBindings[keyStructId].actions.splice(index, 1)
                }
            }
        }
    }

    const onKeyDown = (e) => {
        let handled = false
        for (let keyStructId of getKeyStructIds(e)) {
            if (!handled) {
                if (keyBindings[keyStructId]) {
                    for (let code of keyBindings[keyStructId].actions) {
                        code({
                            preventDefault: () => e.preventDefault(),
                        })
                        handled = true
                        return
                    }
                }
            }
        }
    }

    document.addEventListener('keydown', onKeyDown)
    window.keyBindings = keyBindings

    return registerKeyStruct;
})()