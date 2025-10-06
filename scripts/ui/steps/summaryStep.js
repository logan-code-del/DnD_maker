import { createPanel } from '../components/panel.js';

export async function renderSummaryStep({ mount, session, goToPrevious, reset }) {
    const panel = createPanel({
        title: 'Character Sheet',
        description: 'Preview your adventurer, export a shareable summary, or download printable JSON.',
        actions: [
            {
                label: 'Back',
                variant: 'ghost',
                onClick: goToPrevious,
            },
            {
                label: 'Export JSON',
                variant: 'ghost',
                onClick: handleExport,
            },
        ],
    });

    const summary = document.createElement('div');
    summary.className = 'preview-card';
    summary.innerHTML = `
        <h3>${session.identity.name || 'Unnamed Hero'} • Level ${session.identity.level}</h3>
        <div class="inline-tags">
            ${renderTag(session.identity.pronouns)}
            ${renderTag(session.identity.alignment)}
            ${renderTag(session.identity.campaignRole)}
        </div>
        <section>
            <h4>Ancestry</h4>
            <p>${renderAncestryLine(session)}</p>
            ${renderList('Custom Traits', session.ancestry.customTraits)}
        </section>
        <section>
            <h4>Class & Path</h4>
            <p>${renderClassLine(session)}</p>
            ${renderList('Selected Features', session.class.selectedFeatures)}
        </section>
        <section>
            <h4>Spellcasting</h4>
            ${renderList('Prepared Spells', session.spells.prepared.map((spell) => spell.name))}
            ${renderList('Spellbook', session.spells.spellbook.map((spell) => spell.name))}
        </section>
        <section>
            <h4>Equipment</h4>
            <p><strong>Coin:</strong> ${session.equipment.coin} gp</p>
            ${renderList('Inventory', session.equipment.inventory)}
            ${renderList('Trinkets', session.equipment.trinkets)}
            <p>${session.equipment.notes ?? ''}</p>
        </section>
        <section>
            <h4>Backstory Hooks</h4>
            <p>${session.identity.backstory || 'Add personal history to flesh out this character.'}</p>
        </section>
    `;

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'ghost-button';
    resetButton.textContent = 'Start a New Character';
    resetButton.addEventListener('click', () => {
        reset();
    });

    panel.append(summary, resetButton);
    mount.appendChild(panel);

    function handleExport() {
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${session.identity.name || 'character'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

function renderTag(value) {
    if (!value) return '';
    return `<span class="tag">${value}</span>`;
}

function renderList(label, items) {
    if (!items || items.length === 0) {
        return '<p class="panel-description">Nothing selected yet.</p>';
    }

    return `
        <div>
            <strong>${label}</strong>
            <ul>
                ${items.map((item) => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;
}

function renderAncestryLine(session) {
    if (session.ancestry.customName) {
        return `${session.ancestry.customName} (${session.ancestry.abilityBonuses || 'No bonuses set'})`;
    }

    return session.ancestry.race?.name ?? 'No ancestry selected';
}

function renderClassLine(session) {
    if (session.class.customClass) {
        return `${session.class.customClass.name} (${session.class.customClass.hitDice || 'Hit dice ?'})`;
    }

    return session.class.primaryClass?.name ?? 'No class selected';
}