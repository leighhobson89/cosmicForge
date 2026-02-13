import { getGameActiveCountTime, getTimerRateRatio, getSaveName, getRocketUserName, getDestinationStar, getCurrencySymbol, getPlayerPhilosophy, getRepeatableTechMultipliers, getStatRun, getCurrentRunIsMegaStructureRun, getPriceCasinoGame2, getPriceCasinoGame3 } from "./constantsAndGlobalVars.js";
import { calculateAndAddExtraAPFromPhilosophyRepeatable, formatNumber } from "./game.js";
import { getAchievementDataObject, getResourceDataObject } from "./resourceDataObject.js";
import { capitaliseWordsWithRomanNumerals } from "./utilityFunctions.js";

export let gameIntroHeader;
export let gameIntroText;
export let gameSaveNameCollect;
export let headerDescriptions;
export let techNotificationMessages;
export let optionDescriptions;
export let galacticMarketTooltipDescriptions;
export let newsTickerContent;
export let helpContent;
export let statisticsContent;
export let rocketNames;
export let starNames;
export let achievementNotifications;
export let launchStarShipWarningHeader;
export let launchStarShipWarningText;
export let enterWarModeModalHeader;
export let enterwarModeModalBackOutText;
export let enterwarModeModalNoBackOutText;
export let enterWarModeInsultedText;
export let enterWarModeSurrenderText;
export let enterWarModeNotVassalizedText;
export let enterWarModeScaredText;
export let enterWarModeModalLaughAtProspect;
export let enterWarModeModalLaughAndEnterWar;
export let enterWarModeModalImproveToReceptive;
export let enterWarModeModalNeutral;
export let enterWarModeModalReserved;
export let enterWarModeModalPatience;
export let modalBattleHeaderText;
export let modalBattleWonText;
export let modalBattleLostText;
export let modalBattleNoSentientLifeHeader;
export let modalBattleNoSentientLifeText;
export let modalRebirthHeader;
export let modalRebirthText;
export let modalGalacticTabUnlockHeader;
export let modalGalacticTabUnlockText;
export let modalOStarReachedHeader;
export let modalOStarReachedText;
export let modalOTypeStarTechAcquiredHeader;
export let modalOTypeStarTechAcquiredText;
export let achievementTooltipDescriptions;
export let achievementTooltipDescriptionTexts;
export let modalFeedbackThanksHeaderText;
export let modalFeedbackHeaderText;
export let modalFeedbackContentThanks;
export let modalFeedbackContentTextGood;
export let modalFeedbackContentTextBad;
export let modalPlayerLeaderPhilosophyHeaderText;
export let modalPlayerLeaderPhilosophyContentText;
export let modalPlayerLeaderIntroHeaderText;
export let modalPlayerLeaderIntroContentText1;
export let modalPlayerLeaderIntroContentText2;
export let modalPlayerLeaderIntroContentText3;
export let modalPlayerLeaderIntroContentText4;
export let hardResetWarningHeader;
export let hardResetWarningText;
export let modalCompoundsTabUnlockHeader;
export let modalCompoundsTabUnlockText;
export let modalSpaceMiningTabUnlockHeader;
export let modalSpaceMiningTabUnlockText;
export let modalEnergyTabUnlockHeader;
export let modalEnergyTabUnlockText;
export let modalInterstellarTabUnlockHeader;
export let modalInterstellarTabUnlockText;
export let modalKnowledgeSharingTabUnlockHeader;
export let modalKnowledgeSharingTabUnlockText;
export let modalScienceLabsTabUnlockHeader;
export let modalScienceLabsTabUnlockText;
export let modalQuantumComputingTabUnlockHeader;
export let modalQuantumComputingTabUnlockText;
export let modalRocketCompositesTabUnlockHeader;
export let modalRocketCompositesTabUnlockText;
export let modalNanoBrokersUnlockHeader;
export let modalNanoBrokersUnlockText;
export let modalCompoundMachiningTabUnlockHeader;
export let modalCompoundMachiningTabUnlockText;
export let modalMegaStructureTechDysonSphere1Header;
export let modalMegaStructureTechDysonSphere1Text;
export let modalMegaStructureTechDysonSphere2Header;
export let modalMegaStructureTechDysonSphere2Text;
export let modalMegaStructureTechDysonSphere3Header;
export let modalMegaStructureTechDysonSphere3Text;
export let modalMegaStructureTechDysonSphere4Header;
export let modalMegaStructureTechDysonSphere4Text;
export let modalMegaStructureTechDysonSphere5Header;
export let modalMegaStructureTechDysonSphere5Text;
export let modalMegaStructureTechCelestialProcessingCore1Header;
export let modalMegaStructureTechCelestialProcessingCore1Text;
export let modalMegaStructureTechCelestialProcessingCore2Header;
export let modalMegaStructureTechCelestialProcessingCore2Text;
export let modalMegaStructureTechCelestialProcessingCore3Header;
export let modalMegaStructureTechCelestialProcessingCore3Text;
export let modalMegaStructureTechCelestialProcessingCore4Header;
export let modalMegaStructureTechCelestialProcessingCore4Text;
export let modalMegaStructureTechCelestialProcessingCore5Header;
export let modalMegaStructureTechCelestialProcessingCore5Text;
export let modalMegaStructureTechPlasmaForge1Header;
export let modalMegaStructureTechPlasmaForge1Text;
export let modalMegaStructureTechPlasmaForge2Header;
export let modalMegaStructureTechPlasmaForge2Text;
export let modalMegaStructureTechPlasmaForge3Header;
export let modalMegaStructureTechPlasmaForge3Text;
export let modalMegaStructureTechPlasmaForge4Header;
export let modalMegaStructureTechPlasmaForge4Text;
export let modalMegaStructureTechPlasmaForge5Header;
export let modalMegaStructureTechPlasmaForge5Text;
export let modalMegaStructureTechGalacticMemoryArchive1Header;
export let modalMegaStructureTechGalacticMemoryArchive1Text;
export let modalMegaStructureTechGalacticMemoryArchive2Header;
export let modalMegaStructureTechGalacticMemoryArchive2Text;
export let modalMegaStructureTechGalacticMemoryArchive3Header;
export let modalMegaStructureTechGalacticMemoryArchive3Text;
export let modalMegaStructureTechGalacticMemoryArchive4Header;
export let modalMegaStructureTechGalacticMemoryArchive4Text;
export let modalMegaStructureTechGalacticMemoryArchive5Header;
export let modalMegaStructureTechGalacticMemoryArchive5Text;
export let modalBlackHoleDiscoveredHeader;
export let modalBlackHoleDiscoveredText;
export let miaplacidusEndgameStoryPopups;
export let onboardingModalHeader;
export let onboardingModalText;

export let modalEventPowerPlantExplosionHeader;
export let modalEventPowerPlantExplosionText;
export let modalEventBatteryExplosionHeader;
export let modalEventBatteryExplosionText;
export let modalEventScienceTheftHeader;
export let modalEventScienceTheftText;
export let modalEventResearchBreakthroughHeader;
export let modalEventResearchBreakthroughText;
export let modalEventRocketInstantArrivalHeader;
export let modalEventRocketInstantArrivalText;
export let modalEventAntimatterReactionHeader;
export let modalEventAntimatterReactionText;
export let modalEventStockLossHeader;
export let modalEventStockLossText;
export let modalEventStarshipLostInSpaceHeader;
export let modalEventStarshipLostInSpaceText;
export let modalEventEndlessSummerHeader;
export let modalEventEndlessSummerText;
export let modalEventEndlessSummerEndedHeader;
export let modalEventEndlessSummerEndedText;
export let modalEventGalacticMarketLockdownHeader;
export let modalEventGalacticMarketLockdownText;
export let modalEventGalacticMarketLockdownEndedHeader;
export let modalEventGalacticMarketLockdownEndedText;
export let modalEventMinerBrokeDownHeader;
export let modalEventMinerBrokeDownText;
export let modalEventMinerBrokeDownEndedHeader;
export let modalEventMinerBrokeDownEndedText;
export let modalEventSupplyChainDisruptionHeader;
export let modalEventSupplyChainDisruptionText;
export let modalEventSupplyChainDisruptionEndedHeader;
export let modalEventSupplyChainDisruptionEndedText;
export let modalEventBlackHoleInstabilityHeader;
export let modalEventBlackHoleInstabilityText;
export let modalEventBlackHoleInstabilityEndedHeader;
export let modalEventBlackHoleInstabilityEndedText;

export let randomEventTriggerDescriptions;

export function initialiseDescriptions() {
    gameIntroHeader = 'Welcome to the Cosmic Forge!';
    gameSaveNameCollect = `
        Welcome Pioneer! Please enter your code name!<br><br>
        <textarea 
            id="pioneerCodeName"  
            class="save-name save-name-height save-name-modal-width">${getSaveName()}</textarea><br><br>You can load a previous game by changing this name to a previous one.
    `;
    gameIntroText = 'You wake to dust. Your knowledge knows the path of stars.<br>Start with Hydrogen—spark fusion to forge heavier elements.<br>Build machines that compound creation into momentum.<br>Reach for the stars. Claim systems. Gather ascendency.<br><br>Good luck in your Forging!<br>';
    onboardingModalHeader = 'NEED A HAND?';
    onboardingModalText = `Looks like you're starting a new journey.<br>Would you like a short tutorial onboarding to help you get started?<br>You can continue normally either way.<br><br><span class="green-ready-text">This is the only opportunity to access the Onboarding.</span>`;
    launchStarShipWarningHeader = 'WARNING: POINT OF NO RETURN!';
    launchStarShipWarningText = 'Once your Starship is launched you may not retrieve it this run.<br>So please revise the Star Data section and ensure you really want to select this destination,<br>then please click OK to confirm, or CANCEL to check.';
    enterWarModeModalHeader = `CONQUEST!`;
    enterwarModeModalBackOutText = `You are disengaging diplomacy.<br><br>This means you can no longer engage in diplomacy,<br>and must undertake the conquest when ready to try and conquer the new System.`;
    enterwarModeModalNoBackOutText = `You are now going to start the conquest.<br>Without intelligence you need to prepare your fleet thoroughly, good luck!`;
    enterWarModeInsultedText = `Your attempts have backfired!<br><br>The enemy is insulted by your bad manners and has cut off<br>all diplomatic ties!`;  
    enterWarModeSurrenderText = `The enemy has surrendered!<br><br>They recognize your superior strength and have chosen to yield without a fight.<br>You now have full control over the System, and no battle is necessary.`;  
    enterWarModeNotVassalizedText = `Despite your attempts to vassalize and your good relation,<br>they just prefer being independent, so violence will be the only way to conquer the System!`;
    enterWarModeScaredText = `The enemy is terrified of your power!<br><br>Diplomacy is closed but their fleet strength is halved due to deserters!`;
    enterWarModeModalLaughAtProspect = `The enemy laughs at the prospect of your attempts to manipulate them!<br>Their impression of you has fallen!`;
    enterWarModeModalLaughAndEnterWar = `The enemy laughs at the prospect of your attempts to bully them!<br>They are now going to punish you!<br>War!`;
    enterWarModeModalImproveToReceptive = `The pitter patter was successful, the enemy is now receptive towards you<br>and their impression improved!`;
    enterWarModeModalNeutral = `After chatting the enemy remains neutral towards you.`;
    enterWarModeModalReserved = `The enemy still has a low impression of you and are reserved in their attitude.`;
    enterWarModeModalPatience = `The enemy negotiator is tired of chatter and has retired to consider their position.`;
    modalBattleHeaderText = `OUTCOME OF CONQUEST:`;
    modalBattleWonText = `You have won the battle!<br><br><span class="green-ready-text">Gained X AP!</span>`;
    modalBattleLostText = `You have lost the battle!<br><br>Your fleet has been destroyed, and must be rebuilt to try again to conquer the System!`;
    modalBattleNoSentientLifeHeader = `SETTLE NEW SYSTEM!`;
    modalBattleNoSentientLifeText = `There is no sentient life in this System, so you can settle right away!<br><br><span class="green-ready-text">Gained X AP!</span>`;
    modalRebirthHeader = `WARNING: REBIRTH!`;
    modalRebirthText = `You are about to reset your progress and start again at the new System.<br><br>Are you sure you want to do this?<br><br><span class="green-ready-text">You will carry over X AP!</span>`;
    modalGalacticTabUnlockHeader = `Star System reached!`;
    modalGalacticTabUnlockText = `As you approach the new System, your scanners detect a faint communication signal...<br><br>"You have shown great innovation, you may now access our Galactic Trading Platform"<br><br><span class="green-ready-text">Galactic Tab Unlocked!</span>`;
    modalOStarReachedHeader = `TYPE O STAR REACHED`;
    modalOStarReachedText = `Your Starship has reached orbit of the <span class="o-star-text">X</span> System.<br><br>The star burns with a ferocity you have only ever seen in theory.<br>An O-type sun: rare, impossibly bright, and violently alive.<br><br>The crew falls silent.<br>Even the instruments hesitate before agreeing on the readings.`;
    modalOTypeStarTechAcquiredHeader = 'O-TYPE STAR TECHNOLOGY ACQUIRED';
    modalOTypeStarTechAcquiredText = `The conquered enemies of <span class="o-star-text">{STAR}</span> had a special technology that we have obtained!<br><br>It has caused <span class="green-ready-text">{DISPLAY_NAME}</span> to become <span class="green-ready-text">{STRENGTH_BOOST}x</span> more powerful!`;
    modalFeedbackHeaderText = `SEND FEEDBACK`;
    modalFeedbackContentTextGood = `Glad to hear it!<br><br>Let us know what you love and if there’s anything you’d like to see more of.<br>Your feedback helps us improve Cosmic Forge!`;
    modalFeedbackContentTextBad = `Oh no!<br><br>Please let us know what’s not working for you or what you'd like changed.<br>We read everything and really value your thoughts!`;    
    modalFeedbackThanksHeaderText = `THANK YOU FOR YOUR FEEDBACK!`;
    modalFeedbackContentThanks = `Your feedback has been received.<br><br>It really helps shape the future of Cosmic Forge!<br>Feel free to check out our Discord<br>(There is an invite in the Contact section of the Settings Tab)`;
    modalPlayerLeaderPhilosophyHeaderText = `PONDERING THE HEAVENS`;
    modalPlayerLeaderPhilosophyContentText = `While gazing at the heavens in your Space Telescope, you ponder<br>what the future holds and who you really are.  You decided that<br>as per your forefathers, you have always been a...<br><br>THIS CHOICE AFFECTS YOUR PLAYTHROUGH SO CHOOSE CAREFULLY!</span>`;
    modalPlayerLeaderIntroHeaderText = `THE AWAKENING`;
    modalPlayerLeaderIntroContentText1 = `You are a Constructor.<br>Blueprints flow through your veins.<br><span class="green-ready-text">All building costs can be reduced after the first Rebirth, forever.</span><br>Build the future, one module at a time.`;
    modalPlayerLeaderIntroContentText2 = `You are a Supremacist.<br>Strength is your law, dominance your goal.<br><span class="green-ready-text">Fleet units are cheaper and stronger after the first Rebirth, forever.</span><br><span class="green-ready-text">Enemies are more afraid.</span><br>They will bend or be broken.`;
    modalPlayerLeaderIntroContentText3 = `You are Voidborn.<br>You were born among the stars, and the void whispers to you.<br><span class="green-ready-text">Star studies are faster and reveal more after the first Rebirth, forever.</span><br><span class="green-ready-text">Asteroids are better.</span><br><span class="green-ready-text">Diplomacy is more favorable.</span><br>The darkness is your ally.`;
    modalPlayerLeaderIntroContentText4 = `You are an Expansionist.<br>The horizon always calls.<br><span class="green-ready-text">Starships and Rockets much cheaper to build, after the first Rebirth, forever.</span><br><span class="green-ready-text">Rocket and Starships are faster.</span><br>Spread across the galaxy like wildfire.`;
    hardResetWarningHeader = `DANGER: HARD RESET!`;
    hardResetWarningText = `You are about to hard reset your game!<br><br>This will erase all progress and achievements!<br><br>Be very careful and only confirm if you are absolutely sure this<br>is what you want, otherwise CANCEL!`;
    modalCompoundsTabUnlockHeader = `COMPOUNDS UNLOCKED!`;
    modalCompoundsTabUnlockText = `Your Scientists have experimented with combining Hydrogen and Carbon Resources,<br>and have discovered Diesel!  With this knowledge, they are sure that<br>more of these Compounds will follow.<br><br><span class="green-ready-text">Compounds Tab Unlocked!</span>`;
    modalSpaceMiningTabUnlockHeader = `SPACE MINING UNLOCKED!`;
    modalSpaceMiningTabUnlockText = `You have successfully developed optics capable of scanning the Stars and Asteroids<br>Perhaps we can use these Asteroids for our benefit and mine them!<br>We will realise our dream of returning to the stars!<br><br><span class="green-ready-text">Space Mining Tab Unlocked!</span>`;
    modalEnergyTabUnlockHeader = `ENERGY UNLOCKED!`;
    modalEnergyTabUnlockText = `Your Engineers have harnessed the power of stored Resources<br>to generate Energy for advanced systems and automation.<br>This marks a pivotal step toward a sustainable future, and opens up possibilities unavailable until now.<br><br><span class="green-ready-text">Energy Tab Unlocked!</span>`;
    modalInterstellarTabUnlockHeader = `INTERSTELLAR UNLOCKED!`;
    modalInterstellarTabUnlockText = `Your Engineers have begun mapping the Stars!<br>With this capability, you will one day have a reference to explore and Colonise the Galaxy!<br><br><span class="green-ready-text">Interstellar Tab Unlocked!</span>`;
    modalKnowledgeSharingTabUnlockHeader = `TECH RESEARCH!`;
    modalKnowledgeSharingTabUnlockText = `People are getting together to share knowledge!<br>Scientific research will advance much faster with new Science Clubs where enthusiasts<br>can convene and develop their ideas!<br><br><span class="green-ready-text">Science Clubs Unlocked!</span>`;
    modalScienceLabsTabUnlockHeader = `SCIENCE LABS!`;
    modalScienceLabsTabUnlockText = `Scientists now have dedicated laboratories to carry out their experiments.<br>Research will rocket with this advancement!<br><br><span class="green-ready-text">Science Labs Unlocked!</span>`;
    modalQuantumComputingTabUnlockHeader = `QUANTUM COMPUTING UNLOCKED!`;
    modalQuantumComputingTabUnlockText = `Your Researchers have breached the boundaries of classical computation.<br>With Quantum Computing, reality itself bends to optimize processes.<br>This advancement will allow us to extract Resources much faster<br><br><span class="green-ready-text">Level 2 AutoBuyers Unlocked!</span>`;
    modalRocketCompositesTabUnlockHeader = `ROCKET COMPOSITES!`;
    modalRocketCompositesTabUnlockText = `Scientists have developed new materials that can be used in advanced Mining, both here and on Asteroids!<br>With this technology you can now build a Launch Pad and Rockets!<br>Not only that, but also you now have access to the most advanced extraction machinery on the ground too!<br><br><span class="green-ready-text">LaunchPad and Rockets Unlocked!</span><br><span class="green-ready-text">Level 3 and 4 AutoBuyers Unlocked!</span>`
    modalNanoBrokersUnlockHeader = 'NANO BROKERS!';
    modalNanoBrokersUnlockText = `With this extremely advanced tech, our scientists have developed robots that can go to market<br>automatically and sell our Resources and Compounds for the best possible price!<br><br><span class="green-ready-text">Automated Resource Selling Unlocked!</span>`
    modalCompoundMachiningTabUnlockHeader = `AUTOMATED COMPOUND CREATION!`;
    modalCompoundMachiningTabUnlockText = `Our scientists have done it again! Now we have advanced machinery capable of automatically<br>creating Compounds at will.  This is extremely powerful indeed!<br>If we cannot conquer the Galaxy now, it is your fault!<br><br><span class="green-ready-text">Automated Compound Creation Unlocked!</span>`
    modalMegaStructureTechDysonSphere1Header = `UNDERSTANDING THE DYSON SPHERE`;
    modalMegaStructureTechDysonSphere1Text = `You have studied and now understand what the MegaStructure before you is - it is a Dyson Sphere<br><br><span class="green-ready-text">All Batteries Double in Capacity!</span>`;
    modalMegaStructureTechDysonSphere2Header = `DYSON SPHERE CAPABILITIES`;
    modalMegaStructureTechDysonSphere2Text = `After studying how the Dyson Sphere works you are now<br>confident of its capabilities and you now want to plan how you are going to disconnect<br>it from its current role so you can somehow harness it.<br><br><span class="green-ready-text">All Energy producing Buildings 25% more powerful!</span>`;
    modalMegaStructureTechDysonSphere3Header = `DISCONNECTING THE DYSON SPHERE`;
    modalMegaStructureTechDysonSphere3Text = `You have managed to disconnect the Dyson Sphere from its current role,<br>which was providing power to the great force field around your home star Miaplacidus<br><br><span class="green-ready-text">Miaplacidus Milestone Achieved!<br>+0.15 Antimatter /s forever!</span>`;
    modalMegaStructureTechDysonSphere4Header = `HARNESSING THE DYSON SPHERE`;
    modalMegaStructureTechDysonSphere4Text = `You have harnessed the Dyson Sphere for the benefit of this System,<br>its huge power will benefit you as it provides the following bonus:<br><br><span class="green-ready-text">Power Always On for this System!</span>`;
    modalMegaStructureTechDysonSphere5Header = `CONNECTING THE DYSON SPHERE TO THE FABRIC`;
    modalMegaStructureTechDysonSphere5Text = `You have connected this Dyson Sphere into the fabric of the galaxy<br>meaning its benefits are now permanently available in whichever<br>system you might one day settle. This has enormous potential.<br><br><span class="green-ready-text">Power Always On!</span>`;
    modalMegaStructureTechCelestialProcessingCore1Header = `UNDERSTANDING THE CELESTIAL PROCESSING CORE`;
    modalMegaStructureTechCelestialProcessingCore1Text = `You have studied and now understand what the MegaStructure before you is - it is a Celestial Processing Core<br><br><span class="green-ready-text">Gain 50 Research per Second!</span>`;
    modalMegaStructureTechCelestialProcessingCore2Header = `CELESTIAL PROCESSING CORE CAPABILITIES`;
    modalMegaStructureTechCelestialProcessingCore2Text = `After studying how the Celestial Processing Core works you are now<br>confident of its capabilities and you now want to plan how you are going to disconnect<br>it from its current role so you can somehow harness it.<br><br><span class="green-ready-text">Gain 100 Research per Second!</span>`;
    modalMegaStructureTechCelestialProcessingCore3Header = `DISCONNECTING THE CELESTIAL PROCESSING CORE`;
    modalMegaStructureTechCelestialProcessingCore3Text = `You have managed to disconnect the Celestial Processing Core from its current role<br>which was providing processing power to the great force field around your home star Miaplacidus<br><br><span class="green-ready-text">Miaplacidus Milestone Achieved!<br>+0.15 Antimatter /s forever!</span>`;
    modalMegaStructureTechCelestialProcessingCore4Header = `HARNESSING THE CELESTIAL PROCESSING CORE`;
    modalMegaStructureTechCelestialProcessingCore4Text = `You have harnessed the Celestial Processing Core for the benefit of this System,<br>its huge power will benefit you as it provides the following bonus:<br><br><span class="green-ready-text">Gain 150 Research per Second!</span>`;
    modalMegaStructureTechCelestialProcessingCore5Header = `CONNECTING THE CELESTIAL PROCESSING CORE TO THE FABRIC`;
    modalMegaStructureTechCelestialProcessingCore5Text = `You have connected this Celestial Processing Core into the fabric of the galaxy<br>meaning its benefits are now permanently available in whichever<br>system you might one day settle. This has enormous potential.<br><br><span class="green-ready-text">Gain 200 Research Per Second!<br>Gain 500 Research Per Second in every new System!</span>`;
    modalMegaStructureTechPlasmaForge1Header = `UNDERSTANDING THE PLASMA FORGE`;
    modalMegaStructureTechPlasmaForge1Text = `You have studied and now understand what the MegaStructure before you is - it is a Plasma Forge<br><br><span class="green-ready-text">+25% Resource AutoBuyer Rates!</span>`;
    modalMegaStructureTechPlasmaForge2Header = `PLASMA FORGE CAPABILITIES`;
    modalMegaStructureTechPlasmaForge2Text = `After studying how the Plasma Forge works you are now<br>confident of its capabilities and you now want to plan how you are going to disconnect<br>it from its current role so you can somehow harness it.<br><br><span class="green-ready-text">+50% Resource AutoBuyer Rates!</span>`;
    modalMegaStructureTechPlasmaForge3Header = `DISCONNECTING THE PLASMA FORGE`;
    modalMegaStructureTechPlasmaForge3Text = `You have managed to disconnect the Plasma Forge from its current role<br>which was providing plasma to the great force field around your home star Miaplacidus<br><br><span class="green-ready-text">Miaplacidus Milestone Achieved!<br>+0.15 Antimatter /s forever!</span>`;
    modalMegaStructureTechPlasmaForge4Header = `HARNESSING THE PLASMA FORGE`;
    modalMegaStructureTechPlasmaForge4Text = `You have harnessed the Plasma Forge for the benefit of this System,<br>its huge power will benefit you as it provides the following bonus:<br><br><span class="green-ready-text">+75% Resource AutoBuyer Rates!</span>`;
    modalMegaStructureTechPlasmaForge5Header = `CONNECTING THE PLASMA FORGE TO THE FABRIC`;
    modalMegaStructureTechPlasmaForge5Text = `You have connected this Plasma Forge into the fabric of the galaxy<br>meaning its benefits are now permanently available in whichever<br>system you might one day settle. This has enormous potential.<br><br><span class="green-ready-text">Double Resource AutoBuyer Rates!<br>Resource AutoBuyer Rates are 500% higher in every new System!</span>`;
    modalMegaStructureTechGalacticMemoryArchive1Header = `UNDERSTANDING THE GALACTIC MEMORY ARCHIVE`;
    modalMegaStructureTechGalacticMemoryArchive1Text = `You have studied and now understand what the MegaStructure before you is - it is a Galactic Memory Archive<br><br><span class="green-ready-text">All Resource And Compound Storage Capacity + 100K!</span>`;
    modalMegaStructureTechGalacticMemoryArchive2Header = `GALACTIC MEMORY ARCHIVE CAPABILITIES`;
    modalMegaStructureTechGalacticMemoryArchive2Text = `After studying how the Galactic Memory Archive works you are now<br>confident of its capabilities and you now want to plan how you are going to disconnect<br>it from its current role so you can somehow harness it.<br><br><span class="green-ready-text">All Resource And Compound Storage Capacity + 1M!</span>`;
    modalMegaStructureTechGalacticMemoryArchive3Header = `DISCONNECTING THE GALACTIC MEMORY ARCHIVE`;
    modalMegaStructureTechGalacticMemoryArchive3Text = `You have managed to disconnect the Galactic Memory Archive from its current role<br>which was providing memory functions to the great force field around your home star Miaplacidus<br><br><span class="green-ready-text">Miaplacidus Milestone Achieved!<br>+0.15 Antimatter /s forever!</span>`;
    modalMegaStructureTechGalacticMemoryArchive4Header = `HARNESSING THE GALACTIC MEMORY ARCHIVE`;
    modalMegaStructureTechGalacticMemoryArchive4Text = `You have harnessed the Galactic Memory Archive for the benefit of this System,<br>its huge power will benefit you as it provides the following bonus:<br><br><span class="green-ready-text">All Resource And Compound Storage Capacity + 1B!</span>`;
    modalMegaStructureTechGalacticMemoryArchive5Header = `CONNECTING THE GALACTIC MEMORY ARCHIVE TO THE FABRIC`;
    modalMegaStructureTechGalacticMemoryArchive5Text = `You have connected this Galactic Memory Archive into the fabric of the galaxy<br>meaning its benefits are now permanently available in whichever<br>system you might one day settle. This has enormous potential.<br><br><span class="green-ready-text">All Resource And Compound Storage Capacity + 10B!<br>All Resource And Compound Storage Capacity starts at 10B in every new System!</span>`;
    modalBlackHoleDiscoveredHeader = 'Black Hole Discovered!';
    modalBlackHoleDiscoveredText = `While studying the stars with the Space Telescope, you stumbled upon a Black Hole!<br>Time Dilation is a feature of these objects, and maybe we can harness its power for our own uses!<br><br><span class="green-ready-text">Take a look in the Galactic tab to interact with it.</span>`;

    modalEventPowerPlantExplosionHeader = 'POWER PLANT EXPLOSION!';
    modalEventPowerPlantExplosionText = `A catastrophic failure rocked your energy grid.<br><br><span class="red-disabled-text">{destroyedBuilding} destroyed!</span>`;

    modalEventBatteryExplosionHeader = 'BATTERY EXPLOSION!';
    modalEventBatteryExplosionText = `A battery containment breach caused a violent explosion.<br><br><span class="red-disabled-text">{destroyedBuilding} destroyed!</span>`;

    modalEventScienceTheftHeader = 'SCIENCE THEFT!';
    modalEventScienceTheftText = `A clandestine raid struck your research labs.<br><br><span class="red-disabled-text">-{amountStolen} Research</span>`;

    modalEventResearchBreakthroughHeader = 'RESEARCH BREAKTHROUGH!';
    modalEventResearchBreakthroughText = `A sudden insight unlocks new understanding.<br><br><span class="green-ready-text">+{amountGained} Research</span>`;

    modalEventRocketInstantArrivalHeader = 'WARP ANOMALY!';
    modalEventRocketInstantArrivalText = `A space-time distortion accelerates one of your rockets.<br><br><span class="green-ready-text">{rocketName}</span> instantly arrives!`;

    modalEventAntimatterReactionHeader = 'ANTIMATTER REACTION!';
    modalEventAntimatterReactionText = `A catastrophic reaction annihilates a mining operation.<br><br><span class="red-disabled-text">{rocketName} lost</span><br><span class="red-disabled-text">{asteroidName} destroyed</span><br><span class="red-disabled-text">-{antimatterLost} Antimatter</span>`;

    modalEventStockLossHeader = 'STOCK LOSS!';
    modalEventStockLossText = `A major incident has struck your stores.<br><br><span class="red-disabled-text">-{lostPercent}% {itemName}</span><br>Lost due to {reason}.`;

    modalEventStarshipLostInSpaceHeader = 'STARSHIP LOST IN SPACE!';
    modalEventStarshipLostInSpaceText = `You lose communications with the Starship while en route.<br><br><span class="red-disabled-text">Starship lost</span><br><span class="red-disabled-text">Destination cleared</span><br><span class="red-disabled-text">All fleet units lost</span>`;

    modalEventEndlessSummerHeader = 'ENDLESS SUMMER!';
    modalEventEndlessSummerText = `The skies are clearing and sunny weather is on the way.<br><br><span class="green-ready-text">Sunny weather for {minutes} minutes.</span>`;

    modalEventEndlessSummerEndedHeader = 'ENDLESS SUMMER ENDED!';
    modalEventEndlessSummerEndedText = `The climate returns to normal variability.<br><br><span class="green-ready-text">Weather patterns restored.</span>`;

    modalEventGalacticMarketLockdownHeader = 'GALACTIC MARKET OFFLINE!';
    modalEventGalacticMarketLockdownText = `A network disruption has shut down access to the Galactic Market.<br><br><span class="red-disabled-text">Trading is unavailable for 30 minutes.</span>`;

    modalEventGalacticMarketLockdownEndedHeader = 'GALACTIC MARKET RESTORED!';
    modalEventGalacticMarketLockdownEndedText = `The disruption has cleared.<br><br><span class="green-ready-text">Galactic Market access has been restored.</span>`;

    modalEventMinerBrokeDownHeader = 'MINER BROKE DOWN!';
    modalEventMinerBrokeDownText = `A critical failure has halted one of your mining rockets.<br><br><span class="red-disabled-text">{rocketName} mining rate is 0 for 15 minutes.</span>`;

    modalEventMinerBrokeDownEndedHeader = 'MINER REPAIRED!';
    modalEventMinerBrokeDownEndedText = `Field repairs complete.<br><br><span class="green-ready-text">{rocketName} has been repaired and is ready to resume mining.</span>`;

    modalEventSupplyChainDisruptionHeader = 'SUPPLY CHAIN DISRUPTION!';
    modalEventSupplyChainDisruptionText = `A major logistics disruption has hit your operations.<br><br><span class="warning-orange-text">{itemName} production reduced by -{percentDown}% for 15 minutes.</span>`;

    modalEventSupplyChainDisruptionEndedHeader = 'SUPPLY CHAINS RESTORED!';
    modalEventSupplyChainDisruptionEndedText = `Shipments are flowing again.<br><br><span class="green-ready-text">{itemName} production has returned to normal.</span>`;

    modalEventBlackHoleInstabilityHeader = 'BLACK HOLE INSTABILITY!';
    modalEventBlackHoleInstabilityText = `A violent fluctuation ripples through the singularity.<br><br><span class="warning-orange-text">Strength and duration will shift every minute for {minutes} minutes.</span>`;

    modalEventBlackHoleInstabilityEndedHeader = 'BLACK HOLE STABILISED!';
    modalEventBlackHoleInstabilityEndedText = `The singularity calms and returns to equilibrium.<br><br><span class="green-ready-text">Black Hole strength and duration restored to standard.</span>`;

    randomEventTriggerDescriptions = {
        powerPlantExplosion: 'Destroy 1 random owned power plant',
        batteryExplosion: 'Destroy 1 highest-tier owned battery',
        scienceTheft: 'Lose half your research points (rounded up stolen)',
        researchBreakthrough: 'Double your research points',
        rocketInstantArrival: 'A travelling rocket instantly arrives',
        antimatterReaction: 'A mining rocket and its asteroid are destroyed',
        stockLoss: 'Lose 40-80% of an unlocked resource or compound stock',
        starshipLostInSpace: 'Starship lost in space (reset starship and fleets)',
        endlessSummer: 'Sunny weather only for 40-50 minutes',
        galacticMarketLockdown: 'Disable the Galactic Market for 30 minutes',
        minerBrokeDown: 'One mining rocket produces 0 antimatter for 15 minutes',
        supplyChainDisruption: 'One resource or compound produces only 25% for 15 minutes',
        blackHoleInstability: 'Black Hole fluctuates in strength (and duration) for 15-25 minutes'
    };

    miaplacidusEndgameStoryPopups = [
        {
            header: 'MIAPLACIDUS',
            content: 'The void falls silent as your fleets break the last wardens.<br>' +
                'The great force field is gone, and the sky finally opens.<br>' +
                'You step onto soil you once knew only in memory.<br>' +
                'Spicite banners rise beside Miaplacidean symbols, unbroken.<br>' +
                'For the first time since exile... you are home.',
            confirmLabel: 'CONTINUE'
        },
        {
            header: 'THE PORTAL',
            content: 'Deep in the ruins, you find the scar in space - the old breach.<br>' +
                'This is where the first explorer vanished into the disturbance.<br>' +
                'This is where the machine race traced your people back.<br>' +
                'Now the portal flickers, starved of power and authority.<br>' +
                'You mark it not as a doorway, but as a warning.',
            confirmLabel: 'CONTINUE'
        },
        {
            header: 'THE FORGE',
            content: 'Spica\'s colony stands at your side, stronger than any prophecy.<br>' +
                'The galaxy remembers: Megastructures fall, systems unite, fear fades.<br>' +
                'Your name is no longer a refugee\'s whisper - Mia\'Plac is legend.<br>' +
                'You did not only survive... you built a future from hydrogen and hope.<br>' +
                'The Cosmic Forge burns brighter than ever.',
            confirmLabel: 'CONTINUE'
        },
        {
            header: 'RECLAMATION',
            content: 'Miaplacidus is reclaimed. The Wardens are defeated.<br>' +
                'Your people\'s story is no longer one of loss, but of return.<br>' +
                'This was the promise at the beginning of your long drift.<br>' +
                'And now... you have fulfilled it.<br>' +
                '<span class="green-ready-text">The game is complete.</span>',
            confirmLabel: 'END GAME'
        },
        {
            header: 'ONE LAST THING... ',
            content: 'You can keep playing if you wish.<br>' +
                'Keep conquering and settling until every system is yours.<br>' +
                'Build, optimize, and prove your supremacy across the stars.<br>' +
                'But in truth, your greatest victory is already written.<br>' +
                'Welcome home, Cosmic Forger.',
            confirmLabel: 'GLUTTON FOR PUNISHMENT'
        }
    ];

    headerDescriptions = {
        'Resources': 'Here you can gain and sell resources. You can also upgrade your storage capacity and automate resource harvesting.  When you discover fusion, you will also handle that here.',
        'Compounds': 'Here you can create and sell compounds from constituent parts or with advanced machinery.',
        'Interstellar': 'Here you can explore the galaxy and discover new stars and planets.',
        'Research': 'In the Research section, you can unlock new technologies to progress through the game, and also get upgrades to farm research points.',
        'Energy': 'Here you can buy upgrades for generating power which is needed for more advanced buildings.',
        'Space Mining': 'Here you can build vessels to mine asteroids for valuable Antimatter, enabling you to visit locations in the Star Map, and really start to conquer the galaxy!',
        'Galactic': 'Here you can exchange your AP for permanent buffs, and reset runs.',
        'Settings': 'Change the game settings to your liking.',
        'events': 'Here you can see any ongoing or historical events and the effects they have.',
        'exit game': 'Here you can Exit The Game',
        
        'hydrogen': 'The most basic element known to man, very cheap to produce and has a pretty low value, but anything can be created from it.',
        'helium': 'Lighter than air this one will make you float away!',
        'carbon': 'This is the first stable solid element, made from fused Helium.',
        'neon': 'The first noble gas! Very "bright" of you to discover it!',
        'oxygen': 'A vital element for most, Oxygen is highly reactive and essential for combustion and respiration.',
        'sodium': 'A soft, silvery metal.',
        'silicon': 'The backbone of modern technology, it is a crucial component in electronics and solar panels.',
        'iron': 'A strong and versatile metal, Iron is the foundation of construction and industry.',

        'energy storage': "Any buildings beyond the first level require power to operate, you can store that energy here.",
        'power plant': "These buildings provide the energy resource, and it is used by advanced buildings, without which they won't operate.",
        'advanced power plant': "These buildings provide higher amounts of energy for powering a lot of machinery.",
        'solar power plant': "Solar power plants provide renewable energy without using any resources.",
        'research': "Here you can buy upgrades to generate research points for unlocking new technology.",
        'technology': "Here you can unlock new technologies to improve your game, provided you have enough research points!",
        'tech tree': 'Here you can see a visual representation of technologies and what they provide.  You can zoom with the mouse wheel.',
        'philosophy': 'Here you can unlock special abilities for your philosophy, and research repeatable techs that improve your game.',
    
        'diesel': 'The first compound created by your hands, it is a useful early fuel.',
        'glass': 'This is reinforced specialist glass and is great for solar applications.',
        'steel': 'This is reinforced steel, highly durable and used in construction and manufacturing.',
        'water': 'Water is an essential resource which can be produced, or collected from rain in your reservoir.',
        'concrete': 'Concrete is a fundamental building material used in construction, offering strength and versatility.',
        'titanium': 'Titanium is a strong, lightweight, and corrosion-resistant metal, needed for advanced construction.',

        'star map': "This is a map of the known galaxy.",
        'star data': "Here you can find information about studied stars.",
        'star ship': "Here you can build and manage your Star Ship to travel to and scan studied Stars.",
        'fleet hangar': `Build your fleets to conquer visited Systems - Fleet Strength: <span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span>`,
        'colonise': `Engage in Diplomacy and War to establish your new colony at <span class="green-ready-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> - Fleet Power: <span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span>`,

        'mining': "This shows Antimatter being produced, where, and by which Rocket Miner.",
        'space telescope': "Here you can build a telescope to search for asteroids to mine Antimatter.",
        'asteroids': "Here you can see discovered Asteroids and analyse them.",
        'launch pad': "Build vessels to mine asteroids for valuable Antimatter.",

        'rebirth': getCurrentRunIsMegaStructureRun()
            ? `Here you can reset the run at your new system, once settled!<br><br><span class="warning-orange-text">MEGASTRUCTURE STARS:  It's Mandatory to Disconnect the MegaStructure before Rebirth!</span>`
            : `Here you can reset the run at your new system, once settled!`,

        'galactic market': "Here you can make various trades in the Galactic Market.",
        'galactic casino': "Here you can gamble your hard earned products for instant gratification - ",
        'ascendency perks': "Here you can spend AP for permanent buffs to speed up your runs!",
        'megastructures': "This shows your progress in harnessing the power of MegaStructures, and the slow dismantling of the Miaplacidus Force Field!",
        'black hole': "This shows the Black Hole time warp feature, once unlocked.",

        'contact': "Contact Channels for Feedback and Suggestions",
        'get started': "Learn how to get started in Cosmic Forge.",
        'story': "Learn about your origins and how you find yourself here.",
        'concepts - early': "Early game concepts.",
        'concepts - mid': "Mid game concepts.",
        'concepts - late': "Late game concepts pre rebirth.",
        'concepts - end goal': "End game concepts and what to work toward.",
        'philosophies': "Philosophies and their effects.",
        'visual': "Change the visual settings of the game.",
        'game options': "Change the game options to your liking.",
        'saving / loading': "Save and Load your progress in the game.",
        'statistics': `Here you can see your progress in the game.`,
        'achievements': `Here you can see your earned achievements, and their effects.`
    };

    rocketNames = {
        version: 0.90,
        rocketDescription: "Build the launch pad to launch built rockets and mine asteroids for Antimatter.",
        [getRocketUserName('rocket1').toLowerCase()]: "Build the launch pad to launch built rockets and mine asteroids for Antimatter.",
        [getRocketUserName('rocket2').toLowerCase()]: "Build the launch pad to launch built rockets and mine asteroids for Antimatter.",
        [getRocketUserName('rocket3').toLowerCase()]: "Build the launch pad to launch built rockets and mine asteroids for Antimatter.",
        [getRocketUserName('rocket4').toLowerCase()]: "Build the launch pad to launch built rockets and mine asteroids for Antimatter.",
    }

    techNotificationMessages = {
        knowledgeSharing: 'Knowledge Sharing Researched\n\nYou can now open Science Clubs!',
        fusionTheory: 'Fusion Theory Researched\n\nUseful for future experiments!',
        hydrogenFusion: 'Hydrogen Fusion Researched\n\nYou can now fuse Hydrogen!',
        heliumFusion: 'Helium Fusion Researched\n\nYou can now fuse Helium!',
        carbonFusion: 'Carbon Fusion Researched\n\nYou can now fuse Carbon!',
        neonFusion: 'Neon Fusion Researched\n\nYou can now fuse Neon!',
        oxygenFusion: 'Oxygen Fusion Researched\n\nYou can now fuse Oxygen!',
        siliconFusion: 'Silicon Fusion Researched\n\nYou can now fuse Silicon!',
        nobleGasCollection: 'Noble Gas Collection Researched\n\nYou can now store Noble Gases when fused!',
        glassManufacture: 'Glass Manufacture Researched\n\nYou can now produce Glass compounds!',
        aggregateMixing: 'Aggregate Mixing Researched\n\nYou can now produce Concrete compounds!',
        neutronCapture: 'Neutron Capture Researched\n\nThis will now allow us to fuse Titanium, a versatile and durable material essential for advanced construction and technology!',
        quantumComputing: 'Quantum Computing Researched\n\nMore advanced Machinery is now available!',
        scienceLaboratories: 'Science Laboratories Researched\n\nYou can now build Science Labs!',
        hydroCarbons: 'HydroCarbons Researched\n\nYou can gain access to Diesel Fuel once you have Compounds unlocked!',
        nanoTubeTechnology: 'Nano Tube Technology Researched\n\nWith this we can start to learn about how to fuse Carbon in the future!',
        nanoBrokers: 'Nano Brokers Researched\n\nYou can toggle resources to be automatically sold for cash instead of accumulating!',
        stellarCartography: 'Stellar Cartography Researched\n\nYou unlocked Interstellar tab!',
        fusionEfficiencyI: 'Fusion Efficiency I Researched\n\n20% Boost to Fusion returns!',
        fusionEfficiencyII: 'Fusion Efficiency II Researched\n\nFurther 20% Boost to Fusion returns!',
        fusionEfficiencyIII: 'Fusion Efficiency III Researched\n\n100% Fusion returns!',
        atmosphericTelescopes: 'Atmospheric Telescopes Researched\n\nYou can now get data from the local stellar neighborhood!',
        giganticTurbines: 'Gigantic Turbines Researched\n\nThis opens up new research in power generation!',
        steelFoundries: 'Steel Foundries Researched\n\nYou can now create Steel compounds!',
        rocketComposites: 'Rocket Composites Researched\n\nYou can now build Rocket Parts and Level 3 and 4 AutoBuyers!',
        advancedFuels: 'Advanced Fuels Researched\n\nYou can now fuel Rockets!',
        planetaryNavigation: 'Planetary Navigation Researched\n\nYou can now travel to Asteroids!',
        advancedPowerGeneration: 'Advanced Power Generation \n\nBuild Advanced Power Plants!',
        basicPowerGeneration: 'Basic Power Generation Researched\n\nYou can now build basic Power Stations!',
        solarPowerGeneration: 'Solar Power Generation Researched\n\nYou can now build Solar Panels to generate power!',
        compounds: 'Compounds Researched\n\nUnlocks the Compounds tab!',
        sodiumIonPowerStorage: 'Sodium Ion Power Storage Researched\n\nYou can build batteries to store energy!',
        orbitalConstruction: 'Orbital Construction Researched\n\nYou can now build Starship Modules!',
        antimatterEngines: 'Antimatter Engines Researched\n\nYou can now build Antimatter Engines allowing Interstellar Travel!',
        FTLTravelTheory: 'FTL Travel Theory Researched\n\nYou can now research how to travel faster than light!',
        lifeSupportSystems: 'Life Support Systems Researched\n\nYou can now sustain life in deep space!',
        starshipFleets: 'Starship Fleets Researched\n\nYou can now construct Starship Offensive capabilities!',
        stellarScanners: 'Stellar Scanners Researched\n\nWhen you arrive at a new Star System you can see details of alien life and if it poses a threat!',
        dysonSphereUnderstanding: 'Dyson Sphere Understanding Researched\n\nYou now understand what a Dyson Sphere is.',
        dysonSphereCapabilities: 'Dyson Sphere Capabilities Researched\n\nYou now understand what a Dyson Sphere can do.',
        dysonSphereDisconnect: 'Dyson Sphere Disconnect Researched\n\nYou have disconnected the Dyson Sphere from the Miaplacidus System Force Field.',
        dysonSpherePower: 'Dyson Sphere Power Researched\n\nYou can now harness the Dyson Sphere\'s power for use within the system.',
        dysonSphereConnect: 'Dyson Sphere Connect Researched\n\nYou can now connect the Dyson Sphere\'s power across the galaxy.',
        celestialProcessingCoreUnderstanding: 'Celestial Processing Core Understanding Researched\n\nYou now understand what the Celestial Processing Core is.',
        celestialProcessingCoreCapabilities: 'Celestial Processing Core Capabilities Researched\n\nYou now understand what the Celestial Processing Core can do.',
        celestialProcessingCoreDisconnect: 'Celestial Processing Core Disconnect Researched\n\nYou have disconnected the Celestial Processing Core from the Miaplacidus System Force Field.',
        celestialProcessingCorePower: 'Celestial Processing Core Power Researched\n\nYou can now harness the Celestial Processing Core\'s power for use within the system.',
        celestialProcessingCoreConnect: 'Celestial Processing Core Connect Researched\n\nYou can now connect the Celestial Processing Core\'s power across the galaxy.',
        plasmaForgeUnderstanding: 'Plasma Forge Understanding Researched\n\nYou now understand what the Plasma Forge is.',
        plasmaForgeCapabilities: 'Plasma Forge Capabilities Researched\n\nYou now understand what the Plasma Forge can do.',
        plasmaForgeDisconnect: 'Plasma Forge Disconnect Researched\n\nYou have disconnected the Plasma Forge from the Miaplacidus System Force Field.',
        plasmaForgePower: 'Plasma Forge Power Researched\n\nYou can now harness the Plasma Forge\'s power for use within the system.',
        plasmaForgeConnect: 'Plasma Forge Connect Researched\n\nYou can now connect the Plasma Forge\'s power across the galaxy.',
        galacticMemoryArchiveUnderstanding: 'Galactic Memory Archive Understanding Researched\n\nYou now understand what the Galactic Memory Archive is.',
        galacticMemoryArchiveCapabilities: 'Galactic Memory Archive Capabilities Researched\n\nYou now understand what the Galactic Memory Archive can do.',
        galacticMemoryArchiveDisconnect: 'Galactic Memory Archive Disconnect Researched\n\nYou have disconnected the Galactic Memory Archive from the Miaplacidus System Force Field.',
        galacticMemoryArchivePower: 'Galactic Memory Archive Power Researched\n\nYou can now harness the Galactic Memory Archive\'s power for use within the system.',
        galacticMemoryArchiveConnect: 'Galactic Memory Archive Connect Researched\n\nYou can now connect the Galactic Memory Archive\'s power across the galaxy.'
    };

    galacticMarketTooltipDescriptions = {
        outgoingTitle: 'Outgoing Bias',
        outgoingText: 'Positive: this resource will be priced lower in the future (you\'ll get less when selling). Negative: this resource will be priced higher in the future (you\'ll get more when selling).',
        incomingTitle: 'Incoming Bias',
        incomingText: 'Positive: this resource costs less than baseline to buy right now. Negative: this resource costs more than baseline to buy right now.',
        comparisonTitle: 'Market Outlook',
        comparisonHigherOutgoing: 'Outgoing bias higher → future selling prices for your exports are trending down.',
        comparisonHigherIncoming: 'Incoming bias higher → good time to buy imports as prices are favorable.',
        comparisonBalanced: 'Market is stable with no strong price trends in either direction.'
    };

    optionDescriptions = {
        hydrogenSellRow: {
            content1: "Here you can sell Hydrogen for cash",
            content2: "Here you can sell Hydrogen for cash or fuse it into Helium",
            updateAt: "hydrogenFusion"
        },
        hydrogenGainRow: {
            content1: "Manually gain one unit of Hydrogen.",
            content2: "",
            updateAt: ""
        },
        hydrogenIncreaseStorageRow: {
            content1: "Upgrade your Hydrogen storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        heliumSellRow: {
            content1: "Here you can sell Helium for cash",
            content2: "Here you can sell Helium for cash or fuse it into Carbon",
            updateAt: "heliumFusion"
        },
        heliumGainRow: {
            content1: "Manually scrape one unit of Helium.",
            content2: "",
            updateAt: ""
        },
        heliumIncreaseStorageRow: {
            content1: "Increase your Helium storage capacity to store more Helium.",
            content2: "",
            updateAt: ""
        },
        carbonSellRow: {
            content1: "Here you can sell Carbon for cash",
            content2: "Here you can sell Carbon for cash or fuse it into Neon",
            updateAt: "carbonFusion"
        },
        carbonGainRow: {
            content1: "Extract Carbon manually from the environment.",
            content2: "",
            updateAt: ""
        },
        carbonIncreaseStorageRow: {
            content1: "Expand your Carbon storage.",
            content2: "",
            updateAt: ""
        },
        neonSellRow: {
            content1: "Here you can sell Neon for cash",
            content2: "Here you can sell Neon for cash or fuse it into Oxygen",
            updateAt: "neonFusion"
        },
        neonGainRow: {
            content1: "Manually gain one unit of Neon.",
            content2: "",
            updateAt: ""
        },
        neonIncreaseStorageRow: {
            content1: "Upgrade your Neon storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        oxygenSellRow: {
            content1: "Here you can sell Oxygen for cash.",
            content2: "Here you can sell Oxygen for cash or fuse it into Silicon.",
            updateAt: "oxygenFusion"
        },
        oxygenGainRow: {
            content1: "Manually gain one unit of Oxygen.",
            content2: "",
            updateAt: ""
        },
        oxygenIncreaseStorageRow: {
            content1: "Upgrade your Oxygen storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        sodiumSellRow: {
            content1: "Here you can sell Sodium for cash.",
            content2: "",
            updateAt: ""
        },
        sodiumGainRow: {
            content1: "Manually gain one unit of Sodium.",
            content2: "",
            updateAt: ""
        },
        sodiumIncreaseStorageRow: {
            content1: "Upgrade your Sodium storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        siliconSellRow: {
            content1: "Here you can sell Silicon for cash.",
            content2: "Here you can sell Silicon for cash or fuse it into Iron.",
            updateAt: "siliconFusion"
        },
        siliconGainRow: {
            content1: "Manually gain one unit of Silicon.",
            content2: "",
            updateAt: ""
        },
        siliconIncreaseStorageRow: {
            content1: "Upgrade your Silicon storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        ironSellRow: {
            content1: "Here you can sell Iron for cash.",
            content2: "",
            updateAt: ""
        },
        ironGainRow: {
            content1: "Manually gain one unit of Iron.",
            content2: "",
            updateAt: ""
        },
        ironIncreaseStorageRow: {
            content1: "Upgrade your Iron storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        dieselCreateRow: {
            content1: "Here you can create Diesel from its constituent parts, provided you have them, and the power is ON.",
            content2: "",
            updateAt: ""
        },
        dieselSellRow: {
            content1: "Here you can sell Diesel for cash.",
            content2: "",
            updateAt: ""
        },
        dieselIncreaseStorageRow: {
            content1: "Upgrade your Diesel storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        glassCreateRow: {
            content1: "Here you can create Glass from its constituent parts, provided you have them, and the power is ON.",
            content2: "",
            updateAt: ""
        },
        glassSellRow: {
            content1: "Here you can sell Glass for cash.",
            content2: "",
            updateAt: ""
        },
        glassIncreaseStorageRow: {
            content1: "Upgrade your Glass storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        steelCreateRow: {
            content1: "Here you can create Steel from its constituent parts, provided you have them, and the power is ON.",
            content2: "",
            updateAt: ""
        },
        steelSellRow: {
            content1: "Here you can sell Steel for cash.",
            content2: "",
            updateAt: ""
        },
        steelIncreaseStorageRow: {
            content1: "Upgrade your Steel storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        waterCreateRow: {
            content1: "Here you can manage the production of Water, provided you have the materials, and the power is ON.",
            content2: "",
            updateAt: ""
        },
        waterSellRow: {
            content1: "Here you can sell Water for cash.",
            content2: "",
            updateAt: ""
        },
        waterIncreaseStorageRow: {
            content1: "Upgrade your Water reservoir capacity to store more water.",
            content2: "",
            updateAt: ""
        },
        concreteCreateRow: {
            content1: "Here you can create Concrete, provided you have the materials, and the power is ON.",
            content2: "",
            updateAt: ""
        },
        concreteSellRow: {
            content1: "Here you can sell Concrete for cash.",
            content2: "",
            updateAt: ""
        },
        concreteIncreaseStorageRow: {
            content1: "Upgrade your Concrete storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        titaniumCreateRow: {
            content1: "Here you can create Titanium, provided you have the materials, and the power is ON.",
            content2: "",
            updateAt: ""
        },
        titaniumSellRow: {
            content1: "Here you can sell Titanium for cash.",
            content2: "",
            updateAt: ""
        },
        titaniumIncreaseStorageRow: {
            content1: "Upgrade your Titanium storage capacity to hold more resources.",
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer1Row: {
            content1: `Add a Hydrogen Compressor to automate Hydrogen generation.`,
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer2Row: {
            content1: `Add an Advanced Hydrogen Compressor for enhanced automation - Power: ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer3Row: {
            content1: `Install a Hydrogen Refinery to maximize efficiency in Hydrogen generation - Power: ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer4Row: {
            content1: `Add a Quantum Hydrogen Synthesizer for cutting-edge Hydrogen production - Power: ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer1Row: {
            content1: `Helium seems lighter than air - add an Atmosphere Scraper to automate Helium collection.`,
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer2Row: {
            content1: `Add an Advanced Helium Scraper for enhanced Helium collection - Power: ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer3Row: {
            content1: `Install a Helium Refinery to improve automation of Helium generation - Power: ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer4Row: {
            content1: `Add a Quantum Helium Synthesizer for cutting-edge Helium production - Power: ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer1Row: {
            content1: `Buy a miner to automate the collection of Carbon.`,
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer2Row: {
            content1: `Install an Advanced Carbon Miner for improved Carbon extraction - Power: ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer3Row: {
            content1: `Add a Carbon Refinery to maximize automated Carbon collection - Power: ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer4Row: {
            content1: `Add a Quantum Carbon Synthesizer for cutting-edge Carbon generation - Power: ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer1Row: {
            content1: `Add an Neon Extractor to automate Neon generation.`,
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer2Row: {
            content1: `Add an Advanced Neon Extractor to improve automation of Neon collection - Power: ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer3Row: {
            content1: `Install a Neon Refinery to enhance Neon collection - Power: ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer4Row: {
            content1: `Add a Quantum Neon Synthesizer for cutting-edge Neon production - Power: ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer1Row: {
            content1: `Add an Oxygen Extractor to automate Oxygen generation.`,
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer2Row: {
            content1: `Install an Advanced Oxygen Extractor for improved Oxygen generation - Power: ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer3Row: {
            content1: `Add an Oxygen Refinery to maximize automation of Oxygen production - Power: ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer4Row: {
            content1: `Add a Quantum Oxygen Synthesizer for advanced Oxygen generation - Power: ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer1Row: {
            content1: `Add a Sodium Extractor to automate Sodium generation.`,
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer2Row: {
            content1: `Add an Advanced Sodium Extractor for better Sodium automation - Power: ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer3Row: {
            content1: `Install a Sodium Refinery to boost Sodium production - Power: ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer4Row: {
            content1: `Add a Quantum Sodium Synthesizer for advanced Sodium generation - Power: ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer1Row: {
            content1: `Add a Silicon Extractor to automate Silicon generation.`,
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer2Row: {
            content1: `Add an Advanced Silicon Extractor for improved Silicon collection - Power: ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer3Row: {
            content1: `Install a Silicon Refinery to maximize Silicon automation - Power: ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer4Row: {
            content1: `Add a Quantum Silicon Synthesizer for cutting-edge Silicon production - Power: ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer1Row: {
            content1: `Add an Iron Extractor to automate Iron generation.`,
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer2Row: {
            content1: `Add an Advanced Iron Extractor for enhanced Iron collection - Power: ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer3Row: {
            content1: `Install an Iron Refinery to maximize Iron production automation - Power: ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer4Row: {
            content1: `Add a Quantum Iron Synthesizer for advanced Iron generation - Power: ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer1Row: {
            content1: `Add an Extractor to collect oil and make Diesel.`,
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer2Row: {
            content1: `Add an Advanced Diesel Refinery for enhanced Diesel production - Power: ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer3Row: {
            content1: `Install a Diesel Synthesizer for improved Diesel automation - Power: ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer4Row: {
            content1: `Add a Quantum Diesel Synthesizer for cutting-edge Diesel generation - Power: ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer1Row: {
            content1: `Add a Workshop Glass Fabricator to create glass.`,
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer2Row: {
            content1: `Install an Advanced Glass Fabricator for better Glass production - Power: ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer3Row: {
            content1: `Add a Glass Refinery to enhance Glass automation - Power: ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer4Row: {
            content1: `Add a Quantum Glass Synthesizer for cutting-edge Glass production - Power: ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer1Row: {
            content1: `Add a Back Yard Steel Foundry to create steel.`,
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer2Row: {
            content1: `Add an Advanced Steel Foundry for enhanced Steel production - Power: ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer3Row: {
            content1: `Install a Steel Refinery to improve Steel automation - Power: ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer4Row: {
            content1: `Add a Quantum Steel Synthesizer for advanced Steel generation - Power: ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer1Row: {
            content1: `Add a Water Mixer to facilitate water processing.`,
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer2Row: {
            content1: `Add an Advanced Water Mixer for better Water production - Power: ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer3Row: {
            content1: `Install a Water Refinery to maximize Water automation - Power: ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer4Row: {
            content1: `Add a Quantum Water Synthesizer for advanced Water generation - Power: ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer1Row: {
            content1: `Add a Concrete Mixer to automate Concrete production.`,
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer2Row: {
            content1: `Install an Advanced Concrete Mixer for enhanced Concrete production - Power: ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer3Row: {
            content1: `Add a Concrete Refinery to maximize Concrete automation - Power: ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer4Row: {
            content1: `Add a Quantum Concrete Synthesizer for cutting-edge Concrete production - Power: ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer1Row: {
            content1: `Add a Titanium Mixer to automate Titanium production.`,
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer2Row: {
            content1: `Install an Advanced Titanium Mixer for enhanced Titanium production - Power: ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer3Row: {
            content1: `Add a Titanium Refinery to maximize Titanium automation - Power: ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer4Row: {
            content1: `Add a Quantum Titanium Synthesizer for cutting-edge Titanium production - Power: ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        }, 
        researchAutoBuyerRow: {
            content1: "Toggle the Research AutoBuyer ON and OFF. (Will research the first available tech with all requisites fulfilled)",
            content2: "",
            updateAt: ""
        },            
        researchScienceKitRow: {
            content1: "Purchase a Science Kit to start generating Research points.",
            content2: "",
            updateAt: ""
        },
        researchScienceClubRow: {
            content1: "Open a Science Club to produce Research points more effectively.",
            content2: "",
            updateAt: ""
        },
        researchScienceLabRow: {
            content1: `Build a Science Lab to do large amounts of Research - Power: ${Math.floor(getResourceDataObject('research', ['upgrades', 'scienceLab', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        techKnowledgeSharingRow: {
            content1: "Unlock Knowledge Sharing to advance research capabilities.",
            content2: "Unlock Knowledge Sharing to improve research capacity and make new technologies accessible.<br><br><span class='green-ready-text'>Build Science Club</span>",
            updateAt: ""
        },
        techFusionTheoryRow: {
            content1: "Unlock Fusion Theory to pave the way for advanced fusion technologies.",
            content2: "Unlock Fusion Theory to unlock the potential of advanced fusion technologies for greater energy production.<br><br><span class='green-ready-text'>Prerequisite for Fusion technologies</span>",
            updateAt: ""
        },
        techHydrogenFusionRow: {
            content1: "Unlock Hydrogen Fusion to experiment with fusing Hydrogen atoms.",
            content2: "Unlock Hydrogen Fusion to explore the potential of fusing Hydrogen atoms for sustainable energy.<br><br><span class='green-ready-text'>Unlock Helium resource</span>",
            updateAt: ""
        },
        techStellarCartographyRow: {
            content1: "Unlock Stellar Cartography to map the stars.",
            content2: "Unlock Stellar Cartography to map distant stars and unlock new astronomical research capabilities.<br><br><span class='green-ready-text'>Unlock Star Map</span>",
            updateAt: ""
        },
        techNanoBrokersRow: {
            content1: "Unlock Nano Brokers to automatically sell Resources and Compounds!",
            content2: "Unlock Nano Brokers to automatically sell Resources and Compounds!<br><br><span class='green-ready-text'>Unlock Auto Sellers on all Resources and Compounds</span>",
            updateAt: ""
        },
        techQuantumComputingRow: {
            content1: "Unlock Quantum Computing to enhance computational power and enable more advanced machinery.",
            content2: "Unlock Quantum Computing to drive technological advancements through enhanced computational capabilities.<br><br><span class='green-ready-text'>Unlock Tier 2 AutoBuyers</span>",
            updateAt: ""
        },
        techHeliumFusionRow: {
            content1: "Unlock Helium Fusion to enable the fusion of Helium atoms.",
            content2: "Unlock Helium Fusion to develop methods for fusing Helium and generate more energy.<br><br><span class='green-ready-text'>Unlock Carbon resource</span>",
            updateAt: ""
        },
        techHydroCarbonsRow: {
            content1: "Unlock HydroCarbons to produce early fuel for power generation.",
            content2: "Unlock HydroCarbons to start generating energy by using early forms of fuel.<br><br><span class='green-ready-text'>Create Diesel (with Compounds Tab)</span>",
            updateAt: ""
        },
        techNanoTubeTechnologyRow: {
            content1: "Unlock NanoTube Technology to learn the first step about the fusion of Carbon.",
            content2: "Unlock NanoTube Technology to advance material science, focusing on carbon-based nanotubes.<br><br><span class='green-ready-text'>Prerequisite for Carbon technologies</span>",
            updateAt: ""
        },
        techCarbonFusionRow: {
            content1: "Unlock Carbon Fusion to finalize knowledge about the fusion of Carbon atoms.",
            content2: "Unlock Carbon Fusion to explore and harness the power of Carbon atom fusion for more efficient energy.<br><br><span class='green-ready-text'>Unlock Sodium and Neon resources</span>",
            updateAt: ""
        },
        techNeonFusionRow: {
            content1: "Unlock Neon Fusion to explore and harness fusion reactions of Neon.",
            content2: "Unlock Neon Fusion to investigate and utilize the fusion of Neon atoms for advanced energy solutions.<br><br><span class='green-ready-text'>Unlock Oxygen resource</span>",
            updateAt: ""
        },
        techOxygenFusionRow: {
            content1: "Unlock Oxygen Fusion to experiment with fusing Oxygen atoms.",
            content2: "Unlock Oxygen Fusion to explore the process of Oxygen atom fusion and boost energy efficiency.<br><br><span class='green-ready-text'>Unlock Silicon resource</span>",
            updateAt: ""
        },
        techSiliconFusionRow: {
            content1: "Unlock Silicon Fusion to experiment fusing Silicon.",
            content2: "Unlock Silicon Fusion to examine the fusion process of Silicon atoms for advanced applications.<br><br><span class='green-ready-text'>Unlock Iron resource</span>",
            updateAt: ""
        },
        techNeutronCaptureRow: {
            content1: "Unlock Neutron Capture to collect fusion by-products.",
            content2: "Unlock Neutron Capture to gather and study by-products from fusion reactions for advanced technologies.<br><br><span class='green-ready-text'>Unlock Titanium resource</span>",
            updateAt: ""
        },
        techGlassManufactureRow: {
            content1: "Unlock Glass Manufacture to produce advanced Glass compounds from Silicon and Oxygen.",
            content2: "Unlock Glass Manufacture to produce advanced glass compounds from Silicon and Oxygen for various industrial uses.<br><br><span class='green-ready-text'>Create Glass compound</span>",
            updateAt: ""
        },
        techAggregateMixingRow: {
            content1: "Unlock Aggregate Mixing to produce concrete compounds from Silicon, Sodium and Hydrogen.",
            content2: "Unlock Aggregate Mixing to produce concrete and construction materials using Silicon, Sodium, and Hydrogen.<br><br><span class='green-ready-text'>Create Concrete compound</span>",
            updateAt: ""
        },        
        techNobleGasCollectionRow: {
            content1: "Unlock Noble Gas Collection to store rare noble gases.",
            content2: "Unlock Noble Gas Collection to store and manage rare noble gases, essential for high-end applications.<br><br><span class='green-ready-text'>Prerequisite for Neon Fusion (with Carbon Fusion)</span>",
            updateAt: ""
        },
        techFusionEfficiencyIRow: {
            content1: "Unlock Fusion Efficiency I to enhance fusion efficiency.",
            content2: "Unlock Fusion Efficiency I to improve the performance and energy output of fusion reactions.<br><br><span class='green-ready-text'>Fusion Efficiency +20%</span>",
            updateAt: ""
        },
        techFusionEfficiencyIIRow: {
            content1: "Unlock Fusion Efficiency II to further enhance fusion efficiency.",
            content2: "Unlock Fusion Efficiency II to maximize fusion efficiency, leading to higher energy yields and lower waste.<br><br><span class='green-ready-text'>Fusion Efficiency +20%</span>",
            updateAt: ""
        },
        techFusionEfficiencyIIIRow: {
            content1: "Unlock Fusion Efficiency III to realise 100% efficient fusion.",
            content2: "Unlock Fusion Efficiency III to achieve fully optimized, 100% efficient fusion energy generation.<br><br><span class='green-ready-text'>100% Fusion Efficiency</span>",
            updateAt: ""
        },
        techAtmosphericTelescopesRow: {
            content1: "Unlock Atmospheric Telescopes to get data about the surrounding stellar neighborhood.",
            content2: "Unlock Atmospheric Telescopes to gather data and insights about nearby stars and cosmic bodies.<br><br><span class='green-ready-text'>Reveal Star Data</span>",
            updateAt: ""
        },
        techGiganticTurbinesRow: {
            content1: "Unlock Gigantic Turbines to allow the building of advanced power generators.",
            content2: "Unlock Gigantic Turbines to build massive, high-efficiency turbines for advanced power generation.<br><br><span class='green-ready-text'>Prerequisite for Advanced Power Plant</span>",
            updateAt: ""
        },
        techSteelFoundriesRow: {
            content1: "Unlock Steel Foundries to produce high strength steel alloys from Iron.",
            content2: "Unlock Steel Foundries to produce high-strength steel alloys from iron, enabling advanced manufacturing and construction.<br><br><span class='green-ready-text'>Unlock Steel compound</span>",
            updateAt: ""
        },
        techCompoundsRow: {
            content1: "Unlock Compounds to expand the materials you have access to.",
            content2: "Unlock Compounds to gain access to new materials and enhance your manufacturing capabilities.<br><br><span class='green-ready-text'>Unlock Compounds Tab</span>",
            updateAt: ""
        },
        techRocketCompositesRow: {
            content1: "Unlock Rocket Composites to build rocket components and unlock the Launch Pad tab, and level 3 and 4 AutoBuyers",
            content2: "Unlock Rocket Composites to build rocket components to mine in space, and level 3 and 4 AutoBuyers.<br><br><span class='green-ready-text'>Unlock Launch Pad Tab</span>",
            updateAt: ""
        },
        techAdvancedFuelsRow: {
            content1: "Unlock Advanced Fuels to fuel your Space Mining vessels.",
            content2: "Unlock Advanced Fuels to fuel your Space Mining vessels<br><br><span class='green-ready-text'>Create Rocket Fuel</span>",
            updateAt: ""
        },
        techPlanetaryNavigationRow: {
            content1: "Unlock the ability to travel to Asteroids.",
            content2: "Unlock the ability to travel to Asteroids.<br><br><span class='green-ready-text'>Travel To Asteroids</span>",
            updateAt: ""
        },
        techAdvancedPowerGenerationRow: {
            content1: "Unlock Advanced Power Generation to boost energy production.",
            content2: "Unlock Advanced Power Generation to increase energy output, powering more complex systems and facilities.<br><br><span class='green-ready-text'>Build Advanced Power Plant</span>",
            updateAt: ""
        },
        techBasicPowerGenerationRow: {
            content1: "Unlock Basic Power Generation to start producing energy.",
            content2: "Unlock Basic Power Generation to lay the foundation for generating energy and powering essential systems.<br><br><span class='green-ready-text'>Build Power Plant</span>",
            updateAt: ""
        },
        techSolarPowerGenerationRow: {
            content1: "Unlock the ability to utilize the local star to harness clean, renewable energy.",
            content2: "Unlock Solar Power Generation to harness renewable solar energy, reducing reliance on non-renewable resources.<br><br><span class='green-ready-text'>Build Solar Power Plant</span>",
            updateAt: ""
        },        
        techScienceLaboratoriesRow: {
            content1: "Unlock Science Laboratories to build huge labs for large scale, dedicated research.",
            content2: "Unlock Science Laboratories to establish large-scale labs dedicated to conducting cutting-edge research.<br><br><span class='green-ready-text'>Build Science Laboratory</span>",
            updateAt: "" 
        },
        techSodiumIonPowerStorageRow: {
            content1: "Unlock the ability to build batteries to store energy that you generate.",
            content2: "Unlock Sodium-Ion Power Storage to build advanced batteries for storing energy generated by your systems.<br><br><span class='green-ready-text'>Build Tier 1 Battery</span>",
            updateAt: "" 
        }, 
        techOrbitalConstructionRow: {
            content1: "Unlock Orbital Construction to build starship modules.",
            content2: "Unlock Orbital Construction to build starship modules.<br><br><span class='green-ready-text'>Unlock Starship Section in InterStellar Tab</span>",
            updateAt: ""
        },
        techAntimatterEnginesRow: {
            content1: "Unlock Antimatter Engines to build interstellar propulsion systems.",
            content2: "Unlock Antimatter Engines to build interstellar propulsion systems.<br><br><span class='green-ready-text'>Build Starship Antimatter Engines</span>",
            updateAt: ""
        },
        techFTLTravelTheoryRow: {
            content1: "Unlock FTL Travel Theory to research faster-than-light travel.",
            content2: "Unlock FTL Travel Theory to research faster-than-light travel.<br><br><span class='green-ready-text'>Can Launch Starship</span>",
            updateAt: ""
        },
        techLifeSupportSystemsRow: {
            content1: "Unlock Life Support Systems to sustain life in deep space.",
            content2: "Unlock Life Support Systems to sustain life in deep space.<br><br><span class='green-ready-text'>Build Starship Habitatation Modules</span>",
            updateAt: ""
        },
        techStarshipFleetsRow: {
            content1: "Unlock Starship Fleets to build and command interstellar armadas.",
            content2: "Unlock Starship Fleets to build and command interstellar armadas.<br><br><span class='green-ready-text'>Allow building of Fleet Hangar onboard the Star Ship!</span>",
            updateAt: ""
        },  
        techStellarScannersRow: {
            content1: "Unlock Stellar Scanners to identify life signatures around Star Systems.",
            content2: "Unlock Stellar Scanners to identify life signatures around Star Systems.<br><br><span class='green-ready-text'>Allow building of Stellar Scanner onboard the Star Ship!</span>",
            updateAt: ""
        }, 
        techDysonSphereUnderstandingRow: {
            content1: "Unlock Dyson Sphere Understanding to comprehend the nature of a Dyson Sphere.",
            content2: "Unlock Dyson Sphere Understanding to learn what a Dyson Sphere is and how it can change the course of your technological development.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techDysonSphereCapabilitiesRow: {
            content1: "Unlock Dyson Sphere Capabilities to understand its potential uses and abilities.",
            content2: "Unlock Dyson Sphere Capabilities to gain insight into the incredible powers and capabilities of a Dyson Sphere.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techDysonSphereDisconnectRow: {
            content1: "Unlock Dyson Sphere Disconnect to sever its connection from the Miaplacidus System Force Field.",
            content2: "Unlock Dyson Sphere Disconnect to disconnect the Dyson Sphere from the Miaplacidus System Force Field.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techDysonSpherePowerRow: {
            content1: "Unlock Dyson Sphere Power to harness its energy for your system.",
            content2: "Unlock Dyson Sphere Power to learn how to tap into the vast energy reserves of the Dyson Sphere, powering your system and beyond.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techDysonSphereConnectRow: {
            content1: "Unlock Dyson Sphere Connect to link its power across the galaxy.",
            content2: "Unlock Dyson Sphere Connect to understand how to distribute the Dyson Sphere's energy across all systems, linking it to the galaxy at large.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techCelestialProcessingCoreUnderstandingRow: {
            content1: "Unlock Celestial Processing Core Understanding to comprehend the nature of a Celestial Processing Core.",
            content2: "Unlock Celestial Processing Core Understanding to learn what a Celestial Processing Core is and how it can revolutionize your technological infrastructure.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techCelestialProcessingCoreCapabilitiesRow: {
            content1: "Unlock Celestial Processing Core Capabilities to understand its potential uses and abilities.",
            content2: "Unlock Celestial Processing Core Capabilities to gain insight into the immense power and functions of the Celestial Processing Core.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techCelestialProcessingCoreDisconnectRow: {
            content1: "Unlock Celestial Processing Core Disconnect to sever its connection from the Miaplacidus System Force Field.",
            content2: "Unlock Celestial Processing Core Disconnect to disconnect the Celestial Processing Core from the Miaplacidus System Force Field.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techCelestialProcessingCorePowerRow: {
            content1: "Unlock Celestial Processing Core Power to harness its energy for your system.",
            content2: "Unlock Celestial Processing Core Power to learn how to tap into the vast power of the Celestial Processing Core, empowering your system.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techCelestialProcessingCoreConnectRow: {
            content1: "Unlock Celestial Processing Core Connect to distribute its power galaxy-wide.",
            content2: "Unlock Celestial Processing Core Connect to learn how to distribute the Celestial Processing Core's energy across the galaxy.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },

        blackHoleChargeProgressRow: {
            content1: 'Black Hole Charge Progress',
            content2: '',
            updateAt: ''
        },
        blackHoleTimeWarpProgressRow: {
            content1: 'BLACK HOLE ACTIVATED',
            content2: '',
            updateAt: ''
        },
        blackHoleInteractionRow: {
            content1: 'Here you can research and upgrade your interaction power with the Black Hole',
            content2: '',
            updateAt: ''
        },
        blackHoleFeedRow: {
            content1: 'Here you can feed the Black Hole and increase its power',
            content2: '',
            updateAt: ''
        },
        blackHoleStatsRow: {
            content1: 'Here you can see the Black Hole charge and power stats',
            content2: '',
            updateAt: ''
        },
        blackHoleActivationRow: {
            content1: 'Activate the Black Hole!',
            content2: '',
            updateAt: ''
        },
        techPlasmaForgeCapabilitiesRow: {
            content1: "Unlock Plasma Forge Capabilities to understand its potential uses and abilities.",
            content2: "Unlock Plasma Forge Capabilities to understand the vast array of functions and capabilities that the Plasma Forge offers.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techPlasmaForgeDisconnectRow: {
            content1: "Unlock Plasma Forge Disconnect to sever its connection from the Miaplacidus System Force Field.",
            content2: "Unlock Plasma Forge Disconnect to disconnect the Plasma Forge from the Miaplacidus System Force Field.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techPlasmaForgePowerRow: {
            content1: "Unlock Plasma Forge Power to harness its energy for your system.",
            content2: "Unlock Plasma Forge Power to learn how to utilize the immense energy of the Plasma Forge for powering your system.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techPlasmaForgeConnectRow: {
            content1: "Unlock Plasma Forge Connect to connect its power across the galaxy.",
            content2: "Unlock Plasma Forge Connect to learn how to extend the Plasma Forge’s energy across multiple systems, expanding your reach.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },

        techGalacticMemoryArchiveUnderstandingRow: {
            content1: "Unlock Galactic Memory Archive Understanding to comprehend the Galactic Memory Archive’s function.",
            content2: "Unlock Galactic Memory Archive Understanding to understand what the Galactic Memory Archive is and how it holds vital cosmic data.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techGalacticMemoryArchiveCapabilitiesRow: {
            content1: "Unlock Galactic Memory Archive Capabilities to understand its potential uses and abilities.",
            content2: "Unlock Galactic Memory Archive Capabilities to discover the powerful functions and capabilities that the Galactic Memory Archive holds.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techGalacticMemoryArchiveDisconnectRow: {
            content1: "Unlock Galactic Memory Archive Disconnect to sever its connection from the Miaplacidus System Force Field.",
            content2: "Unlock Galactic Memory Archive Disconnect to disconnect the Galactic Memory Archive from the Miaplacidus System Force Field.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techGalacticMemoryArchivePowerRow: {
            content1: "Unlock Galactic Memory Archive Power to harness its energy for your system.",
            content2: "Unlock Galactic Memory Archive Power to tap into the cosmic energy stored in the Galactic Memory Archive for your system’s benefit.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },
        techGalacticMemoryArchiveConnectRow: {
            content1: "Unlock Galactic Memory Archive Connect to connect its power across the galaxy.",
            content2: "Unlock Galactic Memory Archive Connect to connect the Galactic Memory Archive’s energy across all systems, extending your technological network.<br><br><span class='green-ready-text'>???</span>",
            updateAt: ""
        },      
        techPhilosophySpaceStorageTankResearchRow: {
            content1: "ABILITY: Unlock Storage Research and base storage increases are not x2 but x5 every time.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyFleetHologramsRow: {
            content1: "ABILITY: Unlock Fleet Holograms to guarantee vassalization if fleet 3x larger, regardless of leader traits.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyVoidSeersRow: {
            content1: "ABILITY: Unlock Void Seers to gain the ablity to use Space Telescope for scanning Resources and Compounds in the Void.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyRapidExpansionRow: {
            content1: "ABILITY: Unlock Rapid Expansion to have a chance of conquering up to 3 extra systems when you conquer 1.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyEfficientAssemblyRow: {
            content1: "Research Efficient Assembly to reduce space building costs by 1%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyLaserMiningRow: {
            content1: "Research Laser Mining to lower the cost of resource autobuyers by 5%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyMassCompoundAssemblyRow: {
            content1: "Research Mass Compound Assembly to reduce compound recipe costs by 5%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyEnergyDronesRow: {
            content1: "Research Energy Drones to make energy and research buildings 5% cheaper.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyHangarAutomationRow: {
            content1: "Research Hangar Automation to reduce fleet construction costs by 5%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophySyntheticPlatingRow: {
            content1: "Research Synthetic Plating to improve fleet armor and health by 5%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyAntimatterEngineMinaturizationRow: {
            content1: "Research Antimatter Engine Minaturization to boost fleet speed by 5%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyLaserIntensityResearchRow: {
            content1: "Research Laser Intensity to increase fleet attack power by 5% on newly built Fleet Ships.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyStellarWhispersRow: {
            content1: "Research Stellar Whispers to improve initial diplomacy with alien species by 1% each purchase.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyStellarInsightManifoldRow: {
            content1: "Research Stellar Insight Manifold to accelerate Star Study speed by 1% each time.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyAsteroidDwellersRow: {
            content1: "Research Asteroid Dwellers to improve Asteroid exploration speed by 1% each time.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyAscendencyPhilosophyRow: {
            content1: "Research Ascendency Philosophy to improve base AP gain.",
            content2: "",
            updateAt: ""
        },
        techPhilosophySpaceElevatorRow: {
            content1: "Research Space Elevator to reduce the cost of Star Ship parts by 5%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyLaunchPadMassProductionRow: {
            content1: "Research Launch Pad Mass Production to lower Rocket part costs by 5%",
            content2: "",
            updateAt: ""
        },
        techPhilosophyAsteroidAttractorsRow: {
            content1: "Research Asteroid Attractors to reduce Rocket travel time by 5%.",
            content2: "",
            updateAt: ""
        },
        techPhilosophyWarpDriveRow: {
            content1: "Research Warp Drive to reduce Star Ship travel time by 5%.",
            content2: "",
            updateAt: ""
        },        
        energyPowerPlant1Row: {
            content1: "This is the first building available to produce energy.",
            content2: "",
            updateAt: ""
        },
        energyPowerPlant2Row: {
            content1: "This building produces clean, renewable energy without using resources, but its efficiency is weather dependant!",
            content2: "",
            updateAt: ""
        },
        energyPowerPlant3Row: {
            content1: "This building produces significantly more power than its earlier iteration, but consumes more resources.",
            content2: "",
            updateAt: ""
        },
        energyBattery1Row: {
            content1: "Store small amount of energy for use if power starts being used faster than it can be generated.",
            content2: "",
            updateAt: ""
        },
        energyBattery2Row: {
            content1: "Store larger amount of energy for use if power starts being used faster than it can be generated.",
            content2: "",
            updateAt: ""
        },
        energyBattery3Row: {
            content1: "Store a huge amount of energy for use if power starts being used faster than it can be generated.",
            content2: "",
            updateAt: ""
        },
        antimatterSvgRow: {
            content1: "Hold down the Antimatter rate bar to increase production!",
            content2: "",
            updateAt: ""
        },
        spaceBuildLaunchPadRow: {
            content1: "Build the launch pad to launch built rockets and mine asteroids for antimatter.",
            content2: "",
            updateAt: ""
        },
        spaceBuildTelescopeRow: {
            content1: "Build the space telescope to search for Asteroids to mine.",
            content2: "",
            updateAt: "" 
        },
        spaceTelescopeSearchAsteroidRow: {
            content1: `Search and discover Asteroids - Power: ${Math.floor(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'energyUseSearchAsteroid']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: "" 
        },
        spaceTelescopeInvestigateStarRow: {
            content1: `Study the Stars! - Power: ${Math.floor(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'energyUseInvestigateStar']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: "" 
        },
        spaceTelescopePhilosophyBoostResourcesAndCompoundsRow: {
            content1: `Target beam at the Void, and pillage its riches! - Power: ${Math.floor(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'energyUsePhilosophyBoostResourcesAndCompounds']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: "" 
        },
        spaceRocket1TravelRow: {
            content1: `Select an Asteroid to travel there and begin mining Antimatter`,
            content2: "",
            updateAt: "" 
        },
        spaceRocket2TravelRow: {
            content1: `Select an Asteroid to travel there and begin mining Antimatter`,
            content2: "",
            updateAt: "" 
        },
        spaceRocket3TravelRow: {
            content1: `Select an Asteroid to travel there and begin mining Antimatter`,
            content2: "",
            updateAt: "" 
        },
        spaceRocket4TravelRow: {
            content1: `Select an Asteroid to travel there and begin mining Antimatter`,
            content2: "",
            updateAt: "" 
        },
        spaceRocket1AutoBuyerRow: {
            content1: `Fuel and launch your mining vessel to start mining valuable Antimatter - Power: ${Math.floor(getResourceDataObject('space', ['upgrades', 'rocket1', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        spaceRocket2AutoBuyerRow: {
            content1: `Fuel and launch your mining vessel to start mining valuable Antimatter - Power: ${Math.floor(getResourceDataObject('space', ['upgrades', 'rocket2', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        spaceRocket3AutoBuyerRow: {
            content1: `Fuel and launch your mining vessel to start mining valuable Antimatter - Power: ${Math.floor(getResourceDataObject('space', ['upgrades', 'rocket3', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        spaceRocket4AutoBuyerRow: {
            content1: `Fuel and launch your mining vessel to start mining valuable Antimatter - Power: ${Math.floor(getResourceDataObject('space', ['upgrades', 'rocket4', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())}KW / s`,
            content2: "",
            updateAt: ""
        },
        spaceStarShipStellarScannerRow: {
            content1: `Click to Scan the destination Star for any life or threats that may be present.`,
            content2: "",
            updateAt: ""
        },
        spaceStarShipDestinationReminderRow: {
            content1: "Select a destination in the Star Map.",
            content2: "",
            updateAt: ""
        },
        spaceFleetEnvoyBuildRow: {
            content1: `A special buildable once craft.  When built, you can send it on a diplomacy mission to gather information about sentient alien lifeforms residing in the discovered System.`,
            content2: "",
            updateAt: ""
        },
        spaceFleetScoutBuildRow: {
            content1: `A cheap, light craft good in large numbers.`,
            // content1: `A cheap, light craft good in large numbers. Gains a <span class="green-ready-text">&nbsp;${getResourceDataObject('space', ['upgrades', 'fleetScout', 'bonusPercentage'])}%&nbsp;</span> bonus against <span class="green-ready-text">&nbsp;${capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetScout', 'bonusGivenAgainstType']))}&nbsp;</span> fleets.`,
            content2: "",
            updateAt: ""
        },
        spaceFleetMarauderBuildRow: {
            content1: `A strong craft, designed for decimating enemy fleets.`,
            //content1: `A strong craft, designed for decimating enemy fleets. <span class="green-ready-text">&nbsp;${getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'bonusPercentage'])}%&nbsp;</span> bonus against <span class="green-ready-text">&nbsp;${capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'bonusGivenAgainstType']))}&nbsp;</span> fleets.`,
            content2: "",
            updateAt: ""
        },
        spaceFleetLandStalkerBuildRow: {
            content1: `If they don't fly, they fear this awesome machine!`,
            //content1: `If they don't fly, they fear this awesome machine! <span class="green-ready-text">&nbsp;${getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'bonusPercentage'])}%&nbsp;</span> bonus against <span class="green-ready-text">&nbsp;${capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'bonusGivenAgainstType']))}&nbsp;</span> fleets.`,
            content2: "",
            updateAt: ""
        },
        spaceFleetNavalStraferBuildRow: {
            content1: `Naval fleets can be devastated in a heartbeat!`,
            // content1: `Naval fleets can be devastated in a heartbeat! Gains a <span class="green-ready-text">&nbsp;${getResourceDataObject('space', ['upgrades', 'fleetScout', 'bonusPercentage'])}%&nbsp;</span> bonus against <span class="green-ready-text">&nbsp;${capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'bonusGivenAgainstType']))}&nbsp;</span> fleets.`,
            content2: "",
            updateAt: ""
        },
        rebirthRow: {
            content1: "Rebirth to start over at the new System.  This will reset all progress, but you will keep unspent AP and any permanent buffs purchased with it",
            content2: "",
            updateAt: ""
        },
        megastructureDiagramRow: {
            content1: "",
            content2: "",
            updateAt: ""
        },
        galacticMarketItemSelectRow: {
            content1: "Trade Resources and Compounds.  There is a commission to pay!",
            content2: "",
            updateAt: ""
        },
        galacticMarketSellApForCashRow: {
            content1: "Sell AP for Cash!  Be careful as AP are not easy to come by!",
            content2: "",
            updateAt: ""
        },
        galacticMarketLiquidateForAPRow: {
            content1: "Liquidate ALL Cash, Resources and Compounds, to AP.  You can only do this once per run so choose your moment wisely!",
            content2: `Liquidate ALL Cash, Resources and Compounds, to AP. <span class="red-disabled-text">Already done this run!</span>`,
            updateAt: ""
        },
        galacticCasinoPurchaseCpRow: {
            content1: "You can buy CP to use in the casino by trading Resources or Compounds.",
            content2: "",
            updateAt: ""
        },
        galacticCasinoGame1Row: {
            content1: "Double or Nothing. Stake CP and spin for a chance to win double your stake.",
            content2: "",
            updateAt: ""
        },
        galacticCasinoGame2Row: {
            content1: `Wheel Of Fortune. Spend CP to spin the wheel and test your luck -&nbsp;<strong>${getPriceCasinoGame2()}CP</strong>`,
            content2: "",
            updateAt: ""
        },
        galacticCasinoGame3Row: {
            content1: `Higher Or Lower. Choose Higher or Lower and cash out for the prize shown at any stage -&nbsp;<strong>${getPriceCasinoGame3()}CP</strong>`,
            content2: "",
            updateAt: ""
        },
        settingsCurrencySymbolRow: {
            content1: "Change the currency symbol displayed in the game.",
            content2: "",
            updateAt: ""
        },
        settingsNotationRow: {
            content1: "Select a notation format for displaying large numbers.",
            content2: "",
            updateAt: ""
        },
        settingsToggleNotificationsRow: {
            content1: "Enable or disable in-game notifications.",
            content2: "",
            updateAt: ""
        },
        settingsThemeRow: {
            content1: "Choose a visual theme to change the game’s appearance.",
            content2: "",
            updateAt: ""
        },
        diplomacyOptionsRow: {
            content1: "If available, and Envoy built, click to try to intimidate or improve relations",
            content2: "",
            updateAt: ""
        },
        receptionStatusRow: {
            content1: "You can communicate with civilized species, unless they are Belligerent towards you.",
            content2: "",
            updateAt: ""
        },
        buffLittleBagOfHydrogenRow: {
            content1: "On Rebirth, grants enough Hydrogen to immediately buy 1 Tier 1 Hydrogen Auto Buyer.",
            content2: "",
            updateAt: ""
        },
        buffNonExhaustiveResourcesRow: {
            content1: "On Rebirth, grants enough resources to buy 1 Tier 1 Auto Buyer for each Resource (storage will be increased if needed).",
            content2: "",
            updateAt: ""
        },
        buffEfficientStorageRow: {
            content1: "When you upgrade storage capacity of a Resource or Compound, it is doubled an extra time per purchase up to three times!",
            content2: "",
            updateAt: ""
        },
        buffSmartAutoBuyersRow: {
            content1: "Enhances auto buyers, increasing their efficiency by 50% per purchase.",
            content2: "",
            updateAt: ""
        },
        buffJumpstartResearchRow: {
            content1: "All Technology worth up to 4200 Research Points is given for free on Rebirth.",
            content2: "",
            updateAt: ""
        },
        buffOptimizedPowerGridsRow: {
            content1: "Increases the effectiveness of power grid upgrades by 20%.",
            content2: "",
            updateAt: ""
        },
        buffCompoundAutomationRow: {
            content1: "Enable Compound Auto Creation",
            content2: "",
            updateAt: ""
        },
        buffRoboticResearchAutomationRow: {
            content1: "Unlock ability to automate tech Research when requisites fulfilled.",
            content2: "",
            updateAt: ""
        },
        buffFasterAsteroidScanRow: {
            content1: "Reduces the time taken to perform an Asteroid Search by 25% per purchase.",
            content2: "",
            updateAt: ""
        },
        buffDeeperStarStudyRow: {
            content1: "Double the range reveal of a star study each purchase.",
            content2: "",
            updateAt: ""
        },
        buffAsteroidScannerBoostRow: {
            content1: "Minimum rarity of asteroids upgraded by 1 - Buy once, minimum Asteroid rarity is Uncommon etc.",
            content2: "",
            updateAt: ""
        },
        buffRocketFuelOptimizationRow: {
            content1: "Reduces fuelling time for rockets by 50%",
            content2: "",
            updateAt: ""
        },
        buffEnhancedMiningRow: {
            content1: "Improves antimatter extraction efficiency, by 25% per purchase.",
            content2: "",
            updateAt: ""
        },
        buffQuantumEnginesRow: {
            content1: "Upgrades starship engines, halving travel time per purchase.",
            content2: "",
            updateAt: ""
        },
        buffAutoSpaceTelescopeRow: {
            content1: "Enables the Auto Telescope feature, allowing automatic star studying.",
            content2: "",
            updateAt: ""
        }
    };

    newsTickerContent = {
        wackyEffects: [
            {
                body: "Stretch Me!",
                item: "wave",
                linkWord: "Stretch Me!",
                linkWord2: "",
                class: "",
                id: 1000
            },
            {
                body: "🕺💃 D.I.S.C.O. 🕺💃",
                item: "disco",
                linkWord: "🕺💃 D.I.S.C.O. 🕺💃",
                linkWord2: "",
                class: "",
                id: 1001
            },
            {
                body: "Boing!",
                item: "bounce",
                linkWord: "Boing!",
                linkWord2: "",
                class: "",
                id: 1002
            },
            {
                body: "There Or Not?",
                item: "fade",
                linkWord: "There Or Not?",
                linkWord2: "",
                class: "",
                id: 1003
            },
            {
                body: "Bzzzzzzz!",
                item: "glitch",
                linkWord: "Bzzzzzzz!",
                linkWord2: "",
                class: "",
                id: 1004
            },
            {
                body: "Wibble Wobble!",
                item: "wobble",
                linkWord: "Wibble Wobble!",
                linkWord2: "",
                class: "",
                id: 1005
            },
            {
                body: "Dont Click This: Boo!",
                item: "boo",
                linkWord: "Boo!",
                linkWord2: "",
                class: "boo",
                id: 1006
            },
            {
                body: "Wanna Give FeedBack? Do you like Cosmic Forge? 👍🏽👍🏽👍🏽 Or is it more like 👎🏽👎🏽👎🏽",
                item: "feedback",
                linkWord: "👍🏽👍🏽👍🏽",
                linkWord2: "👎🏽👎🏽👎🏽",
                class: "",
                id: 1007
            } 
        ],        
        oneOff: [
            {
                id : 3000,
                body: "Double storage capacity of all unlocked resources here!",
                type: ["storageMultiplier", 2],
                condition: "visible",
                category: ["resources"],
                item: "all",
                linkWord: "here"
            },
            {
                id : 3001,
                body: "Double storage capacity of all unlocked compounds here!",
                type: ["storageMultiplier", 2],
                condition: "visible",
                category: ["compounds"],
                item: "all",
                linkWord: "here"
            },
            {
                id : 3002,
                body: "Double storage capacity of all unlocked resources and compounds here!",
                type: ["storageMultiplier", 2],
                condition: "visible",
                category: ["resources", "compounds"],
                item: "all",
                linkWord: "here"
            },
            {
                id : 3003,
                body: "Double storage capacity of tier 1 batteries here!",
                type: ["storageMultiplier", 2],
                condition: "",
                category: ["buildings", "batteries"],
                item: ["energy", "battery1"],
                linkWord: "here"
            },
            {   
                id : 3004,
                body: "Double storage capacity of tier 2 batteries here!",
                type: ["storageMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "battery2"],
                linkWord: "here"
            },
            {
                id : 3005,
                body: "Double storage capacity of tier 3 batteries here!",
                type: ["storageMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "battery3"],
                linkWord: "here"
            },
            {
                id : 3006,
                body: "Double output of all basic Power Plants here!",
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "powerPlant1"],
                linkWord: "here"
            },
            {
                id : 3007,
                body: "Double output of all Solar Power Plants here!",
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "powerPlant2"],
                linkWord: "here"
            },
            {
                id : 3008,
                body: "Double output of all Advanced Power Plants here!",
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "powerPlant3"],
                linkWord: "here"
            },            
            {
                id : 3009,
                body: "Double output of Tier 1 Auto Buyers for all unlocked resources here!",
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["resources"],
                item: ["all", "tier1"],
                linkWord: "here"
            },
            {
                id : 3010,
                body: "Double output of Tier 1 Auto Buyers for all unlocked compounds here!",
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["compounds"],
                item: ["all", "tier1"],
                linkWord: "here"
            },
            {
                id : 3011,
                body: "Double output of Tier 1 Auto Buyers for all unlocked resources and compounds here!",
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["resources", "compounds"],
                item: ["all", "tier1"],
                linkWord: "here"
            },
            {
                id: 3012,
                body: "Get 100 free Antimatter here!",
                type: ["adder", 100],
                condition: "visible",
                category: "antimatter",
                item: "quantity",
                linkWord: "here"
            },            
            {
                id: 3013,
                body: `Get ${getPlayerPhilosophy() === 'voidborn' && getStatRun() > 1 ? (1 + calculateAndAddExtraAPFromPhilosophyRepeatable(getRepeatableTechMultipliers('4'))) : 1} free AP here!`,
                type: ["adder", getPlayerPhilosophy() === 'voidborn' && getStatRun() > 1 ? (1 + calculateAndAddExtraAPFromPhilosophyRepeatable(getRepeatableTechMultipliers('4'))) : 1],
                condition: "visible",
                category: "ascendencyPoints",
                item: "quantity",
                linkWord: "here"
            }                
        ],
        prize: [
            {
                body: "Click here to get xxx free Hydrogen!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "hydrogen",
                linkWord: "here",
                id: 2000
            },
            {
                body: "Click here to get xxx free Helium!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "helium",
                linkWord: "here",
                id: 2001
            },
            {
                body: "Click here to get xxx free Carbon!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "carbon",
                linkWord: "here",
                id: 2002
            },
            {
                body: "Click here to get xxx free Neon!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "neon",
                linkWord: "here",
                id: 2003
            },
            {
                body: "Click here to get xxx free Oxygen!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "oxygen",
                linkWord: "here",
                id: 2004
            },
            {
                body: "Click here to get xxx free Sodium!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "sodium",
                linkWord: "here",
                id: 2005
            },
            {
                body: "Click here to get xxx free Silicon!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "silicon",
                linkWord: "here",
                id: 2006
            },
            {
                body: "Click here to get xxx free Iron!",
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "iron",
                linkWord: "here",
                id: 2007
            },
            {
                body: "Click here to get xxx free Diesel!",
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "diesel",
                linkWord: "here",
                id: 2008
            },
            {
                body: "Click here to get xxx free Glass!",
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "glass",
                linkWord: "here",
                id: 2009
            },
            {
                body: "Click here to get xxx free Steel!",
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "steel",
                linkWord: "here",
                id: 2010
            },
            {
                body: "Click here to get xxx free Concrete!",
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "concrete",
                linkWord: "here",
                id: 2011
            },
            {
                body: "Click here to get xxx free Titanium!",
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "titanium",
                linkWord: "here",
                id: 2012
            },
            {
                body: "Click here to get xxx free Water!",
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "water",
                linkWord: "here",
                id: 2013
            }
        ],
        manuscriptClues: [
            {
                id: 4000,
                template: "Scholars whisper that the {STAR} System hums with ancient texts. A closer investigation may reveal their secrets."
            },
            {
                id: 4001,
                template: "Astrometric echoes from {STAR} refuse to align with known models—a thorough scan might uncover what's hidden there."
            },
            {
                id: 4002,
                template: "Fragments of a manuscript allege that {STAR} hides directions to a MegaStructure. It would be wise to investigate this claim."
            },
            {
                id: 4003,
                template: "Explorer logs mention faint harmonic resonances pulsing from deep within {STAR}. Such anomalies often precede great discoveries."
            },
            {
                id: 4004,
                template: "Quantum cartographers argue the sky near {STAR} folds in on itself every few cycles. This phenomenon demands further study."
            },
            {
                id: 4005,
                template: "An intercepted Guardian dispatch labels {STAR} a 'system of architectural interest'. Their attention suggests something valuable lies within."
            },
            {
                id: 4006,
                template: "Pilgrims etch warnings about luminous storms that only manifest over {STAR}. Such rare phenomena often guard great treasures."
            },
            {
                id: 4007,
                template: "A half-burned parchment lists {STAR} as an ancient meeting place for MegaStructure architects. Their legacy may still linger there."
            },
            {
                id: 4008,
                template: "Astronomers swear {STAR} emits coordinates that describe a MegaStructure System. Deciphering these signals could lead to a major breakthrough."
            },
            {
                id: 4009,
                template: "Ancient Manuscripts reported in the {STAR} system. Their contents could prove invaluable to the right explorer."
            }
        ],
        noPrize: [   //push index as id
            "Hydrogen surpluses spark renewed debate over market regulation.",
            "Research Council debates the ethical limits of compound fusion.",
            "Auto Buyers spark controversy after reports of overclocking incidents.",
            "Unlicensed gain modules found in black-market caches.",
            "Energy crisis narrowly avoided after battery grid stabilization.",
            "Solar anomalies disrupt weather-dependent energy production.",
            "Mining guilds seek greater protections after asteroid misclassifications.",
            "Study reveals some Precipitation events yield strange compounds.",
            "Envoys disappear after failed diplomatic overtures on the fringe.",
            "Starship parts backordered as construction surges across the sector.",
            "Galactic Senate questions growing influence of Expansionist factions.",
            "VoidBorn scholars announce new interpretations of stellar silence.",
            "Philosophy selection records lost in recent databurst corruption.",
            "Space Telescope recalibrated after misidentifying stellar mass.",
            "Diplomatic efforts collapse in outer ring systems — war likely.",
            "Ascendency Point inflation reaches historic lows.",
            "Science Kits recalled following minor radiation leaks.",
            "Constructor guild petitions for upgrade subsidies.",
            "New AI disputes traditional understanding of Rebirth mechanics.",
            "Rare Compounds seized in smuggling bust at orbital market.",
            "Galaxy-wide debate erupts over the definition of sentient diplomacy.",
            "Antimatter containment breach narrowly averted in asteroid lab.",
            "Meteorological Authority warns of upcoming strange compound precipitation event.",
            "Rocket Miner registry reveals false travel logs.",
            "Legislators consider limits on repeatable research stacking.",
            "Philosophy divergence may be older than previously thought, researchers claim.",
            "Unauthorized telescope scans ignite conflict over private star maps.",
            "Debate intensifies: is Rebirth a liberation, or an exile?",
            "Galactic Market under scrutiny for volatile AP conversion rates.",
            "The Spica system's hydrogen reserves are unexpectedly abundant.",
            "Fusion reactors in Spica reach unprecedented efficiency levels.",
            "A mysterious signal from Miaplacidus disrupts local communications.",
            "Ancient manuscripts hint at the existence of megastructures.",
            "The Guardians of the Core tighten their grip on Miaplacidus.",
            "Researchers discover a new compound enhancing energy output.",
            "Space miners report sightings of unknown vessels near asteroid belts.",
            "The force field around Miaplacidus shows signs of weakening.",
            "Guardians deploy advanced drones to monitor rebel activity.",
            "A new element synthesis method accelerates technological progress.",
            "Diplomatic channels open with a previously unknown civilization.",
            "Time dilation effects observed near megastructure coordinates.",
            "Spica's sun exhibits unusual solar flare patterns.",
            "The Guardians initiate a lockdown of outer Miaplacidus sectors.",
            "A rare mineral discovered enhances fusion reactor efficiency.",
            "The Galactic Market introduces a new cryptocurrency.",
            "Plasma storms disrupt communication across multiple systems.",
            "An ancient relic points to the location of the next megastructure.",
            "Guardians deploy a new class of warships in response to rebel advances.",
            "A secret meeting between rebel leaders outlines the next offensive.",
            "A new alliance forms among systems opposing the Guardians.",
            "Galactic whispers suggest Mintaka hides advanced energy technologies — investigators urged to verify the rumours.",
            "Rumours ripple through the sector: Regulus may hold forbidden energy tech, waiting for a bold study team.",
            "Hushed reports claim Menkalinan shelters advanced energy breakthroughs — the brave are advised to investigate.",
            "Rebirth technology allows for rapid colonization of new systems.",
            "The force field's integrity drops below critical thresholds.",
            "Rebels attempt to negotiate with Guardian factions.",
            "A massive data leak exposes Rebel strategies.",
            "Galactic economy booms due to technological advancements.",
            "A mysterious artifact enhances plasma manipulation capabilities.",
            "Spica becomes a hub for interstellar diplomacy.",
            "Technological advancements accelerate beyond expectations.",
            "New challenges emerge as the galaxy enters a golden age.",
            "Explorers set course for uncharted territories.",
            "The legacy of the rebellion inspires future generations.",
            "A monument is erected in honor of those who fought for freedom.",
            "The story of Miaplacidus becomes a galactic legend.",
            "Research into ancient manuscripts continues.",
            "A new council forms to govern the liberated systems.",
            "Cultural exchanges flourish among diverse civilizations.",
            "The galaxy prepares for a new chapter in its history.",
            "The Guardians' origins remain a mystery.",
            "The end of one story marks the beginning of another.",      
            "A hummingbird's heart can beat over 1,200 times per minute.",
            "The shortest commercial flight in the world lasts just 57 seconds.",
            "The Eiffel Tower can grow by up to 15 cm during hot weather.",
            "Bananas are naturally radioactive due to their potassium content.",
            "The longest hiccuping spree lasted 68 years!",
            "You can't hum while holding your nose.",
            "Cows have best friends and can get stressed when separated.",
            "Venus is the hottest planet in our solar system.",
            "Honey never spoils. Archaeologists have found 3,000-year-old honey in tombs!",
            "A cloud can weigh more than a million pounds.",
            "The moon is slowly moving away from the Earth by about 1.5 inches a year.",
            "A group of flamingos is called a 'flamboyance'.",
            "In space, astronauts can’t cry due to the lack of gravity.",
            "Sloths can hold their breath for up to 40 minutes underwater.",
            "Wombat poop is cube-shaped and helps it stay put.",
            "The Eiffel Tower can be taller by 15 cm during summer heat due to metal expansion.",
            "There are more stars in the universe than grains of sand on all of Earth's beaches.",
            "Penguins propose to their mates with a pebble.",
            "Sharks existed before trees!",
            "A sneeze can travel up to 100 miles per hour.",
            "A narwhal’s tusk is actually a tooth that can grow up to 10 feet long.",
            "The human stomach gets a new lining every few days.",
            "Cleopatra lived closer to the time of the moon landing than to the Great Pyramid’s construction.",
            "Butterflies can taste with their feet.",
            "The first successful organ transplant was a kidney transplant in 1954.",
            "The longest snowflake recorded was 15 inches wide.",
            "A day on Venus is longer than its year!",
            "Octopuses have three hearts and blue blood.",
            "The fastest-growing plant is bamboo, which can grow up to 35 inches in a single day.",
            "The world's largest rubber band ball weighs over 4,000 pounds.",
            "The shortest war in history lasted only 38 minutes.",
            "Shakespeare invented over 1,700 words in the English language.",
            "A jellyfish called Turritopsis dohrnii can live forever.",
            "There’s a species of fish that can walk on land: the mudskipper.",
            "A giraffe's neck contains the same number of vertebrae as a human's neck.",
            "The world’s largest snowman was built in Maine, USA, and stood over 122 feet tall.",
            "The longest time anyone has gone without sleep is 11 days.",
            "The first alarm clock could only ring at 4 a.m.",
            "In 2006, Pluto was reclassified as a dwarf planet.",
            "A single strand of spider silk is stronger than steel of the same diameter.",
            "Cleopatra wasn’t Egyptian. She was actually Greek.",
            "There are more fake flamingos than real flamingos in the world.",
            "It’s physically impossible to lick your own elbow.",
            "A group of owls is called a parliament.",
            "There are 293 ways to make change for a dollar in the U.S.",
            "A baby kangaroo is called a joey.",
            "The fastest-growing plant on Earth is a type of bamboo.",
            "The unicorn is Scotland's national animal.",
            "The human nose can detect over 1 trillion different scents.",
            "A full moon is 14% brighter than a half moon.",
            "Penguins can’t fly, but they are incredible swimmers.",
            "In Japan, there is a museum dedicated entirely to rocks that look like faces.",
            "The average person produces about 1-1.5 quarts of saliva per day.",
            "In 2004, a man in the UK managed to ride a roller coaster 303 times in one day, setting a record.",
            "The Great Wall of China is not visible from space without aid, despite popular belief.",
            "The lifespan of a single taste bud is about 10 days.",
            "The average person walks about 100,000 miles in a lifetime.",
            "Sharks can live for up to 400 years, with the Greenland shark being the longest-living vertebrate.",
            "A sneeze can travel at 100 mph, and it takes about 2-3 seconds for a person to recover from a sneeze.",
            "The Eiffel Tower is painted every seven years to protect it from rust.",
            "The unicorn is Scotland's national animal, even though it's a mythical creature.",
            "A day on Mars is only 40 minutes longer than a day on Earth.",
            "Butterflies taste with their feet, using sensors to detect the chemicals in plants.",
            "The strongest muscle in the human body, relative to its size, is the masseter (jaw muscle).",
            "The shortest commercial flight in the world is in Scotland, lasting just 57 seconds.",
            "Pigs are smarter than dogs and can learn to play video games.",
            "The longest word in the English language has 189,819 letters and refers to a protein in the human body.",
            "The Earth’s core is as hot as the surface of the sun, with temperatures reaching up to 9,932°F (5,500°C).",
            "Octopuses have three hearts: two pump blood to the gills, and one pumps it to the rest of the body.",
            "The honeybee is the only insect that produces food eaten by humans.",
            "In the 16th century, European doctors believed that 'sitting on a toad' could cure warts.",
            "The world record for the most tattoos on a single person is over 800.",
            "The longest hiccuping spree lasted for 68 years and was documented by a man from California.",
            "Cows have excellent memories and can remember faces for up to 10 years.",
            "An octopus can taste what it touches with its suckers.",
            "Bananas are actually classified as berries, while strawberries are not.",
            "A piece of paper cannot be folded more than seven times, no matter how large or thin it is.",
            "The word 'nerd' was first coined by Dr. Seuss in 1950.",
            "It rains diamonds on Jupiter and Saturn due to high pressure and carbon.",
            "Dolphins are capable of recognizing themselves in a mirror, demonstrating self-awareness.",
            "A panda's diet consists of 99% bamboo, but they are members of the order Carnivora.",
            "The longest recorded flight of a chicken is 13 seconds.",
            "The first computer mouse was made of wood.",
            "Cleopatra lived closer in time to the first moon landing than to the construction of the Great Pyramid of Giza.",
            "There are more possible iterations of a game of chess than there are atoms in the observable universe.",
            "The tallest building in the world, the Burj Khalifa, has 163 floors and stands over 2,700 feet tall.",
            "A group of cats is called a clowder.",
            "A goldfish has a memory span of only 3 seconds, or so the myth goes, but recent studies show they can remember things for months.",
            "The first successful human organ transplant was a kidney transplant in 1954.",
            "A blue whale’s heart is as large as a small car and weighs about 400 pounds.",
            "There are more pyramids in Sudan than in Egypt.",
            "The average person spends about six months of their lifetime waiting for red lights to turn green.",
            "There is a town in Norway called Hell, and it freezes over in the winter.",
            "A kangaroo can’t walk backward.",
            "It’s impossible to fold a paper in half more than seven times.",
            "Peanuts are not nuts; they are legumes.",
            "The first recorded use of the word 'robot' was in 1920, in a play called 'R.U.R.' by Karel Čapek.",
            "Dolphins have names for each other and can call each other by name.",
            "Humans share 60% of their DNA with bananas.",
            "A day on Mercury lasts longer than a year on Mercury.",
            "The word 'testify' comes from the ancient practice of men swearing an oath on their testicles.",
            "The longest time between two twins being born is 87 days.",
            "The tallest mountain in the solar system is Olympus Mons on Mars, which is about three times the height of Mount Everest.",
            "Rats laugh when they are tickled.",
            "Sea otters hold hands while they sleep to keep from drifting apart.",
            "A giraffe can clean its ears with its 21-inch tongue.",
            "There are more plastic flamingos in the U.S. than real flamingos.",
            "The average person has about 100,000 hairs on their head.",
            "There’s a tree that can grow a fruit called 'cannonball' that weighs up to 50 pounds.",
            "In ancient Rome, urine was used as a mouthwash.",
            "You can’t breathe and swallow at the same time.",
            "The first known contraceptive was used in ancient Egypt and involved crocodile dung.",
            "An astronaut's helmet costs over $3 million.",
            "Pressing '-' on the numpad doesn't do anything.",
            "Apparently there are Ancient Manuscripts dotted around the Galaxy that point to Ancient Megastructures...",
            "If you are playing in the United States, there is an 87% chance you are American, but only a 66% chance that at least one of your parents is.",
            "If you think this game is worth paying for, then tough, you can't pay for it, MUHAHAHAH!  Wait, actually there is a way on itch if you get the Downloadable version, Phew!",
            "What do Rome, Italy, Santander, Spain, Chicago, IL, Buffalo, NY, Detroit, MI, Portland, OR, and Boston, MA all have in common? Somewhere in Canada is further South than all of them!"
        ]
    };
}

statisticsContent = {
    'overview': {
        subHeading1: "Time Played ",
        subBody1: "0",

        subHeading2: "Pioneer ",
        subBody2: "Leigh",

        subHeading3: "Current AP ",
        subBody3: "10000",

        subHeading4: "AP Gain ",
        subBody4: "10000",

        subHeading5: "Run ",
        subBody5: "1",

        subHeading6: "Unique News Tickers Seen ",
        subBody6: "1000",

        subHeading7: "News Ticker Prizes Collected ",
        subBody7: "10",

        subHeading8: "Theme ",
        subBody8: "Terminal",

        subHeading9: "Antimatter Mined ",
        subBody9: "10000",

        subHeading10: "Total Asteroids Discovered ",
        subBody10: "50",

        subHeading11: "Legendary Asteroids Discovered ",
        subBody11: "5",

        subHeading12: "Rockets Launched ",
        subBody12: "156",

        subHeading13: "Star Ships Launched ",
        subBody13: "3"
    },
    'run': {
        subHeading1: "Run Time",
        subBody1: "100d 18h 10m 32s",

        subHeading2: "Star System",
        subBody2: "Spica",

        subHeading3: "Current Weather",
        subBody3: "☀",

        subHeading4: "Cash",
        subBody4: "10000",

        subHeading5: "AP Anticipated",
        subBody5: "3",

        subHeading6: "Antimatter",
        subBody6: "10000"
    },
    'resources': {
        subHeading1: "Hydrogen ",
        subBody1: "10000",

        subHeading2: "Helium ",
        subBody2: "10000",

        subHeading3: "Carbon ",
        subBody3: "10000",

        subHeading4: "Neon ",
        subBody4: "10000",

        subHeading5: "Oxygen ",
        subBody5: "10000",

        subHeading6: "Sodium ",
        subBody6: "10000",

        subHeading7: "Silicon ",
        subBody7: "10000",

        subHeading8: "Iron ",
        subBody8: "10000"
    },
    'compounds': {
        subHeading1: "Diesel ",
        subBody1: "10000",

        subHeading2: "Glass ",
        subBody2: "10000",

        subHeading3: "Steel ",
        subBody3: "10000",

        subHeading4: "Concrete ",
        subBody4: "10000",

        subHeading5: "Water ",
        subBody5: "10000",

        subHeading6: "Titanium ",
        subBody6: "10000"
    },
    'research': {
        subHeading1: "Research Points ",
        subBody1: "10000",

        subHeading2: "Science Kits ",
        subBody2: "10000",

        subHeading3: "Science Clubs ",
        subBody3: "10000",

        subHeading4: "Science Labs ",
        subBody4: "10000",

        subHeading5: "Techs Unlocked",
        subBody5: "0"
    },
    'energy': {
        subHeading1: "Power",
        subBody1: "ON",

        subHeading2: "Total Energy",
        subBody2: "10000 KW",

        subHeading3: "Total Production",
        subBody3: "10000 KW",

        subHeading4: "Total Consumption",
        subBody4: "10000 KW",

        subHeading5: "Total Battery Storage",
        subBody5: "10000 MWh",

        subHeading6: "Times Tripped",
        subBody6: "10000",

        subHeading7: "Basic Power Plants",
        subBody7: "10000",

        subHeading8: "Advanced Power Plants",
        subBody8: "10000",

        subHeading9: "Solar Power Plants",
        subBody9: "10000",

        subHeading10: "Sodium Ion Batteries",
        subBody10: "10000",

        subHeading11: "Battery2",
        subBody11: "10000",

        subHeading12: "Battery3",
        subBody12: "10000"
    },
    'spaceMining': {
        subHeading1: "Space Telescope Built",
        subBody1: "N/A",

        subHeading2: "Launch Pad Built",
        subBody2: "N/A",

        subHeading3: "Rockets Built",
        subBody3: "4",

        subHeading4: "Asteroids Discovered",
        subBody4: "15",

        subHeading5: "Asteroids Mined",
        subBody5: "10",
    },
    'interstellar': {
        subHeading1: "Star Study Range",
        subBody1: "N/A",

        subHeading2: "Star Ship Built",
        subBody2: "N/A",

        subHeading3: "Star Ship Distance Travelled",
        subBody3: "0ly",

        subHeading4: "System Scanned",
        subBody4: "N/A",

        subHeading5: "Fleet Attack Strength",
        subBody5: "10000",

        subHeading6: "Envoy",
        subBody6: "8",

        subHeading7: "Scout",
        subBody7: "12",

        subHeading8: "Marauder",
        subBody8: "8",

        subHeading9: "Land Stalker",
        subBody9: "2",

        subHeading10: "Naval Strafer",
        subBody10: "2",

        subHeading11: "Enemy",
        subBody11: "Xythians",

        subHeading12: "Enemy Total Defence Overcome",
        subBody12: "10000",

        subHeading13: "Enemy Total Defence Remaining",
        subBody13: "10000",

        subHeading14: "AP From Star Voyage",
        subBody14: "1",

        subHeading15: "Black Hole Discovered",
        subBody15: "N/A",

        subHeading16: "Black Hole Always Active",
        subBody16: "N/A",

        subHeading17: "Black Hole Strength",
        subBody17: "N/A",
    }
}

helpContent = {
    'contact': {
        subHeading1: "Contact Channels",
        subBody1: "",

        subHeading2: "Discord",
        subBody2: `https://discord.gg/6bUN6BNtny`,

        subHeading3: "Email",
        subBody3: "cosmicforge999@gmail.com"
    },
    'get started': {
        subHeading1: "Introduction",
        subBody1: "Cosmic Forge in a nutshell is an incremental game.  However it is much more than that, and hopefully it will give you hours of gaming pleasure.<br/><br/>When you start the game, it is going to look pretty bleak, which it is, as you have been abandoned on a planet in the Spica system with nothing but a great understanding of the universe, and the ability to harness Hydrogen.  As you gain more of this basic building block, you will be able to sell it and gain some Cash.<br/><br/>Anyway, before going any further, open the Resources Tab, and expand the Gases section, and you will note there is a section called Hydrogen.  Click this and the Resources section will open.  Although it can look overwhelming at first, the concept is pretty simple.  At the top you will see a dropdown which allows you to set an amount of stock to sell, and a sell button.  This sells your Hydrogen for Cash, which you can see at the top left of the screen.<br/><br/>With some Cash in your pocket it is time to set about the goal, which is to ascend to the stars!  Quite a heavy task from a few coins and some Hydrogen atoms, I am sure you will agree, but fear not!<br/><br/>Next if you look below this section, you have a Gain button, that, when clicked adds a Hydrogen atom to your stocks.  You need to store this atom, and thats where the next section comes in.  If you gain so much Hydrogen that your storage is full, then you can trade all but one atom for an increase in storage, although making you gain the Hydrogen again, you can now collect twice as much!<br/><br/>This is great but a bit labour intensive.  To get around this, if you look below, you will see that there is a section allowing you to build a Hydrogen Generator, from now on called an Auto Buyer.  With this Auto Buyer, you can sit back and relax, while the Hydrogen is gained all by itself until the storage is full, which will make life easier for sure.<br/><br/>Now that the pressure is off a bit, next you will note there is a Research Tab, and opening this will give you access to some more information, and more importantly the concept of Research Points!  You can build a Science Kit which will start to generate you Research Points, very slowly at first, but this can grow very quickly.  Use the first batch you generate to open the Technology section and research your first technology, 'Knowledge Sharing'.<br/><br/>Congratulations you have just understood the main concept of Cosmic Forge, which is grinding and buying rewards with the profits.<br/><br/>Eventually you will be able to use this loop to discover new elements and grow those numbers beyond what you ever imagined!<br/><br/>Thanks for reading, now feel free to explore some other topics in the Cosmicopedia to give you some more context!"
    },
    'story': {
        subHeading1: "History",
        subBody1: "You are Miaplacidean. You once lived on a lush and peaceful world orbiting Beta Carinae, known to your people as Miaplacidus. For eons, your civilization thrived—farming the land, advancing in knowledge, and eventually colonizing your entire star system. Life was good, and there was no need for more. That changed the day a scientist discovered a strange disturbance in the void surrounding your system. Driven by curiosity and sacrifice, he entered it, never to return. Unknown to you at the time, he had crossed into a distant system and revealed your existence to an advanced AI race.\n\nThis AI species followed his path back through the now-permanent portal and launched a devastating invasion. In a matter of days, the Miaplacidus system fell. Most were lost. You and a handful of others narrowly escaped. Boarding an experimental ship equipped with untested warp technology, you fled into the void. But the jump did not go as planned. You were cast far from home, lost consciousness, and drifted through space.\n\nWhen you finally awoke, you found yourself alone in the Spica system—roughly 100 light years from your origin. Your people are gone. Your world is gone. But your story is just beginning.",

        subHeading2: "Today",
        subBody2: "You landed on a lush, vibrant world in the Spica system. There, you encountered a sentient native species—the Spicites. They welcomed you with curiosity and kindness, inviting you to share meals and learn their ways. Though communication was imperfect, they showed no aggression. Over time, you grew comfortable among them, adapting to their culture and rhythms of life.\n\nThey began to call you Mia'Plac—perhaps a mistranslation of your origin, or maybe a word with deeper meaning in their language. Whatever the case, the name stuck, and so did your place among them. Through wisdom, leadership, and your advanced knowledge, you gained their trust and eventually rose to lead their colony. Now, you oversee the gathering of resources and the advancement of research to guide this growing settlement into the future.\n\nYet, deep within, a fire still burns. You have not forgotten Miaplacidus. You have not forgotten your people. While you build a future here, you dedicate your life to uncovering the truth of what happened—to find a way back, and to set things right.",

        subHeading3: "Future",
        subBody3: "Equipped with little more than a modest lab, a handful of raw materials, and a spark of hydrogen, you begin your work. The Spicites look to you for guidance, their trust unwavering. Though their world is primitive by your standards, their spirit is strong, and your leadership promises to awaken a new era.\n\nWith your knowledge of advanced science and the secrets of the void, you introduce ideas that accelerate progress far beyond what this colony could have achieved alone. As the first structures rise and research begins, whispers start to circulate—traders speak of distant, hostile systems. They tell of rogue AI, colossal Megastructures, and lifeless worlds turned to ash.\n\nYou listen, and you remember. The invaders. The loss. The betrayal of the stars. These stories only strengthen your resolve. You will lead the Spicites beyond their world, into the stars, and through the void. You will uncover what became of Miaplacidus. And one day, you will return—not in exile, but in strength—to reclaim your home and bring an end to the machine threat once and for all.  You are... The Cosmic Forger, and this is your Forge!",
    },
    'concepts - early': {
        subHeading1: "Resources",
        subBody1: "Resources are the building blocks of the game. They can be manually gathered, sold, used to buy upgrades, fused to create other Resources, or later on, used in the creation of advanced Compounds.",

        subHeading2: "Manual Gain",
        subBody2: "The Resources all have a button that when clicked, adds 1 to the quantity of that Resource, while the total quantity is less than the storage limit. This is useful in the early stages of the game as a way to get small amounts of Resources to get things kicked off!",

        subHeading3: "Sell",
        subBody3: "Using the dropdown to choose a suitable quantity, and then clicking the Sell button, will exchange the chosen quantity of Resource (or later on, Compound) for Cash which can be used towards buying certain upgrades.",

        subHeading4: "Storage",
        subBody4: "Each Resource and Compound has a Storage limit. If the Storage is full, no more of that Resource can be gained until some are used or Storage is increased. Upgrading Storage uses all but 1 of your stocks of that Resource or Compound.",

        subHeading5: "Auto Buyers",
        subBody5: "Auto Buyers allow you to automate the collection of Resources once unlocked. They work continuously in the background, freeing you up to focus on other tasks. That is until the Storage is full. Some require Energy to operate.",

        subHeading6: "Research Points",
        subBody6: "Research Points are gained by Research Upgrades and are used to unlock new technologies.",

        subHeading7: "Research Upgrades",
        subBody7: "Research Upgrades allow you to generate Research Points, although some require Energy to operate.",

        subHeading8: "Technology",
        subBody8: "Technology unlocks powerful upgrades and new game mechanics. Most techs have prerequisites and a cost in Research Points.",

        subHeading9: "Compounds",
        subBody9: "Compounds are more advanced materials that require multiple Resources to create. They are needed for mid to late game mechanics.",

        subHeading10: "Fusion",
        subBody10: "Fusion is a process that allows you to create Resources from more basic Resources.",

        subHeading11: "News Ticker",
        subBody11: "The News Ticker displays very important (honestly!) information, and can sometimes yield secret buffs, so keep an eye on it at all times!",
    },
    'concepts - mid': {
        subHeading1: "Energy Generation & Consumption",
        subBody1: "Energy is needed to power a lot of Upgrades, such as some Auto Buyers, and Research Upgrades, and then Consumed in a lot of later game mechanics, and if this is the case, it will be indicated in the description for the feature. There are Energy Production facilities, and Energy Storage facilities.",

        subHeading2: "Power Buildings",
        subBody2: "Power Buildings generate Energy, and there are various types. They Consume Fuel while running, which can sometimes be Compounds, and in other cases Solar power.",

        subHeading3: "Batteries",
        subBody3: "Batteries store excess Energy for use when Generation is insufficient, for example if there are not enough Power Buildings following the purchase of an Upgrade, or if the Fuel is exhausted for a particular Power Building. Upgrading Battery capacity is key to maintaining Energy flow, while expanding Upgrades that consume Energy.",

        subHeading4: "Weather",
        subBody4: "Weather affects various in-game mechanics, including Energy Production. It can affect the launching of Rockets, and can provide extra Resources through Precipitation. The prevailing Weather, and indeed the Resource provided by Precipitation can vary depending on the Star that is being played (a late game mechanic).",

        subHeading5: "Space Mining",
        subBody5: "Space Mining allows for the extraction of rare Antimatter from Asteroids.",

        subHeading6: "Events",
        subBody6: "Random Events can occur as you progress, bringing unexpected opportunities or challenges. They appear without warning and can offer unique rewards, impose temporary setbacks, or unlock new paths. Pay attention to notifications—some Events are fleeting, while others may alter the course of your run if you act wisely. You can track current and historical Events in the Events panel on the Menu tab.",

        subHeading7: "Space Telescope",
        subBody7: "The Space Telescope is used to scan for Asteroids that can be Mined by your Rocket Miners, and in the Late Game, to Study Stars.  Using the Space Telescope requires a lot of Energy, and it has a high build cost.",

        subHeading8: "Asteroids",
        subBody8: "Asteroids contain Antimatter. Mining asteroids requires the Construction and Launching of Rocket Miners. Some Asteroids are easy to Travel To and Mine, whereas others require more time. The quantity of Antimatter varies, and so the Asteroids have different classes based on their quality. If you are really lucky, you may even find a Legendary Asteroid and have it named after you!",

        subHeading9: "Launch Pad",
        subBody9: "The Launch Pad is a prerequisite to building Rocket Miners.  It is an expensive Upgrade, and once built, you can see the number of Rocket Miners you have, and their stages of Construction, or Launch state.",

        subHeading10: "Rocket Miners - Building",
        subBody10: "You can build up to 4 Rocket Miners using advanced Compounds and a lot of Cash, provided you have built a Launch Pad. They each require a number of modules or Parts to build, which get progressively more expensive.  By default they are named as Rocket 1 etc but can be renamed.",

        subHeading11: "Rocket Miners - Launching & Travelling",
        subBody11: "Rockets must be Fuelled and Launched. They can Travel To to any Asteroid you have discovered with the Space Telescope, provided they are Fuelled and Launched.  Fuelling requires Power and time, and Launching requires good weather.  Once Launched, you can select a destination for your rocket from the discovered Asteroids dropdown, and then click to Travel To it.",

        subHeading12: "Rocket Miners - Mining",
        subBody12: "Once a Rocket Miner has travelled to an Asteroid, it will automatically Mine Antimatter from the Asteroid until it is exhausted, and will then return and require Fuelling to be used again.  While at an Asteroid, a Rocket Miner can Mine faster if the Boost option is used, available in the Mining panel."
    },
    'concepts - late': {
        subHeading1: "Star Map",
        subBody1: "The Star Map provides a view of the known Universe, and although it is discovered relatively early in the Game, it comes in to play much later.  Once you start to Study Stars, you can use this Star Map and the Star Data table to plan out your post Rebirth options.",

        subHeading2: "Antimatter",
        subBody2: "Antimatter is an advanced Resource used as Starship Fuel, and is a key component in progressing towards Rebirthing and completing the Game.  It is Mined from Asteroids using Rocket Miners.",

        subHeading3: "Starship - Construction",
        subBody3: "Building a Starship is a major milestone. Starships can travel to distant star systems and permit Rebirthing.",

        subHeading4: "Starship - Travelling",
        subBody4: "Starships can Travel To Studied Star systems, each offering unique Weather, Resources, and challenges when you rebirth on them for a new run.", 

        subHeading5: "Diplomacy",
        subBody5: "Most Star Systems contain intelligent alien life. You need to perform a Stellar Scan, and build an Envoy and send it, to initiate this. The Scan gives information about the lifeform in the System, it is not mandatory, but if you don't do this, your only option will be war and without knowing the size of the enemy force!  There are several options when these encounters are made, ranging from Bullying them, to trying to Vassalize them, and if all else fails, Conquerig them!  You can improve or worsen their impression of you which can affect their fleet size.  Leaders have traits that can affect how they respond to you, or in the case of war, can buff or reduce their defense, speed, fleet size etc.",

        subHeading6: "Battle",
        subBody6: "Not all systems are friendly. Sometimes the only option will be to fight it out to try to conquer it.  You must use the Fleet Hangar screen to build an attack force and initiate a battle.  If you lose, all your fleet will be destroyed but not your Star Ship.  You can rebuild, but it is an expensive process so try and win!.",

        subHeading7: "Ascendency Points (AP)",
        subBody7: "Ascendency Points (AP) are earned by Travelling To Stars. Simply put, the further away the Star is, the more AP will be granted upon Rebirth. They can be spent in the Galactic Market.  You can also gain them by liquidating all your resources and compounds and cash once per run, and also some colonising methods can double the payout also.", 

        subHeading8: "Rebirth",
        subBody8: "Rebirth resets progress but conquers a New System.", 

        subHeading9: "Galactic Market",
        subBody9: "The Galactic market is a major unlock, and arrives after your ship arrives at the new System in the first run.  In it, you can trade Resources, Cash and AP.",

        subHeading10: "Galactic Casino",
        subBody10: "The Galactic Casino allows you to gamble your hard earned products for instant gratification. Test your luck and risk your resources for potential rewards. Rewards gained are for the current run only, not long-term or multi-run prizes.",

        subHeading11: "Casino Points (CP)",
        subBody11: "Casino Points (CP) are the currency of the Galactic Casino. You must buy CP using Resources or Compounds, and CP is the only way to play the casino games for the various prizes. CP are reset on rebirth.",

        subHeading12: "Ascendency Perks",
        subBody12: "You can spend acquired AP on permanent buffs that make future runs easier, and the game more replayable and fun!",

        subHeading13: "Black Hole",
        subBody13: "You can accidentally discover a Black Hole, and once researched it can be used to Time Warp, speeding up travel times and Resource collection. It needs to be charged which takes time, but the time can be reduced with upgrades. You can also increase the time it stays active for and the power of it with further upgrades, and once it is unlocked it is available across different runs.",

        subHeading14: "O-type Stars",
        subBody14: "O-type stars are the rarest and most violent stars in the galaxy. Each one you control dramatically amplifies the power output of a Power Building type. Expect hardened defenses when attempting to conquer these systems."
    },
    'concepts - end goal': {
        subHeading1: "Ancient Manuscripts",
        subBody1: "Ancient Manuscripts point you toward MegaStructure star systems. Clues to their location can sometimes surface in the News Ticker, so keep an eye on it.",

        subHeading2: "Megastructures",
        subBody2: "MegaStructures are extremely difficult to conquer, and hidden in the Galaxy, but the rewards for doing so are massive. Each one you acquire also contributes directly to the destruction of the Miaplacidus forcefield.",

        subHeading3: "Miaplacidus",
        subBody3: "Miaplacidus - your Homeland - It is protected by a powerful force field maintained by the machine race. As you dismantle MegaStructures, and connect them to your own cause, that force field will weaken until it eventually collapses, where you will then face the almighty battle of your life to recover your Ancestral homeland.",

        subHeading4: "The End Goal",
        subBody4: "Once the Miaplacidus force field is gone, you can attack the Master AI race, reclaim Miaplacidus, and reconquer your homeland. This is the end goal of the game."
    },
    'philosophies': {
    subHeading1: "Philosophies",
    subBody1: "Philosophies are introduced slowly over the first run.  You are encouraged to select one of four possible paths, each of which is a one off, permanent decision that applies for the rest of the game.  Once a Philosophy is chosen, and you complete the first run, a new option shall appear under the Research Tab where you can research a unique special Ability, and a series of unique Repeatable Techs, fitting for the type of Philosophy you selected.  All these bonuses stay with you throughout the game, even persisting through Rebirths.",

    subHeading2: "Special Ability",
    subBody2: "Each Philosophy grants a unique special ability. These are extremely powerful and in different ways can make the game a lot more fun, and each one affects different mechanics, so it is wise to think carefully when choosing a Philosophy, as it cannot be changed later, and there can only be one Philosophy path per game.",

    subHeading3: "Repeatable Tech",
    subBody3: "Each Philosophy grants a series of unique and repeatable Techs.  They offer stacking bonuses that are permanent, and cost Research Points.  Depending on the Philosophy chosen the effects are different, and once a few are purchased, become very powerful indeed.",

    subHeading4: "Constructor",
    subBody4: "The Constructor Philosophy is centered around cheaper and more efficient upgrading. You gain bonuses to AutoBuyer prices, Storage Capacity, Energy and Research Upgrade prices, and a reduction in the cost of Compound Creation.",

    subHeading5: "Supremacist",
    subBody5: "The Supremacist Philosophy leans into military power and conquest. Expect tougher, faster, cheaper Fleets, and the ability to force enemies into Vassalization.",

    subHeading6: "VoidBorn",
    subBody6: "Born of the void, expect bonuses relating to Initial Impressions with Civilizations on foreign Systems, better Asteroid searches and Star studies, opportunities to increase AP gain, and even the ability to Pillage the Void for massive Resource and Compound gains!",

    subHeading7: "Expansionist",
    subBody7: "Expansionists thrive on colonizing and spreading across the stars. Reduce travel time for Rocket Miners and StarShips and make them cheaper, and also gain the ability to force extra nearby Systems to cede when you conquer one!"
    }
}

starNames = [
  ["Sirius", "A"], ["Canopus", "F"], ["Arcturus", "K"], ["Sadalmelik", "G"], ["Capella", "G"],
  ["Rigel", "B"], ["Procyon", "F"], ["Betelgeuse", "M"], ["Altair", "A"], ["Aldebaran", "K"],
  ["Sterope", "B"], ["Antares", "M"], ["Pollux", "K"], ["Fomalhaut", "A"], ["Deneb", "A"],
  ["Mimosa", "B"], ["Regulus", "O"], ["Adhara", "B"], ["Castor", "A"], ["Shaula", "B"],
  ["Bellatrix", "B"], ["Elnath", "B"], ["Miaplacidus", "A"], ["Alnilam", "B"], ["Alnair", "B"],
  ["Alioth", "A"], ["Alnitak", "K"], ["Dubhe", "K"], ["Mirfak", "F"], ["Wezen", "F"],
  ["Sargas", "F"], ["Kaus Australis", "B"], ["Avior", "K"], ["Alkaid", "B"], ["Menkalinan", "O"],
  ["Atria", "K"], ["Alhena", "A"], ["Peacock", "B"], ["Tureis", "B"], ["Nunki", "B"],
  ["Mirzam", "B"], ["Alphard", "K"], ["Rasalhague", "A"], ["Caph", "F"], ["Zubenelgenubi", "A"],
  ["Electra", "B"], ["Hamal", "K"], ["Mintaka", "O"], ["Alsephina", "A"], ["Menkent", "K"],
  ["Enif", "K"], ["Tiaki", "K"], ["Ascella", "A"], ["Algol", "B"], ["Markab", "B"],
  ["Suhail", "K"], ["Zeta Ophiuchi", "M"], ["Kochab", "K"], ["Ankaa", "K"], ["Denebola", "A"],
  ["Vega", "A"], ["Azelfafage", "F"], ["Maia", "B"], ["Arkab Prior", "A"], ["Thuban", "A"],
  ["Izar", "K"], ["Ruchbah", "A"], ["Albireo", "K"], ["Almaaz", "F"], ["Dschubba", "B"],
  ["Algieba", "K"], ["Gomeisa", "B"], ["Hoedus II", "G"], ["Cebalrai", "K"], ["Nashira", "F"],
  ["Muscida", "A"], ["Kitalpha", "F"], ["Hyadum I", "K"], ["Eltanin", "K"], ["Yildun", "A"],
  ["Biham", "A"], ["Zubeneschamali", "B"], ["Alpherg", "K"], ["Alcor", "A"], ["Polaris", "F"],
  ["Pleione", "B"], ["Spica", "B"], ["Chara", "G"], ["Sadachbia", "F"], ["Rasalgethi", "M"],
  ["Barnards Star", "M"], ["Saiph", "B"], ["Hassaleh", "K"], ["Furud", "F"], ["Atik", "F"],
  ["Sadalsuud", "G"], ["Propus", "M"], ["Botein", "K"], ["Acamar", "A"], ["Anser", "G"]
];

document.addEventListener('DOMContentLoaded', function () {
    achievementTooltipDescriptions = generateAchievementTooltipDescriptions();
});

export function refreshAchievementTooltipDescriptions() {
    achievementTooltipDescriptions = generateAchievementTooltipDescriptions();
}

function generateAchievementTooltipDescriptions() {
    return {
        "collect50Hydrogen": `
        ${getAchievementTooltipDescriptionTexts('collect50Hydrogen')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}10</span><br>
        <span class="${getAchievementDataObject('collect50Hydrogen', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('collect50Hydrogen', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('collect50Hydrogen', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('collect50Hydrogen', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "collect1000Hydrogen": `
        ${getAchievementTooltipDescriptionTexts('collect1000Hydrogen')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}25</span><br>
        <span class="${getAchievementDataObject('collect1000Hydrogen', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('collect1000Hydrogen', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('collect1000Hydrogen', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('collect1000Hydrogen', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "collect5000Carbon": `
        ${getAchievementTooltipDescriptionTexts('collect5000Carbon')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}150</span><br>
        <span class="${getAchievementDataObject('collect5000Carbon', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('collect5000Carbon', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('collect5000Carbon', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('collect5000Carbon', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "collect50000Iron": `
        ${getAchievementTooltipDescriptionTexts('collect50000Iron')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}1800</span><br>
        <span class="${getAchievementDataObject('collect50000Iron', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('collect50000Iron', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('collect50000Iron', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('collect50000Iron', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "researchTechnology": `
        ${getAchievementTooltipDescriptionTexts('researchTechnology')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}30</span><br>
        <span class="${getAchievementDataObject('researchTechnology', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('researchTechnology', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('researchTechnology', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('researchTechnology', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "researchAllTechnologies": `
        ${getAchievementTooltipDescriptionTexts('researchAllTechnologies')}<br>
        <span class="green-ready-text">Reward: 1 AP</span><br>
        <span class="${getAchievementDataObject('researchAllTechnologies', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('researchAllTechnologies', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('researchAllTechnologies', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('researchAllTechnologies', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "achieve100FusionEfficiency": `
        ${getAchievementTooltipDescriptionTexts('achieve100FusionEfficiency')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}500</span><br>
        <span class="${getAchievementDataObject('achieve100FusionEfficiency', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('achieve100FusionEfficiency', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('achieve100FusionEfficiency', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('achieve100FusionEfficiency', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "fuseElement": `
        ${getAchievementTooltipDescriptionTexts('fuseElement')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}40</span><br>
        <span class="${getAchievementDataObject('fuseElement', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('fuseElement', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('fuseElement', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('fuseElement', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "gain100Cash": `
        ${getAchievementTooltipDescriptionTexts('gain100Cash')}<br>
        <span class="green-ready-text">Reward: x1.1 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain100Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('gain100Cash', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('gain100Cash', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('gain100Cash', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "gain10000Cash": `
        ${getAchievementTooltipDescriptionTexts('gain10000Cash')}<br>
        <span class="green-ready-text">Reward: x1.2 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain10000Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('gain10000Cash', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('gain10000Cash', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('gain10000Cash', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "gain100000Cash": `
        ${getAchievementTooltipDescriptionTexts('gain100000Cash')}<br>
        <span class="green-ready-text">Reward: x1.2 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain100000Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('gain100000Cash', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('gain100000Cash', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('gain100000Cash', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "gain1000000Cash": `
        ${getAchievementTooltipDescriptionTexts('gain1000000Cash')}<br>
        <span class="green-ready-text">Reward: x1.5 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain1000000Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('gain1000000Cash', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('gain1000000Cash', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('gain1000000Cash', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,    
        "buildPowerPlant": `
        ${getAchievementTooltipDescriptionTexts('buildPowerPlant')}<br>
        <span class="green-ready-text">Reward: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('buildPowerPlant', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('buildPowerPlant', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('buildPowerPlant', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('buildPowerPlant', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "tripPower": `
        ${getAchievementTooltipDescriptionTexts('tripPower')}<br>
        <span class="green-ready-text">Reward: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('tripPower', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('tripPower', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('tripPower', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('tripPower', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "buildSolarPowerPlant": `
        ${getAchievementTooltipDescriptionTexts('buildSolarPowerPlant')}<br>
        <span class="green-ready-text">Reward: x1.2 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('buildSolarPowerPlant', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('buildSolarPowerPlant', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('buildSolarPowerPlant', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('buildSolarPowerPlant', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "collect100Precipitation": `
        ${getAchievementTooltipDescriptionTexts('collect100Precipitation')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}1000</span><br>
        <span class="${getAchievementDataObject('collect100Precipitation', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('collect100Precipitation', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('collect100Precipitation', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('collect100Precipitation', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "unlockCompounds": `
        ${getAchievementTooltipDescriptionTexts('unlockCompounds')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}200</span><br>
        <span class="${getAchievementDataObject('unlockCompounds', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('unlockCompounds', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('unlockCompounds', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('unlockCompounds', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "createSteel": `
        ${getAchievementTooltipDescriptionTexts('createSteel')}<br>
        <span class="green-ready-text">Reward: -20% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('createSteel', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('createSteel', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('createSteel', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('createSteel', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "createTitanium": `
        ${getAchievementTooltipDescriptionTexts('createTitanium')}<br>
        <span class="green-ready-text">Reward: -20% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('createTitanium', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('createTitanium', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('createTitanium', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('createTitanium', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "discoverAsteroid": `
        ${getAchievementTooltipDescriptionTexts('discoverAsteroid')}<br>
        <span class="green-ready-text">Reward: -5% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('discoverAsteroid', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('discoverAsteroid', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverAsteroid', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('discoverAsteroid', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "launchRocket": `
        ${getAchievementTooltipDescriptionTexts('launchRocket')}<br>
        <span class="green-ready-text">Reward: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('launchRocket', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('launchRocket', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('launchRocket', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('launchRocket', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "mineAllAntimatterAsteroid": `
        ${getAchievementTooltipDescriptionTexts('mineAllAntimatterAsteroid')}<br>
        <span class="green-ready-text">Reward: 150 Antimatter</span><br>
        <span class="${getAchievementDataObject('mineAllAntimatterAsteroid', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('mineAllAntimatterAsteroid', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('mineAllAntimatterAsteroid', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('mineAllAntimatterAsteroid', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "studyStar": `
        ${getAchievementTooltipDescriptionTexts('studyStar')}<br>
        <span class="green-ready-text">Reward: -5% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('studyStar', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('studyStar', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('studyStar', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('studyStar', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "studyStarMoreThan5LYAway": `
        ${getAchievementTooltipDescriptionTexts('studyStarMoreThan5LYAway')}<br>
        <span class="green-ready-text">Reward: -10% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('studyStarMoreThan5LYAway', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('studyStarMoreThan5LYAway', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('studyStarMoreThan5LYAway', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('studyStarMoreThan5LYAway', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "studyStarMoreThan20LYAway": `
        ${getAchievementTooltipDescriptionTexts('studyStarMoreThan20LYAway')}<br>
        <span class="green-ready-text">Reward: -15% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('studyStarMoreThan20LYAway', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('studyStarMoreThan20LYAway', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('studyStarMoreThan20LYAway', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('studyStarMoreThan20LYAway', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "launchStarship": `
        ${getAchievementTooltipDescriptionTexts('launchStarship')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}10000</span><br>
        <span class="${getAchievementDataObject('launchStarship', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('launchStarship', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('launchStarship', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('launchStarship', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "initiateDiplomacyWithAlienRace": `
        ${getAchievementTooltipDescriptionTexts('initiateDiplomacyWithAlienRace')}<br>
        <span class="green-ready-text">Reward: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "bullyEnemyIntoSubmission": `
        ${getAchievementTooltipDescriptionTexts('bullyEnemyIntoSubmission')}<br>
        <span class="green-ready-text">Reward: 1 AP</span><br>
        <span class="${getAchievementDataObject('bullyEnemyIntoSubmission', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('bullyEnemyIntoSubmission', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('bullyEnemyIntoSubmission', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('bullyEnemyIntoSubmission', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "vassalizeEnemy": `
        ${getAchievementTooltipDescriptionTexts('vassalizeEnemy')}<br>
        <span class="green-ready-text">Reward: 1 AP</span><br>
        <span class="${getAchievementDataObject('vassalizeEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('vassalizeEnemy', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('vassalizeEnemy', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('vassalizeEnemy', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "conquerEnemy": `
        ${getAchievementTooltipDescriptionTexts('conquerEnemy')}<br>
        <span class="green-ready-text">Reward: 1 AP</span><br>
        <span class="${getAchievementDataObject('conquerEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('conquerEnemy', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerEnemy', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('conquerEnemy', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "conquerHiveMindEnemy": `
        ${getAchievementTooltipDescriptionTexts('conquerHiveMindEnemy')}<br>
        <span class="green-ready-text">Reward: 2 AP</span><br>
        <span class="${getAchievementDataObject('conquerHiveMindEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('conquerHiveMindEnemy', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerHiveMindEnemy', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('conquerHiveMindEnemy', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "conquerBelligerentEnemy": `
        ${getAchievementTooltipDescriptionTexts('conquerBelligerentEnemy')}<br>
        <span class="green-ready-text">Reward: 3 AP</span><br>
        <span class="${getAchievementDataObject('conquerBelligerentEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('conquerBelligerentEnemy', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerBelligerentEnemy', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('conquerBelligerentEnemy', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "conquerEnemyWithoutScanning": `
        ${getAchievementTooltipDescriptionTexts('conquerEnemyWithoutScanning')}<br>
        <span class="green-ready-text">Reward: 2 AP</span><br>
        <span class="${getAchievementDataObject('conquerEnemyWithoutScanning', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('conquerEnemyWithoutScanning', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerEnemyWithoutScanning', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('conquerEnemyWithoutScanning', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "settleUnoccupiedSystem": `
        ${getAchievementTooltipDescriptionTexts('settleUnoccupiedSystem')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}50000</span><br>
        <span class="${getAchievementDataObject('settleUnoccupiedSystem', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('settleUnoccupiedSystem', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('settleUnoccupiedSystem', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('settleUnoccupiedSystem', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "discoverSystemWithNoLife": `
        ${getAchievementTooltipDescriptionTexts('discoverSystemWithNoLife')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}75000</span><br>
        <span class="${getAchievementDataObject('discoverSystemWithNoLife', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('discoverSystemWithNoLife', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverSystemWithNoLife', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('discoverSystemWithNoLife', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "settleSystem": `
        ${getAchievementTooltipDescriptionTexts('settleSystem')}<br>
        <span class="green-ready-text">Reward: Pride!</span><br>
        <span class="${getAchievementDataObject('settleSystem', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('settleSystem', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('settleSystem', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('settleSystem', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "spendAP": `
        ${getAchievementTooltipDescriptionTexts('spendAP')}<br>
        <span class="green-ready-text">Reward: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('spendAP', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('spendAP', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('spendAP', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('spendAP', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "performGalacticMarketTransaction": `
        ${getAchievementTooltipDescriptionTexts('performGalacticMarketTransaction')}<br>
        <span class="green-ready-text">Reward: 1 AP</span><br>
        <span class="${getAchievementDataObject('performGalacticMarketTransaction', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('performGalacticMarketTransaction', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('performGalacticMarketTransaction', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('performGalacticMarketTransaction', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "liquidateAllAssets": `
        ${getAchievementTooltipDescriptionTexts('liquidateAllAssets')}<br>
        <span class="green-ready-text">Reward: Pride!</span><br>
        <span class="${getAchievementDataObject('liquidateAllAssets', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('liquidateAllAssets', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('liquidateAllAssets', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('liquidateAllAssets', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "rebirth": `
        ${getAchievementTooltipDescriptionTexts('rebirth')}<br>
        <span class="green-ready-text">Reward: Permanent x1.3 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('rebirth', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('rebirth', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('rebirth', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('rebirth', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "conquer10StarSystems": `
        ${getAchievementTooltipDescriptionTexts('conquer10StarSystems')}<br>
        <span class="green-ready-text">Reward: 10 AP</span><br>
        <span class="${getAchievementDataObject('conquer10StarSystems', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('conquer10StarSystems', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('conquer10StarSystems', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('conquer10StarSystems', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "conquer50StarSystems": `
        ${getAchievementTooltipDescriptionTexts('conquer50StarSystems')}<br>
        <span class="green-ready-text">Reward: 100 AP</span><br>
        <span class="${getAchievementDataObject('conquer50StarSystems', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('conquer50StarSystems', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('conquer50StarSystems', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('conquer50StarSystems', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "seeAllNewsTickers": `
        ${getAchievementTooltipDescriptionTexts('seeAllNewsTickers')}<br>
        <span class="green-ready-text">Reward: Permanent x1.2 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('seeAllNewsTickers', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('seeAllNewsTickers', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('seeAllNewsTickers', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('seeAllNewsTickers', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "activateAllWackyNewsTickers": `
        ${getAchievementTooltipDescriptionTexts('activateAllWackyNewsTickers')}<br>
        <span class="green-ready-text">Reward: Permanent -20% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('activateAllWackyNewsTickers', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('activateAllWackyNewsTickers', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('activateAllWackyNewsTickers', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('activateAllWackyNewsTickers', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "collect100TitaniumAsPrecipitation": `
        ${getAchievementTooltipDescriptionTexts('collect100TitaniumAsPrecipitation')}<br>
        <span class="green-ready-text">Reward: Permanent x1.3 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "discoverLegendaryAsteroid": `
        ${getAchievementTooltipDescriptionTexts('discoverLegendaryAsteroid')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}75000</span><br>
        <span class="${getAchievementDataObject('discoverLegendaryAsteroid', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('discoverLegendaryAsteroid', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverLegendaryAsteroid', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('discoverLegendaryAsteroid', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "have4RocketsMiningAntimatter": `
        ${getAchievementTooltipDescriptionTexts('have4RocketsMiningAntimatter')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}100000</span><br>
        <span class="${getAchievementDataObject('have4RocketsMiningAntimatter', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('have4RocketsMiningAntimatter', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('have4RocketsMiningAntimatter', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('have4RocketsMiningAntimatter', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "studyAllStarsInOneRun": `
        ${getAchievementTooltipDescriptionTexts('studyAllStarsInOneRun')}<br>
        <span class="green-ready-text">Reward: Pride!</span><br>
        <span class="${getAchievementDataObject('studyAllStarsInOneRun', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('studyAllStarsInOneRun', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('studyAllStarsInOneRun', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('studyAllStarsInOneRun', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "trade10APForCash": `
        ${getAchievementTooltipDescriptionTexts('trade10APForCash')}<br>
        <span class="green-ready-text">Reward: 5 AP</span><br>
        <span class="${getAchievementDataObject('trade10APForCash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('trade10APForCash', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('trade10APForCash', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('trade10APForCash', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "have50HoursWithOnePioneer": `
        ${getAchievementTooltipDescriptionTexts('have50HoursWithOnePioneer')}<br>
        <span class="green-ready-text">Reward: 50 AP</span><br>
        <span class="green-ready-text">
        Logged: ${
            (() => {
                const ms = getGameActiveCountTime()[0];
                const totalSeconds = Math.floor(ms / 1000);
                const days = Math.floor(totalSeconds / 86400);
                const hours = Math.floor((totalSeconds % 86400) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                return `${days}d ${hours}h ${minutes}m ${seconds}s`;
            })()
        }
        </span><br><br>
        <span class="${getAchievementDataObject('have50HoursWithOnePioneer', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('have50HoursWithOnePioneer', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `
        ,
        "adoptPhilosophy": `
        ${getAchievementTooltipDescriptionTexts('adoptPhilosophy')}<br>
        <span class="green-ready-text">Reward: Pride!</span><br>
        <span class="${getAchievementDataObject('adoptPhilosophy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('adoptPhilosophy', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('adoptPhilosophy', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('adoptPhilosophy', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "discoverBlackHole": `
        ${getAchievementTooltipDescriptionTexts('discoverBlackHole')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}1000000</span><br>
        <span class="${getAchievementDataObject('discoverBlackHole', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('discoverBlackHole', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverBlackHole', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('discoverBlackHole', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "activateBlackHoleOver10x": `
        ${getAchievementTooltipDescriptionTexts('activateBlackHoleOver10x')}<br>
        <span class="green-ready-text">Reward: x2 all Resource quantities (capped at storage)</span><br>
        <span class="${getAchievementDataObject('activateBlackHoleOver10x', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('activateBlackHoleOver10x', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('activateBlackHoleOver10x', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('activateBlackHoleOver10x', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "findAncientManuscript": `
        ${getAchievementTooltipDescriptionTexts('findAncientManuscript')}<br>
        <span class="green-ready-text">Reward: x2 all Compound quantities (capped at storage)</span><br>
        <span class="${getAchievementDataObject('findAncientManuscript', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('findAncientManuscript', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('findAncientManuscript', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('findAncientManuscript', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "conquerMegastructureSystem": `
        ${getAchievementTooltipDescriptionTexts('conquerMegastructureSystem')}<br>
        <span class="green-ready-text">Reward: ${getCurrencySymbol()}1000000</span><br>
        <span class="${getAchievementDataObject('conquerMegastructureSystem', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('conquerMegastructureSystem', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerMegastructureSystem', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('conquerMegastructureSystem', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "bringDownMiaplacideanForceField": `
        ${getAchievementTooltipDescriptionTexts('bringDownMiaplacideanForceField')}<br>
        <span class="green-ready-text">Reward: 100 AP</span><br>
        <span class="${getAchievementDataObject('bringDownMiaplacideanForceField', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('bringDownMiaplacideanForceField', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('bringDownMiaplacideanForceField', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('bringDownMiaplacideanForceField', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "completeGame": `
        ${getAchievementTooltipDescriptionTexts('completeGame')}<br>
        <span class="green-ready-text">Reward: Pride!</span><br>
        <span class="${getAchievementDataObject('completeGame', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('completeGame', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('completeGame', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('completeGame', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "completeRunOnMiaplacidus": `
        ${getAchievementTooltipDescriptionTexts('completeRunOnMiaplacidus')}<br>
        <span class="green-ready-text">Reward: Glutton For Punishment!</span><br>
        <span class="${getAchievementDataObject('completeRunOnMiaplacidus', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('completeRunOnMiaplacidus', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('completeRunOnMiaplacidus', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('completeRunOnMiaplacidus', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `,
        "haveFleetSizeOf50EachShipType": `
        ${getAchievementTooltipDescriptionTexts('haveFleetSizeOf50EachShipType')}<br>
        <span class="green-ready-text">Reward: 1000000 Titanium (capped at storage)</span><br>
        <span class="${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `
        ,
        "tryAllThemes": `
        ${getAchievementTooltipDescriptionTexts('tryAllThemes')}<br>
        <span class="green-ready-text">Reward: Pride!</span><br>
        <span class="${getAchievementDataObject('tryAllThemes', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            Reset on Rebirth: ${getAchievementDataObject('tryAllThemes', ['resetOnRebirth']) ? 'YES' : 'NO'}
        </span><br><br>
        <span class="${getAchievementDataObject('tryAllThemes', ['active']) ? 'green-ready-text' : ''}">
            Status: ${getAchievementDataObject('tryAllThemes', ['active']) ? 'ACHIEVED' : 'NOT ACHIEVED'}
        </span>
        `
    };    
}

achievementTooltipDescriptionTexts = {
    "collect50Hydrogen": "Collect 50 Hydrogen",
    "collect1000Hydrogen": "Gather 1000 Hydrogen",
    "collect5000Carbon": "Accumulate 5000 Carbon",
    "collect50000Iron": "Collect 50000 Iron",
    "researchTechnology": "Research a Techology",
    "researchAllTechnologies": "Research all Technologies",
    "achieve100FusionEfficiency": "Achieve 100% Fusion Efficiency",
    "fuseElement": "Fuse an Element",
    "gain100Cash": "Gain 100 Cash",
    "gain10000Cash": "Gain 10K Cash",
    "gain100000Cash": "Gain 100K Cash",
    "gain1000000Cash": "Gain 1M Cash",
    "buildPowerPlant": "Build a Power Plant",
    "tripPower": "Trip the Power",
    "buildSolarPowerPlant": "Construct a Solar Power Plant",
    "collect100Precipitation": "Collect 100 Precipitation",
    "unlockCompounds": "Unlock Compounds",
    "createSteel": "Create Steel",
    "createTitanium": "Create Titanium",
    "discoverAsteroid": "Discover an Asteroid",
    "launchRocket": "Launch a Rocket",
    "mineAllAntimatterAsteroid": "Mine all Antimatter from an Asteroid",
    "studyStar": "Study a Star",
    "studyStarMoreThan5LYAway": "Study a Star over 5 light-years away",
    "studyStarMoreThan20LYAway": "Study a Star over 20 light-years away",
    "launchStarship": "Launch a Starship",
    "initiateDiplomacyWithAlienRace": "Initiate Diplomacy with an Alien Race",
    "bullyEnemyIntoSubmission": "Bully an Enemy into Submission",
    "vassalizeEnemy": "Vassalize an Enemy",
    "conquerEnemy": "Conquer an Enemy",
    "conquerHiveMindEnemy": "Defeat a Hive Mind Enemy",
    "conquerBelligerentEnemy": "Defeat a Belligerent Enemy",
    "conquerEnemyWithoutScanning": "Conquer an Enemy without Scanning",
    "settleUnoccupiedSystem": "Settle a System with Unsentient Lifeforms",
    "discoverSystemWithNoLife": "Discover a System with No Life at all",
    "settleSystem": "Settle a New System",
    "spendAP": "Spend Ascendency Points (AP)",
    "performGalacticMarketTransaction": "Perform a Galactic Market Transaction",
    "liquidateAllAssets": "Liquidate All Assets",
    "rebirth": "Rebirth",
    "conquer10StarSystems": "Conquer 10 Star Systems",
    "conquer50StarSystems": "Conquer 50 Star Systems",
    "seeAllNewsTickers": "See All News Tickers",
    "activateAllWackyNewsTickers": "Activate All Wacky News Tickers",
    "collect100TitaniumAsPrecipitation": "Collect 100 Titanium as Precipitation",
    "discoverLegendaryAsteroid": "Discover a Legendary Asteroid",
    "have4RocketsMiningAntimatter": "Have 4 Rockets Mining Antimatter",
    "studyAllStarsInOneRun": "Study All Stars in One Run",
    "trade10APForCash": "Trade 10 AP for Cash",
    "have50HoursWithOnePioneer": "Log 50 Active Hours with One Pioneer",
    "adoptPhilosophy": "Adopt a Philosophy",
    "discoverBlackHole": "Discover a Black Hole",
    "activateBlackHoleOver10x": "Activate a Black Hole over 10x Time Warp",
    "findAncientManuscript": "Find an Ancient Manuscript",
    "conquerMegastructureSystem": "Conquer a Megastructure System",
    "bringDownMiaplacideanForceField": "Bring down the Miaplacidean Force Field",
    "completeGame": "Complete the Game",
    "completeRunOnMiaplacidus": "Complete a Run on Miaplacidus",
    "haveFleetSizeOf50EachShipType": "Have at least 50 of each Ship Type",
    "tryAllThemes": "Try All Themes"      
};

achievementNotifications = {
    "collect50HydrogenNotification": "ACHIEVEMENT:\nYou have collected 50 Hydrogen!\n\nREWARD: 10 Cash",
    "collect1000HydrogenNotification": "ACHIEVEMENT:\nYou have collected 1000 Hydrogen!\n\nREWARD: 25 Cash",
    "collect5000CarbonNotification": "ACHIEVEMENT:\nYou have collected 5000 Carbon!\n\nREWARD: 150 Cash",
    "collect50000IronNotification": "ACHIEVEMENT:\nYou have collected 50000 Iron!\n\nREWARD: 1800 Cash",
    "researchTechnologyNotification": "ACHIEVEMENT:\nYou have researched a new Technology!\n\nREWARD: 30 Cash",
    "researchAllTechnologiesNotification": "ACHIEVEMENT:\nYou have researched all Technologies!\n\nREWARD: 1AP",
    "achieve100FusionEfficiencyNotification": "ACHIEVEMENT:\nYou have achieved 100% Fusion efficiency!\n\nREWARD: 500 Cash",
    "fuseElementNotification": "ACHIEVEMENT:\nYou have fused an element!\n\nREWARD: 40 Cash",
    "gain100CashNotification": "ACHIEVEMENT:\nYou have gained 100 cash!\n\nREWARD: x1.1 all Resource & Compound Sales",
    "gain10000CashNotification": "ACHIEVEMENT:\nYou have gained 10000 cash!\n\nREWARD: x1.2 all Resource & Compound Sales",
    "gain100000CashNotification": "ACHIEVEMENT:\nYou have gained 100000 cash!\n\nREWARD: x1.2 all Resource & Compound Sales",
    "gain1000000CashNotification": "ACHIEVEMENT:\nYou have gained 1000000 cash!\n\nREWARD: x1.5 all Resource & Compound Sales",
    "buildPowerPlantNotification": "ACHIEVEMENT:\nYou have built a Power Plant!\n\nREWARD: x1.1 all Resource Rates",
    "tripPowerNotification": "ACHIEVEMENT:\nYou have tripped the Power!\n\nREWARD: x1.1 all Resource Rates",
    "buildSolarPowerPlantNotification": "ACHIEVEMENT:\nYou have built a Solar Power Plant!\n\nREWARD: x1.2 all Resource Rates",
    "collect100PrecipitationNotification": "ACHIEVEMENT:\nYou have collected 100 Precipitation!\n\nREWARD: 1000 Cash",
    "unlockCompoundsNotification": "ACHIEVEMENT:\nYou have unlocked Compounds!\n\nREWARD: 200 Cash",
    "createSteelNotification": "ACHIEVEMENT:\nYou have created Steel!\n\nREWARD: -20% Compound Creation Material Costs",
    "createTitaniumNotification": "ACHIEVEMENT:\nYou have created Titanium!\n\nREWARD: -20% Compound Creation Material Costs",
    "discoverAsteroidNotification": "ACHIEVEMENT:\nYou have discovered an Asteroid!\n\nREWARD: -5% Compound Creation Material Costs",
    "launchRocketNotification": "ACHIEVEMENT:\nYou have launched a Rocket!\n\nREWARD: x1.1 all Resource Rates",
    "mineAllAntimatterAsteroidNotification": "ACHIEVEMENT:\nYou have mined all Antimatter from an Asteroid!\n\nREWARD: 150 Antimatter",
    "studyStarNotification": "ACHIEVEMENT:\nYou have studied a Star!\n\nREWARD: -5% Compound Creation Material Costs",
    "studyStarMoreThan5LYAwayNotification": "ACHIEVEMENT:\nYou have studied a Star more than 5ly away!\n\nREWARD: -10% Compound Creation Material Costs",
    "studyStarMoreThan20LYAwayNotification": "ACHIEVEMENT:\nYou have studied a Star more than 20ly away!\n\nREWARD: -15% Compound Creation Material Costs",
    "launchStarshipNotification": "ACHIEVEMENT:\nYou have launched a Starship!\n\nREWARD: 10000 Cash",
    "initiateDiplomacyWithAlienRaceNotification": "ACHIEVEMENT:\nYou have initiated diplomacy with an alien race!\n\nREWARD: x1.1 all Resource Rates",
    "bullyEnemyIntoSubmissionNotification": "ACHIEVEMENT:\nYou have bullied an enemy into submission!\n\nREWARD: 1AP",
    "vassalizeEnemyNotification": "ACHIEVEMENT:\nYou have vassalized an enemy!\n\nREWARD: 1AP",
    "conquerEnemyNotification": "ACHIEVEMENT:\nYou have conquered an enemy!\n\nREWARD: 1AP",
    "conquerHiveMindEnemyNotification": "ACHIEVEMENT:\nYou have conquered a Hive Mind enemy!\n\nREWARD: 2AP",
    "conquerBelligerentEnemyNotification": "ACHIEVEMENT:\nYou have conquered a Belligerent enemy!\n\nREWARD: 3AP", 
    "conquerEnemyWithoutScanningNotification": "ACHIEVEMENT:\nYou have conquered an enemy without scanning the system!\n\nREWARD: 2AP",
    "settleUnoccupiedSystemNotification": "ACHIEVEMENT:\nYou have settled an unoccupied system!\n\nREWARD: 50000 Cash",
    "discoverSystemWithNoLifeNotification": "ACHIEVEMENT:\nYou have discovered a system with no life!\n\nREWARD: 75000 Cash",
    "settleSystemNotification": "ACHIEVEMENT:\nYou have settled a system!\n\nREWARD: Pride!",
    "spendAPNotification": "ACHIEVEMENT:\nYou have spent Ascendency Points (AP)!\n\nREWARD: x1.1 all Resource Rates",
    "performGalacticMarketTransactionNotification": "ACHIEVEMENT:\nYou have performed a Galactic Market transaction!\n\nREWARD: 1AP",
    "liquidateAllAssetsNotification": "ACHIEVEMENT:\nYou have liquidated all assets!\n\nREWARD: Pride!",
    "rebirthNotification": "ACHIEVEMENT:\nYou have rebirthed!\n\nREWARD: Permanent x1.3 all Resource Rates",
    "conquer10StarSystemsNotification": "ACHIEVEMENT:\nYou have conquered 10 star systems!\n\nREWARD: 10AP",
    "conquer50StarSystemsNotification": "ACHIEVEMENT:\nYou have conquered 50 star systems!\n\nREWARD: 100AP",
    "seeAllNewsTickersNotification": "ACHIEVEMENT:\nYou have seen all News Tickers!\n\nREWARD: Permanent x1.2 all Resource Rates",
    "activateAllWackyNewsTickersNotification": "ACHIEVEMENT:\nYou have activated all Wacky News Tickers!\n\nREWARD: Permanent -20% Compound Creation Material Costs",
    "collect100TitaniumAsPrecipitationNotification": "ACHIEVEMENT:\nYou have collected 100 Titanium as Precipitation!\n\nREWARD: 50AP",
    "discoverLegendaryAsteroidNotification": "ACHIEVEMENT:\nYou have discovered a Legendary Asteroid!\n\nREWARD: 75000 Cash",
    "have4RocketsMiningAntimatterNotification": "ACHIEVEMENT:\nYou have 4 rockets simultaneously mining Antimatter!\n\nREWARD: 100000 Cash",
    "studyAllStarsInOneRunNotification": "ACHIEVEMENT:\nYou have studied all Stars in the Star Map in one run!\n\nREWARD: Pride!",
    "trade10APForCashNotification": "ACHIEVEMENT:\nYou have traded 10 AP for Cash in one transaction in the Galactic Market!\n\nREWARD: 5AP",
    "have50HoursWithOnePioneerNotification": "ACHIEVEMENT:\nYou have logged 50 active hours with one Pioneer Name!\n\nREWARD: 50AP",
    "adoptPhilosophyNotification": "ACHIEVEMENT:\nYou have adopted a Philosophy!\n\nREWARD: Pride!",
    "discoverBlackHoleNotification": "ACHIEVEMENT:\nYou have discovered a Black Hole!\n\nREWARD: 1000000 Cash",
    "activateBlackHoleOver10xNotification": "ACHIEVEMENT:\nYou have activated a Black Hole at more than 10x Time Warp!\n\nREWARD: x2 all Resource quantities (capped at storage)",
    "findAncientManuscriptNotification": "ACHIEVEMENT:\nYou have found an Ancient Manuscript!\n\nREWARD: x2 all Compound quantities (capped at storage)",
    "conquerMegastructureSystemNotification": "ACHIEVEMENT:\nYou have conquered a Megastructure System!\n\nREWARD: 1000000 Cash",
    "bringDownMiaplacideanForceFieldNotification": "ACHIEVEMENT:\nYou have brought down the Miaplacidean Force Field!\n\nREWARD: 100AP",
    "completeGameNotification": "ACHIEVEMENT:\nYou have completed the game!\n\nREWARD: Pride!",
    "completeRunOnMiaplacidusNotification": "ACHIEVEMENT:\nYou have completed a run on Miaplacidus!\n\nREWARD: Glutton For Punishment!",
    "haveFleetSizeOf50EachShipTypeNotification": "ACHIEVEMENT:\nYou have at least 50 of each ship type!\n\nREWARD: 1000000 Titanium (capped at storage)",
    "tryAllThemesNotification": "ACHIEVEMENT:\nYou have tried all Themes!\n\nREWARD: Pride!"
};

export const megaStructureTableText = {
    nameDysonSphere: `Dyson Sphere`,
    researchDysonSphere1: `Dyson Sphere Understanding`,
    researchDysonSphere2: `Dyson Sphere Capabilities`,
    researchDysonSphere3: `Dyson Sphere Disconnect`,
    researchDysonSphere4: `Dyson Sphere Power`,
    researchDysonSphere5: `Dyson Sphere Connect`,
    effectDysonSphere1: `All Batteries x2 Capacity`,
    effectDysonSphere2: `All Energy Buildings +25%`,
    effectDysonSphere3: `+0.15 Antimatter/s + Force Field Reduced`,
    effectDysonSphere4: `Power Always On for this System`,
    effectDysonSphere5: `Power Always On`,

    nameCelestialProcessingCore: `Celestial Processing Core`,
    researchCelestialProcessingCore1: `CPC Understanding`,
    researchCelestialProcessingCore2: `CPC Capabilities`,
    researchCelestialProcessingCore3: `CPC Disconnect`,
    researchCelestialProcessingCore4: `CPC Power`,
    researchCelestialProcessingCore5: `CPC Connect`,
    effectCelestialProcessingCore1: `+50 Research/s`,
    effectCelestialProcessingCore2: `+100 Research/s`,
    effectCelestialProcessingCore3: `+0.15 Antimatter/s + Force Field Reduced`,
    effectCelestialProcessingCore4: `+150 Research/s`,
    effectCelestialProcessingCore5: `+200 Research/s & +500 Research/s /System`,

    namePlasmaForge: `Plasma Forge`,
    researchPlasmaForge1: `Plasma Forge Understanding`,
    researchPlasmaForge2: `Plasma Forge Capabilities`,
    researchPlasmaForge3: `Plasma Forge Disconnect`,
    researchPlasmaForge4: `Plasma Forge Power`,
    researchPlasmaForge5: `Plasma Forge Connect`,
    effectPlasmaForge1: `+25% AutoBuyer Rates`,
    effectPlasmaForge2: `+50% AutoBuyer Rates`,
    effectPlasmaForge3: `+0.15 Antimatter/s + Force Field Reduced`,
    effectPlasmaForge4: `+75% AutoBuyer Rates`,
    effectPlasmaForge5: `x2 AutoBuyer Rates & +500% AutoBuyer Rates /System`,

    nameGalacticMemoryArchive: `Galactic Memory Archive`,
    researchGalacticMemoryArchive1: `GMA Understanding`,
    researchGalacticMemoryArchive2: `GMA Capabilities`,
    researchGalacticMemoryArchive3: `GMA Disconnect`,
    researchGalacticMemoryArchive4: `GMA Power`,
    researchGalacticMemoryArchive5: `GMA Connect`,
    effectGalacticMemoryArchive1: `All Res. & Cmp. Storage Cap. +100K`,
    effectGalacticMemoryArchive2: `All Res. & Cmp. Storage Cap. +1M`,
    effectGalacticMemoryArchive3: `+0.15 Antimatter/s + Force Field Reduced`,
    effectGalacticMemoryArchive4: `All Res. & Cmp. Storage Cap. +1B`,
    effectGalacticMemoryArchive5: `All Res. & Cmp. Storage Cap. +10B<br>All Res. & Cmp. Storage Cap. starts at 10B /System`
};

export function getAchievementTooltipDescriptionTexts(achievementKey) {
    const tooltipDescriptionText = achievementTooltipDescriptionTexts[achievementKey];
    
    if (tooltipDescriptionText) {
        return tooltipDescriptionText;
    } else {
        console.warn(`Tooltip description not found for achievement key: ${achievementKey}`);
        return undefined;
    }
}

export function getAchievementTooltipDescription(achievementKey) {
    const tooltipDescription = achievementTooltipDescriptions[achievementKey];
    
    if (tooltipDescription) {
        return tooltipDescription;
    } else {
        console.warn(`Tooltip description not found for achievement key: ${achievementKey}`);
        return undefined;
    }
}

export function getAchievementNotification(achievementKey) {
    const notification = achievementNotifications[achievementKey];
    
    if (notification) {
        return notification;
    } else {
        console.warn(`Notification not found for achievement key: ${achievementKey}`);
        return undefined;
    }
}

export function getOptionDescription(key1) {
    return optionDescriptions[key1];
}

export function setOptionDescription(key1, value) {
    if (!optionDescriptions[key1]) {
        optionDescriptions[key1] = {};
    }
    Object.assign(optionDescriptions[key1], value);
}

export function getHeaderDescriptions(key) {
    return headerDescriptions[key];
}

export function setHeaderDescriptions(key, value) {
    headerDescriptions[key] = value.toLowerCase();
}

export function getRocketNames(key) {
    return rocketNames[key];
}

export function setRocketNames(key, value) {
    rocketNames[key] = value.toLowerCase();
}

export function replaceRocketNames(value) {
    rocketNames = value;
}

export function getStarNames() {
    return starNames.map((entry) => entry?.[0]).filter(Boolean);
}

export function getStarTypeByName(name) {
    const normalized = String(name ?? '').trim().toLowerCase();
    if (!normalized) {
        return 'A';
    }

    const match = starNames.find((entry) => String(entry?.[0] ?? '').toLowerCase() === normalized);
    return match?.[1] ?? 'A';
}

export function getHelpContent(section, type) {
    const currentSection = helpContent[section];

    if (type === 'subHeadings') {
        return Object.keys(currentSection)
            .filter(key => key.startsWith('subHeading'))
            .map(key => currentSection[key]);
    } else if (type === 'subBodys') {
        return Object.keys(currentSection)
            .filter(key => key.startsWith('subBody'))
            .map(key => currentSection[key]);
    }

    return [];
}

export function getStatisticsContent(type) {
    const mainHeadings = Object.keys(statisticsContent);

    if (type === 'mainHeadings') {
        return mainHeadings;
    }

    if (type === 'subHeadings' || type === 'subBodys') {
        let subSections = [];

        mainHeadings.forEach(mainHeading => {
            const subSectionsForMainHeading = statisticsContent[mainHeading];
            let subSectionArray = [];
            
            for (let i = 1; i <= Object.keys(subSectionsForMainHeading).length / 2; i++) {
                const subHeading = subSectionsForMainHeading[`subHeading${i}`] || '';
                const subBody = subSectionsForMainHeading[`subBody${i}`] || '';
                if (type === 'subHeadings') {
                    subSectionArray.push(subHeading);
                } else if (type === 'subBodys') {
                    subSectionArray.push(subBody);
                }
            }
            subSections.push(subSectionArray);
        });
        return subSections;
    }
    return [];
}
