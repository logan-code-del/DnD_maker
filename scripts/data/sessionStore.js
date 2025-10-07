const SESSION_KEY = 'dnd-character-builder-session';

const defaultSession = {
    currentStepIndex: 0,
    identity: {
        name: '',
        level: 1,
        pronouns: '',
        alignment: '',
        campaignRole: '',
        backstory: '',
    },
    ancestry: {
        race: null,
        subrace: null,
        traits: [],
        customTraits: [],
    },
    class: {
        primaryClass: null,
        subclass: null,
        levelDistribution: [],
        customClass: null,
        selectedFeatures: [],
    },
    spells: {
        spellbook: [],
        prepared: [],
        customSpells: [],
    },
    equipment: {
        inventory: [],
        coin: 0,
        trinkets: [],
        notes: '',
    },
};

function deepMerge(target, source) {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }

    return output;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function loadSession() {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) {
            saveSession(defaultSession);
            return structuredClone(defaultSession);
        }
        
        const storedSession = JSON.parse(stored);
        return deepMerge(structuredClone(defaultSession), storedSession);

    } catch (error) {
        console.warn('Failed to load session, returning defaults', error);
        return structuredClone(defaultSession);
    }
}

export function saveSession(session) {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
        console.warn('Unable to persist session', error);
    }
}

export function resetSession() {
    localStorage.removeItem(SESSION_KEY);
}