const addOnKey = (() => {
    const normalizeBool = (data) => data ? true : false;

    /**
     * @typedef {{ code: string, ctrlKey: boolean?, shiftKey: boolean?, altKey: boolean?, metaKey: boolean?, isComposing: boolean? }} Key
     */

    /**
     * 
     * @param {Key} e
     * @returns {string}
     */
    const getHashFromKey = (e) => {
        const code = e.code;
        let { ctrlKey, shiftKey, altKey, metaKey, isComposing } = e;
        [ctrlKey, shiftKey, altKey, metaKey, isComposing] = [ctrlKey, shiftKey, altKey, metaKey, isComposing].map(normalizeBool);
        return `${code};${ctrlKey};${shiftKey};${altKey};${metaKey};${isComposing}`;
    };

    /**
     * @typedef {"up"|"down"} PhaseName
     */

    /**
     * @typedef {{[phaseName:string]: RegisteredKeysForPhase}} RegisteredKeys
     */

    /**
     * @typedef {{ list: KeyBindingItem[], byKeys: Object.<string, KeyBindingItem[]>, eventListener: (e:KeyboardEvent) => {} }} RegisteredKeysForPhaseForElement
     */

    /**
     * @typedef {{ key: Key, hash: string, element: HTMLElement, phase: PhaseName, action: ()=>{}, remove: ()=>{}?}} KeyBindingItem
     */

    /**
     * @typedef {Map<HTMLElement, RegisteredKeysForPhaseForElement>} RegisteredKeysForPhase
     */

    /**
     * @typedef {Map<string, string>} RegisteredKeysForPhase
     */

    /** @type{RegisteredKeys} */
    const registeredKeys = {
        'up': null,
        'down': null,
    };
    window.registeredKeys = registeredKeys;

    /**
     * @type {Object.<string, PhaseName>}
     */
    const typeToKeyIndex = {
        'keydown': 'down',
        'keyup': 'up',
    };

    /**
     * 
     * @param {HTMLElement} element 
     * @returns {(e:KeyboardEvent) => {}}
     */
    const onKeyGenerator = (element) => (e) => {
        let phase = typeToKeyIndex[e.type];
        if (phase) {
            const hash = getHashFromKey(e);
            const registeredKeysForPhase = registeredKeys[phase];
            if (registeredKeysForPhase) {
                const registeredKeysForPhaseElement = registeredKeysForPhase.get(element);
                if (registeredKeysForPhaseElement) {
                    const items = registeredKeysForPhaseElement.byKeys[hash];
                    if (items) {
                        items.forEach((item) => item.action());
                    }
                }
            }
        }
    };

    /**
     * Remove an element from an array
     * 
     * @template{T}
     * @param {T[]} array 
     * @param {T} item 
     */
    const removeElementFromArray = (array, item) => {
        if (array) {
            const index = array.indexOf(item);
            if (index >= 0) {
                array.splice(index, 1);
            }
        }
    };

    /**
     * 
     * @param {KeyBindingItem} item 
     */
    const removeOnKey = (item) => {
        const { hash, element, phase } = item;
        const registeredKeysForPhase = registeredKeys[phase];
        if (registeredKeysForPhase) {
            const registeredKeysForPhaseElement = registeredKeysForPhase.get(element);
            if (registeredKeysForPhaseElement) {
                removeElementFromArray(registeredKeysForPhaseElement.byKeys[hash], item);
                removeElementFromArray(registeredKeysForPhaseElement.list, item);
                if (registeredKeysForPhaseElement.list.length === 0) {
                    element.removeEventListener(`key${phase}`, registeredKeysForPhaseElement.eventListener);
                    registeredKeysForPhase.delete(element);
                }
            }
        }
    };

    /**
     * 
     * @param {Object} param 
     * @param {()=>{}} param.action
     * @param {HTMLElement} param.element
     * @param {Key} param.key
     * @param {PhaseName} param.phase
     * @returns 
     */
    const addOnKey = ({ action, element, key, phase }) => {
        if (!action) {
            return;
        }
        if (!key) {
            return;
        }
        if (!element) {
            element = document.body;
        }
        if (!phase) {
            phase = 'down';
        }
        let registeredKeysForPhase = registeredKeys[phase];
        if (registeredKeysForPhase === undefined) {
            return;
        }
        if (registeredKeysForPhase === null) {
            registeredKeys[phase] = new Map();
            registeredKeysForPhase = registeredKeys[phase];
        }
        if (!registeredKeysForPhase.get(element)) {
            registeredKeysForPhase.set(element, { list: [], byKeys: {}, eventListener: null });
        }
        const registeredKeysForPhaseElement = registeredKeysForPhase.get(element);
        const hash = getHashFromKey(key);
        /** @type{KeyBindingItem} */
        const item = { key, hash, element, phase, action };
        item.remove = () => removeOnKey(item);
        if (registeredKeysForPhaseElement.list.length === 0) {
            registeredKeysForPhaseElement.eventListener = onKeyGenerator(element);
            element.addEventListener(`key${phase}`, registeredKeysForPhaseElement.eventListener, false);
        }
        registeredKeysForPhaseElement.list.push(item);
        if (!registeredKeysForPhaseElement.byKeys[hash]) {
            registeredKeysForPhaseElement.byKeys[hash] = [];
        }
        registeredKeysForPhaseElement.byKeys[hash].push(item);
        return item.remove;
    };

    return addOnKey;
})();
