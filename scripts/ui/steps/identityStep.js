import { createPanel } from '../components/panel.js';

export async function renderIdentityStep({ mount, session, updateSession, goToNext }) {
    const panel = createPanel({
        title: 'Hero Basics',
        description: 'Name your adventurer, define their role, and set the tone for their story.',
        actions: [
            {
                label: 'Next: Ancestry',
                variant: 'primary',
                onClick: handleSubmit,
            },
        ],
    });

    const form = document.createElement('form');
    form.className = 'field-group';
    form.innerHTML = `
        <label>
            <span>Character Name</span>
            <input class="input-field" name="name" placeholder="e.g., Seraphina Dawnspark" required value="${session.identity.name ?? ''}">
        </label>
        <label>
            <span>Level</span>
            <input class="input-field" type="number" min="1" max="20" name="level" value="${session.identity.level ?? 1}" required>
        </label>
        <label>
            <span>Pronouns</span>
            <input class="input-field" name="pronouns" placeholder="they/them" value="${session.identity.pronouns ?? ''}">
        </label>
        <label>
            <span>Alignment</span>
            <input class="input-field" name="alignment" placeholder="Chaotic Good" value="${session.identity.alignment ?? ''}">
        </label>
        <label>
            <span>Party Role</span>
            <input class="input-field" name="campaignRole" placeholder="e.g., Support caster" value="${session.identity.campaignRole ?? ''}">
        </label>
        <label>
            <span>Backstory Hooks</span>
            <textarea class="input-field" rows="4" name="backstory" placeholder="Short origin story, goals, and secrets">${session.identity.backstory ?? ''}</textarea>
        </label>
    `;

    function handleSubmit(event) {
        if (event) {
            event.preventDefault();
        }

        const formData = new FormData(form);
        const identity = Object.fromEntries(formData.entries());
        identity.level = Number(identity.level) || 1;

        updateSession({ identity });
        goToNext();
    }

    form.addEventListener('submit', handleSubmit);

    panel.appendChild(form);
    mount.appendChild(panel);
}