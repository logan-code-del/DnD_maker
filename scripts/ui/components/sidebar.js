const sidebarElement = document.getElementById('details-sidebar');
const sidebarContentElement = document.getElementById('sidebar-content');
const closeButton = document.getElementById('close-sidebar');

let currentItem = null;

function renderSidebar() {
    if (!currentItem) {
        sidebarElement.classList.remove('is-open');
        return;
    }

    sidebarContentElement.innerHTML = `
        <h2>${currentItem.name}</h2>
        <p>${currentItem.description || ''}</p>
        <pre>${JSON.stringify(currentItem, null, 2)}</pre>
    `;
    sidebarElement.classList.add('is-open');
}

export function showInSidebar(item) {
    currentItem = item;
    renderSidebar();
}

export function hideSidebar() {
    currentItem = null;
    renderSidebar();
}

closeButton.addEventListener('click', hideSidebar);
