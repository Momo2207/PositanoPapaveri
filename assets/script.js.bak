'use strict';

const LS_PREFIX = 'positanoPapaveri_';
const LS_KEYS = { /* ... (no changes here) ... */ };
const state = { /* ... (no changes here) ... */ };

// --- UTILITY FUNCTIONS --- (no changes here)
function getLocalStorage(key) { /* ... */ }
function setLocalStorage(key, value) { /* ... */ }

// --- TRANSLATION --- (no changes here)
async function fetchTranslations() { /* ... */ }
function applyTranslations() {
    const langToUse = (state.currentLanguage === 'de' && state.isSimpleGermanActive) ? 'de_simple' : state.currentLanguage;
    const translationData = state.translations[langToUse];

    if (!translationData) {
        // console.warn(`No translations found for language: ${langToUse}`);
        return;
    }

    document.querySelectorAll('[data-i18n-text]').forEach(el => {
        const key = el.getAttribute('data-i18n-text');
        if (translationData[key]) el.textContent = translationData[key];
    });
    document.querySelectorAll('[data-i18n-attr-content]').forEach(el => {
        const key = el.getAttribute('data-i18n-attr-content');
        if (translationData[key]) el.setAttribute('content', translationData[key]);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translationData[key]) el.setAttribute('title', translationData[key]);
    });
    document.querySelectorAll('[data-i18n-attr-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-attr-placeholder');
        if (translationData[key]) el.setAttribute('placeholder', translationData[key]);
    });

    document.documentElement.lang = (state.currentLanguage === 'de' && state.isSimpleGermanActive) ? 'de-x-simple' : state.currentLanguage;

    // Update language display in new dropdown
    const currentLangDisplay = document.getElementById('current-lang-display');
    if (currentLangDisplay) {
        currentLangDisplay.textContent = state.currentLanguage.toUpperCase();
    }

    // Update selected state for language buttons in new dropdown
    document.querySelectorAll('#lang-dropdown button').forEach(btn => {
        btn.setAttribute('aria-selected', btn.dataset.lang === state.currentLanguage);
    });

    const simpleGermanButton = document.getElementById('toggle-simple-german');
    if (simpleGermanButton) {
        simpleGermanButton.style.display = state.currentLanguage === 'de' ? 'block' : 'none'; // Changed to block for dropdown
        simpleGermanButton.setAttribute('aria-pressed', String(state.isSimpleGermanActive));
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
    }
}

// --- ACCESSIBILITY FEATURES --- (no changes, but ensure IDs in HTML match)
function toggleHighContrast() { /* ... */ }
function toggleGrayscale() { /* ... */ }
// Font Scaler functions (increaseFontSize, decreaseFontSize, updateFontSize) unchanged
function toggleSimpleGerman() { /* ... */ }

// --- SCROLL REVEAL --- (no changes)
function setupScrollReveal() { /* ... */ }


// --- HEADER DROPDOWNS ---
function setupHeaderDropdowns() {
    const dropdownToggles = [
        { btnId: 'a11y-toggle-btn', dropdownId: 'a11y-dropdown' },
        { btnId: 'lang-toggle-btn', dropdownId: 'lang-dropdown' }
    ];

    dropdownToggles.forEach(item => {
        const toggleBtn = document.getElementById(item.btnId);
        const dropdown = document.getElementById(item.dropdownId);

        if (toggleBtn && dropdown) {
            toggleBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click from closing immediately
                const isActive = dropdown.classList.toggle('active');
                toggleBtn.setAttribute('aria-expanded', String(isActive));
            });
        }
    });

    // Close dropdowns if clicked outside
    document.addEventListener('click', (event) => {
        dropdownToggles.forEach(item => {
            const toggleBtn = document.getElementById(item.btnId);
            const dropdown = document.getElementById(item.dropdownId);
            if (dropdown && dropdown.classList.contains('active')) {
                if (!dropdown.contains(event.target) && event.target !== toggleBtn && !toggleBtn.contains(event.target)) {
                    dropdown.classList.remove('active');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

     // Handle language selection from new dropdown
    const langDropdown = document.getElementById('lang-dropdown');
    if (langDropdown) {
        langDropdown.addEventListener('click', (event) => {
            if (event.target.matches('button[data-lang]')) {
                setLanguage(event.target.dataset.lang);
                langDropdown.classList.remove('active'); // Close dropdown after selection
                document.getElementById('lang-toggle-btn').setAttribute('aria-expanded', 'false');
            }
        });
    }
}


// --- INITIALIZATION ---
function initializeAccessibilitySettings() { /* ... (ensure IDs match new HTML) ... */ }

async function init() {
    initializeAccessibilitySettings(); // Applies stored settings

    const translationsLoaded = await fetchTranslations();
    if (translationsLoaded) {
        setLanguage(state.currentLanguage); // Applies stored lang and translations
    } else {
        console.warn("Translations did not load, site may not be fully localized via JSON.");
    }

    // Event Listeners for A11y (buttons are now inside a dropdown)
    document.getElementById('toggle-contrast')?.addEventListener('click', toggleHighContrast);
    document.getElementById('toggle-grayscale')?.addEventListener('click', toggleGrayscale);
    document.getElementById('font-increase')?.addEventListener('click', increaseFontSize);
    document.getElementById('font-decrease')?.addEventListener('click', decreaseFontSize);
    document.getElementById('toggle-simple-german')?.addEventListener('click', toggleSimpleGerman);
    
    setupScrollReveal();
    setupHeaderDropdowns(); // Initialize the new dropdowns

    document.documentElement.setAttribute('data-section-padding', 'generous'); // If still used
}

document.addEventListener('DOMContentLoaded', init);