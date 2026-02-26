import { getCurrentStarSystem, setCanFuelRockets, setCanTravelToAsteroids, getTechTreeDataAndDraw, getTimerRateRatio, deferredActions, getCanAffordDeferred, setCanAffordDeferred, setTechUnlockedArray, setTemporaryCoreTechRowsRepo, setUnlockedCompoundsArray, getTechUnlockedArray, getUnlockedResourcesArray, getPlayerPhilosophy, setRepeatableTechMultipliers, getRepeatableTechMultipliers, setIncreaseStorageFactor, getStatRun, getCurrentRunIsMegaStructureRun, setPermanentAntimatterUnlock, getDemoBuild } from './constantsAndGlobalVars.js';
import { setAllCompoundsToZeroQuantity, gain, startUpdateTimersAndRates, addToResourceAllTimeStat, setFleetArmorBuffsAfterRepeatables, setFleetSpeedsAfterRepeatables, setFleetAttackDamageAfterRepeatables, setInitialImpressionBaseAfterRepeatables, setStarStudyEfficiencyAfterRepeatables, setAsteroidSearchEfficiencyAfterRepeatables, setRocketTravelTimeReductionAfterRepeatables, setStarshipTravelTimeReductionAfterRepeatables, setResourceAutobuyerPricesAfterRepeatables, setCompoundRecipePricesAfterRepeatables, setEnergyAndResearchBuildingPricesAfterRepeatables, setFleetPricesAfterRepeatables, setStarshipPartPricesAfterRepeatables, setRocketPartPricesAfterRepeatables, applyMegaStructureBonuses } from './game.js';
import { getStarSystemDataObject, setResourceDataObject, getResourceDataObject, setAutoBuyerTierLevel } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, createToggleSwitch, createSvgElement, createTextElement, sortTechRows, createOptionRow, createButton, showNotification, updateDescriptionRow, appendAttentionIndicator, callPopupModal, showHideModal, setupInfoTooltips, createOptionRowV2 } from './ui.js';
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

        const researchAutoBuyerRow = createOptionRowV2({
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

        const researchScienceKitRow = createOptionRowV2({
                labelId: 'researchScienceKitRow',
                renderNameABs: null,
                labelText: 'Science Kit:',
                inputElements: [
                    createButton(`Add ${getResourceDataObject('research', ['upgrades', 'scienceKit', 'rate']) * getTimerRateRatio()} Research /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                        gain(1, 'scienceKitQuantity', 'scienceKit', false, null, 'scienceUpgrade', 'resources');
                        addToResourceAllTimeStat(1, 'scienceKits');
                            deferredActions.push(() => {
                                if (getCanAffordDeferred()) {
                                    startUpdateTimersAndRates('scienceKit');
                                }
                                setCanAffordDeferred(null);
                            });
                    }, 'upgradeCheck', '', 'scienceUpgrade', 'scienceKit', 'cash', true, null, 'science'),
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

        const researchScienceClubRow = createOptionRowV2({
                labelId: 'researchScienceClubRow',
                renderNameABs: null,
                labelText: 'Open Science Club:',
                inputElements: [
                    createButton(`Add ${getResourceDataObject('research', ['upgrades', 'scienceClub', 'rate']) * getTimerRateRatio()} Research /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                        gain(1, 'scienceClubQuantity', 'scienceClub', false, null, 'scienceUpgrade', 'resources');
                        addToResourceAllTimeStat(1, 'scienceClubs');
                        deferredActions.push(() => {
                            if (getCanAffordDeferred()) {
                                startUpdateTimersAndRates('scienceClub');
                            }
                            setCanAffordDeferred(null);
                        });
                    }, 'upgradeCheck', '', 'scienceUpgrade', 'scienceClub', 'cash', true, null, 'science'),
                    createTextElement(`Quantity: ${getResourceDataObject('research', ['upgrades', 'scienceClub', 'quantity'])}`, 'scienceClubQuantity', ['science-building-quantity']),
                    createToggleSwitch('scienceClubToggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'research', ['upgrades', 'scienceClub', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getResourceDataObject('research', ['upgrades', 'scienceClub', 'price']) + ' Research'}`,
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

        const researchScienceLabRow = createOptionRowV2({
                labelId: 'researchScienceLabRow',
                renderNameABs: null,
                labelText: 'Open Science Lab:',
                inputElements: [
                    createButton(`Add ${getResourceDataObject('research', ['upgrades', 'scienceLab', 'rate']) * getTimerRateRatio()} Research /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', ...demoExtraClasses], () => {
                        gain(1, 'scienceLabQuantity', 'scienceLab', false, null, 'scienceUpgrade', 'resources');
                        addToResourceAllTimeStat(1, 'scienceLabs');
                        deferredActions.push(() => {
                            if (getCanAffordDeferred()) {
                                startUpdateTimersAndRates('scienceLab');
                            }
                            setCanAffordDeferred(null);
                        });
                    }, 'upgradeCheck', '', 'scienceUpgrade', 'scienceLab', 'cash', true, null, 'science'),
                    createTextElement(`Quantity: ${getResourceDataObject('research', ['upgrades', 'scienceLab', 'quantity'])}`, 'scienceLabQuantity', ['science-building-quantity']),
                    createToggleSwitch('scienceLabToggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'research', ['upgrades', 'scienceLab', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getResourceDataObject('research', ['upgrades', 'scienceLab', 'price']) + ' Research'}`,
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
                row: createOptionRowV2({
                    labelId: 'techKnowledgeSharingRow',
                    renderNameABs: null,
                    labelText: 'Knowledge Sharing:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('knowledgeSharing', event);
                        }, 'techUnlock', '', 'knowledgeSharing', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techFusionTheoryRow',
                    renderNameABs: null,
                    labelText: 'Fusion Theory:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('fusionTheory', event);
                        }, 'techUnlock', '', 'fusionTheory', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techHydrogenFusionRow',
                    renderNameABs: null,
                    labelText: 'Hydrogen Fusion:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('hydrogenFusion', event);
                        }, 'techUnlock', '', 'hydrogenFusion', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techHeliumFusionRow',
                    renderNameABs: null,
                    labelText: 'Helium Fusion:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('heliumFusion', event);
                        }, 'techUnlock', '', 'heliumFusion', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techCarbonFusionRow',
                    renderNameABs: null,
                    labelText: 'Carbon Fusion:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('carbonFusion', event);
                        }, 'techUnlock', '', 'carbonFusion', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techNeonFusionRow',
                    renderNameABs: null,
                    labelText: 'Neon Fusion:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('neonFusion', event);
                        }, 'techUnlock', '', 'neonFusion', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techOxygenFusionRow',
                    renderNameABs: null,
                    labelText: 'Oxygen Fusion:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('oxygenFusion', event);
                        }, 'techUnlock', '', 'oxygenFusion', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techSiliconFusionRow',
                    renderNameABs: null,
                    labelText: 'Silicon Fusion:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('siliconFusion', event);
                        }, 'techUnlock', '', 'siliconFusion', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techNobleGasCollectionRow',
                    renderNameABs: null,
                    labelText: 'Noble Gas Collection:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('nobleGasCollection', event);
                        }, 'techUnlock', '', 'nobleGasCollection', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techGlassManufactureRow',
                    renderNameABs: null,
                    labelText: 'Glass Manufacture:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('glassManufacture', event);
                        }, 'techUnlock', '', 'glassManufacture', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techAggregateMixingRow',
                    renderNameABs: null,
                    labelText: 'Aggregate Mixing:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('aggregateMixing', event);
                        }, 'techUnlock', '', 'aggregateMixing', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techNeutronCaptureRow',
                    renderNameABs: null,
                    labelText: 'Neutron Capture:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('neutronCapture', event);
                        }, 'techUnlock', '', 'neutronCapture', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techQuantumComputingRow',
                    renderNameABs: null,
                    labelText: 'Quantum Computing:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('quantumComputing', event);
                        }, 'techUnlock', '', 'quantumComputing', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techScienceLaboratoriesRow',
                    renderNameABs: null,
                    labelText: 'Science Laboratories:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('scienceLaboratories', event);
                        }, 'techUnlock', '', 'scienceLaboratories', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techHydroCarbonsRow',
                    renderNameABs: null,
                    labelText: 'HydroCarbons:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('hydroCarbons', event);
                        }, 'techUnlock', '', 'hydroCarbons', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techNanoTubeTechnologyRow',
                    renderNameABs: null,
                    labelText: 'Nano Tube Technology:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('nanoTubeTechnology', event);
                        }, 'techUnlock', '', 'nanoTubeTechnology', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techNanoBrokersRow',
                    renderNameABs: null,
                    labelText: 'Nano Brokers:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('nanoBrokers', event);
                        }, 'techUnlock', '', 'nanoBrokers', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techStellarCartographyRow',
                    renderNameABs: null,
                    labelText: 'Stellar Cartography:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('stellarCartography', event);
                        }, 'techUnlock', '', 'stellarCartography', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techBasicPowerGenerationRow',
                    renderNameABs: null,
                    labelText: 'Basic Power Generation:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('basicPowerGeneration', event);
                        }, 'techUnlock', '', 'basicPowerGeneration', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techSodiumIonPowerStorageRow',
                    renderNameABs: null,
                    labelText: 'Sodium Ion Power Storage:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('sodiumIonPowerStorage', event);
                        }, 'techUnlock', '', 'sodiumIonPowerStorage', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techAdvancedPowerGenerationRow',
                    renderNameABs: null,
                    labelText: 'Advanced Power Generation:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('advancedPowerGeneration', event);
                        }, 'techUnlock', '', 'advancedPowerGeneration', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techSolarPowerGenerationRow',
                    renderNameABs: null,
                    labelText: 'Solar Power Generation:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('solarPowerGeneration', event);
                        }, 'techUnlock', '', 'solarPowerGeneration', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techRocketCompositesRow',
                    renderNameABs: null,
                    labelText: 'Rocket Composites:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('rocketComposites', event);
                        }, 'techUnlock', '', 'rocketComposites', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techAdvancedFuelsRow',
                    renderNameABs: null,
                    labelText: 'Advanced Fuels:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('advancedFuels', event);
                        }, 'techUnlock', '', 'advancedFuels', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techPlanetaryNavigationRow',
                    renderNameABs: null,
                    labelText: 'Planetary Navigation:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('planetaryNavigation', event);
                        }, 'techUnlock', '', 'planetaryNavigation', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techCompoundsRow',
                    renderNameABs: null,
                    labelText: 'Compounds:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('compounds', event);
                        }, 'techUnlock', '', 'compounds', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techSteelFoundriesRow',
                    renderNameABs: null,
                    labelText: 'Steel Foundries:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('steelFoundries', event);
                        }, 'techUnlock', '', 'steelFoundries', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techGiganticTurbinesRow',
                    renderNameABs: null,
                    labelText: 'Gigantic Turbines:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('giganticTurbines', event);
                        }, 'techUnlock', '', 'giganticTurbines', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techAtmosphericTelescopesRow',
                    renderNameABs: null,
                    labelText: 'Atmospheric Telescopes:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('atmosphericTelescopes', event);
                        }, 'techUnlock', '', 'atmosphericTelescopes', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techFusionEfficiencyIRow',
                    renderNameABs: null,
                    labelText: 'Fusion Efficiency I:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('fusionEfficiencyI', event);
                        }, 'techUnlock', '', 'fusionEfficiencyI', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techFusionEfficiencyIIRow',
                    renderNameABs: null,
                    labelText: 'Fusion Efficiency II:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('fusionEfficiencyII', event);
                        }, 'techUnlock', '', 'fusionEfficiencyII', null, 'research', true, null, 'tech'), 
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
                row: createOptionRowV2({
                    labelId: 'techFusionEfficiencyIIIRow',
                    renderNameABs: null,
                    labelText: 'Fusion Efficiency III:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('fusionEfficiencyIII', event);
                        }, 'techUnlock', '', 'fusionEfficiencyIII', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techOrbitalConstructionRow',
                    renderNameABs: null,
                    labelText: 'Orbital Construction:',
                    inputElements: [
                        (() => {
                            const extraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
                            return createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock', ...extraClasses], (event) => {
                                handleTechnologyButtonClick('orbitalConstruction', event);
                            }, 'techUnlock', '', 'orbitalConstruction', null, 'research', true, null, 'tech');
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
                row: createOptionRowV2({
                    labelId: 'techAntimatterEnginesRow',
                    renderNameABs: null,
                    labelText: 'Antimatter Engines:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('antimatterEngines', event);
                        }, 'techUnlock', '', 'antimatterEngines', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techFTLTravelTheoryRow',
                    renderNameABs: null,
                    labelText: 'FTL Travel Theory:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('FTLTravelTheory', event);
                        }, 'techUnlock', '', 'FTLTravelTheory', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techLifeSupportSystemsRow',
                    renderNameABs: null,
                    labelText: 'Life Support Systems:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('lifeSupportSystems', event);
                        }, 'techUnlock', '', 'lifeSupportSystems', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techStarshipFleetsRow',
                    renderNameABs: null,
                    labelText: 'Starship Fleets:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('starshipFleets', event);
                        }, 'techUnlock', '', 'starshipFleets', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techStellarScannersRow',
                    renderNameABs: null,
                    labelText: 'Stellar Scanners:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            handleTechnologyButtonClick('stellarScanners', event);
                        }, 'techUnlock', '', 'stellarScanners', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techDysonSphereUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Understanding',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('dysonSphereUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('dysonSphereUnderstanding');
                            showNotification(techNotificationMessages.dysonSphereUnderstanding, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechDysonSphere1Header, 
                                modalMegaStructureTechDysonSphere1Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(1,1);
                        }, 'techUnlock', '', 'dysonSphereUnderstanding', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techDysonSphereCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Capabilities',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('dysonSphereCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('dysonSphereCapabilities');
                            showNotification(techNotificationMessages.dysonSphereCapabilities, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechDysonSphere2Header, 
                                modalMegaStructureTechDysonSphere2Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(1,2);
                        }, 'techUnlock', '', 'dysonSphereCapabilities', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techDysonSphereDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Disconnect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('dysonSphereDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('dysonSphereDisconnect');
                            showNotification(techNotificationMessages.dysonSphereDisconnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechDysonSphere3Header, 
                                modalMegaStructureTechDysonSphere3Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(1,3);
                        }, 'techUnlock', '', 'dysonSphereDisconnect', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techDysonSpherePowerRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Power',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('dysonSpherePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('dysonSpherePower');
                            showNotification(techNotificationMessages.dysonSpherePower, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechDysonSphere4Header, 
                                modalMegaStructureTechDysonSphere4Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(1,4);
                        }, 'techUnlock', '', 'dysonSpherePower', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techDysonSphereConnectRow',
                    renderNameABs: null,
                    labelText: 'Dyson Sphere Connect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('dysonSphereConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('dysonSphereConnect');
                            showNotification(techNotificationMessages.dysonSphereConnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechDysonSphere5Header, 
                                modalMegaStructureTechDysonSphere5Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(1,5);
                        }, 'techUnlock', '', 'dysonSphereConnect', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techCelestialProcessingCoreUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Understanding',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('celestialProcessingCoreUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('celestialProcessingCoreUnderstanding');
                            showNotification(techNotificationMessages.celestialProcessingCoreUnderstanding, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechCelestialProcessingCore1Header, 
                                modalMegaStructureTechCelestialProcessingCore1Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(2,1);
                        }, 'techUnlock', '', 'celestialProcessingCoreUnderstanding', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techCelestialProcessingCoreCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Capabilities',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('celestialProcessingCoreCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('celestialProcessingCoreCapabilities');
                            showNotification(techNotificationMessages.celestialProcessingCoreCapabilities, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechCelestialProcessingCore2Header, 
                                modalMegaStructureTechCelestialProcessingCore2Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(2,2);
                        }, 'techUnlock', '', 'celestialProcessingCoreCapabilities', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techCelestialProcessingCoreDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Disconnect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('celestialProcessingCoreDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('celestialProcessingCoreDisconnect');
                            showNotification(techNotificationMessages.celestialProcessingCoreDisconnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechCelestialProcessingCore3Header, 
                                modalMegaStructureTechCelestialProcessingCore3Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(2,3);
                        }, 'techUnlock', '', 'celestialProcessingCoreDisconnect', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techCelestialProcessingCorePowerRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Power',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('celestialProcessingCorePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('celestialProcessingCorePower');
                            showNotification(techNotificationMessages.celestialProcessingCorePower, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechCelestialProcessingCore4Header, 
                                modalMegaStructureTechCelestialProcessingCore4Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(2,4);
                        }, 'techUnlock', '', 'celestialProcessingCorePower', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techCelestialProcessingCoreConnectRow',
                    renderNameABs: null,
                    labelText: 'Celestial Processing Core Connect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('celestialProcessingCoreConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('celestialProcessingCoreConnect');
                            showNotification(techNotificationMessages.celestialProcessingCoreConnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechCelestialProcessingCore5Header, 
                                modalMegaStructureTechCelestialProcessingCore5Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(2,5);
                        }, 'techUnlock', '', 'celestialProcessingCoreConnect', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techPlasmaForgeUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Understanding',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('plasmaForgeUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('plasmaForgeUnderstanding');
                            showNotification(techNotificationMessages.plasmaForgeUnderstanding, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechPlasmaForge1Header, 
                                modalMegaStructureTechPlasmaForge1Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(3,1);
                        }, 'techUnlock', '', 'plasmaForgeUnderstanding', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techPlasmaForgeCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Capabilities',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('plasmaForgeCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('plasmaForgeCapabilities');
                            showNotification(techNotificationMessages.plasmaForgeCapabilities, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechPlasmaForge2Header, 
                                modalMegaStructureTechPlasmaForge2Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(3,2);
                        }, 'techUnlock', '', 'plasmaForgeCapabilities', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techPlasmaForgeDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Disconnect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('plasmaForgeDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('plasmaForgeDisconnect');
                            showNotification(techNotificationMessages.plasmaForgeDisconnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechPlasmaForge3Header, 
                                modalMegaStructureTechPlasmaForge3Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(3,3);
                        }, 'techUnlock', '', 'plasmaForgeDisconnect', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techPlasmaForgePowerRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Power',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('plasmaForgePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('plasmaForgePower');
                            showNotification(techNotificationMessages.plasmaForgePower, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechPlasmaForge4Header, 
                                modalMegaStructureTechPlasmaForge4Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(3,4);
                        }, 'techUnlock', '', 'plasmaForgePower', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techPlasmaForgeConnectRow',
                    renderNameABs: null,
                    labelText: 'Plasma Forge Connect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('plasmaForgeConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('plasmaForgeConnect');
                            showNotification(techNotificationMessages.plasmaForgeConnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechPlasmaForge5Header, 
                                modalMegaStructureTechPlasmaForge5Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(3,5);
                        }, 'techUnlock', '', 'plasmaForgeConnect', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techGalacticMemoryArchiveUnderstandingRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Understanding',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('galacticMemoryArchiveUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('galacticMemoryArchiveUnderstanding');
                            showNotification(techNotificationMessages.galacticMemoryArchiveUnderstanding, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechGalacticMemoryArchive1Header, 
                                modalMegaStructureTechGalacticMemoryArchive1Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(4,1);
                        }, 'techUnlock', '', 'galacticMemoryArchiveUnderstanding', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techGalacticMemoryArchiveCapabilitiesRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Capabilities',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('galacticMemoryArchiveCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('galacticMemoryArchiveCapabilities');
                            showNotification(techNotificationMessages.galacticMemoryArchiveCapabilities, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechGalacticMemoryArchive2Header, 
                                modalMegaStructureTechGalacticMemoryArchive2Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(4,2);
                        }, 'techUnlock', '', 'galacticMemoryArchiveCapabilities', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techGalacticMemoryArchiveDisconnectRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Disconnect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('galacticMemoryArchiveDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('galacticMemoryArchiveDisconnect');
                            showNotification(techNotificationMessages.galacticMemoryArchiveDisconnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechGalacticMemoryArchive3Header, 
                                modalMegaStructureTechGalacticMemoryArchive3Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(4,3);
                        }, 'techUnlock', '', 'galacticMemoryArchiveDisconnect', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techGalacticMemoryArchivePowerRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Power',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('galacticMemoryArchivePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('galacticMemoryArchivePower');
                            showNotification(techNotificationMessages.galacticMemoryArchivePower, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechGalacticMemoryArchive4Header, 
                                modalMegaStructureTechGalacticMemoryArchive4Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(4,4);
                        }, 'techUnlock', '', 'galacticMemoryArchivePower', null, 'research', true, null, 'tech'),
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
                row: createOptionRowV2({
                    labelId: 'techGalacticMemoryArchiveConnectRow',
                    renderNameABs: null,
                    labelText: 'Galactic Memory Archive Connect',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                            gain('galacticMemoryArchiveConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                            event.currentTarget.classList.add('unlocked-tech');
                            setTechUnlockedArray('galacticMemoryArchiveConnect');
                            showNotification(techNotificationMessages.galacticMemoryArchiveConnect, 'info', 3000, 'tech');
                            callPopupModal(
                                modalMegaStructureTechGalacticMemoryArchive5Header, 
                                modalMegaStructureTechGalacticMemoryArchive5Text, 
                                true, 
                                false, 
                                false, 
                                false, 
                                function() {
                                    showHideModal();
                                },
                                null, 
                                null, 
                                null,
                                'CONFIRM',
                                null,
                                null,
                                null,
                                false
                            );
                            applyMegaStructureBonuses(4,5);
                        }, 'techUnlock', '', 'galacticMemoryArchiveConnect', null, 'research', true, null, 'tech'),
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
        const techTreeContainerRow = createOptionRowV2({
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophySpaceStorageTankResearchRow',
                    renderNameABs: null,
                    labelText: 'Space Storage Tank Research:',
                    inputElements: [
                        createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                            gain('spaceStorageTankResearch', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                            setIncreaseStorageFactor(5);
                            showNotification('ABILITY: Base storage expansion multiplier now 5x instead of 2x!', 'info', 3000, 'tech');
                        }, 'techUnlockPhilosophy', '', 'spaceStorageTankResearch', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyEfficientAssemblyRow',
                    renderNameABs: null,
                    labelText: 'Efficient Assembly:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'efficientAssembly', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyLaserMiningRow',
                    renderNameABs: null,
                    labelText: 'Laser Mining:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'laserMining', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyMassCompoundAssemblyRow',
                    renderNameABs: null,
                    labelText: 'Mass Compound Assembly:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'massCompoundAssembly', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyEnergyDronesRow',
                    renderNameABs: null,
                    labelText: 'Energy Drones:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'energyDrones', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyFleetHologramsRow',
                    renderNameABs: null,
                    labelText: 'Fleet Holograms:',
                    inputElements: [
                        createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                            gain('fleetHolograms', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                            showNotification('ABILITY: You can now always Vassalize enemies provided your fleet is 3x larger than theirs!', 'info', 3000, 'tech');
                        }, 'techUnlockPhilosophy', '', 'fleetHolograms', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyHangarAutomationRow',
                    renderNameABs: null,
                    labelText: 'Hangar Automation:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'hangarAutomation', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophySyntheticPlatingRow',
                    renderNameABs: null,
                    labelText: 'Synthetic Plating:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'syntheticPlating', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyAntimatterEngineMinaturizationRow',
                    renderNameABs: null,
                    labelText: 'Antimatter Engine Minaturization:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'antimatterEngineMinaturization', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyLaserIntensityResearchRow',
                    renderNameABs: null,
                    labelText: 'Laser Intensity Research:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'laserIntensityResearch', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyVoidSeersRow',
                    renderNameABs: null,
                    labelText: 'Void Seers:',
                    inputElements: [
                        createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                            gain('voidSeers', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                            showNotification('ABILITY: Space Telescope can now scan for instant Resources and Compounds!', 'info', 3000, 'tech');
                        }, 'techUnlockPhilosophy', '', 'voidSeers', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyStellarWhispersRow',
                    renderNameABs: null,
                    labelText: 'Stellar Whispers:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'stellarWhispers', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyStellarInsightManifoldRow',
                    renderNameABs: null,
                    labelText: 'Stellar Insight Manifold:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'stellarInsightManifold', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyAsteroidDwellersRow',
                    renderNameABs: null,
                    labelText: 'Asteroid Dwellers:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'asteroidDwellers', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyAscendencyPhilosophyRow',
                    renderNameABs: null,
                    labelText: 'Ascendency Philosophy:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'ascendencyPhilosophy', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyRapidExpansionRow',
                    renderNameABs: null,
                    labelText: 'Rapid Expansion:',
                    inputElements: [
                        createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                            gain('rapidExpansion', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                            showNotification('ABILITY: You now have a chance of capturing up to 3 nearby Systems for every 1!', 'info', 3000, 'tech');
                        }, 'techUnlockPhilosophy', '', 'rapidExpansion', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophySpaceElevatorRow',
                    renderNameABs: null,
                    labelText: 'Space Elevator:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'spaceElevator', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyLaunchPadMassProductionRow',
                    renderNameABs: null,
                    labelText: 'Launch Pad Mass Production:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'launchPadMassProduction', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyAsteroidAttractorsRow',
                    renderNameABs: null,
                    labelText: 'Asteroid Attractors:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'asteroidAttractors', null, 'research', true, null, 'techPhilosophy'),
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
                row: createOptionRowV2({
                    labelId: 'techPhilosophyWarpDriveRow',
                    renderNameABs: null,
                    labelText: 'Warp Drive:',
                    inputElements: [
                        createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
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
                        }, 'techUnlockPhilosophy', '', 'warpDrive', null, 'research', true, null, 'techPhilosophy'),
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
                callPopupModal(
                    modalKnowledgeSharingTabUnlockHeader,
                    modalKnowledgeSharingTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
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
                callPopupModal(
                    modalQuantumComputingTabUnlockHeader,
                    modalQuantumComputingTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
            }
            break;
        }
        case 'scienceLaboratories':
            appendAttentionIndicator(document.getElementById('researchOption'));
            if (getStatRun() === 1) {
                callPopupModal(
                    modalScienceLabsTabUnlockHeader,
                    modalScienceLabsTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
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
                callPopupModal(
                    modalNanoBrokersUnlockHeader,
                    modalNanoBrokersUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
            }
            break;
        case 'stellarCartography':
            if (getStatRun() === 1) {
                callPopupModal(
                    modalInterstellarTabUnlockHeader,
                    modalInterstellarTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
            }
            break;
        case 'basicPowerGeneration':
            if (getStatRun() === 1) {
                callPopupModal(
                    modalEnergyTabUnlockHeader,
                    modalEnergyTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
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
                callPopupModal(
                    modalRocketCompositesTabUnlockHeader,
                    modalRocketCompositesTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
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
                callPopupModal(
                    modalCompoundsTabUnlockHeader,
                    modalCompoundsTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
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
                callPopupModal(
                    modalSpaceMiningTabUnlockHeader,
                    modalSpaceMiningTabUnlockText,
                    true,
                    false,
                    false,
                    false,
                    () => {
                        showHideModal();
                    },
                    null,
                    null,
                    null,
                    'CONFIRM',
                    null,
                    null,
                    null,
                    false
                );
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
