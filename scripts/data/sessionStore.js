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

export function loadSession() {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) {
            saveSession(defaultSession);
            return structuredClone(defaultSession);
        }
        return {
            ...structuredClone(defaultSession),
            ...JSON.parse(stored),
        };
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