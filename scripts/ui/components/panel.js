export function createPanel({ title, description, actions = [] }) {
    const container = document.createElement('section');
    container.className = 'builder-panel';

    const header = document.createElement('div');
    header.className = 'panel-header';
    container.appendChild(header);

    const heading = document.createElement('div');
    heading.innerHTML = `
        <h2>${title}</h2>
        ${description ? `<p class="panel-description">${description}</p>` : ''}
    `;
    header.appendChild(heading);

    if (actions.length > 0) {
        const actionBar = document.createElement('div');
        actionBar.className = 'action-bar';
        actions.forEach((action) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = action.variant === 'primary' ? 'primary-button' : 'ghost-button';
            button.textContent = action.label;
            button.addEventListener('click', action.onClick);
            actionBar.appendChild(button);
        });
        header.appendChild(actionBar);
    }

    return container;
}