import { getCurrentStarSystem, setCanFuelRockets, setCanTravelToAsteroids, getTechTreeDataAndDraw, getTimerRateRatio, deferredActions, getCanAffordDeferred, setCanAffordDeferred, setTechUnlockedArray, setTemporaryCoreTechRowsRepo, setUnlockedCompoundsArray, getTechUnlockedArray, getUnlockedResourcesArray, getPlayerPhilosophy, setRepeatableTechMultipliers, getRepeatableTechMultipliers, setIncreaseStorageFactor, getStatRun, getCurrentRunIsMegaStructureRun, setPermanentAntimatterUnlock, getDemoBuild } from './constantsAndGlobalVars.js';
import { setAllCompoundsToZeroQuantity, gain, startUpdateTimersAndRates, addToResourceAllTimeStat, setFleetArmorBuffsAfterRepeatables, setFleetSpeedsAfterRepeatables, setFleetAttackDamageAfterRepeatables, setInitialImpressionBaseAfterRepeatables, setStarStudyEfficiencyAfterRepeatables, setAsteroidSearchEfficiencyAfterRepeatables, setRocketTravelTimeReductionAfterRepeatables, setStarshipTravelTimeReductionAfterRepeatables, setResourceAutobuyerPricesAfterRepeatables, setCompoundRecipePricesAfterRepeatables, setEnergyAndResearchBuildingPricesAfterRepeatables, setFleetPricesAfterRepeatables, setStarshipPartPricesAfterRepeatables, setRocketPartPricesAfterRepeatables, applyMegaStructureBonuses } from './game.js';
import { getStarSystemDataObject, setResourceDataObject, getResourceDataObject, setAutoBuyerTierLevel } from './resourceDataObject.js';
import { createOptionRow, removeTabAttentionIfNoIndicators, createToggleSwitch, createSvgElement, createTextElement, sortTechRows, createButton, showNotification, updateDescriptionRow, appendAttentionIndicator, showHideModal, setupInfoTooltips, callPopupModal } from './ui.js';
import { trackAnalyticsEvent } from './analytics.js';
import { modalMegaStructureTechDysonSphere1Header, modalMegaStructureTechDysonSphere1Text, modalMegaStructureTechDysonSphere2Header, modalMegaStructureTechDysonSphere2Text, modalMegaStructureTechDysonSphere3Header, modalMegaStructureTechDysonSphere3Text, modalMegaStructureTechDysonSphere4Header, modalMegaStructureTechDysonSphere4Text, modalMegaStructureTechDysonSphere5Header, modalMegaStructureTechDysonSphere5Text, modalMegaStructureTechCelestialProcessingCore1Header, modalMegaStructureTechCelestialProcessingCore1Text, modalMegaStructureTechCelestialProcessingCore2Header, modalMegaStructureTechCelestialProcessingCore2Text, modalMegaStructureTechCelestialProcessingCore3Header, modalMegaStructureTechCelestialProcessingCore3Text, modalMegaStructureTechCelestialProcessingCore4Header, modalMegaStructureTechCelestialProcessingCore4Text, modalMegaStructureTechCelestialProcessingCore5Header, modalMegaStructureTechCelestialProcessingCore5Text, modalMegaStructureTechPlasmaForge1Header, modalMegaStructureTechPlasmaForge1Text, modalMegaStructureTechPlasmaForge2Header, modalMegaStructureTechPlasmaForge2Text, modalMegaStructureTechPlasmaForge3Header, modalMegaStructureTechPlasmaForge3Text, modalMegaStructureTechPlasmaForge4Header, modalMegaStructureTechPlasmaForge4Text, modalMegaStructureTechPlasmaForge5Header, modalMegaStructureTechPlasmaForge5Text, modalMegaStructureTechGalacticMemoryArchive1Header, modalMegaStructureTechGalacticMemoryArchive1Text, modalMegaStructureTechGalacticMemoryArchive2Header, modalMegaStructureTechGalacticMemoryArchive2Text, modalMegaStructureTechGalacticMemoryArchive3Header, modalMegaStructureTechGalacticMemoryArchive3Text, modalMegaStructureTechGalacticMemoryArchive4Header, modalMegaStructureTechGalacticMemoryArchive4Text, modalMegaStructureTechGalacticMemoryArchive5Header, modalMegaStructureTechGalacticMemoryArchive5Text, modalNanoBrokersUnlockHeader, modalNanoBrokersUnlockText, modalRocketCompositesTabUnlockHeader, modalRocketCompositesTabUnlockText, modalQuantumComputingTabUnlockHeader, modalQuantumComputingTabUnlockText, modalScienceLabsTabUnlockHeader, modalScienceLabsTabUnlockText, modalKnowledgeSharingTabUnlockHeader, modalKnowledgeSharingTabUnlockText, modalInterstellarTabUnlockHeader, modalInterstellarTabUnlockText, modalEnergyTabUnlockHeader, modalEnergyTabUnlockText, modalSpaceMiningTabUnlockText, modalSpaceMiningTabUnlockHeader, modalCompoundsTabUnlockHeader, modalCompoundsTabUnlockText, techNotificationMessages } from './descriptions.js';

export function drawTab3Content(heading, optionContentElement) {
    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
    if (optionElement) {
        const warningIcon = optionElement.querySelector('span.attention-indicator');
        if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
            warningIcon.remove();
        }
    }
    removeTabAttentionIfNoIndicators('tab3');

    if (heading === 'Philosophy') {
        const headerRow = document.getElementById('headerContentTab3');
        if (headerRow) {
            headerRow.innerHTML = `Philosophy <p id="info_philosophyHeader" class="info-emoji">ℹ️</p>`;
        }
        setupInfoTooltips();
    }

    sortTechRows(true);
    if (heading === 'Research') {

        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];

        const autoBuyerEnabled = !!getResourceDataObject('research', ['upgrades', 'autoBuyer', 'enabled']);

        const researchAutoBuyerRow = createOptionRow({
                labelId: 'researchAutoBuyerRow',
                renderNameABs: null,
                labelText: 'Research AutoBuyer:',
                inputElements: [
                    createToggleSwitch('scienceAutoBuyerToggle', autoBuyerEnabled, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'research', ['upgrades', 'autoBuyer', 'enabled']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: null,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: null,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'science'
            });
        researchAutoBuyerRow.classList.add('invisible');
        optionContentElement.appendChild(researchAutoBuyerRow);

        const researchScienceKitRow = createOptionRow({
                labelId: 'researchScienceKitRow',
                renderNameABs: null,
                labelText: 'Science Kit:',
                inputElements: [
                    createButton({
                        text: `Add ${getResourceDataObject('research', ['upgrades', 'scienceKit', 'rate']) * getTimerRateRatio()} Research /s`,
                        classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'scienceKitQuantity', 'scienceKit', false, null, 'scienceUpgrade', 'resources');
                            addToResourceAllTimeStat(1, 'scienceKits');
                            deferredActions.push(() => {
                                if (getCanAffordDeferred()) {
                                    startUpdateTimersAndRates('scienceKit');
                                }
                                setCanAffordDeferred(null);
                            });
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'scienceUpgrade',
                        objectSectionArgument2: 'scienceKit',
                        quantityArgument: 'cash',
                        disableKeyboardForButton: true,
                        autoBuyerTier: null,
                        rowCategory: 'science'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('research', ['upgrades', 'scienceKit', 'quantity'])}`, 'scienceKitQuantity', ['science-building-quantity']),
                    createToggleSwitch('scienceKitToggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'research', ['upgrades', 'scienceKit', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getResourceDataObject('research', ['upgrades', 'scienceKit', 'price']) + ' Research'}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'scienceUpgrade',
                objectSectionArgument2: 'scienceKit',
                quantityArgument: 'cash',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'science'
            });
        optionContentElement.appendChild(researchScienceKitRow);

        const researchScienceClubRow = createOptionRow({
                labelId: 'researchScienceClubRow',
                renderNameABs: null,
                labelText: 'Open Science Club:',
                inputElements: [
                    createButton({
                        text: `Add ${getResourceDataObject('research', ['upgrades', 'scienceClub', 'rate']) * getTimerRateRatio()} Research /s`,
                        classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'scienceClubQuantity', 'scienceClub', false, null, 'scienceUpgrade', 'resources');
                            addToResourceAllTimeStat(1, 'scienceClubs');
                            deferredActions.push(() => {
                                if (getCanAffordDeferred()) {
                                    startUpdateTimersAndRates('scienceClub');
                                }
                                setCanAffordDeferred(null);
                            });
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'scienceUpgrade',
                        objectSectionArgument2: 'scienceClub',
                        quantityArgument: 'cash',
                        disableKeyboardForButton: true,
                        autoBuyerTier: null,
                        rowCategory: 'science'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('research', ['upgrades', 'scienceClub', 'quantity'])}`, 'scienceClubQuantity', ['science-building-quantity']),
                    createToggleSwitch('scienceClubToggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'research', ['upgrades', 'scienceClub', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getResourceDataObject('research', ['upgrades', 'scienceClub', 'price']) + '$'}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'scienceUpgrade',
                objectSectionArgument2: 'scienceClub',
                quantityArgument: 'cash',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: ['tech', 'knowledgeSharing'],
                rowCategory: 'science'
            });
        optionContentElement.appendChild(researchScienceClubRow);

        const researchScienceLabRow = createOptionRow({
                labelId: 'researchScienceLabRow',
                renderNameABs: null,
                labelText: 'Open Science Lab:',
                inputElements: [
                    createButton({
                        text: `Add ${getResourceDataObject('research', ['upgrades', 'scienceLab', 'rate']) * getTimerRateRatio()} Research /s`,
                        classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', ...demoExtraClasses],
                        onClick: () => {
                            gain(1, 'scienceLabQuantity', 'scienceLab', false, null, 'scienceUpgrade', 'resources');
                            addToResourceAllTimeStat(1, 'scienceLabs');
                            deferredActions.push(() => {
                                if (getCanAffordDeferred()) {
                                    startUpdateTimersAndRates('scienceLab');
                                }
                                setCanAffordDeferred(null);
                            });
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'scienceUpgrade',
                        objectSectionArgument2: 'scienceLab',
                        quantityArgument: 'cash',
                        disableKeyboardForButton: true,
                        autoBuyerTier: null,
                        rowCategory: 'science'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('research', ['upgrades', 'scienceLab', 'quantity'])}`, 'scienceLabQuantity', ['science-building-quantity']),
                    createToggleSwitch('scienceLabToggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'research', ['upgrades', 'scienceLab', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getResourceDataObject('research', ['upgrades', 'scienceLab', 'price']) + '$'}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'scienceUpgrade',
                objectSectionArgument2: 'scienceLab',
                quantityArgument: 'cash',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: ['tech', 'scienceLaboratories'],
                rowCategory: 'science'
            });
        optionContentElement.appendChild(researchScienceLabRow);

    } else if (heading === 'Technology') {
        const rows = [
            {
                techName: 'knowledgeSharing',
                row: createOptionRow({
                    labelId: 'techKnowledgeSharingRow',
                    renderNameABs: null,
                    labelText: 'Knowledge Sharing:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('knowledgeSharing', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'knowledgeSharing',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['knowledgeSharing', 'price'])} Research${getResourceDataObject('techs', ['knowledgeSharing', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="knowledgeSharingPrereq">${getResourceDataObject('techs', ['knowledgeSharing', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'knowledgeSharing',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'fusionTheory',
                row: createOptionRow({
                    labelId: 'techFusionTheoryRow',
                    renderNameABs: null,
                    labelText: 'Fusion Theory:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('fusionTheory', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'fusionTheory',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['fusionTheory', 'price'])} Research${getResourceDataObject('techs', ['fusionTheory', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionTheoryPrereq">${getResourceDataObject('techs', ['fusionTheory', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'fusionTheory',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'hydrogenFusion',
                row: createOptionRow({
                    labelId: 'techHydrogenFusionRow',
                    renderNameABs: null,
                    labelText: 'Hydrogen Fusion:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('hydrogenFusion', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'hydrogenFusion',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['hydrogenFusion', 'price'])} Research${getResourceDataObject('techs', ['hydrogenFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="hydrogenFusionPrereq">${getResourceDataObject('techs', ['hydrogenFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'hydrogenFusion',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'heliumFusion',
                row: createOptionRow({
                    labelId: 'techHeliumFusionRow',
                    renderNameABs: null,
                    labelText: 'Helium Fusion:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('heliumFusion', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'heliumFusion',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['heliumFusion', 'price'])} Research${getResourceDataObject('techs', ['heliumFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="heliumFusionPrereq">${getResourceDataObject('techs', ['heliumFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'heliumFusion',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'carbonFusion',
                row: createOptionRow({
                    labelId: 'techCarbonFusionRow',
                    renderNameABs: null,
                    labelText: 'Carbon Fusion:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('carbonFusion', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'carbonFusion',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['carbonFusion', 'price'])} Research${getResourceDataObject('techs', ['carbonFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="carbonFusionPrereq">${getResourceDataObject('techs', ['carbonFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'carbonFusion',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'neonFusion',
                row: createOptionRow({
                    labelId: 'techNeonFusionRow',
                    renderNameABs: null,
                    labelText: 'Neon Fusion:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('neonFusion', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'neonFusion',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['neonFusion', 'price'])} Research${getResourceDataObject('techs', ['neonFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="neonFusionPrereq">${getResourceDataObject('techs', ['neonFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'neonFusion',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },            
            {
                techName: 'oxygenFusion',
                row: createOptionRow({
                    labelId: 'techOxygenFusionRow',
                    renderNameABs: null,
                    labelText: 'Oxygen Fusion:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('oxygenFusion', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'oxygenFusion',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['oxygenFusion', 'price'])} Research${getResourceDataObject('techs', ['oxygenFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="oxygenFusionPrereq">${getResourceDataObject('techs', ['oxygenFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'oxygenFusion',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },            
            {
                techName: 'siliconFusion',
                row: createOptionRow({
                    labelId: 'techSiliconFusionRow',
                    renderNameABs: null,
                    labelText: 'Silicon Fusion:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('siliconFusion', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'siliconFusion',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['siliconFusion', 'price'])} Research${getResourceDataObject('techs', ['siliconFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="siliconFusionPrereq">${getResourceDataObject('techs', ['siliconFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'siliconFusion',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },    
            {
                techName: 'nobleGasCollection',
                row: createOptionRow({
                    labelId: 'techNobleGasCollectionRow',
                    renderNameABs: null,
                    labelText: 'Noble Gas Collection:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('nobleGasCollection', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'nobleGasCollection',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['nobleGasCollection', 'price'])} Research${getResourceDataObject('techs', ['nobleGasCollection', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="nobleGasCollectionPrereq">${getResourceDataObject('techs', ['nobleGasCollection', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'nobleGasCollection',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'glassManufacture',
                row: createOptionRow({
                    labelId: 'techGlassManufactureRow',
                    renderNameABs: null,
                    labelText: 'Glass Manufacture:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('glassManufacture', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'glassManufacture',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['glassManufacture', 'price'])} Research${getResourceDataObject('techs', ['glassManufacture', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="glassManufacturePrereq">${getResourceDataObject('techs', ['glassManufacture', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'glassManufacture',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'aggregateMixing',
                row: createOptionRow({
                    labelId: 'techAggregateMixingRow',
                    renderNameABs: null,
                    labelText: 'Aggregate Mixing:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('aggregateMixing', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'aggregateMixing',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['aggregateMixing', 'price'])} Research${getResourceDataObject('techs', ['aggregateMixing', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="aggregateMixingPrereq">${getResourceDataObject('techs', ['aggregateMixing', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'aggregateMixing',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },            
            {
                techName: 'neutronCapture',
                row: createOptionRow({
                    labelId: 'techNeutronCaptureRow',
                    renderNameABs: null,
                    labelText: 'Neutron Capture:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('neutronCapture', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'neutronCapture',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['neutronCapture', 'price'])} Research${getResourceDataObject('techs', ['neutronCapture', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="neutronCapturePrereq">${getResourceDataObject('techs', ['neutronCapture', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'neutronCapture',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },                               
            {
                techName: 'quantumComputing',
                row: createOptionRow({
                    labelId: 'techQuantumComputingRow',
                    renderNameABs: null,
                    labelText: 'Quantum Computing:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('quantumComputing', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'quantumComputing',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['quantumComputing', 'price'])} Research${getResourceDataObject('techs', ['quantumComputing', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="quantumComputingPrereq">${getResourceDataObject('techs', ['quantumComputing', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'quantumComputing',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'scienceLaboratories',
                row: createOptionRow({
                    labelId: 'techScienceLaboratoriesRow',
                    renderNameABs: null,
                    labelText: 'Science Laboratories:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('scienceLaboratories', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'scienceLaboratories',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['scienceLaboratories', 'price'])} Research${getResourceDataObject('techs', ['scienceLaboratories', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="scienceLaboratoriesPrereq">${getResourceDataObject('techs', ['scienceLaboratories', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'scienceLaboratories',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'hydroCarbons',
                row: createOptionRow({
                    labelId: 'techHydroCarbonsRow',
                    renderNameABs: null,
                    labelText: 'HydroCarbons:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('hydroCarbons', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'hydroCarbons',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['hydroCarbons', 'price'])} Research${getResourceDataObject('techs', ['hydroCarbons', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="hydroCarbonsPrereq">${getResourceDataObject('techs', ['hydroCarbons', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'hydroCarbons',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'nanoTubeTechnology',
                row: createOptionRow({
                    labelId: 'techNanoTubeTechnologyRow',
                    renderNameABs: null,
                    labelText: 'Nano Tube Technology:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('nanoTubeTechnology', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'nanoTubeTechnology',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['nanoTubeTechnology', 'price'])} Research${getResourceDataObject('techs', ['nanoTubeTechnology', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="nanoTubeTechnologyPrereq">${getResourceDataObject('techs', ['nanoTubeTechnology', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'nanoTubeTechnology',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'nanoBrokers',
                row: createOptionRow({
                    labelId: 'techNanoBrokersRow',
                    renderNameABs: null,
                    labelText: 'Nano Brokers:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('nanoBrokers', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'nanoBrokers',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['nanoBrokers', 'price'])} Research${getResourceDataObject('techs', ['nanoBrokers', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="nanoBrokersPrereq">${getResourceDataObject('techs', ['nanoBrokers', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'nanoBrokers',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'stellarCartography',
                row: createOptionRow({
                    labelId: 'techStellarCartographyRow',
                    renderNameABs: null,
                    labelText: 'Stellar Cartography:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('stellarCartography', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'stellarCartography',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['stellarCartography', 'price'])} Research${getResourceDataObject('techs', ['stellarCartography', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="stellarCartographyPrereq">${getResourceDataObject('techs', ['stellarCartography', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'stellarCartography',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'basicPowerGeneration',
                row: createOptionRow({
                    labelId: 'techBasicPowerGenerationRow',
                    renderNameABs: null,
                    labelText: 'Basic Power Generation:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('basicPowerGeneration', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'basicPowerGeneration',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['basicPowerGeneration', 'price'])} Research${getResourceDataObject('techs', ['basicPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="basicPowerGenerationPrereq">${getResourceDataObject('techs', ['basicPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'basicPowerGeneration',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'sodiumIonPowerStorage',
                row: createOptionRow({
                    labelId: 'techSodiumIonPowerStorageRow',
                    renderNameABs: null,
                    labelText: 'Sodium Ion Power Storage:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('sodiumIonPowerStorage', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'sodiumIonPowerStorage',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['sodiumIonPowerStorage', 'price'])} Research${getResourceDataObject('techs', ['sodiumIonPowerStorage', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="sodiumIonPowerStoragePrereq">${getResourceDataObject('techs', ['sodiumIonPowerStorage', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'sodiumIonPowerStorage',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'advancedPowerGeneration',
                row: createOptionRow({
                    labelId: 'techAdvancedPowerGenerationRow',
                    renderNameABs: null,
                    labelText: 'Advanced Power Generation:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('advancedPowerGeneration', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'advancedPowerGeneration',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['advancedPowerGeneration', 'price'])} Research${getResourceDataObject('techs', ['advancedPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="advancedPowerGenerationPrereq">${getResourceDataObject('techs', ['advancedPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'advancedPowerGeneration',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'solarPowerGeneration',
                row: createOptionRow({
                    labelId: 'techSolarPowerGenerationRow',
                    renderNameABs: null,
                    labelText: 'Solar Power Generation:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => { handleTechnologyButtonClick('solarPowerGeneration', event); },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'solarPowerGeneration',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['solarPowerGeneration', 'price'])} Research${getResourceDataObject('techs', ['solarPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="solarPowerGenerationPrereq">${getResourceDataObject('techs', ['solarPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'solarPowerGeneration',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'rocketComposites',
                row: createOptionRow({
                    labelId: 'techRocketCompositesRow',
                    renderNameABs: null,
                    labelText: 'Rocket Composites:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('rocketComposites', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'rocketComposites',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['rocketComposites', 'price'])} Research${getResourceDataObject('techs', ['rocketComposites', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="rocketCompositesPrereq">${getResourceDataObject('techs', ['rocketComposites', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'rocketComposites',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'advancedFuels',
                row: createOptionRow({
                    labelId: 'techAdvancedFuelsRow',
                    renderNameABs: null,
                    labelText: 'Advanced Fuels:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('advancedFuels', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'advancedFuels',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['advancedFuels', 'price'])} Research${getResourceDataObject('techs', ['advancedFuels', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="advancedFuelsPrereq">${getResourceDataObject('techs', ['advancedFuels', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'advancedFuels',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'planetaryNavigation',
                row: createOptionRow({
                    labelId: 'techPlanetaryNavigationRow',
                    renderNameABs: null,
                    labelText: 'Planetary Navigation:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('planetaryNavigation', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'planetaryNavigation',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['planetaryNavigation', 'price'])} Research${getResourceDataObject('techs', ['planetaryNavigation', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="planetaryNavigationPrereq">${getResourceDataObject('techs', ['planetaryNavigation', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'planetaryNavigation',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'compounds',
                row: createOptionRow({
                    labelId: 'techCompoundsRow',
                    renderNameABs: null,
                    labelText: 'Compounds:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('compounds', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'compounds',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['compounds', 'price'])} Research${getResourceDataObject('techs', ['compounds', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="compoundsPrereq">${getResourceDataObject('techs', ['compounds', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'compounds',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'steelFoundries',
                row: createOptionRow({
                    labelId: 'techSteelFoundriesRow',
                    renderNameABs: null,
                    labelText: 'Steel Foundries:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('steelFoundries', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'steelFoundries',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['steelFoundries', 'price'])} Research${getResourceDataObject('techs', ['steelFoundries', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="steelFoundriesPrereq">${getResourceDataObject('techs', ['steelFoundries', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'steelFoundries',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'giganticTurbines',
                row: createOptionRow({
                    labelId: 'techGiganticTurbinesRow',
                    renderNameABs: null,
                    labelText: 'Gigantic Turbines:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('giganticTurbines', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'giganticTurbines',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['giganticTurbines', 'price'])} Research${getResourceDataObject('techs', ['giganticTurbines', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="giganticTurbinesPrereq">${getResourceDataObject('techs', ['giganticTurbines', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'giganticTurbines',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'atmosphericTelescopes',
                row: createOptionRow({
                    labelId: 'techAtmosphericTelescopesRow',
                    renderNameABs: null,
                    labelText: 'Atmospheric Telescopes:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('atmosphericTelescopes', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'atmosphericTelescopes',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['atmosphericTelescopes', 'price'])} Research${getResourceDataObject('techs', ['atmosphericTelescopes', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="atmosphericTelescopesPrereq">${getResourceDataObject('techs', ['atmosphericTelescopes', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'atmosphericTelescopes',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'fusionEfficiencyI',
                row: createOptionRow({
                    labelId: 'techFusionEfficiencyIRow',
                    renderNameABs: null,
                    labelText: 'Fusion Efficiency I:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('fusionEfficiencyI', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'fusionEfficiencyI',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['fusionEfficiencyI', 'price'])} Research${getResourceDataObject('techs', ['fusionEfficiencyI', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionEfficiencyIPrereq">${getResourceDataObject('techs', ['fusionEfficiencyI', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'fusionEfficiencyI',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'fusionEfficiencyII',
                row: createOptionRow({
                    labelId: 'techFusionEfficiencyIIRow',
                    renderNameABs: null,
                    labelText: 'Fusion Efficiency II:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('fusionEfficiencyII', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'fusionEfficiencyII',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }), 
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['fusionEfficiencyII', 'price'])} Research${getResourceDataObject('techs', ['fusionEfficiencyII', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionEfficiencyIIPrereq">${getResourceDataObject('techs', ['fusionEfficiencyII', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'fusionEfficiencyII',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'fusionEfficiencyIII',
                row: createOptionRow({
                    labelId: 'techFusionEfficiencyIIIRow',
                    renderNameABs: null,
                    labelText: 'Fusion Efficiency III:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('fusionEfficiencyIII', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'fusionEfficiencyIII',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['fusionEfficiencyIII', 'price'])} Research${getResourceDataObject('techs', ['fusionEfficiencyIII', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionEfficiencyIIIPrereq">${getResourceDataObject('techs', ['fusionEfficiencyIII', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'fusionEfficiencyIII',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'orbitalConstruction',
                row: createOptionRow({
                    labelId: 'techOrbitalConstructionRow',
                    renderNameABs: null,
                    labelText: 'Orbital Construction:',
                    inputElements: [
                        (() => {
                            const extraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
                            return createButton({
                                text: `Research`,
                                classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock', ...extraClasses],
                                onClick: (event) => {
                                    handleTechnologyButtonClick('orbitalConstruction', event);
                                },
                                dataConditionCheck: 'techUnlock',
                                resourcePriceObject: '',
                                objectSectionArgument1: 'orbitalConstruction',
                                quantityArgument: 'research',
                                disableKeyboardForButton: true,
                                rowCategory: 'tech'
                            });
                        })(),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['orbitalConstruction', 'price'])} Research${getResourceDataObject('techs', ['orbitalConstruction', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="orbitalConstructionPrereq">${getResourceDataObject('techs', ['orbitalConstruction', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'orbitalConstruction',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'antimatterEngines',
                row: createOptionRow({
                    labelId: 'techAntimatterEnginesRow',
                    renderNameABs: null,
                    labelText: 'Antimatter Engines:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('antimatterEngines', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'antimatterEngines',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['antimatterEngines', 'price'])} Research${getResourceDataObject('techs', ['antimatterEngines', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="antimatterEnginesPrereq">${getResourceDataObject('techs', ['antimatterEngines', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'antimatterEngines',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'FTLTravelTheory',
                row: createOptionRow({
                    labelId: 'techFTLTravelTheoryRow',
                    renderNameABs: null,
                    labelText: 'FTL Travel Theory:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('FTLTravelTheory', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'FTLTravelTheory',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['FTLTravelTheory', 'price'])} Research${getResourceDataObject('techs', ['FTLTravelTheory', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="FTLTravelTheoryPrereq">${getResourceDataObject('techs', ['FTLTravelTheory', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'FTLTravelTheory',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'lifeSupportSystems',
                row: createOptionRow({
                    labelId: 'techLifeSupportSystemsRow',
                    renderNameABs: null,
                    labelText: 'Life Support Systems:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('lifeSupportSystems', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'lifeSupportSystems',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['lifeSupportSystems', 'price'])} Research${getResourceDataObject('techs', ['lifeSupportSystems', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="lifeSupportSystemsPrereq">${getResourceDataObject('techs', ['lifeSupportSystems', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'lifeSupportSystems',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'starshipFleets',
                row: createOptionRow({
                    labelId: 'techStarshipFleetsRow',
                    renderNameABs: null,
                    labelText: 'Starship Fleets:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('starshipFleets', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'starshipFleets',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['starshipFleets', 'price'])} Research${getResourceDataObject('techs', ['starshipFleets', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="starshipFleetsPrereq">${getResourceDataObject('techs', ['starshipFleets', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'starshipFleets',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'stellarScanners',
                row: createOptionRow({
                    labelId: 'techStellarScannersRow',
                    renderNameABs: null,
                    labelText: 'Stellar Scanners:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                handleTechnologyButtonClick('stellarScanners', event);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'stellarScanners',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['stellarScanners', 'price'])} Research${getResourceDataObject('techs', ['stellarScanners', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="stellarScannersPrereq">${getResourceDataObject('techs', ['stellarScanners', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'stellarScanners',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: ['research', 'researchPoints'],
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            }, 
            
            //MEGASTRUCTURE TECHS

            {
                techName: 'dysonSphereUnderstanding',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow({
                    labelId: 'techDysonSphereUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Understanding',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('dysonSphereUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('dysonSphereUnderstanding');
                                showNotification(techNotificationMessages.dysonSphereUnderstanding, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechDysonSphere1Header,
                                    content: modalMegaStructureTechDysonSphere1Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(1,1);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'dysonSphereUnderstanding',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['dysonSphereUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereUnderstandingPrereq">${getResourceDataObject('techs', ['dysonSphereUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'dysonSphereUnderstanding',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'dysonSphereCapabilities',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow({
                    labelId: 'techDysonSphereCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Capabilities',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('dysonSphereCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('dysonSphereCapabilities');
                                showNotification(techNotificationMessages.dysonSphereCapabilities, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechDysonSphere2Header,
                                    content: modalMegaStructureTechDysonSphere2Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(1,2);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'dysonSphereCapabilities',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['dysonSphereCapabilities', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereCapabilitiesPrereq">${getResourceDataObject('techs', ['dysonSphereCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'dysonSphereCapabilities',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'dysonSphereDisconnect',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow({
                    labelId: 'techDysonSphereDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Disconnect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('dysonSphereDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('dysonSphereDisconnect');
                                showNotification(techNotificationMessages.dysonSphereDisconnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechDysonSphere3Header,
                                    content: modalMegaStructureTechDysonSphere3Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(1,3);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'dysonSphereDisconnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['dysonSphereDisconnect', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereDisconnectPrereq">${getResourceDataObject('techs', ['dysonSphereDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'dysonSphereDisconnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'dysonSpherePower',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow({
                    labelId: 'techDysonSpherePowerRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Power',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('dysonSpherePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('dysonSpherePower');
                                showNotification(techNotificationMessages.dysonSpherePower, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechDysonSphere4Header,
                                    content: modalMegaStructureTechDysonSphere4Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(1,4);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'dysonSpherePower',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['dysonSpherePower', 'price'])} Research${getResourceDataObject('techs', ['dysonSpherePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSpherePowerPrereq">${getResourceDataObject('techs', ['dysonSpherePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'dysonSpherePower',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'dysonSphereConnect',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow({
                    labelId: 'techDysonSphereConnectRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Connect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('dysonSphereConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('dysonSphereConnect');
                                showNotification(techNotificationMessages.dysonSphereConnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechDysonSphere5Header,
                                    content: modalMegaStructureTechDysonSphere5Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(1,5);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'dysonSphereConnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['dysonSphereConnect', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereConnectPrereq">${getResourceDataObject('techs', ['dysonSphereConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'dysonSphereConnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'celestialProcessingCoreUnderstanding',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow({
                    labelId: 'techCelestialProcessingCoreUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Understanding',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('celestialProcessingCoreUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('celestialProcessingCoreUnderstanding');
                                showNotification(techNotificationMessages.celestialProcessingCoreUnderstanding, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechCelestialProcessingCore1Header,
                                    content: modalMegaStructureTechCelestialProcessingCore1Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(2,1);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'celestialProcessingCoreUnderstanding',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['celestialProcessingCoreUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreUnderstandingPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'celestialProcessingCoreUnderstanding',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'celestialProcessingCoreCapabilities',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow({
                    labelId: 'techCelestialProcessingCoreCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Capabilities',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('celestialProcessingCoreCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('celestialProcessingCoreCapabilities');
                                showNotification(techNotificationMessages.celestialProcessingCoreCapabilities, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechCelestialProcessingCore2Header,
                                    content: modalMegaStructureTechCelestialProcessingCore2Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(2,2);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'celestialProcessingCoreCapabilities',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['celestialProcessingCoreCapabilities', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreCapabilitiesPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'celestialProcessingCoreCapabilities',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'celestialProcessingCoreDisconnect',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow({
                    labelId: 'techCelestialProcessingCoreDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Disconnect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('celestialProcessingCoreDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('celestialProcessingCoreDisconnect');
                                showNotification(techNotificationMessages.celestialProcessingCoreDisconnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechCelestialProcessingCore3Header,
                                    content: modalMegaStructureTechCelestialProcessingCore3Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(2,3);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'celestialProcessingCoreDisconnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['celestialProcessingCoreDisconnect', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreDisconnectPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'celestialProcessingCoreDisconnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'celestialProcessingCorePower',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow({
                    labelId: 'techCelestialProcessingCorePowerRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Power',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('celestialProcessingCorePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('celestialProcessingCorePower');
                                showNotification(techNotificationMessages.celestialProcessingCorePower, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechCelestialProcessingCore4Header,
                                    content: modalMegaStructureTechCelestialProcessingCore4Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(2,4);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'celestialProcessingCorePower',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['celestialProcessingCorePower', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCorePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCorePowerPrereq">${getResourceDataObject('techs', ['celestialProcessingCorePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'celestialProcessingCorePower',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'celestialProcessingCoreConnect',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow({
                    labelId: 'techCelestialProcessingCoreConnectRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Connect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('celestialProcessingCoreConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('celestialProcessingCoreConnect');
                                showNotification(techNotificationMessages.celestialProcessingCoreConnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechCelestialProcessingCore5Header,
                                    content: modalMegaStructureTechCelestialProcessingCore5Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(2,5);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'celestialProcessingCoreConnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['celestialProcessingCoreConnect', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreConnectPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'celestialProcessingCoreConnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'plasmaForgeUnderstanding',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow({
                    labelId: 'techPlasmaForgeUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Understanding',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('plasmaForgeUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('plasmaForgeUnderstanding');
                                showNotification(techNotificationMessages.plasmaForgeUnderstanding, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechPlasmaForge1Header,
                                    content: modalMegaStructureTechPlasmaForge1Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(3,1);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'plasmaForgeUnderstanding',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['plasmaForgeUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeUnderstandingPrereq">${getResourceDataObject('techs', ['plasmaForgeUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'plasmaForgeUnderstanding',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'plasmaForgeCapabilities',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow({
                    labelId: 'techPlasmaForgeCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Capabilities',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('plasmaForgeCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('plasmaForgeCapabilities');
                                showNotification(techNotificationMessages.plasmaForgeCapabilities, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechPlasmaForge2Header,
                                    content: modalMegaStructureTechPlasmaForge2Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(3,2);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'plasmaForgeCapabilities',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['plasmaForgeCapabilities', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeCapabilitiesPrereq">${getResourceDataObject('techs', ['plasmaForgeCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'plasmaForgeCapabilities',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'plasmaForgeDisconnect',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow({
                    labelId: 'techPlasmaForgeDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Disconnect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('plasmaForgeDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('plasmaForgeDisconnect');
                                showNotification(techNotificationMessages.plasmaForgeDisconnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechPlasmaForge3Header,
                                    content: modalMegaStructureTechPlasmaForge3Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(3,3);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'plasmaForgeDisconnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['plasmaForgeDisconnect', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeDisconnectPrereq">${getResourceDataObject('techs', ['plasmaForgeDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'plasmaForgeDisconnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'plasmaForgePower',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow({
                    labelId: 'techPlasmaForgePowerRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Power',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('plasmaForgePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('plasmaForgePower');
                                showNotification(techNotificationMessages.plasmaForgePower, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechPlasmaForge4Header,
                                    content: modalMegaStructureTechPlasmaForge4Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(3,4);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'plasmaForgePower',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['plasmaForgePower', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgePowerPrereq">${getResourceDataObject('techs', ['plasmaForgePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'plasmaForgePower',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'plasmaForgeConnect',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow({
                    labelId: 'techPlasmaForgeConnectRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Connect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('plasmaForgeConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('plasmaForgeConnect');
                                showNotification(techNotificationMessages.plasmaForgeConnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechPlasmaForge5Header,
                                    content: modalMegaStructureTechPlasmaForge5Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(3,5);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'plasmaForgeConnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['plasmaForgeConnect', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeConnectPrereq">${getResourceDataObject('techs', ['plasmaForgeConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'plasmaForgeConnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'galacticMemoryArchiveUnderstanding',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow({
                    labelId: 'techGalacticMemoryArchiveUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Understanding',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('galacticMemoryArchiveUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('galacticMemoryArchiveUnderstanding');
                                showNotification(techNotificationMessages.galacticMemoryArchiveUnderstanding, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechGalacticMemoryArchive1Header,
                                    content: modalMegaStructureTechGalacticMemoryArchive1Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(4,1);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'galacticMemoryArchiveUnderstanding',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['galacticMemoryArchiveUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveUnderstandingPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'galacticMemoryArchiveUnderstanding',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'galacticMemoryArchiveCapabilities',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow({
                    labelId: 'techGalacticMemoryArchiveCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Capabilities',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('galacticMemoryArchiveCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('galacticMemoryArchiveCapabilities');
                                showNotification(techNotificationMessages.galacticMemoryArchiveCapabilities, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechGalacticMemoryArchive2Header,
                                    content: modalMegaStructureTechGalacticMemoryArchive2Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(4,2);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'galacticMemoryArchiveCapabilities',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['galacticMemoryArchiveCapabilities', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveCapabilitiesPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'galacticMemoryArchiveCapabilities',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'galacticMemoryArchiveDisconnect',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow({
                    labelId: 'techGalacticMemoryArchiveDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Disconnect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('galacticMemoryArchiveDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('galacticMemoryArchiveDisconnect');
                                showNotification(techNotificationMessages.galacticMemoryArchiveDisconnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechGalacticMemoryArchive3Header,
                                    content: modalMegaStructureTechGalacticMemoryArchive3Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(4,3);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'galacticMemoryArchiveDisconnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['galacticMemoryArchiveDisconnect', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveDisconnectPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'galacticMemoryArchiveDisconnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'galacticMemoryArchivePower',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow({
                    labelId: 'techGalacticMemoryArchivePowerRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Power',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('galacticMemoryArchivePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('galacticMemoryArchivePower');
                                showNotification(techNotificationMessages.galacticMemoryArchivePower, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechGalacticMemoryArchive4Header,
                                    content: modalMegaStructureTechGalacticMemoryArchive4Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(4,4);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'galacticMemoryArchivePower',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['galacticMemoryArchivePower', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchivePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchivePowerPrereq">${getResourceDataObject('techs', ['galacticMemoryArchivePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'galacticMemoryArchivePower',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            },
            {
                techName: 'galacticMemoryArchiveConnect',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow({
                    labelId: 'techGalacticMemoryArchiveConnectRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Connect',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'],
                            onClick: (event) => {
                                gain('galacticMemoryArchiveConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                                event.currentTarget.classList.add('unlocked-tech');
                                setTechUnlockedArray('galacticMemoryArchiveConnect');
                                showNotification(techNotificationMessages.galacticMemoryArchiveConnect, 'info', 3000, 'tech');
                                callPopupModal({
                                    header: modalMegaStructureTechGalacticMemoryArchive5Header,
                                    content: modalMegaStructureTechGalacticMemoryArchive5Text,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                                });
                                applyMegaStructureBonuses(4,5);
                            },
                            dataConditionCheck: 'techUnlock',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'galacticMemoryArchiveConnect',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'tech'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('techs', ['galacticMemoryArchiveConnect', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveConnectPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlock',
                    objectSectionArgument1: 'galacticMemoryArchiveConnect',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: null,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'tech'
                })
            }
        ];

        const rowsToRemove = [];

        rows.forEach((item, index) => {
            const rowElement = item.row;

            if (rowElement) {
                if (getCurrentRunIsMegaStructureRun()) {
                    const systemMegaStructure = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'factoryStar']);
                    
                    if (item.special) {
                        if (item.special[1] === systemMegaStructure) {
                            optionContentElement.appendChild(rowElement);
                        } else {
                            rowsToRemove.push(index);
                        }
                    } else {
                        optionContentElement.appendChild(rowElement);
                    }
                } else {
                    if (!item.special || item.special[0] !== 'megastructure') {
                        optionContentElement.appendChild(rowElement);
                    } else {
                        rowsToRemove.push(index);
                    }
                }
            }
        });

        rowsToRemove.reverse().forEach(index => {
            rows.splice(index, 1);
        });


        const container = optionContentElement;
        setTemporaryCoreTechRowsRepo(container, rows);
    }
    
    if (heading === 'Tech Tree') {
        const techTreeContainerRow = createOptionRow({
            labelId: 'techTreeContainerRow',
            renderNameABs: null,
            labelText: '',
            inputElements: [
                createTextElement('', 'techTreeNativeContainer', ['tech-tree-native-container']),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: 'techTreeRender',
            objectSectionArgument1: '',
            objectSectionArgument2: '',
            quantityArgument: '',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'tech-tree',
            noDescriptionContainer: [true, 'invisible', '100%']
        });
    
        optionContentElement.appendChild(techTreeContainerRow);

        const tooltip = document.getElementById('techTreeTooltip');
        if (tooltip) {
            tooltip.remove();
        }
        getTechTreeDataAndDraw(false); 

    }

    if (heading === 'Philosophy') {
        const constructorRows = [
            {
                techName: 'spaceStorageTankResearch',
                row: createOptionRow({
                    labelId: 'techPhilosophySpaceStorageTankResearchRow',
                    renderNameABs: null,
                    labelText: 'Space Storage Tank Research:',
                    inputElements: [
                        createButton({
                            text: `UNLOCK`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'],
                            onClick: (event) => {
                                gain('spaceStorageTankResearch', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                setIncreaseStorageFactor(5);
                                showNotification('ABILITY: Base storage expansion multiplier now 5x instead of 2x!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'spaceStorageTankResearch',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'spaceStorageTankResearch', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'spaceStorageTankResearch',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'efficientAssembly',
                row: createOptionRow({
                    labelId: 'techPhilosophyEfficientAssemblyRow',
                    renderNameABs: null,
                    labelText: 'Efficient Assembly:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('efficientAssembly', 'efficientAssembly', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1');
                                setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'efficientAssembly',
                                    repeatable_slot: 1,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                showNotification('Space Building costs reduced by 1%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'efficientAssembly',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'efficientAssembly', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'efficientAssembly',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'laserMining',
                row: createOptionRow({
                    labelId: 'techPhilosophyLaserMiningRow',
                    renderNameABs: null,
                    labelText: 'Laser Mining:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('laserMining', 'laserMining', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                                setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'laserMining',
                                    repeatable_slot: 2,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setResourceAutobuyerPricesAfterRepeatables();
                                showNotification('Resources AutoBuyers 5% cheaper!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'laserMining',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'laserMining', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'laserMining',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'massCompoundAssembly',
                row: createOptionRow({
                    labelId: 'techPhilosophyMassCompoundAssemblyRow',
                    renderNameABs: null,
                    labelText: 'Mass Compound Assembly:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('massCompoundAssembly', 'massCompoundAssembly', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                                setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'massCompoundAssembly',
                                    repeatable_slot: 3,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setCompoundRecipePricesAfterRepeatables();
                                showNotification('Compounds recipes cheaper by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'massCompoundAssembly',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'massCompoundAssembly', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'massCompoundAssembly',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },   
            {
                techName: 'energyDrones',
                row: createOptionRow({
                    labelId: 'techPhilosophyEnergyDronesRow',
                    renderNameABs: null,
                    labelText: 'Energy Drones:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('energyDrones', 'energyDrones', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                                setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'energyDrones',
                                    repeatable_slot: 4,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setEnergyAndResearchBuildingPricesAfterRepeatables();
                                showNotification('Energy and Research Buildings 5% cheaper!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'energyDrones',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'energyDrones', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'energyDrones',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            }                                            
        ];

        const supremacistRows = [
            {
                techName: 'fleetHolograms',
                row: createOptionRow({
                    labelId: 'techPhilosophyFleetHologramsRow',
                    renderNameABs: null,
                    labelText: 'Fleet Holograms:',
                    inputElements: [
                        createButton({
                            text: `UNLOCK`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'],
                            onClick: (event) => {
                                gain('fleetHolograms', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                showNotification('ABILITY: You can now always Vassalize enemies provided your fleet is 3x larger than theirs!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'fleetHolograms',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'fleetHolograms', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'fleetHolograms',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },     
            {
                techName: 'hangarAutomation',
                row: createOptionRow({
                    labelId: 'techPhilosophyHangarAutomationRow',
                    renderNameABs: null,
                    labelText: 'Hangar Automation:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('hangarAutomation', 'hangarAutomation', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1');
                                setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'hangarAutomation',
                                    repeatable_slot: 1,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setFleetPricesAfterRepeatables();
                                showNotification('Fleet build costs reduced by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'hangarAutomation',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'hangarAutomation', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'hangarAutomation',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'syntheticPlating',
                row: createOptionRow({
                    labelId: 'techPhilosophySyntheticPlatingRow',
                    renderNameABs: null,
                    labelText: 'Synthetic Plating:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('syntheticPlating', 'syntheticPlating', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                                setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'syntheticPlating',
                                    repeatable_slot: 2,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setFleetArmorBuffsAfterRepeatables();
                                showNotification('Fleet Armor increased by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'syntheticPlating',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'syntheticPlating', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'syntheticPlating',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'antimatterEngineMinaturization',
                row: createOptionRow({
                    labelId: 'techPhilosophyAntimatterEngineMinaturizationRow',
                    renderNameABs: null,
                    labelText: 'Antimatter Engine Minaturization:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('antimatterEngineMinaturization', 'antimatterEngineMinaturization', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                                setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'antimatterEngineMinaturization',
                                    repeatable_slot: 3,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setFleetSpeedsAfterRepeatables();
                                showNotification('Fleet Speed increased by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'antimatterEngineMinaturization',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'antimatterEngineMinaturization', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'antimatterEngineMinaturization',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'laserIntensityResearch',
                row: createOptionRow({
                    labelId: 'techPhilosophyLaserIntensityResearchRow',
                    renderNameABs: null,
                    labelText: 'Laser Intensity Research:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('laserIntensityResearch', 'laserIntensityResearch', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                                setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'laserIntensityResearch',
                                    repeatable_slot: 4,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setFleetAttackDamageAfterRepeatables();
                                showNotification('Fleet Attack Power increased by 5%! (Applicable to Newly Built Ships)', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'laserIntensityResearch',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'laserIntensityResearch', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'laserIntensityResearch',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            }                   
        ];

        const voidbornRows = [
            {
                techName: 'voidSeers',
                row: createOptionRow({
                    labelId: 'techPhilosophyVoidSeersRow',
                    renderNameABs: null,
                    labelText: 'Void Seers:',
                    inputElements: [
                        createButton({
                            text: `UNLOCK`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'],
                            onClick: (event) => {
                                gain('voidSeers', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                showNotification('ABILITY: Space Telescope can now scan for instant Resources and Compounds!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'voidSeers',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'voidSeers', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'voidSeers',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            }, 
            {
                techName: 'stellarWhispers',
                row: createOptionRow({
                    labelId: 'techPhilosophyStellarWhispersRow',
                    renderNameABs: null,
                    labelText: 'Stellar Whispers:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('stellarWhispers', 'stellarWhispers', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1');
                                setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'stellarWhispers',
                                    repeatable_slot: 1,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setInitialImpressionBaseAfterRepeatables();
                                showNotification('Initial Impression of enemies improved by 1%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'stellarWhispers',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'stellarWhispers', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'stellarWhispers',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'stellarInsightManifold',
                row: createOptionRow({
                    labelId: 'techPhilosophyStellarInsightManifoldRow',
                    renderNameABs: null,
                    labelText: 'Stellar Insight Manifold:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('stellarInsightManifold', 'stellarInsightManifold', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                                setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'stellarInsightManifold',
                                    repeatable_slot: 2,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setStarStudyEfficiencyAfterRepeatables();
                                showNotification('Star Study speed increased by 1%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'stellarInsightManifold',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'stellarInsightManifold', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'stellarInsightManifold',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'asteroidDwellers',
                row: createOptionRow({
                    labelId: 'techPhilosophyAsteroidDwellersRow',
                    renderNameABs: null,
                    labelText: 'Asteroid Dwellers:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('asteroidDwellers', 'asteroidDwellers', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                                setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'asteroidDwellers',
                                    repeatable_slot: 3,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setAsteroidSearchEfficiencyAfterRepeatables();
                                showNotification('Asteroid Search speed increased by 1%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'asteroidDwellers',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'asteroidDwellers', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'asteroidDwellers',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'ascendencyPhilosophy',
                row: createOptionRow({
                    labelId: 'techPhilosophyAscendencyPhilosophyRow',
                    renderNameABs: null,
                    labelText: 'Ascendency Philosophy:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('ascendencyPhilosophy', 'ascendencyPhilosophy', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                                setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'ascendencyPhilosophy',
                                    repeatable_slot: 4,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                showNotification('Base Ascendency Point gain +1!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'ascendencyPhilosophy',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'ascendencyPhilosophy', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'ascendencyPhilosophy',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            }                       
        ];

        const expansionistRows = [
            {
                techName: 'rapidExpansion',
                row: createOptionRow({
                    labelId: 'techPhilosophyRapidExpansionRow',
                    renderNameABs: null,
                    labelText: 'Rapid Expansion:',
                    inputElements: [
                        createButton({
                            text: `UNLOCK`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'],
                            onClick: (event) => {
                                gain('rapidExpansion', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                showNotification('ABILITY: You now have a chance of capturing up to 3 nearby Systems for every 1!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'rapidExpansion',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'rapidExpansion', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'rapidExpansion',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },  
            {
                techName: 'spaceElevator',
                row: createOptionRow({
                    labelId: 'techPhilosophySpaceElevatorRow',
                    renderNameABs: null,
                    labelText: 'Space Elevator:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('spaceElevator', 'spaceElevator', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1');
                                setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'spaceElevator',
                                    repeatable_slot: 1,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setStarshipPartPricesAfterRepeatables();
                                showNotification('Starship Parts cost reduced by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'spaceElevator',
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'spaceElevator', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'spaceElevator',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'launchPadMassProduction',
                row: createOptionRow({
                    labelId: 'techPhilosophyLaunchPadMassProductionRow',
                    renderNameABs: null,
                    labelText: 'Launch Pad Mass Production:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('launchPadMassProduction', 'launchPadMassProduction', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                                setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'launchPadMassProduction',
                                    repeatable_slot: 2,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setRocketPartPricesAfterRepeatables();
                                showNotification('Rocket Parts cost reduced by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'launchPadMassProduction',
                            objectSectionArgument2: null,
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            autoBuyerTier: null,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'launchPadMassProduction', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'launchPadMassProduction',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'asteroidAttractors',
                row: createOptionRow({
                    labelId: 'techPhilosophyAsteroidAttractorsRow',
                    renderNameABs: null,
                    labelText: 'Asteroid Attractors:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('asteroidAttractors', 'asteroidAttractors', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                                setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'asteroidAttractors',
                                    repeatable_slot: 3,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setRocketTravelTimeReductionAfterRepeatables();
                                showNotification('Rocket Travel time reduced by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'asteroidAttractors',
                            objectSectionArgument2: null,
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            autoBuyerTier: null,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'asteroidAttractors', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'asteroidAttractors',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            },
            {
                techName: 'warpDrive',
                row: createOptionRow({
                    labelId: 'techPhilosophyWarpDriveRow',
                    renderNameABs: null,
                    labelText: 'Warp Drive:',
                    inputElements: [
                        createButton({
                            text: `Research`,
                            classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'],
                            onClick: (event) => {
                                gain('warpDrive', 'warpDrive', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                                let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                                setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier);
                                trackAnalyticsEvent('philosophy_repeatable_researched', {
                                    philosophy_id: getPlayerPhilosophy(),
                                    tech_id: 'warpDrive',
                                    repeatable_slot: 4,
                                    new_level: currentRepeatableTechMultiplier
                                }, { immediate: true, flushReason: 'philosophy_repeatable' });
                                setStarshipTravelTimeReductionAfterRepeatables();
                                showNotification('Starship Travel time reduced by 5%!', 'info', 3000, 'tech');
                            },
                            dataConditionCheck: 'techUnlockPhilosophy',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'warpDrive',
                            objectSectionArgument2: null,
                            quantityArgument: 'research',
                            disableKeyboardForButton: true,
                            autoBuyerTier: null,
                            rowCategory: 'techPhilosophy'
                        }),
                    ],
                    descriptionText: `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'warpDrive', 'price'])} Research`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'techUnlockPhilosophy',
                    objectSectionArgument1: 'warpDrive',
                    objectSectionArgument2: null,
                    quantityArgument: 'research',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'techPhilosophy'
                })
            }                      
        ];

        let specificPhilosophyRows;

        switch (getPlayerPhilosophy()) {
            case 'constructor':
                specificPhilosophyRows = constructorRows;
                break;
            case 'supremacist':
                specificPhilosophyRows = supremacistRows;
                break;
            case 'voidborn':
                specificPhilosophyRows = voidbornRows;
                break;
            case 'expansionist':
                specificPhilosophyRows = expansionistRows;
                break;
            default: return;
        }

        specificPhilosophyRows.forEach(item => {
            const rowElement = item.row;
            if (rowElement) {
                optionContentElement.appendChild(rowElement);
            }
        });
    }
}

export function handleTechnologyButtonClick(techName, event) {
    gain(techName, null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');

    if (event?.currentTarget) {
        event.currentTarget.classList.add('unlocked-tech');
    }

    setTechUnlockedArray(techName);

    if (techNotificationMessages[techName]) {
        showNotification(techNotificationMessages[techName], 'info', 3000, 'tech');
    }

    switch (techName) {
        case 'knowledgeSharing':
            appendAttentionIndicator(document.getElementById('researchOption'));
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalKnowledgeSharingTabUnlockHeader,
                    content: modalKnowledgeSharingTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false
                });
            }
            break;
        case 'fusionTheory':
            break;
        case 'hydrogenFusion':
            updateDescriptionRow('hydrogenSellRow', 'content2');
            break;
        case 'heliumFusion':
            updateDescriptionRow('heliumSellRow', 'content2');
            break;
        case 'carbonFusion':
            updateDescriptionRow('carbonSellRow', 'content2');
            break;
        case 'neonFusion':
            updateDescriptionRow('neonSellRow', 'content2');
            setUnlockedCompoundsArray('water');
            if (getTechUnlockedArray().includes('compounds')) {
                appendAttentionIndicator(document.getElementById('waterOption'));
            }
            break;
        case 'oxygenFusion':
            updateDescriptionRow('oxygenSellRow', 'content2');
            break;
        case 'siliconFusion':
            updateDescriptionRow('siliconSellRow', 'content2');
            break;
        case 'nobleGasCollection':
            break;
        case 'glassManufacture':
            setUnlockedCompoundsArray('glass');
            if (getTechUnlockedArray().includes('compounds')) {
                appendAttentionIndicator(document.getElementById('glassOption'));
            }
            break;
        case 'aggregateMixing':
            setUnlockedCompoundsArray('concrete');
            if (getTechUnlockedArray().includes('compounds')) {
                appendAttentionIndicator(document.getElementById('concreteOption'));
            }
            break;
        case 'neutronCapture':
            setUnlockedCompoundsArray('titanium');
            if (getTechUnlockedArray().includes('compounds')) {
                appendAttentionIndicator(document.getElementById('titaniumOption'));
            }
            break;
        case 'quantumComputing': {
            const resourceObject = getResourceDataObject('resources');
            Object.keys(resourceObject).forEach(key => {
                if (getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'normalProgression']) === true) {
                    setAutoBuyerTierLevel(key, 2, false, 'resources');
                }
            });
            indicateAllResources();
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalQuantumComputingTabUnlockHeader,
                    content: modalQuantumComputingTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            break;
        }
        case 'scienceLaboratories':
            appendAttentionIndicator(document.getElementById('researchOption'));
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalScienceLabsTabUnlockHeader,
                    content: modalScienceLabsTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            break;
        case 'hydroCarbons':
            setUnlockedCompoundsArray('diesel');
            if (getTechUnlockedArray().includes('compounds')) {
                appendAttentionIndicator(document.getElementById('dieselOption'));
            }
            break;
        case 'nanoTubeTechnology':
            break;
        case 'nanoBrokers':
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalNanoBrokersUnlockHeader,
                    content: modalNanoBrokersUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            break;
        case 'stellarCartography':
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalInterstellarTabUnlockHeader,
                    content: modalInterstellarTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            break;
        case 'basicPowerGeneration':
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalEnergyTabUnlockHeader,
                    content: modalEnergyTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            break;
        case 'sodiumIonPowerStorage':
            break;
        case 'advancedPowerGeneration':
            break;
        case 'solarPowerGeneration':
            break;
        case 'rocketComposites': {
            const resourceObject = getResourceDataObject('resources');
            Object.keys(resourceObject).forEach(key => {
                if (getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'normalProgression']) === true) {
                    setAutoBuyerTierLevel(key, 4, false, 'resources');
                    indicateAllResources();
                }
            });
            const tab6 = document.getElementById('tab6');
            if (tab6 && !tab6.innerHTML.includes('???')) {
                appendAttentionIndicator(document.getElementById('launchPadOption'));
            }
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalRocketCompositesTabUnlockHeader,
                    content: modalRocketCompositesTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            const launchPadOption = document.getElementById('launchPadOption');
            launchPadOption?.parentElement?.parentElement?.classList.remove('invisible');
            break;
        }
        case 'advancedFuels':
            setCanFuelRockets(true);
            break;
        case 'planetaryNavigation':
            setCanTravelToAsteroids(true);
            break;
        case 'compounds':
            setAllCompoundsToZeroQuantity();
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalCompoundsTabUnlockHeader,
                    content: modalCompoundsTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            break;
        case 'steelFoundries':
            setUnlockedCompoundsArray('steel');
            if (getTechUnlockedArray().includes('compounds')) {
                appendAttentionIndicator(document.getElementById('steelOption'));
            }
            break;
        case 'giganticTurbines':
            break;
        case 'atmosphericTelescopes': {
            const tab6 = document.getElementById('tab6');
            if (tab6 && !tab6.innerHTML.includes('???')) {
                appendAttentionIndicator(document.getElementById('spaceTelescopeOption'));
            }
            if (getStatRun() === 1) {
                callPopupModal({
                    header: modalSpaceMiningTabUnlockHeader,
                    content: modalSpaceMiningTabUnlockText,
                    showConfirm: true,
                    showCancel: false,
                    showExtra1: false,
                    showExtra2: false,
                    onConfirm: () => {
                        showHideModal();
                    },
                    onCancel: null,
                    onExtra1: null,
                    onExtra2: null,
                    confirmLabel: 'CONFIRM',
                    cancelLabel: null,
                    extra1Label: null,
                    extra2Label: null,
                    setupToolTips: false,
                });
            }
            break;
        }
        case 'fusionEfficiencyI':
            break;
        case 'fusionEfficiencyII':
            break;
        case 'fusionEfficiencyIII':
            break;
        case 'orbitalConstruction': {
            const starShipOption = document.getElementById('starShipOption');
            starShipOption?.parentElement?.parentElement?.classList.remove('invisible');
            break;
        }
        case 'antimatterEngines':
            break;
        case 'FTLTravelTheory':
            break;
        case 'lifeSupportSystems':
            break;
        case 'starshipFleets':
            break;
        case 'stellarScanners':
            break;
        default:
            break;
    }
}

function indicateAllResources() {
    const resources = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];

    resources.forEach(resource => {
        if (getUnlockedResourcesArray().includes(resource)) {
            const element = document.getElementById(`${resource}Option`);
            if (element) {
                appendAttentionIndicator(element);
            }
        }
    });
}
