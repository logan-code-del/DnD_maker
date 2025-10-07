export function createOptionList({ options, onSelect, getLabel, getSubtitle, getDescription, isSelected, onShowDetails }) {
    const grid = document.createElement('div');
    grid.className = 'option-grid';

    options.forEach((option) => {
        const card = document.createElement('article');
        card.className = 'option-card';
        card.tabIndex = 0;
        card.dataset.value = option.index ?? option.slug ?? option.name;
        card.dataset.selected = isSelected(option)
            ? 'true'
            : 'false';

        const title = document.createElement('h3');
        title.textContent = getLabel(option);
        card.appendChild(title);

        if (getSubtitle) {
            const subtitleValue = getSubtitle(option);
            if (subtitleValue) {
                const subtitle = document.createElement('p');
                subtitle.className = 'subtitle';
                subtitle.textContent = subtitleValue;
                card.appendChild(subtitle);
            }
        }

        if (getDescription) {
            const descriptionText = getDescription(option);
            if (descriptionText) {
                const description = document.createElement('p');
                description.textContent = descriptionText;
                card.appendChild(description);
            }
        }

        const detailsButton = document.createElement('button');
        detailsButton.className = 'ghost-button small-button';
        detailsButton.textContent = 'Details';
        detailsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onShowDetails) {
                onShowDetails(option);
            }
        });
        card.appendChild(detailsButton);

        card.addEventListener('click', () => onSelect(option));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(option);
            }
        });

        grid.appendChild(card);
    });

    return grid;
}