import { loadSession, saveSession, resetSession } from '../data/sessionStore.js';

export function createStepManager({ mount, steps, compendium }) {
    let session = loadSession();
    let currentIndex = session.currentStepIndex ?? 0;
    const listeners = new Set();

    function getCurrentStep() {
        return steps[currentIndex];
    }

    function getSteps() {
        return steps;
    }

    function updateSession(partial) {
        const nextSession = {
            ...session,
            ...partial,
            currentStepIndex: currentIndex,
            lastUpdated: Date.now(),
        };
        saveSession(nextSession);
        session = loadSession(); 
        renderCurrentStep();
    }

    async function renderCurrentStep() {
        const step = getCurrentStep();
        mount.innerHTML = '';
        const context = {
            mount,
            session,
            compendium,
            updateSession,
            goToStep,
            goToNext,
            goToPrevious,
        };
        await step.render(context);
        notify();
    }

    function goToNext() {
        if (currentIndex < steps.length - 1) {
            currentIndex += 1;
            renderCurrentStep();
        }
    }

    function goToPrevious() {
        if (currentIndex > 0) {
            currentIndex -= 1;
            renderCurrentStep();
        }
    }

    function goToStep(stepId) {
        const index = steps.findIndex((step) => step.id === stepId);
        if (index === -1) return;
        currentIndex = index;
        renderCurrentStep();
    }

    function onStepChange(callback) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }

    function notify() {
        const step = getCurrentStep();
        listeners.forEach((callback) => callback(step));
    }

    return {
        renderCurrentStep,
        getCurrentStep,
        getSteps,
        goToNext,
        goToPrevious,
        goToStep,
        onStepChange,
        reset: () => {
            resetSession();
            currentIndex = 0;
            renderCurrentStep();
        },
    };
}