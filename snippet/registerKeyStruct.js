/**
 * @typedef {Object} KeyStruct A key event
 * @property {string} key The key value of the key represented by the event
 * @property {string} code The code value of the key represented by the event
 * @property {boolean} altKey  Whether the ALT key was pressed when this event was fired
 * @property {boolean} shiftKey Whether the SHIFT key was pressed when this event was fired
 * @property {boolean} ctrlKey Whether the CTRL key was pressed when this event was fired
 * @property {boolean} metaKey Whether the META key was pressed when this event was fired
 * @property {boolean} isComposing Whether the key is being held down such that it is automatically repeating
 */

/**
 * @typedef {Object} KeyActionEvent
 * @property {()=>{}} preventDefault Prevent the default action of the key event
 */

/**
 * @typedef {(event: KeyActionEvent)=>{}} KeyAction The action to associate with a key event
 */


/**
 * Register a keyStruct with an action
 * 
 * @param {KeyStruct} keyStruct 
 * @param {KeyAction} action 
 * @returns {void}
 */
const registerKeyStruct = (() => {

    /**
     * Return a boolean that is always true or false even if the input is not a boolean but has a truthy or falsy value
     * 
     * @param {boolean} x The input value
     * @returns {boolean}
     */
    const getNormalizedBool = (x) => x ? true : false

    /**
     * Ensure the keyStruct has the correct format
     * 
     * @param {KeyStruct} keyStruct 
     * @returns {KeyStruct}
     */
    const normalizeKeyStruct = (keyStruct) => {
        let { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = keyStruct
        altKey = getNormalizedBool(altKey)
        shiftKey = getNormalizedBool(shiftKey)
        ctrlKey = getNormalizedBool(ctrlKey)
        metaKey = getNormalizedBool(metaKey)
        isComposing = getNormalizedBool(isComposing)
        return { key, code, altKey, shiftKey, ctrlKey, metaKey, isComposing }
    }

    /**
     * Get a unique id for the keyStruct based on the key value
     * Be sure that two different KeyStructs with the same key value have the same id
     * 
     * @param {KeyStruct} keyStruct The keyStruct to get the id for
     * @returns {string}
     */
    const getKeyStructKeyId = (keyStruct) => {
        const { key, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (key) {
            return `${key}-undefined-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }

    /**
     * Get a unique id for the keyStruct based on the code value
     * Be sure that two different KeyStructs with the same code value have the same id
     * 
     * @param {KeyStruct} keyStruct The keyStruct to get the id for
     * @returns 
     */
    const getKeyStructCodeId = (keyStruct) => {
        const { code, altKey, shiftKey, ctrlKey, metaKey, isComposing } = normalizeKeyStruct(keyStruct)
        if (code) {
            return `undefined-${code}-${altKey}-${shiftKey}-${ctrlKey}-${metaKey}-${isComposing}`
        }
        return null
    }


    /**
     * Get the ids for the keyStruct (the key one, the code one or both)
     * @param {KeyStruct} keyStruct The keyStruct to get the ids for
     * @returns {string[]}
     */
    const getKeyStructIds = (keyStruct) => {
        return [getKeyStructKeyId, getKeyStructCodeId].map((f) => f(keyStruct)).filter((keyStruct) => keyStruct !== null)
    }

    /**
     * @type {Object.<string, {keyStruct: KeyStruct, actions: KeyAction[]}>}
     */
    const keyBindings = {}

    /**
     * Register a keyStruct with an action
     * 
     * @param {KeyStruct} keyStruct 
     * @param {KeyAction} action 
     * @returns {void}
     */
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