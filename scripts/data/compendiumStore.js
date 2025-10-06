const COMPENDIUM_CACHE_KEY = 'dnd-character-compendium-v1';
const COMPENDIUM_SOURCES = [
    {
        id: 'classes',
        endpoint: 'https://www.dnd5eapi.co/api/classes',
    },
    {
        id: 'subclasses',
        endpoint: 'https://www.dnd5eapi.co/api/subclasses',
    },
    {
        id: 'races',
        endpoint: 'https://www.dnd5eapi.co/api/races',
    },
    {
        id: 'backgrounds',
        endpoint: 'https://www.dnd5eapi.co/api/backgrounds',
    },
    {
        id: 'spells',
        endpoint: 'https://www.dnd5eapi.co/api/spells',
    },
    {
        id: 'features',
        endpoint: 'https://www.dnd5eapi.co/api/features',
    },
];

let compendiumCache = null;

export async function fetchAndCacheCompendium() {
    if (compendiumCache) {
        return compendiumCache;
    }

    const cached = loadFromLocalStorage();
    if (cached) {
        compendiumCache = cached;
        refreshInBackground();
        return cached;
    }

    const fetched = await fetchAllSources();
    saveToLocalStorage(fetched);
    compendiumCache = fetched;
    return fetched;
}

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem(COMPENDIUM_CACHE_KEY);
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (error) {
        console.warn('Failed to parse compendium cache', error);
        return null;
    }
}

function saveToLocalStorage(data) {
    try {
        localStorage.setItem(COMPENDIUM_CACHE_KEY, JSON.stringify({
            ...data,
            cachedAt: Date.now(),
        }));
    } catch (error) {
        console.warn('Unable to persist compendium cache', error);
    }
}

async function refreshInBackground() {
    try {
        const fetched = await fetchAllSources();
        saveToLocalStorage(fetched);
        compendiumCache = fetched;
    } catch (error) {
        console.warn('Background refresh failed', error);
    }
}

async function fetchAllSources() {
    const results = await Promise.all(
        COMPENDIUM_SOURCES.map(async (source) => {
            const response = await fetch(source.endpoint);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${source.id}`);
            }
            const json = await response.json();
            return [source.id, json.results ?? json];
        }),
    );

    return Object.fromEntries(results);
}

export function upsertCustomEntry(category, entry) {
    if (!compendiumCache) {
        const stored = loadFromLocalStorage();
        compendiumCache = stored ?? { cachedAt: Date.now() };
    }

    const existing = compendiumCache[category] ?? [];
    const updated = existing.filter((item) => item.slug !== entry.slug);
    updated.push(entry);

    compendiumCache[category] = updated;
    saveToLocalStorage(compendiumCache);

    return compendiumCache[category];
}