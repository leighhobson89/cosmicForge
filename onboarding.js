import {
    getOnboardingMode,
    setOnboardingMode,
    getCurrentTab,
    getCurrentTheme
} from './constantsAndGlobalVars.js';

import { getResourceDataObject } from './resourceDataObject.js';

import {
    onboardingModalHeader,
    onboardingModalText
} from './descriptions.js';

let shouldPromptOnboarding = false;

export function setShouldPromptOnboarding(value) {
    shouldPromptOnboarding = Boolean(value);
}

export async function promptOnboardingIfNeeded({ callPopupModal, showHideModal } = {}) {
    if (!shouldPromptOnboarding) {
        return;
    }

    if (typeof callPopupModal !== 'function') {
        shouldPromptOnboarding = false;
        return;
    }

    await new Promise((resolve) => {
        callPopupModal(
            onboardingModalHeader,
            onboardingModalText,
            true,
            true,
            false,
            false,
            () => {
                setOnboardingMode(true);
                showHideModal?.();
                resolve();
            },
            () => {
                setOnboardingMode(false);
                showHideModal?.();
                resolve();
            },
            null,
            null,
            'YES',
            'NO',
            null,
            null,
            false
        );
    });

    shouldPromptOnboarding = false;
}

let onboardingSteps = null;
let onboardingSegments = null;
let onboardingSegmentIndex = 0;
let onboardingAwaitingCompletionConfirm = false;
let onboardingClickTargetEl = null;
let onboardingClickHandler = null;
let lastOnboardingRenderMs = 0;
let onboardingRenderDirty = true;
let onboardingExitButton = null;
const ONBOARDING_HIGHLIGHT_PADDING = 5;

function ensureOnboardingExitButton() {
    if (onboardingExitButton && document.body.contains(onboardingExitButton)) {
        return onboardingExitButton;
    }

    const button = document.getElementById('onboardingExitButton') || document.createElement('button');
    button.id = 'onboardingExitButton';
    button.type = 'button';
    button.textContent = 'Exit Onboarding';
    button.className = 'option-button onboarding-exit-button';

    if (!button.dataset.onboardingExitHandlerAttached) {
        button.dataset.onboardingExitHandlerAttached = 'true';
        button.addEventListener('click', () => {
            setOnboardingMode(false);
            resetOnboardingProgression();
        });
    }

    if (!document.body.contains(button)) {
        document.body.appendChild(button);
    }

    onboardingExitButton = button;
    return onboardingExitButton;
}

function cleanupOnboardingClickListener() {
    if (onboardingClickTargetEl && onboardingClickHandler) {
        onboardingClickTargetEl.removeEventListener('click', onboardingClickHandler, true);
    }

    onboardingClickTargetEl = null;
    onboardingClickHandler = null;
}

function resetOnboardingProgression() {
    onboardingSegmentIndex = 0;
    onboardingAwaitingCompletionConfirm = false;
    onboardingSegments = null;
    cleanupOnboardingClickListener();
}

function normalizeTabLabel(value) {
    const raw = (value ?? '').toString().trim().toLowerCase();
    if (!raw) {
        return '';
    }

    if (raw === '☰') {
        return 'settings';
    }

    return raw.replace(/\s+/g, ' ');
}

function isOnboardingTabSatisfied(requiredTab) {
    if (!requiredTab) {
        return true;
    }

    const current = normalizeTabLabel(getCurrentTab?.()?.[1]);
    const desired = normalizeTabLabel(requiredTab);
    if (!current || !desired) {
        return true;
    }

    if (current === desired) {
        return true;
    }

    return current.includes(desired) || desired.includes(current);
}

function getRequiredTabForSegment(segment) {
    if (!segment || !Array.isArray(segment.items)) {
        return null;
    }

    for (const step of segment.items) {
        if (!Array.isArray(step) || step.length === 0) {
            continue;
        }

        const type = step[0];
        if (type === 'callout') {
            if (typeof step[1] === 'number' && typeof step[2] === 'number') {
                if (typeof step[4] === 'string') {
                    return step[4];
                }
            } else if (typeof step[3] === 'string') {
                return step[3];
            }
        }

        if ((type === 'buttonOverlay' || type === 'divOverlay') && typeof step[2] === 'string') {
            return step[2];
        }
    }

    return null;
}

function normalizeOnboardingSteps(steps) {
    if (!Array.isArray(steps)) {
        return [];
    }

    const normalized = [];

    steps.forEach(step => {
        if (!Array.isArray(step) || step.length === 0) {
            normalized.push(step);
            return;
        }

        if (step[0] === 'spotlight') {
            const [, targetSpec, message] = step;
            let rawOptions = null;
            let requiredTab = null;
            if (step.length >= 5 && typeof step[4] === 'string') {
                rawOptions = step[3];
                requiredTab = step[4];
            } else if (step.length >= 4 && typeof step[3] === 'string') {
                requiredTab = step[3];
            } else {
                rawOptions = step[3];
            }

            const options = (rawOptions && typeof rawOptions === 'object') ? rawOptions : {};
            const highlightMode = options.highlightMode === 'div' ? 'div' : (options.highlightMode === 'none' ? 'none' : 'button');
            const waitForClick = options.waitForClick !== false;

            if (message !== undefined && message !== null) {
                if (requiredTab) {
                    normalized.push(['callout', targetSpec, message, requiredTab]);
                } else {
                    normalized.push(['callout', targetSpec, message]);
                }
            }

            if (highlightMode === 'div') {
                if (requiredTab) {
                    normalized.push(['divOverlay', targetSpec, requiredTab]);
                } else {
                    normalized.push(['divOverlay', targetSpec]);
                }
            } else if (highlightMode === 'button') {
                if (requiredTab) {
                    normalized.push(['buttonOverlay', targetSpec, requiredTab]);
                } else {
                    normalized.push(['buttonOverlay', targetSpec]);
                }
            }

            if (waitForClick) {
                normalized.push(['waitForClick', targetSpec]);
            }

            return;
        }

        if (step[0] === 'timedSpotlight') {
            const [, targetSpec, message, msRaw] = step;
            let rawOptions = null;
            let requiredTab = null;
            if (step.length >= 6 && typeof step[5] === 'string') {
                rawOptions = step[4];
                requiredTab = step[5];
            } else if (step.length >= 5 && typeof step[4] === 'string') {
                requiredTab = step[4];
            } else {
                rawOptions = step[4];
            }

            const options = (rawOptions && typeof rawOptions === 'object') ? rawOptions : {};
            const highlightMode = options.highlightMode === 'div' ? 'div' : (options.highlightMode === 'none' ? 'none' : 'button');
            const waitMs = Math.max(0, Number(msRaw) || 0);

            if (message !== undefined && message !== null) {
                if (requiredTab) {
                    normalized.push(['callout', targetSpec, message, requiredTab]);
                } else {
                    normalized.push(['callout', targetSpec, message]);
                }
            }

            if (highlightMode === 'div') {
                if (requiredTab) {
                    normalized.push(['divOverlay', targetSpec, requiredTab]);
                } else {
                    normalized.push(['divOverlay', targetSpec]);
                }
            } else if (highlightMode === 'button') {
                if (requiredTab) {
                    normalized.push(['buttonOverlay', targetSpec, requiredTab]);
                } else {
                    normalized.push(['buttonOverlay', targetSpec]);
                }
            }

            normalized.push(['waitForMs', waitMs]);
            return;
        }

        normalized.push(step);
    });

    return normalized;
}

export function setOnboardingSteps(steps) {
    onboardingSteps = Array.isArray(steps) ? normalizeOnboardingSteps(steps) : null;
    resetOnboardingProgression();
    onboardingRenderDirty = true;
}

function buildOnboardingSegments(steps) {
    const segments = [];
    let currentItems = [];

    const pushSegment = (overrides = {}) => {
        segments.push({
            items: currentItems,
            waitForClickTarget: overrides.waitForClickTarget ?? null,
            condition: overrides.condition ?? null,
            waitForElementTarget: overrides.waitForElementTarget ?? null,
            waitForElementTimeout: overrides.waitForElementTimeout ?? 0,
            waitForMs: overrides.waitForMs ?? 0,
            waitDeadline: null
        });
        currentItems = [];
    };

    for (const step of steps) {
        if (!Array.isArray(step)) {
            continue;
        }

        if (step[0] === 'waitForClick') {
            pushSegment({ waitForClickTarget: step[1] });
            continue;
        }

        if (step[0] === 'condition') {
            pushSegment({ condition: step });
            continue;
        }

        if (step[0] === 'waitForElement') {
            pushSegment({ waitForElementTarget: step[1], waitForElementTimeout: Number(step[2]) || 0 });
            continue;
        }

        if (step[0] === 'waitForMs') {
            pushSegment({ waitForMs: Number(step[1]) || 0 });
            continue;
        }

        currentItems.push(step);
    }

    if (currentItems.length > 0) {
        pushSegment();
    }

    return segments;
}

function clearOnboardingOverlay(overlay) {
    while (overlay.firstChild) {
        const child = overlay.firstChild;
        if (child && child.id === 'onboardingExitButton') {
            overlay.removeChild(child);
            continue;
        }
        overlay.removeChild(child);
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function formatOnboardingText(raw) {
    if (raw === null || raw === undefined) {
        return '';
    }

    const str = String(raw);
    if (!str.includes('*')) {
        return str;
    }

    return str.replace(/\*/g, '\n');
}

function getElementCenterPoint(el) {
    if (!el || !el.getBoundingClientRect) {
        return null;
    }

    const rect = el.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
        return null;
    }

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function addOnboardingCallout(svg, overlay, targetOrX, yMaybe, textMaybe) {
    let targetPoint = null;
    let text = '';
    let targetEl = null;
    let targetRect = null;

    if (typeof targetOrX === 'number' && typeof yMaybe === 'number') {
        targetPoint = { x: targetOrX, y: yMaybe };
        text = formatOnboardingText(textMaybe);
    } else {
        targetEl = resolveOnboardingTargetElement(targetOrX);
        text = formatOnboardingText(yMaybe);

        if (targetEl) {
            const { rect } = getHighlightTargetWithRect(targetEl);
            if (rect) {
                targetRect = rect;
                targetPoint = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            } else {
                targetPoint = getElementCenterPoint(targetEl);
                targetRect = targetEl?.getBoundingClientRect?.() ?? null;
            }
        }
    }

    if (!targetPoint) {
        return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;
    const gap = 18;

    const targetWidth = targetRect?.width ?? 0;
    const baseGap = 18;
    const requiredArrowLength = targetWidth > 0 ? targetWidth * 2 : 0;
    const arrowLength = Math.max(baseGap, requiredArrowLength);
    const labelClearance = 16;
    const horizontalOffset = arrowLength + labelClearance;
    const verticalOffset = arrowLength + labelClearance;

    const measure = document.createElement('div');
    measure.className = 'onboarding-step-text';
    measure.style.left = '0px';
    measure.style.top = '0px';
    measure.style.visibility = 'hidden';
    measure.style.maxWidth = `${Math.max(140, vw - margin * 2)}px`;
    measure.textContent = text;
    overlay.appendChild(measure);

    const rect = measure.getBoundingClientRect();
    const boxW = rect.width || 260;
    const boxH = rect.height || 60;

    const candidates = [
        { dir: 'left', left: targetPoint.x - horizontalOffset - boxW, top: targetPoint.y - boxH / 2 },
        { dir: 'right', left: targetPoint.x + horizontalOffset, top: targetPoint.y - boxH / 2 },
        { dir: 'up', left: targetPoint.x - boxW / 2, top: targetPoint.y - verticalOffset - boxH },
        { dir: 'down', left: targetPoint.x - boxW / 2, top: targetPoint.y + verticalOffset }
    ];

    let best = null;
    for (const c of candidates) {
        const clampedLeft = clamp(c.left, margin, vw - margin - boxW);
        const clampedTop = clamp(c.top, margin, vh - margin - boxH);
        const score = Math.abs(clampedLeft - c.left) + Math.abs(clampedTop - c.top);

        if (!best || score < best.score) {
            best = {
                dir: c.dir,
                left: clampedLeft,
                top: clampedTop,
                score
            };
        }
    }

    measure.style.left = `${best.left}px`;
    measure.style.top = `${best.top}px`;
    measure.style.visibility = '';

    const tail = (() => {
        if (best.dir === 'left') return { x: best.left + boxW, y: best.top + boxH / 2 };
        if (best.dir === 'right') return { x: best.left, y: best.top + boxH / 2 };
        if (best.dir === 'up') return { x: best.left + boxW / 2, y: best.top + boxH };
        return { x: best.left + boxW / 2, y: best.top };
    })();

    const arrowHeadPoint = targetRect ? getEllipseBoundaryPoint(targetPoint, tail, targetRect) : targetPoint;

    addOnboardingArrowBetweenPoints(svg, tail.x, tail.y, arrowHeadPoint.x, arrowHeadPoint.y);
}

function createOnboardingSvgLayer() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'onboarding-steps-svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    return svg;
}

function getLabelForInput(input) {
    if (!input || !input.id) {
        return null;
    }

    const escapedId = typeof CSS !== 'undefined' && CSS?.escape ? CSS.escape(input.id) : input.id;
    return document.querySelector(`label[for="${escapedId}"]`);
}

function findInputElementMatchingNeedle(lowerNeedle) {
    if (!lowerNeedle) {
        return null;
    }

    const inputs = Array.from(document.querySelectorAll('input'));
    for (const input of inputs) {
        const labelForInput = getLabelForInput(input);
        const candidates = [
            input.value,
            input.placeholder,
            input.getAttribute?.('aria-label'),
            input.getAttribute?.('title'),
            input.innerText,
            input.textContent,
            labelForInput?.innerText,
            labelForInput?.textContent,
            input.name
        ];

        for (const candidate of candidates) {
            const hay = (candidate || '').trim().toLowerCase();
            if (!hay) {
                continue;
            }

            if (hay === lowerNeedle || hay.includes(lowerNeedle)) {
                return input;
            }
        }
    }

    return null;
}

function getHighlightTargetWithRect(element) {
    if (!element) {
        return { target: null, rect: null };
    }

    const validate = (candidate) => {
        if (!candidate || !candidate.getBoundingClientRect) {
            return null;
        }

        const rect = candidate.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
            return { target: candidate, rect };
        }

        return null;
    };

    const direct = validate(element);
    if (direct) {
        return direct;
    }

    if (element.tagName === 'INPUT') {
        const labelForInput = getLabelForInput(element);
        const viaLabel = validate(labelForInput);
        if (viaLabel) {
            return viaLabel;
        }
    }

    let current = element.parentElement;
    while (current) {
        const viaParent = validate(current);
        if (viaParent) {
            return viaParent;
        }
        current = current.parentElement;
    }

    return { target: null, rect: null };
}

function resolveOnboardingTargetElement(identifier) {
    if (identifier === null || identifier === undefined) {
        return null;
    }

    let mode = null;
    let raw = identifier;
    if (Array.isArray(identifier) && identifier.length >= 2) {
        raw = identifier[0];
        mode = Number(identifier[1]);
    }

    const asString = String(raw).trim();
    if (!asString) {
        return null;
    }

    if (mode === 1) {
        return document.getElementById(asString);
    }

    if (mode !== 0) {
        const byId = document.getElementById(asString);
        if (byId) {
            return byId;
        }
    }

    const needle = asString.toLowerCase();

    const buttonCandidates = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]'));
    for (const candidate of buttonCandidates) {
        const text = (candidate.innerText || candidate.value || candidate.textContent || '').trim();
        const hay = text.toLowerCase();
        if (hay === needle || hay.includes(needle)) {
            return candidate;
        }
    }

    const inputMatch = findInputElementMatchingNeedle(needle);
    if (inputMatch) {
        return inputMatch;
    }

    const paragraphs = Array.from(document.querySelectorAll('p'));
    for (const paragraph of paragraphs) {
        const content = (paragraph.innerHTML || '').trim();
        const hay = content.toLowerCase();
        if (hay === needle || hay.includes(needle)) {
            return paragraph;
        }
    }

    const spanCandidates = Array.from(document.querySelectorAll('span'));
    for (const candidate of spanCandidates) {
        const text = (candidate.innerText || candidate.textContent || '').trim();
        const hay = text.toLowerCase();
        if (hay === needle || hay.includes(needle)) {
            return candidate;
        }
    }

    const divCandidates = Array.from(document.querySelectorAll('div'));
    for (const candidate of divCandidates) {
        const text = (candidate.innerText || candidate.textContent || '').trim();
        const hay = text.toLowerCase();
        if (hay === needle || hay.includes(needle)) {
            return candidate;
        }
    }

    return null;
}

function addOnboardingTextBlock(overlay, x, y, text, className = 'onboarding-step-text') {
    const el = document.createElement('div');
    el.className = className;

    if (Number.isFinite(Number(x)) && Number.isFinite(Number(y)) && className === 'onboarding-step-text') {
        el.style.left = `${Number(x) || 0}px`;
        el.style.top = `${Number(y) || 0}px`;
    }

    el.textContent = text ?? '';
    overlay.appendChild(el);
}

function computeArrowTail(x, y, facing, length = 90) {
    const fx = Number(x) || 0;
    const fy = Number(y) || 0;
    const dir = String(facing || 'left').toLowerCase();

    if (dir === 'right') return { x: fx + length, y: fy };
    if (dir === 'up') return { x: fx, y: fy - length };
    if (dir === 'down') return { x: fx, y: fy + length };
    return { x: fx - length, y: fy };
}

function addOnboardingArrowBetweenPoints(svg, startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    const headSize = 14;
    const wing = 7;

    const lineEndX = endX - ux * headSize;
    const lineEndY = endY - uy * headSize;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${startX}`);
    line.setAttribute('y1', `${startY}`);
    line.setAttribute('x2', `${lineEndX}`);
    line.setAttribute('y2', `${lineEndY}`);
    line.setAttribute('class', 'onboarding-step-arrow-line');
    svg.appendChild(line);

    const p2x = endX - ux * headSize - uy * wing;
    const p2y = endY - uy * headSize + ux * wing;
    const p3x = endX - ux * headSize + uy * wing;
    const p3y = endY - uy * headSize - ux * wing;

    const head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    head.setAttribute('points', `${endX},${endY} ${p2x},${p2y} ${p3x},${p3y}`);
    head.setAttribute('class', 'onboarding-step-arrow-head');
    svg.appendChild(head);
}

function addOnboardingArrow(svg, overlay, x, y, label, facing) {
    const headX = Number(x) || 0;
    const headY = Number(y) || 0;
    const tail = computeArrowTail(headX, headY, facing);

    addOnboardingArrowBetweenPoints(svg, tail.x, tail.y, headX, headY);

    if (label !== undefined && label !== null && String(label).trim() !== '') {
        const labelEl = document.createElement('div');
        labelEl.className = 'onboarding-step-arrow-label';
        labelEl.style.left = `${headX + 10}px`;
        labelEl.style.top = `${headY + 10}px`;
        labelEl.textContent = String(label);
        overlay.appendChild(labelEl);
    }
}

function createEllipseHighlight(overlay, rect, padding = ONBOARDING_HIGHLIGHT_PADDING) {
    if (!rect || rect.width <= 0 || rect.height <= 0) {
        return;
    }

    const highlight = document.createElement('div');
    highlight.className = 'onboarding-step-highlight';
    highlight.style.left = `${rect.left - padding}px`;
    highlight.style.top = `${rect.top - padding}px`;
    highlight.style.width = `${rect.width + padding * 2}px`;
    highlight.style.height = `${rect.height + padding * 2}px`;
    overlay.appendChild(highlight);
}

function getEllipseBoundaryPoint(centerPoint, towardsPoint, targetRect) {
    if (!centerPoint || !towardsPoint || !targetRect) {
        return centerPoint;
    }

    const halfWidth = (targetRect.width + ONBOARDING_HIGHLIGHT_PADDING * 2) / 2;
    const halfHeight = (targetRect.height + ONBOARDING_HIGHLIGHT_PADDING * 2) / 2;

    if (halfWidth <= 0 || halfHeight <= 0) {
        return centerPoint;
    }

    const dx = towardsPoint.x - centerPoint.x;
    const dy = towardsPoint.y - centerPoint.y;

    if (dx === 0 && dy === 0) {
        return centerPoint;
    }

    const denom = Math.sqrt((dx * dx) / (halfWidth * halfWidth) + (dy * dy) / (halfHeight * halfHeight));
    if (!Number.isFinite(denom) || denom <= 0) {
        return centerPoint;
    }

    const u = Math.min(1 / denom, 1);

    return {
        x: centerPoint.x + dx * u,
        y: centerPoint.y + dy * u
    };
}

function addOnboardingButtonHighlight(overlay, identifier) {
    const target = resolveOnboardingTargetElement(identifier);
    if (!target) {
        return;
    }

    const { rect } = getHighlightTargetWithRect(target);
    if (!rect) {
        return;
    }

    createEllipseHighlight(overlay, rect);
}

function addOnboardingDivOverlay(overlay, label, requiredTab) {
    if (Array.isArray(label) && Number(label[1]) === 1) {
        const el = resolveOnboardingTargetElement(label);
        const rect = el?.getBoundingClientRect?.();
        if (rect) {
            createEllipseHighlight(overlay, rect);
        }
        return;
    }

    const needle =
        Array.isArray(label) && Number(label[1]) === 0
            ? String(label[0] ?? '').trim()
            : (typeof label === 'string' ? label.trim() : '');

    if (!needle) {
        return;
    }

    const highlightElements = [
        ...Array.from(document.querySelectorAll('p')),
        ...Array.from(document.querySelectorAll('div')),
        ...Array.from(document.querySelectorAll('span'))
    ];

    highlightElements.forEach(element => {
        const content = (element.innerText || element.textContent || '').trim();
        if (content === needle) {
            const rect = element.getBoundingClientRect();
            createEllipseHighlight(overlay, rect);
        }
    });
}

function checkOnboardingCondition(conditionStep, calculateResearchRatePerTick) {
    if (!Array.isArray(conditionStep) || conditionStep[0] !== 'condition') {
        return false;
    }

    const pathSpec = conditionStep[2];
    const threshold = conditionStep[3];
    const comparatorRaw = conditionStep.length > 4 ? conditionStep[4] : undefined;

    if (!Array.isArray(pathSpec) || pathSpec.length < 2) {
        return false;
    }

    const category = pathSpec[0];
    const path = pathSpec.slice(1);

    let currentRaw;
    if (category === 'computed') {
        const computedKey = path[0];
        if (computedKey === 'researchRatePerTick') {
            currentRaw = calculateResearchRatePerTick?.();
        } else if (computedKey === 'currentTheme') {
            currentRaw = getCurrentTheme?.();
        } else {
            return false;
        }
    } else {
        currentRaw = getResourceDataObject(category, path, true);
    }

    const comparator = typeof comparatorRaw === 'string' ? comparatorRaw.toLowerCase() : 'gte';

    if (typeof currentRaw === 'string' || typeof threshold === 'string') {
        const currentStr = (currentRaw ?? '').toString().trim().toLowerCase();
        const targetStr = (threshold ?? '').toString().trim().toLowerCase();

        switch (comparator) {
            case 'ne':
            case '!=':
                return currentStr !== targetStr;
            case 'eq':
            case '==':
            default:
                return currentStr === targetStr;
        }
    }

    const current = typeof currentRaw === 'number' ? currentRaw : Number(currentRaw);
    const target = typeof threshold === 'number' ? threshold : Number(threshold);

    if (!Number.isFinite(current) || !Number.isFinite(target)) {
        return false;
    }

    const epsilon = 1e-9;

    switch (comparator) {
        case 'gt':
        case '>':
            return current > target + epsilon;
        case 'lt':
        case '<':
            return current < target - epsilon;
        case 'lte':
        case '<=':
            return current <= target + epsilon;
        case 'eq':
        case '==':
            return Math.abs(current - target) <= epsilon;
        case 'ne':
        case '!=':
            return Math.abs(current - target) > epsilon;
        case 'gte':
        case '>=':
        default:
            return current >= target - epsilon;
    }
}

function renderOnboardingSteps(overlay, steps, requiredTab = null) {
    clearOnboardingOverlay(overlay);

    const svg = createOnboardingSvgLayer();
    overlay.appendChild(svg);

    if (!isOnboardingTabSatisfied(requiredTab)) {
        const tabLabel = requiredTab ? String(requiredTab).trim() : 'required';
        addOnboardingTextBlock(
            overlay,
            null,
            null,
            `Please return to the ${tabLabel} tab or exit Onboarding Mode`,
            'onboarding-tab-warning'
        );
        return;
    }

    for (const step of steps) {
        if (!Array.isArray(step) || step.length === 0) {
            continue;
        }

        const type = step[0];
        if (type === 'textBlock') {
            addOnboardingTextBlock(overlay, step[1], step[2], step[3]);
        } else if (type === 'arrow') {
            const label = step.length > 3 ? step[3] : null;
            let facing = step.length > 4 ? step[4] : undefined;

            if (step.length === 4 && typeof label === 'string') {
                const lower = label.toLowerCase();
                if (['left', 'right', 'up', 'down'].includes(lower)) {
                    facing = label;
                    addOnboardingArrow(svg, overlay, step[1], step[2], null, facing);
                    continue;
                }
            }

            addOnboardingArrow(svg, overlay, step[1], step[2], label, facing);
        } else if (type === 'callout') {
            if (typeof step[1] === 'number' && typeof step[2] === 'number') {
                addOnboardingCallout(svg, overlay, step[1], step[2], step[3]);
            } else {
                addOnboardingCallout(svg, overlay, step[1], step[2]);
            }
        } else if (type === 'buttonOverlay') {
            addOnboardingButtonHighlight(overlay, step[1]);
        } else if (type === 'divOverlay') {
            addOnboardingDivOverlay(overlay, step[1], requiredTab);
        } else if (type === 'waitForClick') {
            continue;
        } else if (type === 'condition') {
            continue;
        }
    }
}

export function onboardingChecks(
    {
        callPopupModal,
        showHideModal,
        calculateResearchRatePerTick
    } = {}
) {
    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay) {
        return;
    }

    const exitButton = ensureOnboardingExitButton();

    if (!getOnboardingMode()) {
        overlay.style.display = 'none';
        exitButton.style.display = 'none';
        onboardingRenderDirty = true;
        resetOnboardingProgression();
        return;
    }

    if (onboardingAwaitingCompletionConfirm) {
        overlay.style.display = 'none';
        exitButton.style.display = 'none';
        return;
    }

    overlay.style.display = 'block';
    exitButton.style.display = 'flex';
    exitButton.style.justifyContent = 'center';
    exitButton.style.alignItems = 'center';

    if (!onboardingSteps) {
        setOnboardingSteps([
            ['spotlight', ['Hydrogen', 0], 'Click the Hydrogen Option', { highlightMode: 'div' }, 'Resources'],
            ['spotlight', ['Gain', 0], 'Click the Gain button', 'Resources'],
            ['spotlight', ['hydrogenQuantity', 1], 'Continue clicking Gain until you have 50 Hydrogen', { waitForClick: false }, 'Resources'],
            ['condition', ['hydrogenQuantity', 1], ['resources', 'hydrogen', 'quantity'], 50],
            ['spotlight', ['Add 2 Hydrogen /s', 0], 'Buy a Hydrogen AutoBuyer', 'Resources'],
            ['spotlight', ['tab3', 1], 'Click the Research Tab', { waitForElementTarget: ['Research', 0], waitForElementTimeout: 4000 }, 'Resources'],
            ['spotlight', ['researchOption', 1], 'Click Research', { highlightMode: 'div' }, 'Research'],
            ['spotlight', ['Add 0.5 Research /s', 0], 'Buy 3 Science Kits', { waitForClick: false }, 'Research'],
            ['condition', ['Add 0.5 Research /s', 0], ['research', 'upgrades', 'scienceKit', 'quantity'], 3],
            ['spotlight', ['scienceKitToggle', 1], 'Turn off the Science Kit toggle', { waitForClick: false }, 'Research'],
            ['condition', ['scienceKitToggle', 1], ['computed', 'researchRatePerTick'], 0, 'eq'],
            ['timedSpotlight', ['researchRate', 1], 'You can switch on and off many items in the game and when off they wont produce*but wont consume energy', 4000, 'Research'],
            ['spotlight', ['scienceKitToggle', 1], 'Turn the Science Kit toggle back on', { waitForClick: false }, 'Research'],
            ['condition', ['scienceKitToggle', 1], ['computed', 'researchRatePerTick'], 0, 'gt'],
            ['spotlight', ['tab1', 1], 'Return to the Resources Tab', { waitForElementTarget: ['Hydrogen', 0], waitForElementTimeout: 4000 }, 'Research'],
            ['timedSpotlight', ['hydrogenQuantity', 1], 'Eventually your storage will fill up*and you will need to expand it.', 4000, 'Resources'],
            ['spotlight', ['Increase storage', 0], 'Click the Increase Storage Button when storage full.', 'Resources'],
            ['timedSpotlight', ['hydrogenQuantity', 1], 'It cost you all your Hydrogen but now you can store double.', 3000, 'Resources'],
            ['timedSpotlight', ['Gain', 0], 'Feel free to click Gain to help your Auto Buyer along.', 3000, 'Resources'],
            ['condition', ['hydrogenQuantity', 1], ['resources', 'hydrogen', 'quantity'], 300],
            ['spotlight', ['Sell', 0], 'Click the Sell Button.', 'Resources'],
            ['timedSpotlight', ['cashStat', 1], 'Your Cash is shown here.', 3000, 'Resources'],
            ['spotlight', ['tab3', 1], "Let's return to the Research Tab", 'Resources'],
            ['spotlight', ['Technology', 0], 'Click Technology', 'Research'],
            ['timedSpotlight', ['Technology', 0], 'Here you can see and select technologies to Research.', 3000, 'Research'],
            ['spotlight', ['Tech Tree', 0], 'Click Tech Tree', 'Research'],
            ['timedSpotlight', ['Tech Tree', 0], 'Here you see a graphical representation of techs. * It will grow out as you continue progression in the game.', 4000, 'Research'],
            ['spotlight', ['Technology', 0], 'Return to the Technology Option', 'Research'],
            ['spotlight', ['RESEARCH', 0], 'When you have 150 Research, click Research on Knowledge Sharing', 'Research'],
            ['spotlight', ['researchOption', 1], 'Click Research', 'Research'],
            ['timedSpotlight', ['Add 8 Research /s', 0], 'Once you save up more Cash you can buy a Science Club * You will Research much faster!', 4000, 'Research'],
            ['spotlight', ['tab8', 1], 'Next we will take a look at the Settings Tab.', 'Research'],
            ['spotlight', ['Visual', 0], 'While we are here, lets change the look and feel.', 'Settings'],
            ['timedSpotlight', ['themeSelect', 1], 'In this menu you can customise the look and feel of the game.*Scroll down to find Themes.', 4000, 'Settings'],
            ['spotlight', ['themeSelect', 1], 'Click the Dropdown', 'Settings'],
            ['spotlight', ['themeSelect', 1], 'Select Dark', 'Settings'],
            ['condition', ['themeSelect', 1], ['computed', 'currentTheme'], 'dark', 'eq'],
            ['spotlight', ['Game Options', 0], 'Now Click Game Options', 'Settings'],
            ['spotlight', ['backGroundAudioToggle', 1], 'Click the Background Ambience Option toggle switch', 'Settings'],
            ['timedSpotlight', ['backGroundAudioToggle', 1], 'There, some ambience!* Now I will show you the help file * so you can learn more about the game and really enjoy it!', 4000, 'Settings'],
            ['spotlight', ['Cosmicopedia', 0], 'Click Cosmicopedia', 'Settings'],
            ['timedSpotlight', ['Get Started', 0], 'Get Started will go over the steps you performed in*this tutorial', 4000, 'Settings'],
            ['timedSpotlight', ['Story', 0], 'Story gives you the background and lore around the game', 4000, 'Settings'],
            ['spotlight', ['Concepts - Early', 0], "Click 'Concepts - Early'", 'Settings'],
            ['spotlight', ['Concepts - Mid', 0], "When you are done Click 'Concepts - Mid Game'", 'Settings'],
            ['spotlight', ['Concepts - Late', 0], "When you are done Click 'Concepts - Late'", 'Settings'],
            ['timedSpotlight', ['Concepts - Late', 0], 'This is all the background you need!  One last thing before I leave * you to explore and Forge!', 4000, 'Settings'],
            ['spotlight', ['Saving / Loading', 0], "Click 'Saving / Loading'", 'Settings'],
            ['spotlight', ['autoSaveToggle', 1], 'Click The Autosave Toggle Switch', 'Settings'],
            ['timedSpotlight', ['autoSaveToggle', 1], "You game will now save periodocally*Thats it!  Go forth and Forge, Mia'Plac!", 7000, 'Settings'],
        ]);
    }

    if (!onboardingSegments) {
        onboardingSegments = buildOnboardingSegments(onboardingSteps);
        onboardingSegmentIndex = 0;
    }

    const currentSegment = onboardingSegments[onboardingSegmentIndex];
    if (!currentSegment) {
        onboardingAwaitingCompletionConfirm = true;
        cleanupOnboardingClickListener();
        overlay.style.display = 'none';

        if (typeof callPopupModal === 'function') {
            callPopupModal(
                'ONBOARDING COMPLETE',
                'Onboarding is over.',
                true,
                false,
                false,
                false,
                () => {
                    setOnboardingMode(false);
                    resetOnboardingProgression();
                    showHideModal?.();
                },
                null,
                null,
                null,
                'CONTINUE',
                null,
                null,
                null,
                false
            );
        } else {
            setOnboardingMode(false);
            resetOnboardingProgression();
        }

        return;
    }

    const requiredTab = getRequiredTabForSegment(currentSegment);
    const tabSatisfied = isOnboardingTabSatisfied(requiredTab);
    if (!tabSatisfied) {
        currentSegment.waitDeadline = null;
        cleanupOnboardingClickListener();

        const now = Date.now();
        if (onboardingRenderDirty || now - lastOnboardingRenderMs > 150) {
            renderOnboardingSteps(overlay, currentSegment.items, requiredTab);
            lastOnboardingRenderMs = now;
            onboardingRenderDirty = false;
        }
        return;
    }

    if (currentSegment.condition) {
        if (checkOnboardingCondition(currentSegment.condition, calculateResearchRatePerTick)) {
            onboardingSegmentIndex += 1;
            onboardingRenderDirty = true;
            cleanupOnboardingClickListener();
            return;
        }
    }

    if (currentSegment.waitForElementTarget) {
        const el = resolveOnboardingTargetElement(currentSegment.waitForElementTarget);
        if (el) {
            onboardingSegmentIndex += 1;
            onboardingRenderDirty = true;
            cleanupOnboardingClickListener();
            return;
        }

        if (currentSegment.waitForElementTimeout > 0) {
            if (!currentSegment.waitDeadline) {
                currentSegment.waitDeadline = Date.now() + currentSegment.waitForElementTimeout;
            } else if (Date.now() >= currentSegment.waitDeadline) {
                onboardingSegmentIndex += 1;
                onboardingRenderDirty = true;
                cleanupOnboardingClickListener();
                return;
            }
        }
    }

    if (currentSegment.waitForMs > 0 && !currentSegment.waitForClickTarget) {
        if (!currentSegment.waitDeadline) {
            currentSegment.waitDeadline = Date.now() + currentSegment.waitForMs;
        } else if (Date.now() >= currentSegment.waitDeadline) {
            onboardingSegmentIndex += 1;
            onboardingRenderDirty = true;
            cleanupOnboardingClickListener();
            return;
        }
    }

    if (currentSegment.waitForClickTarget) {
        const desiredTargetEl = resolveOnboardingTargetElement(currentSegment.waitForClickTarget);

        if (!desiredTargetEl) {
            cleanupOnboardingClickListener();
        } else if (onboardingClickTargetEl !== desiredTargetEl) {
            cleanupOnboardingClickListener();
            onboardingClickTargetEl = desiredTargetEl;
            onboardingClickHandler = () => {
                onboardingSegmentIndex += 1;
                onboardingRenderDirty = true;
                cleanupOnboardingClickListener();
            };
            onboardingClickTargetEl.addEventListener('click', onboardingClickHandler, true);
        }
    } else {
        cleanupOnboardingClickListener();
    }

    const now = Date.now();
    if (onboardingRenderDirty || now - lastOnboardingRenderMs > 150) {
        renderOnboardingSteps(overlay, currentSegment.items, requiredTab);
        lastOnboardingRenderMs = now;
        onboardingRenderDirty = false;
    }
}
