import { createPanel } from '../components/panel.js';
import { createOptionList } from '../components/optionList.js';
import { upsertCustomEntry } from '../../data/compendiumStore.js';

export async function renderClassStep({ mount, session, compendium, updateSession, goToNext, goToPrevious }) {
    const panel = createPanel({
        title: 'Class & Path',
        description: 'Select from every SRD class (including Artificer) or craft a homebrew class from scratch.',
        actions: [
            {
                label: 'Back',
                variant: 'ghost',
                onClick: goToPrevious,
            },
            {
                label: 'Next: Spells',
                variant: 'primary',
                onClick: goToNext,
            },
        ],
    });

    const classOptions = normalizeClasses(compendium.classes ?? []);
    const currentClass = session.class.primaryClass;

    const classSelector = createOptionList({
        options: classOptions,
        getLabel: (klass) => klass.name,
        getSubtitle: (klass) => klass.source,
        getDescription: (klass) => klass.keyFeatures.join(', '),
        isSelected: (klass) => klass.slug === currentClass?.slug,
        onSelect: (klass) => {
            updateSession({
                class: {
                    ...session.class,
                    primaryClass: klass,
                    subclass: null,
                },
            });
            renderClassStep({ mount, session: { ...session, class: { ...session.class, primaryClass: klass } }, compendium, updateSession, goToNext, goToPrevious });
        },
    });

    const subclasses = normalizeSubclasses(compendium.subclasses ?? [], currentClass?.slug);

    const subclassSelector = document.createElement('div');
    subclassSelector.className = 'builder-panel';
    subclassSelector.innerHTML = `
        <div class="panel-header">
            <div>
                <h3>Subclass or Specialist Path</h3>
                <p class="panel-description">Each class includes archetypes. Choose one or homebrew your own.</p>
            </div>
        </div>
    `;

    if (currentClass) {
        const selector = createOptionList({
            options: subclasses,
            getLabel: (sc) => sc.name,
            getSubtitle: (sc) => sc.source,
            getDescription: (sc) => sc.summary,
            isSelected: (sc) => sc.slug === session.class.subclass?.slug,
            onSelect: (sc) => {
                updateSession({
                    class: {
                        ...session.class,
                        subclass: sc,
                    },
                });
                renderClassStep({ mount, session: { ...session, class: { ...session.class, subclass: sc } }, compendium, updateSession, goToNext, goToPrevious });
            },
        });
        subclassSelector.appendChild(selector);
    } else {
        const empty = document.createElement('p');
        empty.className = 'panel-description';
        empty.textContent = 'Select a class to unlock subclass options.';
        subclassSelector.appendChild(empty);
    }

    const customBuilder = document.createElement('div');
    customBuilder.className = 'builder-panel';
    customBuilder.innerHTML = `
        <div class="panel-header">
            <div>
                <h3>Homebrew Class Designer</h3>
                <p class="panel-description">Define custom class progression, spellcasting, and features.</p>
            </div>
            <div class="action-bar">
                <button class="ghost-button" type="button" id="save-custom-class">Save Custom Class</button>
            </div>
        </div>
        <form class="field-group" id="custom-class-form">
            <label>
                <span>Class Name</span>
                <input class="input-field" name="name" placeholder="Chronomancer" value="${session.class.customClass?.name ?? ''}" required>
            </label>
            <label>
                <span>Hit Dice</span>
                <input class="input-field" name="hitDice" placeholder="d8" value="${session.class.customClass?.hitDice ?? ''}">
            </label>
            <label>
                <span>Primary Abilities</span>
                <input class="input-field" name="primaryAbilities" placeholder="Intelligence, Wisdom" value="${session.class.customClass?.primaryAbilities ?? ''}">
            </label>
            <label>
                <span>Spellcasting Progression</span>
                <input class="input-field" name="spellcasting" placeholder="Full caster" value="${session.class.customClass?.spellcasting ?? ''}">
            </label>
            <label>
                <span>Key Features (one per line)</span>
                <textarea class="input-field" name="features" rows="4" placeholder="Time Shift
Chrono Step
Temporal Echoes">${(session.class.customClass?.features ?? []).join('\n')}</textarea>
            </label>
        </form>
    `;

    panel.append(classSelector, subclassSelector, customBuilder);
    mount.appendChild(panel);

    document.getElementById('save-custom-class').addEventListener('click', () => {
        const form = document.getElementById('custom-class-form');
        const formData = new FormData(form);
        const customClass = {
            name: formData.get('name'),
            slug: slugify(formData.get('name')),
            source: 'Homebrew',
            hitDice: formData.get('hitDice'),
            primaryAbilities: formData.get('primaryAbilities'),
            spellcasting: formData.get('spellcasting'),
            keyFeatures: (formData.get('features') ?? '')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
        };

        upsertCustomEntry('classes', customClass);
        updateSession({
            class: {
                ...session.class,
                primaryClass: customClass,
                customClass,
            },
        });

        renderClassStep({
            mount,
            session: {
                ...session,
                class: {
                    ...session.class,
                    primaryClass: customClass,
                    customClass,
                },
            },
            compendium,
            updateSession,
            goToNext,
            goToPrevious,
        });
    });
}

function normalizeClasses(classes) {
    const artificer = {
        name: 'Artificer',
        slug: 'artificer',
        source: 'Eberron (UA)',
        keyFeatures: ['Magical Tinkering', 'Infusions', 'Battle Smith / Alchemist / Artillerist'],
    };

    const normalized = classes.map((klass) => ({
        name: klass.name,
        slug: klass.index,
        source: '5e SRD',
        keyFeatures: ['Signature abilities available in detail view'],
    }));

    return [artificer, ...normalized];
}

function normalizeSubclasses(subclasses, classSlug) {
    return subclasses
        .filter((subclass) => {
            if (!classSlug) return true;
            return (subclass.class?.index ?? subclass.class) === classSlug;
        })
        .map((subclass) => ({
            name: subclass.name,
            slug: subclass.index,
            source: '5e SRD',
            summary: subclass.desc?.[0] ?? 'Signature features defined in rules text.',
        }));
}

function slugify(value) {
    return value?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ?? crypto.randomUUID();
}