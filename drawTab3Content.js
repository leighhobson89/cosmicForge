import { getCurrentStarSystem, setCanFuelRockets, setCanTravelToAsteroids, getTechTreeDataAndDraw, getTimerRateRatio, deferredActions, getCanAffordDeferred, setCanAffordDeferred, setTechUnlockedArray, setTemporaryCoreTechRowsRepo, setTechTreeDrawnYet, setRenderedTechTree, setUnlockedCompoundsArray, getTechUnlockedArray, getUnlockedResourcesArray, getPlayerPhilosophy, setRepeatableTechMultipliers, getRepeatableTechMultipliers, setIncreaseStorageFactor, getStatRun, getCurrentRunIsMegaStructureRun, setPermanentAntimatterUnlock, isTechTreeEnabled } from './constantsAndGlobalVars.js';
import { setAllCompoundsToZeroQuantity, gain, startUpdateTimersAndRates, addToResourceAllTimeStat, setFleetArmorBuffsAfterRepeatables, setFleetSpeedsAfterRepeatables, setFleetAttackDamageAfterRepeatables, setInitialImpressionBaseAfterRepeatables, setStarStudyEfficiencyAfterRepeatables, setAsteroidSearchEfficiencyAfterRepeatables, setRocketTravelTimeReductionAfterRepeatables, setStarshipTravelTimeReductionAfterRepeatables, setResourceAutobuyerPricesAfterRepeatables, setCompoundRecipePricesAfterRepeatables, setEnergyAndResearchBuildingPricesAfterRepeatables, setFleetPricesAfterRepeatables, setStarshipPartPricesAfterRepeatables, setRocketPartPricesAfterRepeatables, applyMegaStructureBonuses } from './game.js';
import { getStarSystemDataObject, setResourceDataObject, getResourceDataObject, setAutoBuyerTierLevel } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, createToggleSwitch, createSvgElement, createTextElement, sortTechRows, createOptionRow, createButton, showNotification, updateDescriptionRow, appendAttentionIndicator, callPopupModal, showHideModal } from './ui.js';
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

    sortTechRows(true);
    if (heading === 'Research') {
        const researchScienceKitRow = createOptionRow(
            'researchScienceKitRow',
            null,
            'Science Kit:',
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
            null,
            null,
            `${getResourceDataObject('research', ['upgrades', 'scienceKit', 'price']) + ' Research'}`,
            '',
            'upgradeCheck',
            'scienceUpgrade',
            'scienceKit',
            'cash',
            null,
            false,
            null,
            null,
            'science'
        );
        optionContentElement.appendChild(researchScienceKitRow);

        const researchScienceClubRow = createOptionRow(
            'researchScienceClubRow',
            null,
            'Open Science Club:',
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
            null,
            null,
            `${getResourceDataObject('research', ['upgrades', 'scienceClub', 'price']) + ' Research'}`,
            '',
            'upgradeCheck',
            'scienceUpgrade',
            'scienceClub',
            'cash',
            null,
            ['tech', 'knowledgeSharing'],
            null,
            null,
            'science'
        );
        optionContentElement.appendChild(researchScienceClubRow);

        const researchScienceLabRow = createOptionRow(
            'researchScienceLabRow',
            null,
            'Open Science Lab:',
            createButton(`Add ${getResourceDataObject('research', ['upgrades', 'scienceLab', 'rate']) * getTimerRateRatio()} Research /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
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
            null,
            null,
            `${getResourceDataObject('research', ['upgrades', 'scienceLab', 'price']) + ' Research'}`,
            '',
            'upgradeCheck',
            'scienceUpgrade',
            'scienceLab',
            'cash',
            null,
            ['tech', 'scienceLaboratories'],
            null,
            null,
            'science'
        );
        optionContentElement.appendChild(researchScienceLabRow);

    } else if (heading === 'Technology') {
        const rows = [
            {
                techName: 'knowledgeSharing',
                row: createOptionRow(
                    'techKnowledgeSharingRow',
                    null,
                    'Knowledge Sharing:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('knowledgeSharing', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('knowledgeSharing');
                        showNotification(techNotificationMessages.knowledgeSharing, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        appendAttentionIndicator(document.getElementById('researchOption'));
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalKnowledgeSharingTabUnlockHeader, 
                                modalKnowledgeSharingTabUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'knowledgeSharing', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['knowledgeSharing', 'price'])} Research${getResourceDataObject('techs', ['knowledgeSharing', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="knowledgeSharingPrereq">${getResourceDataObject('techs', ['knowledgeSharing', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'knowledgeSharing',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'fusionTheory',
                row: createOptionRow(
                    'techFusionTheoryRow',
                    null,
                    'Fusion Theory:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('fusionTheory', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('fusionTheory');
                        showNotification(techNotificationMessages.fusionTheory, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'fusionTheory', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['fusionTheory', 'price'])} Research${getResourceDataObject('techs', ['fusionTheory', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionTheoryPrereq">${getResourceDataObject('techs', ['fusionTheory', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'fusionTheory',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'hydrogenFusion',
                row: createOptionRow(
                    'techHydrogenFusionRow',
                    null,
                    'Hydrogen Fusion:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('hydrogenFusion', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('hydrogenFusion');
                        updateDescriptionRow('hydrogenSellRow', 'content2');
                        showNotification(techNotificationMessages.hydrogenFusion, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'hydrogenFusion', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['hydrogenFusion', 'price'])} Research${getResourceDataObject('techs', ['hydrogenFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="hydrogenFusionPrereq">${getResourceDataObject('techs', ['hydrogenFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'hydrogenFusion',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'heliumFusion',
                row: createOptionRow(
                    'techHeliumFusionRow',
                    null,
                    'Helium Fusion:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('heliumFusion', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('heliumFusion');
                        updateDescriptionRow('heliumSellRow', 'content2');
                        showNotification(techNotificationMessages.heliumFusion, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'heliumFusion', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['heliumFusion', 'price'])} Research${getResourceDataObject('techs', ['heliumFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="heliumFusionPrereq">${getResourceDataObject('techs', ['heliumFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'heliumFusion',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'carbonFusion',
                row: createOptionRow(
                    'techCarbonFusionRow',
                    null,
                    'Carbon Fusion:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('carbonFusion', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('carbonFusion');
                        updateDescriptionRow('carbonSellRow', 'content2');
                        showNotification(techNotificationMessages.carbonFusion, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'carbonFusion', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['carbonFusion', 'price'])} Research${getResourceDataObject('techs', ['carbonFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="carbonFusionPrereq">${getResourceDataObject('techs', ['carbonFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'carbonFusion',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'neonFusion',
                row: createOptionRow(
                    'techNeonFusionRow',
                    null,
                    'Neon Fusion:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('neonFusion', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('neonFusion');
                        updateDescriptionRow('neonSellRow', 'content2');
                        showNotification(techNotificationMessages.neonFusion, 'info', 3000, 'tech');
                        setUnlockedCompoundsArray('water');
                        if (getTechUnlockedArray().includes('compounds')) {
                            appendAttentionIndicator(document.getElementById(`waterOption`));
                        }
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'neonFusion', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['neonFusion', 'price'])} Research${getResourceDataObject('techs', ['neonFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="neonFusionPrereq">${getResourceDataObject('techs', ['neonFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'neonFusion',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },            
            {
                techName: 'oxygenFusion',
                row: createOptionRow(
                    'techOxygenFusionRow',
                    null,
                    'Oxygen Fusion:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('oxygenFusion', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('oxygenFusion');
                        updateDescriptionRow('oxygenSellRow', 'content2');
                        showNotification(techNotificationMessages.oxygenFusion, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'oxygenFusion', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['oxygenFusion', 'price'])} Research${getResourceDataObject('techs', ['oxygenFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="oxygenFusionPrereq">${getResourceDataObject('techs', ['oxygenFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'oxygenFusion',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },            
            {
                techName: 'siliconFusion',
                row: createOptionRow(
                    'techSiliconFusionRow',
                    null,
                    'Silicon Fusion:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('siliconFusion', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('siliconFusion');
                        updateDescriptionRow('siliconSellRow', 'content2');
                        showNotification(techNotificationMessages.siliconFusion, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'siliconFusion', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['siliconFusion', 'price'])} Research${getResourceDataObject('techs', ['siliconFusion', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="siliconFusionPrereq">${getResourceDataObject('techs', ['siliconFusion', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'siliconFusion',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },    
            {
                techName: 'nobleGasCollection',
                row: createOptionRow(
                    'techNobleGasCollectionRow',
                    null,
                    'Noble Gas Collection:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('nobleGasCollection', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('nobleGasCollection');
                        showNotification(techNotificationMessages.nobleGasCollection, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'nobleGasCollection', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['nobleGasCollection', 'price'])} Research${getResourceDataObject('techs', ['nobleGasCollection', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="nobleGasCollectionPrereq">${getResourceDataObject('techs', ['nobleGasCollection', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'nobleGasCollection',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'glassManufacture',
                row: createOptionRow(
                    'techGlassManufactureRow',
                    null,
                    'Glass Manufacture:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('glassManufacture', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('glassManufacture');
                        showNotification(techNotificationMessages.glassManufacture, 'info', 3000, 'tech');
                        setUnlockedCompoundsArray('glass');
                        if (getTechUnlockedArray().includes('compounds')) {
                            appendAttentionIndicator(document.getElementById(`glassOption`));
                        }
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'glassManufacture', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['glassManufacture', 'price'])} Research${getResourceDataObject('techs', ['glassManufacture', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="glassManufacturePrereq">${getResourceDataObject('techs', ['glassManufacture', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'glassManufacture',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'aggregateMixing',
                row: createOptionRow(
                    'techAggregateMixingRow',
                    null,
                    'Aggregate Mixing:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('aggregateMixing', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('aggregateMixing');
                        showNotification(techNotificationMessages.aggregateMixing, 'info', 3000, 'tech');
                        setUnlockedCompoundsArray('concrete');
                        if (getTechUnlockedArray().includes('compounds')) {
                            appendAttentionIndicator(document.getElementById(`concreteOption`));
                        }
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'aggregateMixing', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['aggregateMixing', 'price'])} Research${getResourceDataObject('techs', ['aggregateMixing', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="aggregateMixingPrereq">${getResourceDataObject('techs', ['aggregateMixing', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'aggregateMixing',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },            
            {
                techName: 'neutronCapture',
                row: createOptionRow(
                    'techNeutronCaptureRow',
                    null,
                    'Neutron Capture:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('neutronCapture', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('neutronCapture');
                        showNotification(techNotificationMessages.neutronCapture, 'info', 3000, 'tech');
                        setUnlockedCompoundsArray('titanium');
                        if (getTechUnlockedArray().includes('compounds')) {
                            appendAttentionIndicator(document.getElementById(`titaniumOption`));
                        }
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'neutronCapture', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['neutronCapture', 'price'])} Research${getResourceDataObject('techs', ['neutronCapture', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="neutronCapturePrereq">${getResourceDataObject('techs', ['neutronCapture', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'neutronCapture',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },                               
            {
                techName: 'quantumComputing',
                row: createOptionRow(
                    'techQuantumComputingRow',
                    null,
                    'Quantum Computing:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('quantumComputing', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('quantumComputing');
                        const resourceObject = getResourceDataObject('resources');
                        Object.keys(resourceObject).forEach(key => {
                            if (getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'normalProgression']) === true) {
                                setAutoBuyerTierLevel(key, 2, false, 'resources');
                            }
                        });
                        showNotification(techNotificationMessages.quantumComputing, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        indicateAllResources();
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalQuantumComputingTabUnlockHeader, 
                                modalQuantumComputingTabUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'quantumComputing', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['quantumComputing', 'price'])} Research${getResourceDataObject('techs', ['quantumComputing', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="quantumComputingPrereq">${getResourceDataObject('techs', ['quantumComputing', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'quantumComputing',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'scienceLaboratories',
                row: createOptionRow(
                    'techScienceLaboratoriesRow',
                    null,
                    'Science Laboratories:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('scienceLaboratories', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('scienceLaboratories');
                        showNotification(techNotificationMessages.scienceLaboratories, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        appendAttentionIndicator(document.getElementById('researchOption'));
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalScienceLabsTabUnlockHeader, 
                                modalScienceLabsTabUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'scienceLaboratories', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['scienceLaboratories', 'price'])} Research${getResourceDataObject('techs', ['scienceLaboratories', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="scienceLaboratoriesPrereq">${getResourceDataObject('techs', ['scienceLaboratories', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'scienceLaboratories',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'hydroCarbons',
                row: createOptionRow(
                    'techHydroCarbonsRow',
                    null,
                    'HydroCarbons:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('hydroCarbons', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('hydroCarbons');
                        showNotification(techNotificationMessages.hydroCarbons, 'info', 3000, 'tech');
                        setUnlockedCompoundsArray('diesel');
                        if (getTechUnlockedArray().includes('compounds')) {
                            appendAttentionIndicator(document.getElementById(`dieselOption`));
                        }
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'hydroCarbons', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['hydroCarbons', 'price'])} Research${getResourceDataObject('techs', ['hydroCarbons', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="hydroCarbonsPrereq">${getResourceDataObject('techs', ['hydroCarbons', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'hydroCarbons',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'nanoTubeTechnology',
                row: createOptionRow(
                    'techNanoTubeTechnologyRow',
                    null,
                    'Nano Tube Technology:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('nanoTubeTechnology', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('nanoTubeTechnology');
                        showNotification(techNotificationMessages.nanoTubeTechnology, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'nanoTubeTechnology', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['nanoTubeTechnology', 'price'])} Research${getResourceDataObject('techs', ['nanoTubeTechnology', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="nanoTubeTechnologyPrereq">${getResourceDataObject('techs', ['nanoTubeTechnology', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'nanoTubeTechnology',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'nanoBrokers',
                row: createOptionRow(
                    'techNanoBrokersRow',
                    null,
                    'Nano Brokers:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('nanoBrokers', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('nanoBrokers');
                        showNotification(techNotificationMessages.nanoBrokers, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalNanoBrokersUnlockHeader, 
                                modalNanoBrokersUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'nanoBrokers', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['nanoBrokers', 'price'])} Research${getResourceDataObject('techs', ['nanoBrokers', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="nanoBrokersPrereq">${getResourceDataObject('techs', ['nanoBrokers', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'nanoBrokers',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'stellarCartography',
                row: createOptionRow(
                    'techStellarCartographyRow',
                    null,
                    'Stellar Cartography:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('stellarCartography', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('stellarCartography');
                        showNotification(techNotificationMessages.stellarCartography, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalInterstellarTabUnlockHeader, 
                                modalInterstellarTabUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'stellarCartography', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['stellarCartography', 'price'])} Research${getResourceDataObject('techs', ['stellarCartography', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="stellarCartographyPrereq">${getResourceDataObject('techs', ['stellarCartography', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'stellarCartography',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'basicPowerGeneration',
                row: createOptionRow(
                    'techBasicPowerGenerationRow',
                    null,
                    'Basic Power Generation:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('basicPowerGeneration', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('basicPowerGeneration');
                        showNotification(techNotificationMessages.basicPowerGeneration, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalEnergyTabUnlockHeader, 
                                modalEnergyTabUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'basicPowerGeneration', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['basicPowerGeneration', 'price'])} Research${getResourceDataObject('techs', ['basicPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="basicPowerGenerationPrereq">${getResourceDataObject('techs', ['basicPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'basicPowerGeneration',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'sodiumIonPowerStorage',
                row: createOptionRow(
                    'techSodiumIonPowerStorageRow',
                    null,
                    'Sodium Ion Power Storage:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('sodiumIonPowerStorage', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('sodiumIonPowerStorage');
                        showNotification(techNotificationMessages.sodiumIonPowerStorage, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'sodiumIonPowerStorage', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['sodiumIonPowerStorage', 'price'])} Research${getResourceDataObject('techs', ['sodiumIonPowerStorage', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="sodiumIonPowerStoragePrereq">${getResourceDataObject('techs', ['sodiumIonPowerStorage', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'sodiumIonPowerStorage',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'advancedPowerGeneration',
                row: createOptionRow(
                    'techAdvancedPowerGenerationRow',
                    null,
                    'Advanced Power Generation:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('advancedPowerGeneration', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('advancedPowerGeneration');
                        showNotification(techNotificationMessages.advancedPowerGeneration, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'advancedPowerGeneration', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['advancedPowerGeneration', 'price'])} Research${getResourceDataObject('techs', ['advancedPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="advancedPowerGenerationPrereq">${getResourceDataObject('techs', ['advancedPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'advancedPowerGeneration',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'solarPowerGeneration',
                row: createOptionRow(
                    'techSolarPowerGenerationRow',
                    null,
                    'Solar Power Generation:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('solarPowerGeneration', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('solarPowerGeneration');
                        showNotification(techNotificationMessages.solarPowerGeneration, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'solarPowerGeneration', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['solarPowerGeneration', 'price'])} Research${getResourceDataObject('techs', ['solarPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="solarPowerGenerationPrereq">${getResourceDataObject('techs', ['solarPowerGeneration', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'solarPowerGeneration',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'rocketComposites',
                row: createOptionRow(
                    'techRocketCompositesRow',
                    null,
                    'Rocket Composites:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('rocketComposites', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('rocketComposites');
                        const resourceObject = getResourceDataObject('resources');
                        Object.keys(resourceObject).forEach(key => {
                            if (getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'normalProgression']) === true) {
                                setAutoBuyerTierLevel(key, 4, false, 'resources');
                                indicateAllResources();
                            }
                        });
                        showNotification(techNotificationMessages.rocketComposites, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        if (!document.getElementById('tab6').innerHTML.includes('???')) {
                            appendAttentionIndicator(document.getElementById(`launchPadOption`)); 
                        } 
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalRocketCompositesTabUnlockHeader, 
                                modalRocketCompositesTabUnlockText, 
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
                        }
                        document.getElementById('launchPadOption').parentElement.parentElement.classList.remove('invisible');
                    }, 'techUnlock', '', 'rocketComposites', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['rocketComposites', 'price'])} Research${getResourceDataObject('techs', ['rocketComposites', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="rocketCompositesPrereq">${getResourceDataObject('techs', ['rocketComposites', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'rocketComposites',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'advancedFuels',
                row: createOptionRow(
                    'techAdvancedFuelsRow',
                    null,
                    'Advanced Fuels:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('advancedFuels', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('advancedFuels');
                        showNotification(techNotificationMessages.advancedFuels, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        setCanFuelRockets(true);
                    }, 'techUnlock', '', 'advancedFuels', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['advancedFuels', 'price'])} Research${getResourceDataObject('techs', ['advancedFuels', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="advancedFuelsPrereq">${getResourceDataObject('techs', ['advancedFuels', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'advancedFuels',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'planetaryNavigation',
                row: createOptionRow(
                    'techPlanetaryNavigationRow',
                    null,
                    'Planetary Navigation:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('planetaryNavigation', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('planetaryNavigation');
                        showNotification(techNotificationMessages.planetaryNavigation, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        setCanTravelToAsteroids(true);
                    }, 'techUnlock', '', 'planetaryNavigation', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['planetaryNavigation', 'price'])} Research${getResourceDataObject('techs', ['planetaryNavigation', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="planetaryNavigationPrereq">${getResourceDataObject('techs', ['planetaryNavigation', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'planetaryNavigation',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'compounds',
                row: createOptionRow(
                    'techCompoundsRow',
                    null,
                    'Compounds:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('compounds', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('compounds');
                        showNotification(techNotificationMessages.compounds, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        setAllCompoundsToZeroQuantity();
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalCompoundsTabUnlockHeader, 
                                modalCompoundsTabUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'compounds', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['compounds', 'price'])} Research${getResourceDataObject('techs', ['compounds', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="compoundsPrereq">${getResourceDataObject('techs', ['compounds', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'compounds',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'steelFoundries',
                row: createOptionRow(
                    'techSteelFoundriesRow',
                    null,
                    'Steel Foundries:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('steelFoundries', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('steelFoundries');
                        showNotification(techNotificationMessages.steelFoundries, 'info', 3000, 'tech');
                        setUnlockedCompoundsArray('steel');
                        if (getTechUnlockedArray().includes('compounds')) {
                            appendAttentionIndicator(document.getElementById(`steelOption`));
                        }
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'steelFoundries', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['steelFoundries', 'price'])} Research${getResourceDataObject('techs', ['steelFoundries', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="steelFoundriesPrereq">${getResourceDataObject('techs', ['steelFoundries', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'steelFoundries',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'giganticTurbines',
                row: createOptionRow(
                    'techGiganticTurbinesRow',
                    null,
                    'Gigantic Turbines:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('giganticTurbines', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('giganticTurbines');
                        showNotification(techNotificationMessages.giganticTurbines, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'giganticTurbines', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['giganticTurbines', 'price'])} Research${getResourceDataObject('techs', ['giganticTurbines', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="giganticTurbinesPrereq">${getResourceDataObject('techs', ['giganticTurbines', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'giganticTurbines',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'atmosphericTelescopes',
                row: createOptionRow(
                    'techAtmosphericTelescopesRow',
                    null,
                    'Atmospheric Telescopes:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('atmosphericTelescopes', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('atmosphericTelescopes');
                        showNotification(techNotificationMessages.atmosphericTelescopes, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        if (!document.getElementById('tab6').innerHTML.includes('???')) {
                            appendAttentionIndicator(document.getElementById(`spaceTelescopeOption`)); 
                        }
                        if (getStatRun() === 1) {
                            callPopupModal(
                                modalSpaceMiningTabUnlockHeader, 
                                modalSpaceMiningTabUnlockText, 
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
                        }
                    }, 'techUnlock', '', 'atmosphericTelescopes', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['atmosphericTelescopes', 'price'])} Research${getResourceDataObject('techs', ['atmosphericTelescopes', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="atmosphericTelescopesPrereq">${getResourceDataObject('techs', ['atmosphericTelescopes', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'atmosphericTelescopes',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'fusionEfficiencyI',
                row: createOptionRow(
                    'techFusionEfficiencyIRow',
                    null,
                    'Fusion Efficiency I:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('fusionEfficiencyI', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('fusionEfficiencyI');
                        showNotification(techNotificationMessages.fusionEfficiencyI, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'fusionEfficiencyI', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['fusionEfficiencyI', 'price'])} Research${getResourceDataObject('techs', ['fusionEfficiencyI', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionEfficiencyIPrereq">${getResourceDataObject('techs', ['fusionEfficiencyI', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'fusionEfficiencyI',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'fusionEfficiencyII',
                row: createOptionRow(
                    'techFusionEfficiencyIIRow',
                    null,
                    'Fusion Efficiency II:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('fusionEfficiencyII', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('fusionEfficiencyII');
                        showNotification(techNotificationMessages.fusionEfficiencyII, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'fusionEfficiencyII', null, 'research', true, null, 'tech'), 
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['fusionEfficiencyII', 'price'])} Research${getResourceDataObject('techs', ['fusionEfficiencyII', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionEfficiencyIIPrereq">${getResourceDataObject('techs', ['fusionEfficiencyII', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'fusionEfficiencyII',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'fusionEfficiencyIII',
                row: createOptionRow(
                    'techFusionEfficiencyIIIRow',
                    null,
                    'Fusion Efficiency III:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('fusionEfficiencyIII', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('fusionEfficiencyIII');
                        showNotification(techNotificationMessages.fusionEfficiencyIII, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'fusionEfficiencyIII', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                   `${getResourceDataObject('techs', ['fusionEfficiencyIII', 'price'])} Research${getResourceDataObject('techs', ['fusionEfficiencyIII', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="fusionEfficiencyIIIPrereq">${getResourceDataObject('techs', ['fusionEfficiencyIII', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'fusionEfficiencyIII',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'orbitalConstruction',
                row: createOptionRow(
                    'techOrbitalConstructionRow',
                    null,
                    'Orbital Construction:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('orbitalConstruction', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('orbitalConstruction');
                        showNotification(techNotificationMessages.orbitalConstruction, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                        document.getElementById('starShipOption').parentElement.parentElement.classList.remove('invisible');
                    }, 'techUnlock', '', 'orbitalConstruction', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['orbitalConstruction', 'price'])} Research${getResourceDataObject('techs', ['orbitalConstruction', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="orbitalConstructionPrereq">${getResourceDataObject('techs', ['orbitalConstruction', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'orbitalConstruction',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'antimatterEngines',
                row: createOptionRow(
                    'techAntimatterEnginesRow',
                    null,
                    'Antimatter Engines:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('antimatterEngines', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('antimatterEngines');
                        showNotification(techNotificationMessages.antimatterEngines, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'antimatterEngines', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['antimatterEngines', 'price'])} Research${getResourceDataObject('techs', ['antimatterEngines', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="antimatterEnginesPrereq">${getResourceDataObject('techs', ['antimatterEngines', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'antimatterEngines',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'FTLTravelTheory',
                row: createOptionRow(
                    'techFTLTravelTheoryRow',
                    null,
                    'FTL Travel Theory:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('FTLTravelTheory', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('FTLTravelTheory');
                        showNotification(techNotificationMessages.FTLTravelTheory, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'FTLTravelTheory', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['FTLTravelTheory', 'price'])} Research${getResourceDataObject('techs', ['FTLTravelTheory', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="FTLTravelTheoryPrereq">${getResourceDataObject('techs', ['FTLTravelTheory', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'FTLTravelTheory',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'lifeSupportSystems',
                row: createOptionRow(
                    'techLifeSupportSystemsRow',
                    null,
                    'Life Support Systems:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('lifeSupportSystems', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('lifeSupportSystems');
                        showNotification(techNotificationMessages.lifeSupportSystems, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'lifeSupportSystems', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['lifeSupportSystems', 'price'])} Research${getResourceDataObject('techs', ['lifeSupportSystems', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="lifeSupportSystemsPrereq">${getResourceDataObject('techs', ['lifeSupportSystems', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'lifeSupportSystems',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'starshipFleets',
                row: createOptionRow(
                    'techStarshipFleetsRow',
                    null,
                    'Starship Fleets:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('starshipFleets', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('starshipFleets');
                        showNotification(techNotificationMessages.starshipFleets, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'starshipFleets', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['starshipFleets', 'price'])} Research${getResourceDataObject('techs', ['starshipFleets', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="starshipFleetsPrereq">${getResourceDataObject('techs', ['starshipFleets', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'starshipFleets',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'stellarScanners',
                row: createOptionRow(
                    'techStellarScannersRow',
                    null,
                    'Stellar Scanners:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('stellarScanners', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('stellarScanners');
                        showNotification(techNotificationMessages.stellarScanners, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
                    }, 'techUnlock', '', 'stellarScanners', null, 'research', true, null, 'tech'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['stellarScanners', 'price'])} Research${getResourceDataObject('techs', ['stellarScanners', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="stellarScannersPrereq">${getResourceDataObject('techs', ['stellarScanners', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'stellarScanners',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            }, 
            
            //MEGASTRUCTURE TECHS

            {
                techName: 'dysonSphereUnderstanding',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow(
                    'techDysonSphereUnderstandingRow',
                    null,
                    'Dyson Sphere Understanding',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('dysonSphereUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('dysonSphereUnderstanding');
                        showNotification(techNotificationMessages.dysonSphereUnderstanding, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['dysonSphereUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereUnderstandingPrereq">${getResourceDataObject('techs', ['dysonSphereUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'dysonSphereUnderstanding',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'dysonSphereCapabilities',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow(
                    'techDysonSphereCapabilitiesRow',
                    null,
                    'Dyson Sphere Capabilities',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('dysonSphereCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('dysonSphereCapabilities');
                        showNotification(techNotificationMessages.dysonSphereCapabilities, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['dysonSphereCapabilities', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereCapabilitiesPrereq">${getResourceDataObject('techs', ['dysonSphereCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'dysonSphereCapabilities',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'dysonSphereDisconnect',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow(
                    'techDysonSphereDisconnectRow',
                    null,
                    'Dyson Sphere Disconnect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('dysonSphereDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('dysonSphereDisconnect');
                        showNotification(techNotificationMessages.dysonSphereDisconnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['dysonSphereDisconnect', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereDisconnectPrereq">${getResourceDataObject('techs', ['dysonSphereDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'dysonSphereDisconnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'dysonSpherePower',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow(
                    'techDysonSpherePowerRow',
                    null,
                    'Dyson Sphere Power',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('dysonSpherePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('dysonSpherePower');
                        showNotification(techNotificationMessages.dysonSpherePower, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['dysonSpherePower', 'price'])} Research${getResourceDataObject('techs', ['dysonSpherePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSpherePowerPrereq">${getResourceDataObject('techs', ['dysonSpherePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'dysonSpherePower',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'dysonSphereConnect',
                special: ['megastructure', 'Dyson Sphere'],
                row: createOptionRow(
                    'techDysonSphereConnectRow',
                    null,
                    'Dyson Sphere Connect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('dysonSphereConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('dysonSphereConnect');
                        showNotification(techNotificationMessages.dysonSphereConnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['dysonSphereConnect', 'price'])} Research${getResourceDataObject('techs', ['dysonSphereConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="dysonSphereConnectPrereq">${getResourceDataObject('techs', ['dysonSphereConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'dysonSphereConnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'celestialProcessingCoreUnderstanding',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow(
                    'techCelestialProcessingCoreUnderstandingRow',
                    null,
                    'Celestial Processing Core Understanding',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('celestialProcessingCoreUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('celestialProcessingCoreUnderstanding');
                        showNotification(techNotificationMessages.celestialProcessingCoreUnderstanding, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['celestialProcessingCoreUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreUnderstandingPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'celestialProcessingCoreUnderstanding',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'celestialProcessingCoreCapabilities',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow(
                    'techCelestialProcessingCoreCapabilitiesRow',
                    null,
                    'Celestial Processing Core Capabilities',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('celestialProcessingCoreCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('celestialProcessingCoreCapabilities');
                        showNotification(techNotificationMessages.celestialProcessingCoreCapabilities, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['celestialProcessingCoreCapabilities', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreCapabilitiesPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'celestialProcessingCoreCapabilities',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'celestialProcessingCoreDisconnect',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow(
                    'techCelestialProcessingCoreDisconnectRow',
                    null,
                    'Celestial Processing Core Disconnect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('celestialProcessingCoreDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('celestialProcessingCoreDisconnect');
                        showNotification(techNotificationMessages.celestialProcessingCoreDisconnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['celestialProcessingCoreDisconnect', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreDisconnectPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'celestialProcessingCoreDisconnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'celestialProcessingCorePower',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow(
                    'techCelestialProcessingCorePowerRow',
                    null,
                    'Celestial Processing Core Power',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('celestialProcessingCorePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('celestialProcessingCorePower');
                        showNotification(techNotificationMessages.celestialProcessingCorePower, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['celestialProcessingCorePower', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCorePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCorePowerPrereq">${getResourceDataObject('techs', ['celestialProcessingCorePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'celestialProcessingCorePower',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'celestialProcessingCoreConnect',
                special: ['megastructure', 'Celestial Processing Core'],
                row: createOptionRow(
                    'techCelestialProcessingCoreConnectRow',
                    null,
                    'Celestial Processing Core Connect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('celestialProcessingCoreConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('celestialProcessingCoreConnect');
                        showNotification(techNotificationMessages.celestialProcessingCoreConnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['celestialProcessingCoreConnect', 'price'])} Research${getResourceDataObject('techs', ['celestialProcessingCoreConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="celestialProcessingCoreConnectPrereq">${getResourceDataObject('techs', ['celestialProcessingCoreConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'celestialProcessingCoreConnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'plasmaForgeUnderstanding',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow(
                    'techPlasmaForgeUnderstandingRow',
                    null,
                    'Plasma Forge Understanding',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('plasmaForgeUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('plasmaForgeUnderstanding');
                        showNotification(techNotificationMessages.plasmaForgeUnderstanding, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['plasmaForgeUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeUnderstandingPrereq">${getResourceDataObject('techs', ['plasmaForgeUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'plasmaForgeUnderstanding',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'plasmaForgeCapabilities',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow(
                    'techPlasmaForgeCapabilitiesRow',
                    null,
                    'Plasma Forge Capabilities',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('plasmaForgeCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('plasmaForgeCapabilities');
                        showNotification(techNotificationMessages.plasmaForgeCapabilities, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['plasmaForgeCapabilities', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeCapabilitiesPrereq">${getResourceDataObject('techs', ['plasmaForgeCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'plasmaForgeCapabilities',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'plasmaForgeDisconnect',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow(
                    'techPlasmaForgeDisconnectRow',
                    null,
                    'Plasma Forge Disconnect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('plasmaForgeDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('plasmaForgeDisconnect');
                        showNotification(techNotificationMessages.plasmaForgeDisconnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['plasmaForgeDisconnect', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeDisconnectPrereq">${getResourceDataObject('techs', ['plasmaForgeDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'plasmaForgeDisconnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'plasmaForgePower',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow(
                    'techPlasmaForgePowerRow',
                    null,
                    'Plasma Forge Power',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('plasmaForgePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('plasmaForgePower');
                        showNotification(techNotificationMessages.plasmaForgePower, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['plasmaForgePower', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgePowerPrereq">${getResourceDataObject('techs', ['plasmaForgePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'plasmaForgePower',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'plasmaForgeConnect',
                special: ['megastructure', 'Plasma Forge'],
                row: createOptionRow(
                    'techPlasmaForgeConnectRow',
                    null,
                    'Plasma Forge Connect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('plasmaForgeConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('plasmaForgeConnect');
                        showNotification(techNotificationMessages.plasmaForgeConnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['plasmaForgeConnect', 'price'])} Research${getResourceDataObject('techs', ['plasmaForgeConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="plasmaForgeConnectPrereq">${getResourceDataObject('techs', ['plasmaForgeConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'plasmaForgeConnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'galacticMemoryArchiveUnderstanding',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow(
                    'techGalacticMemoryArchiveUnderstandingRow',
                    null,
                    'Galactic Memory Archive Understanding',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('galacticMemoryArchiveUnderstanding', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('galacticMemoryArchiveUnderstanding');
                        showNotification(techNotificationMessages.galacticMemoryArchiveUnderstanding, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['galacticMemoryArchiveUnderstanding', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveUnderstanding', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveUnderstandingPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveUnderstanding', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'galacticMemoryArchiveUnderstanding',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'galacticMemoryArchiveCapabilities',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow(
                    'techGalacticMemoryArchiveCapabilitiesRow',
                    null,
                    'Galactic Memory Archive Capabilities',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('galacticMemoryArchiveCapabilities', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('galacticMemoryArchiveCapabilities');
                        showNotification(techNotificationMessages.galacticMemoryArchiveCapabilities, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['galacticMemoryArchiveCapabilities', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveCapabilities', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveCapabilitiesPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveCapabilities', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'galacticMemoryArchiveCapabilities',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'galacticMemoryArchiveDisconnect',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow(
                    'techGalacticMemoryArchiveDisconnectRow',
                    null,
                    'Galactic Memory Archive Disconnect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('galacticMemoryArchiveDisconnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('galacticMemoryArchiveDisconnect');
                        showNotification(techNotificationMessages.galacticMemoryArchiveDisconnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['galacticMemoryArchiveDisconnect', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveDisconnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveDisconnectPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveDisconnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'galacticMemoryArchiveDisconnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'galacticMemoryArchivePower',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow(
                    'techGalacticMemoryArchivePowerRow',
                    null,
                    'Galactic Memory Archive Power',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('galacticMemoryArchivePower', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('galacticMemoryArchivePower');
                        showNotification(techNotificationMessages.galacticMemoryArchivePower, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['galacticMemoryArchivePower', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchivePower', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchivePowerPrereq">${getResourceDataObject('techs', ['galacticMemoryArchivePower', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'galacticMemoryArchivePower',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
            },
            {
                techName: 'galacticMemoryArchiveConnect',
                special: ['megastructure', 'Galactic Memory Archive'],
                row: createOptionRow(
                    'techGalacticMemoryArchiveConnectRow',
                    null,
                    'Galactic Memory Archive Connect',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'tech-unlock'], (event) => {
                        gain('galacticMemoryArchiveConnect', null, 'techUnlock', 'techUnlock', false, 'techs', 'resources');
                        event.currentTarget.classList.add('unlocked-tech');
                        setTechUnlockedArray('galacticMemoryArchiveConnect');
                        showNotification(techNotificationMessages.galacticMemoryArchiveConnect, 'info', 3000, 'tech');
                        setRenderedTechTree(false);
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
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('techs', ['galacticMemoryArchiveConnect', 'price'])} Research${getResourceDataObject('techs', ['galacticMemoryArchiveConnect', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? ', ' : ''}<span id="galacticMemoryArchiveConnectPrereq">${getResourceDataObject('techs', ['galacticMemoryArchiveConnect', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span>`,
                    '',
                    'techUnlock',
                    'galacticMemoryArchiveConnect',
                    null,
                    'research',
                    null,
                    ['research', 'researchPoints'],
                    null,
                    null,
                    'tech'
                )
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
        const techTreeContainerRow = createOptionRow(
            'techTreeContainerRow',
            null,
            '',
            isTechTreeEnabled()
                ? createSvgElement('techTreeSvg', '100%', '700px', ['tech-tree-svg'])
                : createTextElement('', 'techTreeNativeContainer', ['tech-tree-native-container']),
            null,
            null,
            null,
            null,
            '',
            '',
            'techTreeRender',
            '',
            '',
            '',
            null,
            false,
            null,
            null,
            'tech-tree',
            [true, 'invisible', '100%']
        );
    
        optionContentElement.appendChild(techTreeContainerRow);

        const tooltip = document.getElementById('techTreeTooltip');
        if (tooltip) {
            tooltip.remove();
        }
        getTechTreeDataAndDraw(false);
        setTechTreeDrawnYet(true);   

    }

    if (heading === 'Philosophy') {
        const constructorRows = [
            {
                techName: 'spaceStorageTankResearch',
                row: createOptionRow(
                    'techPhilosophySpaceStorageTankResearchRow',
                    null,
                    'Space Storage Tank Research:',
                    createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                        gain('spaceStorageTankResearch', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        setIncreaseStorageFactor(5);
                        showNotification('ABILITY: Base storage expansion multiplier now 5x instead of 2x!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'spaceStorageTankResearch', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'spaceStorageTankResearch', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'spaceStorageTankResearch',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'efficientAssembly',
                row: createOptionRow(
                    'techPhilosophyEfficientAssemblyRow',
                    null,
                    'Efficient Assembly:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('efficientAssembly', 'efficientAssembly', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1'); //calc for this repeatable done in gameloop with baseprices, not here
                        setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier);
                        showNotification('Space Building costs reduced by 1%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'efficientAssembly', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'efficientAssembly', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'efficientAssembly',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'laserMining',
                row: createOptionRow(
                    'techPhilosophyLaserMiningRow',
                    null,
                    'Laser Mining:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('laserMining', 'laserMining', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                        setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setResourceAutobuyerPricesAfterRepeatables();
                        showNotification('Resources AutoBuyers 5% cheaper!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'laserMining', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'laserMining', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'laserMining',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'massCompoundAssembly',
                row: createOptionRow(
                    'techPhilosophyMassCompoundAssemblyRow',
                    null,
                    'Mass Compound Assembly:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('massCompoundAssembly', 'massCompoundAssembly', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                        setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier);
                        setCompoundRecipePricesAfterRepeatables(); //logged but not needed for calc below
                        showNotification('Compounds recipes cheaper by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'massCompoundAssembly', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'massCompoundAssembly', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'massCompoundAssembly',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },   
            {
                techName: 'energyDrones',
                row: createOptionRow(
                    'techPhilosophyEnergyDronesRow',
                    null,
                    'Energy Drones:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('energyDrones', 'energyDrones', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                        setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setEnergyAndResearchBuildingPricesAfterRepeatables();
                        showNotification('Energy and Research Buildings 5% cheaper!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'energyDrones', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'energyDrones', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'energyDrones',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            }                                            
        ];

        const supremacistRows = [
            {
                techName: 'fleetHolograms',
                row: createOptionRow(
                    'techPhilosophyFleetHologramsRow',
                    null,
                    'Fleet Holograms:',
                    createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                        gain('fleetHolograms', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        //this ability is checked elsewhere not here
                        showNotification('ABILITY: You can now always Vassalize enemies provided your fleet is 3x larger than theirs!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'fleetHolograms', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'fleetHolograms', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'fleetHolograms',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },     
            {
                techName: 'hangarAutomation',
                row: createOptionRow(
                    'techPhilosophyHangarAutomationRow',
                    null,
                    'Hangar Automation:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('hangarAutomation', 'hangarAutomation', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1');
                        setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setFleetPricesAfterRepeatables();
                        showNotification('Fleet build costs reduced by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'hangarAutomation', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'hangarAutomation', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'hangarAutomation',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'syntheticPlating',
                row: createOptionRow(
                    'techPhilosophySyntheticPlatingRow',
                    null,
                    'Synthetic Plating:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('syntheticPlating', 'syntheticPlating', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                        setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setFleetArmorBuffsAfterRepeatables();
                        showNotification('Fleet Armor increased by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'syntheticPlating', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'syntheticPlating', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'syntheticPlating',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'antimatterEngineMinaturization',
                row: createOptionRow(
                    'techPhilosophyAntimatterEngineMinaturizationRow',
                    null,
                    'Antimatter Engine Minaturization:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('antimatterEngineMinaturization', 'antimatterEngineMinaturization', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                        setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setFleetSpeedsAfterRepeatables();
                        showNotification('Fleet Speed increased by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'antimatterEngineMinaturization', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'antimatterEngineMinaturization', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'antimatterEngineMinaturization',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'laserIntensityResearch',
                row: createOptionRow(
                    'techPhilosophyLaserIntensityResearchRow',
                    null,
                    'Laser Intensity Research:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('laserIntensityResearch', 'laserIntensityResearch', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                        setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setFleetAttackDamageAfterRepeatables();
                        showNotification('Fleet Attack Power increased by 5%! (Applicable to Newly Built Ships)', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'laserIntensityResearch', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'laserIntensityResearch', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'laserIntensityResearch',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            }                   
        ];

        const voidbornRows = [
            {
                techName: 'voidSeers',
                row: createOptionRow(
                    'techPhilosophyVoidSeersRow',
                    null,
                    'Void Seers:',
                    createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                        gain('voidSeers', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        //addAbilityPermanentModifier
                        showNotification('ABILITY: Space Telescope can now scan for instant Resources and Compounds!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'voidSeers', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'voidSeers', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'voidSeers',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            }, 
            {
                techName: 'stellarWhispers',
                row: createOptionRow(
                    'techPhilosophyStellarWhispersRow',
                    null,
                    'Stellar Whispers:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('stellarWhispers', 'stellarWhispers', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1');
                        setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setInitialImpressionBaseAfterRepeatables();
                        showNotification('Initial Impression of enemies improved by 1%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'stellarWhispers', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'stellarWhispers', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'stellarWhispers',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'stellarInsightManifold',
                row: createOptionRow(
                    'techPhilosophyStellarInsightManifoldRow',
                    null,
                    'Stellar Insight Manifold:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('stellarInsightManifold', 'stellarInsightManifold', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                        setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setStarStudyEfficiencyAfterRepeatables();
                        showNotification('Star Study speed increased by 1%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'stellarInsightManifold', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'stellarInsightManifold', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'stellarInsightManifold',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'asteroidDwellers',
                row: createOptionRow(
                    'techPhilosophyAsteroidDwellersRow',
                    null,
                    'Asteroid Dwellers:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('asteroidDwellers', 'asteroidDwellers', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                        setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setAsteroidSearchEfficiencyAfterRepeatables();
                        showNotification('Asteroid Search speed increased by 1%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'asteroidDwellers', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'asteroidDwellers', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'asteroidDwellers',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'ascendencyPhilosophy',
                row: createOptionRow(
                    'techPhilosophyAscendencyPhilosophyRow',
                    null,
                    'Ascendency Philosophy:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('ascendencyPhilosophy', 'ascendencyPhilosophy', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                        setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier); //calc done for repeatables in all code where AP are issued, not here
                        showNotification('Base Ascendency Point gain +1!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'ascendencyPhilosophy', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'ascendencyPhilosophy', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'ascendencyPhilosophy',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            }                       
        ];

        const expansionistRows = [
            {
                techName: 'rapidExpansion',
                row: createOptionRow(
                    'techPhilosophyRapidExpansionRow',
                    null,
                    'Rapid Expansion:',
                    createButton(`UNLOCK`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock', 'special-ability'], (event) => {
                        gain('rapidExpansion', 'ability', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        //addAbilityPermanentModifier
                        showNotification('ABILITY: You now have a chance of capturing up to 3 nearby Systems for every 1!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'rapidExpansion', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'rapidExpansion', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'rapidExpansion',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },  
            {
                techName: 'spaceElevator',
                row: createOptionRow(
                    'techPhilosophySpaceElevatorRow',
                    null,
                    'Space Elevator:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('spaceElevator', 'spaceElevator', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('1'); //logged but not needed for calc below
                        setRepeatableTechMultipliers('1', ++currentRepeatableTechMultiplier);
                        setStarshipPartPricesAfterRepeatables();
                        showNotification('Starship Parts cost reduced by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'spaceElevator', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'spaceElevator', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'spaceElevator',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'launchPadMassProduction',
                row: createOptionRow(
                    'techPhilosophyLaunchPadMassProductionRow',
                    null,
                    'Launch Pad Mass Production:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('launchPadMassProduction', 'launchPadMassProduction', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('2');
                        setRepeatableTechMultipliers('2', ++currentRepeatableTechMultiplier); //logged but not needed for calc below
                        setRocketPartPricesAfterRepeatables();
                        showNotification('Rocket Parts cost reduced by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'launchPadMassProduction', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'launchPadMassProduction', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'launchPadMassProduction',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'asteroidAttractors',
                row: createOptionRow(
                    'techPhilosophyAsteroidAttractorsRow',
                    null,
                    'Asteroid Attractors:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('asteroidAttractors', 'asteroidAttractors', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('3');
                        setRepeatableTechMultipliers('3', ++currentRepeatableTechMultiplier);
                        setRocketTravelTimeReductionAfterRepeatables();  //logged but not needed for calc below
                        showNotification('Rocket Travel time reduced by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'asteroidAttractors', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'asteroidAttractors', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'asteroidAttractors',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
            },
            {
                techName: 'warpDrive',
                row: createOptionRow(
                    'techPhilosophyWarpDriveRow',
                    null,
                    'Warp Drive:',
                    createButton(`Research`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'philosophy-tech-unlock'], (event) => {
                        gain('warpDrive', 'warpDrive', 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research');
                        let currentRepeatableTechMultiplier = getRepeatableTechMultipliers('4');
                        setRepeatableTechMultipliers('4', ++currentRepeatableTechMultiplier);
                        setStarshipTravelTimeReductionAfterRepeatables();  //logged but not needed for calc below
                        showNotification('Starship Travel time reduced by 5%!', 'info', 3000, 'tech');
                    }, 'techUnlockPhilosophy', '', 'warpDrive', null, 'research', true, null, 'techPhilosophy'),
                    null,
                    null,
                    null,
                    null,
                    `${getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'warpDrive', 'price'])} Research`,
                    '',
                    'techUnlockPhilosophy',
                    'warpDrive',
                    null,
                    'research',
                    null,
                    false,
                    null,
                    null,
                    'techPhilosophy'
                )
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

