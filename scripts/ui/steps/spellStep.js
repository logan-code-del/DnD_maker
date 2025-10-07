import { createPanel } from '../components/panel.js';
import { createOptionList } from '../components/optionList.js';
import { upsertCustomEntry } from '../../data/compendiumStore.js';
import { getSpellLimits } from '../../data/spellLimits.js';

export async function renderSpellStep({ mount, session, compendium, updateSession, goToNext, goToPrevious }) {
        const spellLimits = await getSpellLimits(session.class?.primaryClass, session.identity.level);

    const panel = createPanel({
        title: 'Spells & Magic',
        description: 'Browse the entire SRD spell list, prepare spell slots, and add custom magic.',
        actions: [
            {
                label: 'Back',
                variant: 'ghost',
                onClick: goToPrevious,
            },
            {
                label: 'Next: Equipment',
                variant: 'primary',
                onClick: goToNext,
            },
        ],
    });

    const spellOptions = normalizeSpells(compendium.spells ?? []);
    const spellSearch = createSpellSearchField();
    const lists = createSpellLists({
        spellOptions,
        session,
        updateSession,
        spellLimits,
    });
    const customSpellForm = createCustomSpellForm({ session, updateSession });

    panel.append(spellSearch, ...lists, customSpellForm);
    mount.appendChild(panel);

    function createSpellSearchField() {
        const wrapper = document.createElement('div');
        wrapper.className = 'builder-panel';
        wrapper.innerHTML = `
            <div class="panel-header">
                <div>
                    <h3>Search Spells</h3>
                    <p class="panel-description">Filter by name, level, school, or class availability.</p>
                </div>
            </div>
            <div class="field-group">
                <input class="input-field" id="spell-search" placeholder="Start typing a spell name...">
                <div class="inline-tags">
                    <label class="tag"><input type="checkbox" value="cantrip" checked> Cantrips</label>
                    <label class="tag"><input type="checkbox" value="ritual" checked> Rituals</label>
                </div>
            </div>
        `;

        const searchInput = wrapper.querySelector('#spell-search');
        const filterCheckboxes = wrapper.querySelectorAll('input[type="checkbox"]');

        function applyFilters() {
            const query = searchInput.value.toLowerCase();
            const filters = Array.from(filterCheckboxes)
                .filter((cb) => cb.checked)
                .map((cb) => cb.value);

            const filteredSpells = spellOptions.filter((spell) => {
                const matchesQuery = spell.name.toLowerCase().includes(query)
                    || spell.school.toLowerCase().includes(query)
                    || spell.level.toString() === query;

                const matchesFilters = filters.every((filter) => {
                    if (filter === 'cantrip') return spell.level === 0;
                    if (filter === 'ritual') return spell.ritual;
                    return true;
                });

                return matchesQuery && matchesFilters;
            });

            lists[0].replaceChildren(createSpellListColumn({
                title: 'All Spells',
                spells: filteredSpells,
                onToggle: handleToggleSpell,
                isSelected: (spell) => session.spells.spellbook.some((s) => s.slug === spell.slug),
            }));
        }

        searchInput.addEventListener('input', applyFilters);
        filterCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', applyFilters));

        return wrapper;
    }

    function createSpellLists({ spellOptions, session, updateSession, spellLimits }) {
        const allSpellsColumn = createSpellListColumn({
            title: 'All Spells',
            spells: spellOptions,
            onToggle: handleToggleSpell,
            isSelected: (spell) => session.spells.spellbook.some((s) => s.slug === spell.slug),
        });

        const preparedSpellsColumn = createSpellListColumn({
            title: `Prepared Spells (${session.spells.prepared.length}/${spellLimits.prepared})`,
            spells: session.spells.prepared,
            onToggle: handleTogglePrepared,
            isSelected: () => true,
        });

        return [allSpellsColumn, preparedSpellsColumn];
    }

    function handleToggleSpell(spell) {
        const current = session.spells.spellbook;
        const exists = current.some((s) => s.slug === spell.slug);
        const nextSpellbook = exists ? current.filter((s) => s.slug !== spell.slug) : [...current, spell];

        updateSession({
            spells: {
                ...session.spells,
                spellbook: nextSpellbook,
            },
        });
    }

    function handleTogglePrepared(spell) {
        const current = session.spells.prepared;
        const exists = current.some((s) => s.slug === spell.slug);

        if (!exists && session.spells.prepared.length >= spellLimits.prepared) {
            return;
        }

        let nextPrepared = exists
            ? current.filter((s) => s.slug !== spell.slug)
            : [...current, spell];

        updateSession({
            spells: {
                ...session.spells,
                prepared: nextPrepared,
            },
        });
    }

    function createCustomSpellForm({ session, updateSession }) {
        const wrapper = document.createElement('div');
        wrapper.className = 'builder-panel';
        wrapper.innerHTML = `
            <div class="panel-header">
                <div>
                    <h3>Custom Spell</h3>
                    <p class="panel-description">Add unique spells with description, level, school, and casting details.</p>
                </div>
                <div class="action-bar">
                    <button class="ghost-button" type="button" id="save-custom-spell">Save Custom Spell</button>
                </div>
            </div>
            <form class="field-group" id="custom-spell-form">
                <label>
                    <span>Name</span>
                    <input class="input-field" name="name" placeholder="Astral Lattice" required>
                </label>
                <label>
                    <span>Level</span>
                    <input class="input-field" type="number" name="level" min="0" max="9" value="0" required>
                </label>
                <label>
                    <span>School</span>
                    <input class="input-field" name="school" placeholder="Divination" required>
                </label>
                <label>
                    <span>Description</span>
                    <textarea class="input-field" name="description" rows="3" placeholder="Describe the spell\'s effect" required></textarea>
                </label>
            </form>
        `;

        wrapper.querySelector('#save-custom-spell').addEventListener('click', () => {
            const form = wrapper.querySelector('#custom-spell-form');
            const formData = new FormData(form);
            const customSpell = {
                name: formData.get('name'),
                slug: slugify(formData.get('name')),
                level: Number(formData.get('level')),
                school: formData.get('school'),
                description: formData.get('description'),
                ritual: false,
                source: 'Homebrew',
            };

            upsertCustomEntry('spells', customSpell);

            const nextSpellbook = [...session.spells.spellbook, customSpell];
            updateSession({
                spells: {
                    ...session.spells,
                    spellbook: nextSpellbook,
                    customSpells: [...session.spells.customSpells, customSpell],
                },
            });
        });

        return wrapper;
    }

    function createSpellListColumn({ title, spells, onToggle, isSelected }) {
        const column = document.createElement('div');
        column.className = 'builder-panel';
        column.innerHTML = `
            <div class="panel-header">
                <div>
                    <h3>${title}</h3>
                </div>
            </div>
        `;

        if (spells.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'panel-description';
            empty.textContent = 'No spells match your criteria yet.';
            column.appendChild(empty);
            return column;
        }

        const list = document.createElement('div');
        list.className = 'option-grid';

        spells.forEach((spell) => {
            const card = document.createElement('article');
            card.className = 'option-card';
            card.dataset.selected = isSelected(spell);
            card.innerHTML = `
                <h3>${spell.name}</h3>
                <p>${spell.school} • Level ${spell.level}</p>
                <p>${spell.description}</p>
            `;
            card.addEventListener('click', () => onToggle(spell));
            list.appendChild(card);
        });

        column.appendChild(list);
        return column;
    }
}

function normalizeSpells(spells) {
    return spells.map((spell) => ({
        name: spell.name,
        slug: spell.index,
        level: spell.level ?? spell.level_int ?? 0,
        school: spell.school?.name ?? 'Unknown',
        ritual: spell.ritual ?? false,
        description: spell.desc?.[0] ?? 'See full description in compendium.',
        source: '5e SRD',
    }));
}

function slugify(value) {
    return value?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ?? crypto.randomUUID();
}