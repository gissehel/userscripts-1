const registerKeyStruct = (() => {
    const getNormalizedBool = (x) => x ? true : false

    const normalizeKeyStruct = (keyStruct) => {
        let { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = keyStruct
        altKey = getNormalizedBool(altKey)
        shiftKey = getNormalizedBool(shiftKey)
        ctrlKey = getNormalizedBool(ctrlKey)
        metaKey = getNormalizedBool(metaKey)
        isComposing = getNormalizedBool(isComposing)
        if (key) {
            return { key, altKey, shiftKey, ctrlKey, metaKey, isComposing }
        } else if (code) {
            return { code, altKey, shiftKey, ctrlKey, metaKey, isComposing }
        } else {
            return null
        }
    }

    const getKeyStructId = (keyStruct) => {
        const { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        return `${key}-${code}-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
    }

    const keyBindings = {}

    const registerKeyStruct = (keyStruct, code) => {
        const keyStructId = getKeyStructId(keyStruct)
        if (! keyBindings[keyStructId]) {
            keyBindings[keyStructId] = {
                keyStruct: normalizeKeyStruct(keyStruct),
                codes: [],
            }
        }
        keyBindings[keyStructId].codes.push(code)
        return () => {
            const index = keyBindings[keyStructId].codes.indexOf(code)
            if (index >= 0) {
                keyBindings[keyStructId].codes.splice(index, 1)
            }
        }
    }

    const onKeyDown = (e) => {
        const keyStructId = getKeyStructId(e)
        if (keyBindings[keyStructId]) {
            for(let code of keyBindings[keyStructId].codes) {
                code({
                    preventDefault: () => e.preventDefault(),
                })
            }
        }
    }

    document.addEventListener('keydown', onKeyDown)
    window.keyBindings = keyBindings

    return registerKeyStruct;
})()