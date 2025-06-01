'use strict';

const LS_PREFIX = 'positanoPapaveri_';
const LS_KEYS = {
    LANGUAGE: `${LS_PREFIX}language`,
    THEME: `${LS_PREFIX}theme`, // For high-contrast
    GRAYSCALE: `${LS_PREFIX}grayscale`,
    FONT_SIZE: `${LS_PREFIX}fontSizeMultiplier`,
    SIMPLE_GERMAN: `${LS_PREFIX}simpleGermanActive`
};

const state = {
    currentLanguage: getLocalStorage(LS_KEYS.LANGUAGE) || 'de',
    translations: {},
    isHighContrast: getLocalStorage(LS_KEYS.THEME) === 'high',
    isGrayscale: getLocalStorage(LS_KEYS.GRAYSCALE) === 'true',
    fontSizeMultiplier: parseFloat(getLocalStorage(LS_KEYS.FONT_SIZE)) || 1.0,
    isSimpleGermanActive: getLocalStorage(LS_KEYS.SIMPLE_GERMAN) === 'true' && (getLocalStorage(LS_KEYS.LANGUAGE) || 'de') === 'de',
    baseFontSize: 16 // px
};

// --- UTILITY FUNCTIONS ---
function getLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.warn("LocalStorage access denied or unavailable.", e);
        return null;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn("LocalStorage access denied or unavailable.", e);
    }
}


// --- TRANSLATION ---
async function fetchTranslations() {
    try {
        const response = await fetch('assets/translations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        state.translations = await response.json();
        return true;
    } catch (error) {
        console.error("Could not load translations:", error);
        // Fallback translation widget integration could go here
        // const fallbackWidget = document.getElementById('gtranslate_wrapper');
        // if (fallbackWidget) fallbackWidget.style.display = 'block';
        return false;
    }
}

function applyTranslations() {
    const langToUse = (state.currentLanguage === 'de' && state.isSimpleGermanActive) ? 'de_simple' : state.currentLanguage;
    const translationData = state.translations[langToUse];

    if (!translationData) {
        console.warn(`No translations found for language: ${langToUse}`);
        return;
    }

    document.querySelectorAll('[data-i18n-text]').forEach(el => {
        const key = el.getAttribute('data-i18n-text');
        if (translationData[key]) {
            el.textContent = translationData[key];
        } else {
            // console.warn(`Missing translation key (text): ${key} for lang ${langToUse}`);
        }
    });

    document.querySelectorAll('[data-i18n-attr-content]').forEach(el => {
        const key = el.getAttribute('data-i18n-attr-content');
        const attrName = el.getAttribute('data-i18n-attr-content'); // This was likely a typo, should be 'content'
        if (translationData[key]) {
            el.setAttribute('content', translationData[key]);
        } else {
            // console.warn(`Missing translation key (content attr): ${key} for lang ${langToUse}`);
        }
    });
    
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translationData[key]) {
            el.setAttribute('title', translationData[key]);
        } else {
            // console.warn(`Missing translation key (title attr): ${key} for lang ${langToUse}`);
        }
    });

    document.querySelectorAll('[data-i18n-attr-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-attr-placeholder');
        if (translationData[key]) {
            el.setAttribute('placeholder', translationData[key]);
        } else {
            // console.warn(`Missing translation key (placeholder attr): ${key} for lang ${langToUse}`);
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = state.currentLanguage;
    if (state.currentLanguage === 'de' && state.isSimpleGermanActive) {
        document.documentElement.lang = 'de-x-simple'; // Custom lang tag for simple German
    }


    // Update selected state for language buttons
    document.querySelectorAll('.language-menu button').forEach(btn => {
        btn.setAttribute('aria-selected', btn.dataset.lang === state.currentLanguage);
    });

    // Show/hide "Einfache Sprache" button
    const simpleGermanButton = document.getElementById('toggle-simple-german');
    if (simpleGermanButton) {
        simpleGermanButton.style.display = state.currentLanguage === 'de' ? 'inline-block' : 'none';
        simpleGermanButton.setAttribute('aria-pressed', state.isSimpleGermanActive);
    }
}

function setLanguage(lang) {
    const langExists = state.translations[lang] || (lang === 'de' && state.translations['de_simple']);
    if (langExists) {
        state.currentLanguage = lang;
        setLocalStorage(LS_KEYS.LANGUAGE, lang);
        if (lang !== 'de' && state.isSimpleGermanActive) {
            state.isSimpleGermanActive = false;
            setLocalStorage(LS_KEYS.SIMPLE_GERMAN, 'false');
        }
        applyTranslations();
    } else {
        console.warn(`Language ${lang} not available in translations.`);
    }
}


// --- ACCESSIBILITY FEATURES ---

function toggleHighContrast() {
    state.isHighContrast = !state.isHighContrast;
    document.documentElement.setAttribute('data-theme', state.isHighContrast ? 'high' : 'default');
    document.getElementById('toggle-contrast').setAttribute('aria-pressed', String(state.isHighContrast));
    setLocalStorage(LS_KEYS.THEME, state.isHighContrast ? 'high' : 'default');
}

function toggleGrayscale() {
    state.isGrayscale = !state.isGrayscale;
    document.documentElement.classList.toggle('grayscale', state.isGrayscale);
    document.getElementById('toggle-grayscale').setAttribute('aria-pressed', String(state.isGrayscale));
    setLocalStorage(LS_KEYS.GRAYSCALE, String(state.isGrayscale));
}

const MIN_FONT_MULTIPLIER = 0.8;
const MAX_FONT_MULTIPLIER = 2.0;
const FONT_STEP = 0.1;

function updateFontSize() {
    // Calculate new font size in REM for HTML element, or use px for body.
    // Sticking to modifying html { font-size } as requested for rem units.
    const newBaseSize = state.baseFontSize * state.fontSizeMultiplier;
    document.documentElement.style.fontSize = `${newBaseSize}px`;
    setLocalStorage(LS_KEYS.FONT_SIZE, state.fontSizeMultiplier.toString());
}

function increaseFontSize() {
    if (state.fontSizeMultiplier < MAX_FONT_MULTIPLIER) {
        state.fontSizeMultiplier = parseFloat((state.fontSizeMultiplier + FONT_STEP).toFixed(2)); // toFixed for precision
        updateFontSize();
    }
}

function decreaseFontSize() {
    if (state.fontSizeMultiplier > MIN_FONT_MULTIPLIER) {
        state.fontSizeMultiplier = parseFloat((state.fontSizeMultiplier - FONT_STEP).toFixed(2)); // toFixed for precision
        updateFontSize();
    }
}

function toggleSimpleGerman() {
    if (state.currentLanguage !== 'de') return;
    state.isSimpleGermanActive = !state.isSimpleGermanActive;
    document.getElementById('toggle-simple-german').setAttribute('aria-pressed', String(state.isSimpleGermanActive));
    setLocalStorage(LS_KEYS.SIMPLE_GERMAN, String(state.isSimpleGermanActive));
    applyTranslations();
}

// --- SCROLL REVEAL ---
function setupScrollReveal() {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            el.classList.add('is-visible'); // Make them visible immediately if motion is reduced
        });
        return;
    }

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Set CSS variable for potential stagger, can be used in CSS
                entry.target.style.setProperty('--reveal-idx', index);
                entry.target.classList.add('is-visible');
                observerInstance.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 10% visible
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });
}

// --- INITIALIZATION ---
function initializeAccessibilitySettings() {
    if (state.isHighContrast) {
        document.documentElement.setAttribute('data-theme', 'high');
    }
    document.getElementById('toggle-contrast').setAttribute('aria-pressed', String(state.isHighContrast));

    if (state.isGrayscale) {
        document.documentElement.classList.add('grayscale');
    }
    document.getElementById('toggle-grayscale').setAttribute('aria-pressed', String(state.isGrayscale));

    updateFontSize(); // Applies stored or default font size

    const simpleGermanButton = document.getElementById('toggle-simple-german');
    if (simpleGermanButton && state.currentLanguage === 'de') {
        simpleGermanButton.setAttribute('aria-pressed', String(state.isSimpleGermanActive));
    }
}

async function init() {
    initializeAccessibilitySettings();

    const translationsLoaded = await fetchTranslations();
    if (translationsLoaded) {
        setLanguage(state.currentLanguage);
    } else {
        // Handle case where primary translations fail (e.g. display site in a default or show error)
        // For now, it might show keys if applyTranslations runs with empty state.translations
        // Or, if fallback widget is used, ensure it's visible.
        console.warn("Translations did not load, site may not be fully localized via JSON.");
    }

    // Event Listeners
    document.querySelectorAll('.language-menu button[data-lang]').forEach(button => {
        button.addEventListener('click', (e) => setLanguage(e.target.dataset.lang));
    });

    document.getElementById('toggle-contrast').addEventListener('click', toggleHighContrast);
    document.getElementById('toggle-grayscale').addEventListener('click', toggleGrayscale);
    document.getElementById('font-increase').addEventListener('click', increaseFontSize);
    document.getElementById('font-decrease').addEventListener('click', decreaseFontSize);
    
    const simpleGermanButton = document.getElementById('toggle-simple-german');
    if (simpleGermanButton) {
        simpleGermanButton.addEventListener('click', toggleSimpleGerman);
    }
    
    setupScrollReveal();

    document.documentElement.setAttribute('data-section-padding', 'generous');
}

document.addEventListener('DOMContentLoaded', init);