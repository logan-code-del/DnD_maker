import { createStepManager } from './stepManager.js';
import { renderIdentityStep } from './steps/identityStep.js';
import { renderAncestryStep } from './steps/ancestryStep.js';
import { renderClassStep } from './steps/classStep.js';
import { renderSpellStep } from './steps/spellStep.js';
import { renderEquipmentStep } from './steps/equipmentStep.js';
import { renderSummaryStep } from './steps/summaryStep.js';

const STEP_SEQUENCE = [
    {
        id: 'identity',
        label: 'Hero Basics',
        description: 'Name, level, alignment, and backstory hooks.',
        render: renderIdentityStep,
    },
    {
        id: 'ancestry',
        label: 'Ancestry',
        description: 'Choose race, lineage, and heritage traits.',
        render: renderAncestryStep,
    },
    {
        id: 'class',
        label: 'Class & Path',
        description: 'Select class, subclass, and custom class features.',
        render: renderClassStep,
    },
    {
        id: 'spells',
        label: 'Spells & Invocations',
        description: 'Prepare spells, invocations, and magical secrets.',
        render: renderSpellStep,
    },
    {
        id: 'equipment',
        label: 'Gear & Resources',
        description: 'Manage inventory, proficiencies, and companions.',
        render: renderEquipmentStep,
    },
    {
        id: 'summary',
        label: 'Character Sheet',
        description: 'Review, export, and share your complete adventurer.',
        render: renderSummaryStep,
    },
];

export function initializeBuilder({ mount, stepper, compendium }) {
    const stepManager = createStepManager({
        mount,
        steps: STEP_SEQUENCE,
        compendium,
    });

    hydrateStepper(stepper, stepManager);
    stepManager.renderCurrentStep();
}

function hydrateStepper(stepperElement, stepManager) {
    stepperElement.innerHTML = '';
    stepManager.getSteps().forEach((step) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = step.label;
        button.dataset.stepId = step.id;
        button.title = step.description;

        if (stepManager.getCurrentStep().id === step.id) {
            button.setAttribute('aria-current', 'step');
        }

        button.addEventListener('click', () => {
            stepManager.goToStep(step.id);
        });

        stepperElement.appendChild(button);
    });

    stepManager.onStepChange((current) => {
        stepperElement.querySelectorAll('button').forEach((button) => {
            if (button.dataset.stepId === current.id) {
                button.setAttribute('aria-current', 'step');
            } else {
                button.removeAttribute('aria-current');
            }
        });
    });
}