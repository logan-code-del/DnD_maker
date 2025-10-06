import { createPanel } from '../components/panel.js';

export async function renderEquipmentStep({ mount, session, updateSession, goToNext, goToPrevious }) {
    const panel = createPanel({
        title: 'Equipment & Resources',
        description: 'Track inventory, coin, and special gear. Add magical items and companions as needed.',
        actions: [
            {
                label: 'Back',
                variant: 'ghost',
                onClick: goToPrevious,
            },
            {
                label: 'Next: Summary',
                variant: 'primary',
                onClick: goToNext,
            },
        ],
    });

    const form = document.createElement('form');
    form.className = 'field-group';
    form.innerHTML = `
        <label>
            <span>Gold & Coin</span>
            <input class="input-field" type="number" min="0" name="coin" value="${session.equipment.coin ?? 0}" required>
        </label>
        <label>
            <span>Inventory List</span>
            <textarea class="input-field" rows="4" name="inventory">${session.equipment.inventory.join('\n')}</textarea>
        </label>
        <label>
            <span>Trinkets & Companions</span>
            <textarea class="input-field" rows="4" name="trinkets">${session.equipment.trinkets.join('\n')}</textarea>
        </label>
        <label>
            <span>Notes</span>
            <textarea class="input-field" rows="4" name="notes">${session.equipment.notes ?? ''}</textarea>
        </label>
    `;

    form.addEventListener('change', () => {
        const formData = new FormData(form);
        updateSession({
            equipment: {
                coin: Number(formData.get('coin')),
                inventory: splitTextarea(formData.get('inventory')),
                trinkets: splitTextarea(formData.get('trinkets')),
                notes: formData.get('notes'),
            },
        });
    });

    panel.appendChild(form);
    mount.appendChild(panel);
}

function splitTextarea(value) {
    if (!value) return [];
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}