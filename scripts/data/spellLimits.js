const CLASS_LEVELS_CACHE = {};

async function fetchClassLevels(classSlug) {
    if (CLASS_LEVELS_CACHE[classSlug]) {
        return CLASS_LEVELS_CACHE[classSlug];
    }

    try {
        const response = await fetch(`https://www.dnd5eapi.co/api/classes/${classSlug}/levels`);
        if (!response.ok) {
            throw new Error(`Failed to fetch levels for ${classSlug}`);
        }
        const levels = await response.json();
        CLASS_LEVELS_CACHE[classSlug] = levels;
        return levels;
    } catch (error) {
        console.error('Failed to fetch class levels', error);
        return [];
    }
}

export async function getSpellLimits(characterClass, characterLevel) {
    if (!characterClass || !characterLevel) {
        return {
            cantrips: 0,
            level1: 0,
            level2: 0,
        };
    }

    const levels = await fetchClassLevels(characterClass.index);
    const levelData = levels.find((l) => l.level === characterLevel);

    if (!levelData || !levelData.spellcasting) {
        return {
            cantrips: 0,
            level1: 0,
            level2: 0,
        };
    }

    return {
        cantrips: levelData.spellcasting.cantrips_known ?? 0,
        level1: levelData.spellcasting.spell_slots_level_1 ?? 0,
        level2: levelData.spellcasting.spell_slots_level_2 ?? 0,
    };
}
