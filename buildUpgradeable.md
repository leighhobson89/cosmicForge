# Build Upgradeable System - Complete Implementation Guide

This guide details the end-to-end process for creating repeatable/upgradable items in the game (e.g., hydrogen autobuyers, batteries, power plants).

---

## Table of Contents

1. [Overview](#overview)
2. [Data Structure Setup](#1-data-structure-setup)
3. [UI Creation - The Row](#2-ui-creation---the-row)
4. [UI Creation - The Button](#3-ui-creation---the-button)
5. [Description Display](#4-description-display)
6. [Purchase Flow](#5-purchase-flow)
7. [Price Scaling](#6-price-scaling)
8. [Button Enable/Disable Logic](#7-button-enabledisable-logic)
9. [Color Coding (Red/Green)](#8-color-coding-redgreen)
10. [Complete Working Example](#9-complete-working-example)

---

## Overview

A repeatable upgrade system consists of:
- **Data Object**: Stores price, quantity, rate, and other properties
- **UI Row**: `createOptionRow()` - Container with label, button(s), and description
- **Buy Button**: `createButton()` - Triggers the purchase
- **Gain Function**: `gain()` - Handles resource deduction and quantity increase
- **Price Scaling**: Automatically increases price after each purchase
- **Visual Feedback**: Red/green color coding based on affordability

---

## 1. Data Structure Setup

### Step 1.1: Define the Upgrade in `resourceDataObject.js`

Add your upgrade to the appropriate category (resources, compounds, buildings, space, research).

**Example: Building Upgrade (Battery)**
```javascript
buildings: {
    energy: {
        upgrades: {
            battery1: {
                price: 5000,                                    // Base cash price
                resource1Price: [500, 'sodium', 'resources'],    // [amount, name, category]
                resource2Price: [1000, 'carbon', 'resources'],   // Second resource cost
                resource3Price: [0, '', ''],                     // Third resource cost (optional)
                capacity: 15000,                                // Special property
                quantity: 0,                                     // Current owned amount
                setPrice: 'battery1Price'                       // Key for price scaling function
            }
        }
    }
}
```

**Example: Resource Autobuyer**
```javascript
resources: {
    hydrogen: {
        upgrades: {
            autoBuyer: {
                currentTierLevel: 1,
                normalProgression: true,
                tier1: {
                    nameUpgrade: 'Hydrogen Compressor',
                    screen: 'hydrogen',
                    place: 'hydrogenAutoBuyer1Row',
                    price: 50,              // Cash cost
                    rate: 0.02,             // Generation rate per unit
                    quantity: 0,             // Owned quantity
                    setPrice: 'hydrogenAB1Price',  // Price scaling key
                    energyUse: 0,            // Energy consumption
                    active: true
                },
                tier2: { ... },
                tier3: { ... },
                tier4: { ... }
            }
        }
    }
}
```

**Required Properties:**
- `price`: Cash cost
- `resource1Price`: [amount, resourceName, category] - Primary resource cost
- `resource2Price`: [amount, resourceName, category] - Secondary cost (can be [0, '', ''])
- `resource3Price`: [amount, resourceName, category] - Tertiary cost (can be [0, '', ''])
- `quantity`: Current owned count (starts at 0)
- `setPrice`: String key used by price scaling system

---

## 2. UI Creation - The Row

### Step 2.1: Call `createOptionRow()`

The row is the container that holds the label, button(s), and price description.

```javascript
import { createOptionRow, createButton } from './ui.js';
import { getResourceDataObject } from './resourceDataObject.js';
import { gain } from './game.js';
import { getCurrencySymbol } from './constantsAndGlobalVars.js';
import { capitaliseString } from './utilityFunctions.js';

const battery1Row = createOptionRow({
    labelId: 'energyBattery1Row',           // Unique ID for the row
    renderNameABs: null,                     // Or use this instead of labelText
    labelText: 'Sodium Ion Battery:',        // Display name
    inputElements: [
        // Buttons and other elements go here (see Section 3)
    ],
    descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'price'])}, 
    ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[1])}, 
    ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[1])}, 
    ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[1])}`,
    resourcePriceObject: '',                 // Optional price object reference
    dataConditionCheck: 'upgradeCheck',      // Enables price checking system
    objectSectionArgument1: 'energy',         // Category in resourceDataObject
    objectSectionArgument2: 'battery1',       // Upgrade identifier
    quantityArgument: 'cash',                 // Primary resource to check
    autoBuyerTier: null,                     // For autobuyers: 'tier1', 'tier2', etc.
    startInvisibleValue: ['tech', 'sodiumIonPowerStorage'],  // [type, condition] or false
    resourceString: null,                    // Optional resource reference
    optionalIterationParam: null,            // For tiered items
    rowCategory: 'building'                  // 'building', 'resource', 'science', 'tech', etc.
});
optionContentElement.appendChild(battery1Row);
```

**Key Parameters for createOptionRow:**

| Parameter | Description | Example Values |
|-----------|-------------|----------------|
| `labelId` | Unique HTML ID for the row | `'energyBattery1Row'` |
| `labelText` | Display label (string or array) | `'Sodium Ion Battery:'` or `['Text', 'cssClass']` |
| `inputElements` | Array of buttons/controls | `[createButton({...})]` |
| `descriptionText` | Price display string | See Section 4 |
| `dataConditionCheck` | Type of price checking | `'upgradeCheck'`, `'techUnlock'`, `'sellResource'` |
| `objectSectionArgument1` | Top-level category | `'energy'`, `'resources'`, `'space'` |
| `objectSectionArgument2` | Specific upgrade ID | `'battery1'`, `'powerPlant1'` |
| `quantityArgument` | Primary cost resource | `'cash'` |
| `rowCategory` | CSS/styling category | `'building'`, `'resource'`, `'science'`, `'spaceMiningPurchase'` |
| `startInvisibleValue` | Hide until unlocked | `['tech', 'sodiumIonPowerStorage']` or `false` |
| `noDescriptionContainer` | Custom widths | `[true, '25%', '75%']` or leave undefined |

---

## 3. UI Creation - The Button

### Step 3.1: Call `createButton()`

The button handles the actual purchase click event.

```javascript
const buyButton = createButton({
    text: `Add ${Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']) / 1000)} MWh`,
    classNames: [
        'option-button',                    // Base button style
        'red-disabled-text',               // Initial disabled state color
        'building-purchase-button',        // Category-specific styling
        'resource-cost-sell-check'         // Enables affordability checking
    ],
    onClick: () => {
        // Increment, element ID, item name, isAutobuyer, tier, category, itemType
        gain(1, 'battery1Quantity', 'battery1', false, null, 'energy', 'resources');
        addToResourceAllTimeStat(1, 'allTimeSodiumIonBatteriesBuilt');
        setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
        switchBatteryStatBarWhenBatteryBought();
        setEnergyCapacity('battery1');
    },
    dataConditionCheck: 'upgradeCheck',     // Must match row's dataConditionCheck
    resourcePriceObject: '',
    objectSectionArgument1: 'energy',       // Must match row's objectSectionArgument1
    objectSectionArgument2: 'battery1',     // Must match row's objectSectionArgument2
    quantityArgument: 'cash',               // Must match row's quantityArgument
    disableKeyboardForButton: true,         // Prevent keyboard focus
    autoBuyerTier: null,                    // For autobuyers: 'tier1', 'tier2', etc.
    rowCategory: 'building'                 // Must match row's rowCategory
});
```

**Key Parameters for createButton:**

| Parameter | Description | Required |
|-----------|-------------|----------|
| `text` | Button label text | Yes |
| `classNames` | Array of CSS classes | Yes |
| `onClick` | Click handler function | Yes |
| `dataConditionCheck` | Type of check | Yes (must match row) |
| `objectSectionArgument1` | Category | Yes (must match row) |
| `objectSectionArgument2` | Upgrade ID | Yes (must match row) |
| `quantityArgument` | Cost resource | Yes (must match row) |
| `rowCategory` | Category string | Yes (must match row) |
| `disableKeyboardForButton` | Disable keyboard nav | Recommended |
| `autoBuyerTier` | Tier level | For autobuyers only |

**Important Class Names:**
- `'option-button'` - Base styling (required)
- `'red-disabled-text'` - Initial disabled color (required for affordability checking)
- `'green-ready-text'` - Available/ready color (added dynamically)
- `'building-purchase-button'` - Building category styling
- `'resource-cost-sell-check'` - Enables automatic affordability checking

---

## 4. Description Display

### Step 4.1: Build the Description String

The description shows the current price with all resource costs.

```javascript
descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'price'])}, 
${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[1])}, 
${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[1])}, 
${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[1])}`
```

This generates output like:
```
€5000, 500 Sodium, 1000 Carbon, 0 
```

---

## 5. Purchase Flow

### Step 5.1: The `gain()` Function

When button is clicked, `gain()` handles the purchase:

```javascript
gain(incrementAmount, elementId, item, ABOrTechPurchase, tierAB, resourceCategory, itemType)
```

**Parameters:**
- `incrementAmount`: How many to buy (usually 1)
- `elementId`: HTML element ID to update quantity display
- `item`: Upgrade identifier (e.g., 'battery1', 'powerPlant1')
- `ABOrTechPurchase`: `false` for normal buildings, `'techUnlock'` for tech, `'tier1'` etc for autobuyers
- `tierAB`: Autobuyer tier ('tier1', 'tier2', etc.) or `null`
- `resourceCategory`: Category string ('energy', 'space', 'resources')
- `itemType`: Data type ('resources', 'buildings', 'space', 'research')

**Example Calls:**

Building purchase:
```javascript
gain(1, 'battery1Quantity', 'battery1', false, null, 'energy', 'resources');
```

Power plant purchase:
```javascript
gain(1, 'powerPlant1Quantity', 'powerPlant1', false, null, 'energy', 'resources');
```

Autobuyer purchase:
```javascript
gain(1, 'hydrogenAB1Quantity', 'autoBuyer', 'tier1', 'tier1', 'hydrogen', 'resources');
```

Space upgrade purchase:
```javascript
gain(1, 'ssStructuralBuiltParts', 'ssStructural', false, null, 'space', 'space');
```

### Step 5.2: What `gain()` Does

1. **Gets current quantity** from resourceDataObject
2. **Adds incrementAmount** to quantity
3. **Calls setItemsToDeduct()** to queue resource deduction
4. **Calls setItemsToIncreasePrice()** to queue price increase
5. **Updates UI elements** with new quantity

---

## 6. Price Scaling

### Step 6.1: How Price Scaling Works

After each purchase, the price automatically increases.

**The price scaling system uses these functions in `game.js`:**

```javascript
// In gain() function, after quantity update:
setItemsToIncreasePrice(priceIncreaseName || itemToDeduct1Name, itemSetNewPrice, amountToDeduct, itemType, resourcePrices);
```

**Example: Building Price Scaling**
```javascript
// For batteries/power plants:
// - Cash price increases by 1.15x per purchase
// - Resource costs remain fixed (or scale differently)

// Example from code:
const costMultiplier = getGameCostMultiplier(); // typically 1.15
// New price = Old price * 1.15
```

### Step 6.2: Price Scaling in Action

The `setItemsToIncreasePrice()` function:
1. Receives the `setPrice` key from data object
2. Applies the cost multiplier (1.15 default)
3. Updates the price in resourceDataObject
4. New price is reflected in description on next UI update

---

## 7. Button Enable/Disable Logic

### Step 7.1: The Checking System

Buttons are automatically enabled/disabled based on affordability.

**CSS Classes Control Appearance:**
- `'red-disabled-text'` - Not affordable (red)
- `'green-ready-text'` - Affordable (green)

### Step 7.2: How the Check Works

The game has a timer-based checking system that:

1. **Finds all elements with checking classes:**
   - `'resource-cost-sell-check'` for resources
   - `'compound-cost-sell-check'` for compounds
   - `'building-purchase-button'` for buildings

2. **Reads data attributes from elements:**
   - `dataset.conditionCheck` - Type of check ('upgradeCheck')
   - `dataset.type` - Category ('energy')
   - `dataset.resourceToFuseTo` - Upgrade ID ('battery1')
   - `dataset.rowCategory` - Row category ('building')

3. **Compares player resources vs. costs:**
   - Cash cost vs. current cash
   - Resource1 cost vs. current resource1 quantity
   - Resource2 cost vs. current resource2 quantity
   - Resource3 cost vs. current resource3 quantity

4. **Applies/removes CSS classes:**
   ```javascript
   if (canAfford) {
       button.classList.remove('red-disabled-text');
       button.classList.add('green-ready-text');
       button.style.pointerEvents = 'auto';
   } else {
       button.classList.add('red-disabled-text');
       button.classList.remove('green-ready-text');
       button.style.pointerEvents = 'none';
   }
   ```

### Step 7.3: Checking Function Location

The affordability checking logic is in `game.js` and runs on a timer. It looks for elements with specific data attributes set by `createOptionRow()` and `createButton()`.

---

## 8. Color Coding (Red/Green)

### Step 8.1: CSS Classes

The game uses these standard classes defined in `styles.css`:

```css
.red-disabled-text {
    color: #ff4444;  /* Red - cannot afford */
    pointer-events: none;
}

.green-ready-text {
    color: #44ff44;  /* Green - can afford */
    pointer-events: auto;
}
```

### Step 8.2: How Classes Are Applied

**Initial State:**
```javascript
classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check']
```

**When Affordable (by checking system):**
```javascript
// Class red-disabled-text removed
// Class green-ready-text added
// pointer-events set to 'auto'
```

**When Not Affordable:**
```javascript
// Class green-ready-text removed
// Class red-disabled-text added
// pointer-events set to 'none'
```

---

## 9. Complete Working Example

### Battery Implementation (from drawTab2Content.js)

```javascript
// 1. DATA STRUCTURE (in resourceDataObject.js)
buildings: {
    energy: {
        upgrades: {
            battery1: {
                price: 5000,
                resource1Price: [500, 'sodium', 'resources'],
                resource2Price: [1000, 'carbon', 'resources'],
                resource3Price: [0, '', ''],
                capacity: 15000,
                quantity: 0,
                setPrice: 'battery1Price'
            }
        }
    }
}

// 2. UI CREATION (in drawTab2Content.js)
const battery1Row = createOptionRow({
    labelId: 'energyBattery1Row',
    labelText: 'Sodium Ion Battery:',
    inputElements: [
        createButton({
            text: `Add ${Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']) / 1000)} MWh`,
            classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check'],
            onClick: () => {
                gain(1, 'battery1Quantity', 'battery1', false, null, 'energy', 'resources');
                addToResourceAllTimeStat(1, 'allTimeSodiumIonBatteriesBuilt');
                setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
                switchBatteryStatBarWhenBatteryBought();
                setEnergyCapacity('battery1');
            },
            dataConditionCheck: 'upgradeCheck',
            resourcePriceObject: '',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'battery1',
            quantityArgument: 'cash',
            disableKeyboardForButton: true,
            rowCategory: 'building'
        }),
    ],
    descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'price'])}, 
    ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[1])}, 
    ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[1])}`,
    resourcePriceObject: '',
    dataConditionCheck: 'upgradeCheck',
    objectSectionArgument1: 'energy',
    objectSectionArgument2: 'battery1',
    quantityArgument: 'cash',
    startInvisibleValue: ['tech', 'sodiumIonPowerStorage'],  // Hidden until tech unlocked
    rowCategory: 'building'
});
optionContentElement.appendChild(battery1Row);
```

### Power Plant Implementation

```javascript
// 1. DATA STRUCTURE
buildings: {
    energy: {
        upgrades: {
            powerPlant1: {
                revealedBy: 'basicPowerGeneration',
                price: 300,
                resource1Price: [100, 'carbon', 'resources'],
                resource2Price: [0, '', ''],
                resource3Price: [0, '', ''],
                rate: 0.05,
                quantity: 0,
                setPrice: 'powerPlant1Price',
                fuel: ['carbon', 0.03, 'resources'],
                purchasedRate: 0,
                maxPurchasedRate: 0,
                weatherAffects: false
            }
        }
    }
}

// 2. UI CREATION
const powerPlant1Row = createOptionRow({
    labelId: 'energyPowerPlant1Row',
    labelText: 'Power Plant:',
    inputElements: [
        createButton({
            text: `Sell 1`,
            classNames: ['option-button', 'red-disabled-text', 'sell-building-button', 'resource-cost-sell-check'],
            onClick: () => {
                sellBuilding(1, 'powerPlant1');
                addBuildingPotentialRate('powerPlant1');
            },
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'powerPlant1',
            quantityArgument: 'cash',
            rowCategory: 'building'
        }),
        createButton({
            text: `Add ${Math.round(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'rate']) * getTimerRateRatio())} KW /s`,
            classNames: ['option-button', 'building-purchase-button', 'red-disabled-text', 'resource-cost-sell-check'],
            onClick: () => {
                gain(1, 'powerPlant1Quantity', 'powerPlant1', false, null, 'energy', 'resources');
                addBuildingPotentialRate('powerPlant1');
                if (getBuildingTypeOnOff('powerPlant1')) {
                    startUpdateTimersAndRates('powerPlant1', 'buy');
                }
            },
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'powerPlant1',
            quantityArgument: 'cash',
            rowCategory: 'building'
        }),
        // Toggle button (optional)
        createButton({
            text: toggleButtonText,
            classNames: ['option-button', 'toggle-timer', 'fuel-check', 'invisible', 'id_powerPlant1Toggle'],
            onClick: (event) => {
                const activeState = addOrRemoveUsedPerSecForFuelRate('carbon', event.target, 'resources', null, false);
                toggleBuildingTypeOnOff('powerPlant1', activeState);
                startUpdateTimersAndRates('powerPlant1', 'toggle');
            },
            dataConditionCheck: 'toggle',
            objectSectionArgument2: 'powerPlant1'
        })
    ],
    descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price'])}`,
    dataConditionCheck: 'upgradeCheck',
    objectSectionArgument1: 'energy',
    objectSectionArgument2: 'powerPlant1',
    quantityArgument: 'cash',
    rowCategory: 'building',
    noDescriptionContainer: [true, '25%', '70%']  // Custom widths
});
optionContentElement.appendChild(powerPlant1Row);
```

---

## Summary Checklist

When creating a new upgradeable item:

- [ ] **Data Structure**: Add entry to `resourceDataObject.js` with price, resources, quantity, setPrice
- [ ] **Row Creation**: Call `createOptionRow()` with proper dataConditionCheck and rowCategory
- [ ] **Button Creation**: Call `createButton()` with matching data attributes
- [ ] **Description**: Build string showing all costs using `getResourceDataObject()`
- [ ] **Click Handler**: Call `gain()` with correct parameters
- [ ] **CSS Classes**: Include 'red-disabled-text', 'resource-cost-sell-check', and row category class
- [ ] **Visibility**: Set `startInvisibleValue` if item should be hidden initially
- [ ] **Price Scaling**: Ensure `setPrice` property exists in data object

---

## Key Files Involved

| File | Purpose |
|------|---------|
| `resourceDataObject.js` | Data structure definitions |
| `ui.js` | `createOptionRow()`, `createButton()`, `setButtonState()` |
| `game.js` | `gain()`, price scaling logic, affordability checking |
| `drawTab2Content.js` | Energy/buildings tab examples |
| `drawTab1Content.js` | Resources tab examples |
| `drawTab5Content.js` | Space tab examples |
| `constantsAndGlobalVars.js` | Global state getters/setters |

---

## 10. Bulk Data Collection Functions

Three helper functions in `game.js` collect all game data at once for save/load operations and UI synchronization: `getAllQuantities()`, `getAllStorages()`, and `getAllElements()`.

---

### 10.1 What These Functions Do

| Function | Purpose | Returns |
|----------|---------|---------|
| `getAllQuantities()` | Collects current owned quantities of all items | Object with quantities for resources, compounds, buildings, rockets, starship modules, fleet ships, research |
| `getAllStorages()` | Collects storage capacity limits | Object with storage capacities for resources, compounds, and energy |
| `getAllElements()` | Collects HTML DOM element references | Object with references to all quantity display elements |

---

### 10.2 How These Come Into Play

**Save/Load System:**
When saving the game, `getAllQuantities()` is called to gather all current owned amounts. When loading, these values are restored to the game state.

**UI Synchronization:**
`getAllElements()` is used to batch-update all quantity displays on screen efficiently without querying the DOM repeatedly.

**Storage Validation:**
`getAllStorages()` checks if resources are within capacity limits before allowing purchases or generation.

---

### 10.3 What Needs Adding for New Upgradeable Items

When you create a new upgradeable item (e.g., `battery4`, `powerPlant4`, or a new fleet ship), you MUST add it to all three functions:

#### A. Add to `getAllQuantities()`

```javascript
function getAllQuantities() {
    // ... existing code for resources, compounds, rockets, etc. ...

    // BUILDINGS - Add your new item here
    allQuantities.battery1 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'quantity']);
    allQuantities.battery2 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'quantity']);
    allQuantities.battery3 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'quantity']);
    allQuantities.battery4 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery4', 'quantity']);  // ADD THIS LINE
    
    allQuantities.powerPlant1 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
    allQuantities.powerPlant2 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']);
    allQuantities.powerPlant3 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'quantity']);
    allQuantities.powerPlant4 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant4', 'quantity']);  // ADD THIS LINE

    // For Fleet Ships (dynamic based on current tab)
    if (getCurrentOptionPane() === 'fleet hangar') {
        fleetShips.forEach(ship => {
            allQuantities[ship] = getResourceDataObject('space', ['upgrades', ship, 'quantity']);
        });
        // Add new fleet ship
        allQuantities.fleetBattleCruiser = getResourceDataObject('space', ['upgrades', 'fleetBattleCruiser', 'quantity']);  // ADD THIS LINE
    }
    
    return allQuantities;
}
```

**Pattern to follow:**
```javascript
allQuantities.yourNewItem = getResourceDataObject('buildings', ['energy', 'upgrades', 'yourNewItem', 'quantity']);
```

#### B. Add to `getAllStorages()`

```javascript
function getAllStorages() {
    // ... existing code for resources and compounds ...

    allStorages.energy = getResourceDataObject('buildings', ['energy', 'storageCapacity']);
    
    // Buildings usually don't have individual storage (null), but add entry for consistency
    allStorages.battery1 = null;
    allStorages.battery2 = null;
    allStorages.battery3 = null;
    allStorages.battery4 = null;  // ADD THIS LINE
    
    allStorages.powerPlant1 = null;
    allStorages.powerPlant2 = null;
    allStorages.powerPlant3 = null;
    allStorages.powerPlant4 = null;  // ADD THIS LINE
    
    return allStorages;
}
```

**Note:** Buildings typically have `null` storage since they don't store resources directly (unlike resources/compounds which have storageCapacity).

#### C. Add to `getAllElements()`

```javascript
function getAllElements(resourcesArray, compoundsArray) {
    // ... existing code for resources, compounds with autobuyer quantities ...

    // ENERGY BUILDINGS
    allElements.energy = getElements().energyQuantity;
    allElements.battery1 = getElements().battery1Quantity;
    allElements.battery2 = getElements().battery2Quantity;
    allElements.battery3 = getElements().battery3Quantity;
    allElements.battery4 = getElements().battery4Quantity;  // ADD THIS LINE - matches element ID
    
    allElements.powerPlant1 = getElements().powerPlant1Quantity;
    allElements.powerPlant2 = getElements().powerPlant2Quantity;
    allElements.powerPlant3 = getElements().powerPlant3Quantity;
    allElements.powerPlant4 = getElements().powerPlant4Quantity;  // ADD THIS LINE

    // LAUNCH PAD (conditional based on current tab)
    if (getCurrentOptionPane() === 'launch pad') {
        allElements.rocket1BuiltParts = document.getElementById('rocket1BuiltPartsQuantity');
        // Add new rocket
        allElements.rocket5BuiltParts = document.getElementById('rocket5BuiltPartsQuantity');  // ADD THIS LINE
    }
    
    // FLEET HANGAR (conditional)
    else if (getCurrentOptionPane() === 'fleet hangar') {
        allElements.fleetEnvoy = document.getElementById('fleetEnvoyQuantity');
        // Add new fleet ship
        allElements.fleetBattleCruiser = document.getElementById('fleetBattleCruiserQuantity');  // ADD THIS LINE
    }

    return allElements;
}
```

**Important:** The element ID (e.g., `battery4Quantity`) must match the ID you used in your UI creation code when you called `gain(1, 'battery4Quantity', ...)`. The ID comes from `getElements()` which is typically defined in `constantsAndGlobalVars.js`.

---

### 10.4 Complete Code Reference

**From `game.js` lines 4983-5080:**

```javascript
function getAllQuantities() {
    const resourceKeys = Object.keys(getResourceDataObject('resources'));
    const compoundKeys = Object.keys(getResourceDataObject('compounds'));
    const rockets = Object.keys(getResourceDataObject('space', ['upgrades']))
    .filter(rocket => rocket.startsWith('rocket'));
    const starshipModules = Object.keys(getResourceDataObject('space', ['upgrades']))
    .filter(module => module.startsWith('ss'));
    const fleetShips = Object.keys(getResourceDataObject('space', ['upgrades']))
    .filter(module => module.startsWith('fleet'));

    const allQuantities = {};

    // Resources - auto-generates quantities for all resources and their AB tiers
    resourceKeys.forEach(resource => {
        allQuantities[resource] = getResourceDataObject('resources', [resource, 'quantity']);
        allQuantities[`${resource}AB1Quantity`] = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
        allQuantities[`${resource}AB2Quantity`] = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', 'tier2', 'quantity']);
        allQuantities[`${resource}AB3Quantity`] = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', 'tier3', 'quantity']);
        allQuantities[`${resource}AB4Quantity`] = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', 'tier4', 'quantity']);
    });

    // Compounds - auto-generates quantities for all compounds and their AB tiers
    compoundKeys.forEach(compound => {
        allQuantities[compound] = getResourceDataObject('compounds', [compound, 'quantity']);
        allQuantities[`${compound}AB1Quantity`] = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
        allQuantities[`${compound}AB2Quantity`] = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', 'tier2', 'quantity']);
        allQuantities[`${compound}AB3Quantity`] = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', 'tier3', 'quantity']);
        allQuantities[`${compound}AB4Quantity`] = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', 'tier4', 'quantity']);
    });

    // Space items - conditional based on current tab
    if (getCurrentOptionPane() === 'launch pad') {
        rockets.forEach(rocket => {
            allQuantities[rocket] = getResourceDataObject('space', ['upgrades', rocket, 'builtParts']);
        });
    } else if (getCurrentOptionPane() === 'star ship') {
        starshipModules.forEach(module => {
            allQuantities[module] = getResourceDataObject('space', ['upgrades', module, 'builtParts']);
        });
    } else if (getCurrentOptionPane() === 'fleet hangar') {
        fleetShips.forEach(ship => {
            allQuantities[ship] = getResourceDataObject('space', ['upgrades', ship, 'quantity']);
        });
    }        

    // Energy buildings - MANUAL ENTRIES REQUIRED for new items
    allQuantities.energy = getResourceDataObject('buildings', ['energy', 'quantity']);
    allQuantities.battery1 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'quantity']);
    allQuantities.battery2 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'quantity']);
    allQuantities.battery3 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'quantity']);
    allQuantities.powerPlant1 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
    allQuantities.powerPlant2 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']);
    allQuantities.powerPlant3 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'quantity']);

    // Research buildings - MANUAL ENTRIES REQUIRED
    allQuantities.research = getResourceDataObject('research', ['quantity']);
    allQuantities.scienceKit = getResourceDataObject('research', ['upgrades', 'scienceKit', 'quantity']);
    allQuantities.scienceClub = getResourceDataObject('research', ['upgrades', 'scienceClub', 'quantity']);
    allQuantities.scienceLab = getResourceDataObject('research', ['upgrades', 'scienceLab', 'quantity']);

    return allQuantities;
}
```

**Key Insight:** Resources and compounds are auto-generated using `Object.keys()` loops, but **buildings, research, rockets, starship modules, and fleet ships require manual entries** for each new item.

---

## 11. Comprehensive Codebase Reference (Using battery1 as Example)

Based on a complete grep of the codebase for `battery1`, here are **ALL** the places you need to update when creating a new upgradeable item:

---

### 11.1 Data Structure Layer

#### A. `resourceDataObject.js` - Primary Data Definition
```javascript
buildings: {
    energy: {
        upgrades: {
            battery1: {
                price: 5000,
                resource1Price: [500, 'sodium', 'resources'],
                resource2Price: [1000, 'carbon', 'resources'],
                resource3Price: [0, '', ''],
                capacity: 15000,
                quantity: 0,
                setPrice: 'battery1Price'  // Used for price scaling
            }
        }
    }
}
```

---

### 11.2 UI Layer

#### B. `drawTab2Content.js` - Row and Button Creation
Create the row with `createOptionRow()` and `createButton()`:
- Label ID: `energyBattery1Row`
- Buy button with `gain(1, 'battery1Quantity', 'battery1', false, null, 'energy', 'resources')`
- Description showing price and resource costs

#### C. `constantsAndGlobalVars.js` - Element ID Registration
```javascript
export function getElements() {
    return {
        // ... other elements ...
        battery1Quantity: document.getElementById('battery1Quantity'),
        // Add new battery element IDs here
    };
}
```
**Note:** The ID `'battery1Quantity'` must match what you passed to `gain()` as the second parameter.

---

### 11.3 Game Logic Layer

#### D. `game.js` - setEnergyCapacity()
```javascript
export function setEnergyCapacity(battery) {
    const currentEnergyCap = getResourceDataObject('buildings', ['energy', 'storageCapacity']);
    const battery1Cap = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']);
    const battery2Cap = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'capacity']);
    const battery3Cap = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'capacity']);
    // ADD: const battery4Cap = getResourceDataObject(...)
    
    let newEnergyCap;
    switch (battery) {
        case 'battery1':
            newEnergyCap = currentEnergyCap + battery1Cap;
            break;
        case 'battery2':
            newEnergyCap = currentEnergyCap + battery2Cap;
            break;
        case 'battery3':
            newEnergyCap = currentEnergyCap + battery3Cap;
            break;
        // ADD: case 'battery4': ...
    }
    setResourceDataObject(newEnergyCap, 'buildings', ['energy', 'storageCapacity']);
}
```

#### E. `game.js` - getBuildingResourceDescriptionElements()
```javascript
function getBuildingResourceDescriptionElements() {
    const battery1BuyDescElement = document.getElementById('sodiumIonBatteryDescription');
    const battery1BuyPrice = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'price']);
    const battery1BuyResource1Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[0];
    const battery1BuyResource2Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[0];
    const battery1BuyResource3Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[0];
    
    return {
        battery1Buy: { 
            element: battery1BuyDescElement, 
            price: battery1BuyPrice, 
            resource1Price: battery1BuyResource1Price, 
            resource2Price: battery1BuyResource2Price, 
            resource3Price: battery1BuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[1])
        },
        // Add battery4Buy object here
    };
}
```

#### F. `game.js` - Bulk Data Collection (Already covered in Section 10)
- `getAllQuantities()` - Add quantity getter
- `getAllStorages()` - Add storage entry (null for buildings)
- `getAllElements()` - Add DOM element reference

---

### 11.4 Description Layer

#### H. `descriptions.js` - Row Description
```javascript
optionDescriptions = {
    // ... other descriptions ...
    energyBattery1Row: {
        content1: "Store small amount of energy for use if power starts being used faster than it can be generated.",
        content2: "",
        updateAt: ""
    },
    // Add energyBattery4Row here
}
```

---

## 12. Master Checklist - Creating a New Upgradeable Item

Use this comprehensive checklist when creating any new upgradeable item (battery, power plant, rocket, fleet ship, etc.):

### Phase 1: Data Layer
- [ ] **1. Add to `resourceDataObject.js`**
  - Define price, resource1Price, resource2Price, resource3Price
  - Set quantity: 0, setPrice: 'yourItemPrice'
  - Add any special properties (capacity, rate, fuel, etc.)

### Phase 2: UI Layer
- [ ] **2. Add element ID to `constantsAndGlobalVars.js`**
  - `yourItemQuantity: document.getElementById('yourItemQuantity')`
  - Must match the ID passed to `gain()`

- [ ] **3. Create row in `drawTab[XXX]Content.js`**
  - Call `createOptionRow()` with labelId, labelText, inputElements
  - Call `createButton()` with onClick handler calling `gain()`
  - Set dataConditionCheck: 'upgradeCheck', rowCategory: 'building'
  - Build descriptionText with prices

### Phase 3: Game Logic Layer
- [ ] **4. Add to `game.js` - setEnergyCapacity()** (if applicable)
  - Add case to switch statement for batteries

- [ ] **5. Add to `game.js` - getBuildingResourceDescriptionElements()** (if applicable)
  - Create description element getter
  - Create return object with element, price, resourcePrices

- [ ] **6. Add to `game.js` - Bulk Data Functions**
  - `getAllQuantities()` - Add quantity getter line
  - `getAllStorages()` - Add storage entry (usually null)
  - `getAllElements()` - Add DOM element reference

### Phase 4: Descriptions
- [ ] **7. Add to `descriptions.js`**
  - Row description in `optionDescriptions`

### Phase 5: Verification
- [ ] **8. Verify Element ID Consistency**
  - ID in `constantsAndGlobalVars.js` matches
  - ID passed to `gain()` as second parameter matches
  - ID used in `getAllElements()` matches

---

### Quick Reference: File-by-File Summary

| File | What to Add | Example Function/Location |
|------|-------------|---------------------------|
| `resourceDataObject.js` | Data structure | `buildings.energy.upgrades.battery4` |
| `constantsAndGlobalVars.js` | Element ID | `battery4Quantity: document.getElementById('battery4Quantity')` |
| `drawTab2Content.js` | UI row/button | `createOptionRow()`, `createButton()` |
| `game.js` | Energy capacity logic | `setEnergyCapacity()` - add switch case |
| `game.js` | Description elements | `getBuildingResourceDescriptionElements()` |
| `game.js` | Bulk data collection | `getAllQuantities()`, `getAllStorages()`, `getAllElements()` |
| `events.js` | Event handling | `getHighestBatteryTierWithQuantity()` tier array |
| `descriptions.js` | Row description | `optionDescriptions.energyBattery4Row` |

---
