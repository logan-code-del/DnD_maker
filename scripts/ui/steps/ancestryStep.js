import { createPanel } from '../components/panel.js';
import { createOptionList } from '../components/optionList.js';

export async function renderAncestryStep({ mount, session, compendium, updateSession, goToNext, goToPrevious }) {
    const panel = createPanel({
        title: 'Ancestry',
        description: 'Choose a race or lineage, select heritage traits, or craft a custom ancestry.',
        actions: [
            {
                label: 'Back',
                variant: 'ghost',
                onClick: goToPrevious,
            },
            {
                label: 'Next: Class & Path',
                variant: 'primary',
                onClick: handleAdvance,
            },
        ],
    });

    const raceOptions = normalizeRaceOptions(compendium.races ?? []);
    const currentRace = session.ancestry.race;
    const selectedRaceSlug = currentRace?.slug ?? null;

    const optionList = createOptionList({
        options: raceOptions,
        getLabel: (race) => race.name,
        getSubtitle: (race) => race.source,
        getDescription: (race) => race.traits.slice(0, 3).join(', '),
        isSelected: (race) => race.slug === selectedRaceSlug,
        onSelect: (race) => {
            updateSession({
                ancestry: {
                    ...session.ancestry,
                    race,
                    subrace: null,
                    traits: race.traits ?? [],
                },
            });
        },
    });

    const customBuilder = document.createElement('section');
    customBuilder.className = 'builder-panel';
    customBuilder.innerHTML = `
        <div class="panel-header">
            <div>
                <h3>Custom Ancestry</h3>
                <p class="panel-description">Define unique heritage, ability bonuses, and features for homebrew options.</p>
            </div>
        </div>
        <form class="field-group" id="custom-ancestry-form">
            <label>
                <span>Name</span>
                <input class="input-field" name="customName" placeholder="Crystalborn" value="${session.ancestry.customName ?? ''}">
            </label>
            <label>
                <span>Ability Score Bonuses</span>
                <input class="input-field" name="abilityBonuses" placeholder="+2 Intelligence, +1 Dexterity" value="${session.ancestry.abilityBonuses ?? ''}">
            </label>
            <label>
                <span>Heritage Traits</span>
                <textarea class="input-field" rows="3" name="customTraits" placeholder="Enter one trait per line">${(session.ancestry.customTraits ?? []).join('\n')}</textarea>
            </label>
        </form>
    `;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'field-group';
    contentWrapper.append(optionList, customBuilder);

    panel.appendChild(contentWrapper);
    mount.appendChild(panel);

    function handleAdvance() {
        const customForm = document.getElementById('custom-ancestry-form');
        const formData = new FormData(customForm);
        const customTraits = formData.get('customTraits')
            ? formData.get('customTraits').split('\n').map((t) => t.trim()).filter(Boolean)
            : [];

        updateSession({
            ancestry: {
                ...session.ancestry,
                customName: formData.get('customName'),
                abilityBonuses: formData.get('abilityBonuses'),
                customTraits,
            },
        });

        goToNext();
    }
}

function normalizeRaceOptions(races) {
    return races.map((race) => ({
        name: race.name,
        slug: race.index,
        source: '5e SRD',
        traits: race.url ? [race.url.replace('/api/races/', '').replace('-', ' ')] : [],
    })).concat({
        name: 'Custom Lineage',
        slug: 'custom-lineage',
        source: 'Homebrew',
        traits: ['Fully customizable'],
    });
}