import { initializeBuilder } from './ui/initializeBuilder.js';
import { fetchAndCacheCompendium } from './data/compendiumStore.js';

const appElement = document.getElementById('app');
const stepperElement = document.querySelector('.stepper');
const restartButton = document.getElementById('restart-builder');

async function startApp() {
    try {
        const compendium = await fetchAndCacheCompendium();
        initializeBuilder({
            mount: appElement,
            stepper: stepperElement,
            compendium,
        });
    } catch (error) {
        renderFatalError(error);
    }
}

function renderFatalError(error) {
    appElement.innerHTML = `
        <section class="builder-panel">
            <h2>Something went wrong</h2>
            <p>We were unable to load the required game data. Please refresh the page or try again later.</p>
            <code style="white-space: pre-wrap;">${error.message ?? error}</code>
        </section>
    `;
}

restartButton.addEventListener('click', () => {
    localStorage.removeItem('dnd-character-builder-session');
    window.location.reload();
});

startApp();