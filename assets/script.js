'use strict';

const LS_PREFIX = 'positanoPapaveri_';
const LS_KEYS = {
    LANGUAGE: `${LS_PREFIX}language`,
    THEME: `${LS_PREFIX}theme`,
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
    baseFontSize: 16
};

function getLocalStorage(key) {
    try { return localStorage.getItem(key); } catch (e) { console.warn("LocalStorage unavailable.", e); return null; }
}
function setLocalStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { console.warn("LocalStorage unavailable.", e); }
}

async function fetchTranslations() {
    try {
        const response = await fetch('assets/translations.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        state.translations = await response.json();
        return true;
    } catch (error) {
        console.error("Could not load translations:", error);
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
        if (translationData[key] !== undefined) el.textContent = translationData[key];
        // else console.warn(`Missing text key: ${key} for ${langToUse}`);
    });
    document.querySelectorAll('[data-i18n-attr-content]').forEach(el => {
        const key = el.getAttribute('data-i18n-attr-content');
        if (translationData[key] !== undefined) el.setAttribute('content', translationData[key]);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translationData[key] !== undefined) el.setAttribute('title', translationData[key]);
    });
    document.querySelectorAll('[data-i18n-attr-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-attr-placeholder');
        if (translationData[key] !== undefined) el.setAttribute('placeholder', translationData[key]);
    });
     document.querySelectorAll('[data-i18n-alt]').forEach(el => { // For alt attributes
        const key = el.getAttribute('data-i18n-alt');
        if (translationData[key] !== undefined) el.setAttribute('alt', translationData[key]);
    });


    document.documentElement.lang = (state.currentLanguage === 'de' && state.isSimpleGermanActive) ? 'de-x-simple' : state.currentLanguage;

    const currentLangDisplay = document.getElementById('current-lang-display');
    if (currentLangDisplay) {
        currentLangDisplay.textContent = state.currentLanguage.toUpperCase();
    }

    document.querySelectorAll('#lang-dropdown button').forEach(btn => {
        btn.setAttribute('aria-selected', btn.dataset.lang === state.currentLanguage);
    });

    const simpleGermanButton = document.getElementById('toggle-simple-german');
    if (simpleGermanButton) {
        simpleGermanButton.style.display = state.currentLanguage === 'de' ? 'block' : 'none';
        simpleGermanButton.setAttribute('aria-pressed', String(state.isSimpleGermanActive));
    }

    // Update active state in main nav
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll('.main-nav a').forEach(link => {
        const linkPath = link.getAttribute('href').split("/").pop().split("#")[0] || "index.html";
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
     if (currentPath === "index.html" && window.location.hash) { // For homepage hash links
        const activeLink = document.querySelector(`.main-nav a[href="index.html${window.location.hash}"]`);
        activeLink?.classList.add('active');
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
        console.warn(`Language ${lang} not available.`);
    }
}

function toggleHighContrast() {
    state.isHighContrast = !state.isHighContrast;
    document.documentElement.setAttribute('data-theme', state.isHighContrast ? 'high' : 'default');
    document.getElementById('toggle-contrast')?.setAttribute('aria-pressed', String(state.isHighContrast));
    setLocalStorage(LS_KEYS.THEME, state.isHighContrast ? 'high' : 'default');
}

function toggleGrayscale() {
    state.isGrayscale = !state.isGrayscale;
    document.documentElement.classList.toggle('grayscale', state.isGrayscale);
    document.getElementById('toggle-grayscale')?.setAttribute('aria-pressed', String(state.isGrayscale));
    setLocalStorage(LS_KEYS.GRAYSCALE, String(state.isGrayscale));
}

const MIN_FONT_MULTIPLIER = 0.8; const MAX_FONT_MULTIPLIER = 2.0; const FONT_STEP = 0.1;
function updateFontSize() {
    document.documentElement.style.fontSize = `${state.baseFontSize * state.fontSizeMultiplier}px`;
    setLocalStorage(LS_KEYS.FONT_SIZE, state.fontSizeMultiplier.toString());
}
function increaseFontSize() {
    if (state.fontSizeMultiplier < MAX_FONT_MULTIPLIER) {
        state.fontSizeMultiplier = parseFloat((state.fontSizeMultiplier + FONT_STEP).toFixed(2));
        updateFontSize();
    }
}
function decreaseFontSize() {
    if (state.fontSizeMultiplier > MIN_FONT_MULTIPLIER) {
        state.fontSizeMultiplier = parseFloat((state.fontSizeMultiplier - FONT_STEP).toFixed(2));
        updateFontSize();
    }
}
function toggleSimpleGerman() {
    if (state.currentLanguage !== 'de') return;
    state.isSimpleGermanActive = !state.isSimpleGermanActive;
    document.getElementById('toggle-simple-german')?.setAttribute('aria-pressed', String(state.isSimpleGermanActive));
    setLocalStorage(LS_KEYS.SIMPLE_GERMAN, String(state.isSimpleGermanActive));
    applyTranslations();
}

function setupScrollReveal() {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
        return;
    }
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observerInstance.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }); // Trigger a bit earlier
    revealElements.forEach(el => observer.observe(el));
}

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
                event.stopPropagation();
                dropdownToggles.forEach(other => { // Close other dropdowns
                    if (other.dropdownId !== item.dropdownId) {
                        document.getElementById(other.dropdownId)?.classList.remove('active');
                        document.getElementById(other.btnId)?.setAttribute('aria-expanded', 'false');
                    }
                });
                const isActive = dropdown.classList.toggle('active');
                toggleBtn.setAttribute('aria-expanded', String(isActive));
            });
        }
    });
    document.addEventListener('click', (event) => {
        dropdownToggles.forEach(item => {
            const toggleBtn = document.getElementById(item.btnId);
            const dropdown = document.getElementById(item.dropdownId);
            if (dropdown?.classList.contains('active') && !dropdown.contains(event.target) && event.target !== toggleBtn && !toggleBtn?.contains(event.target)) {
                dropdown.classList.remove('active');
                toggleBtn?.setAttribute('aria-expanded', 'false');
            }
        });
    });
    const langDropdown = document.getElementById('lang-dropdown');
    if (langDropdown) {
        langDropdown.addEventListener('click', (event) => {
            if (event.target.matches('button[data-lang]')) {
                setLanguage(event.target.dataset.lang);
                langDropdown.classList.remove('active');
                document.getElementById('lang-toggle-btn')?.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

function initializeAccessibilitySettings() {
    if (state.isHighContrast) document.documentElement.setAttribute('data-theme', 'high');
    document.getElementById('toggle-contrast')?.setAttribute('aria-pressed', String(state.isHighContrast));
    if (state.isGrayscale) document.documentElement.classList.add('grayscale');
    document.getElementById('toggle-grayscale')?.setAttribute('aria-pressed', String(state.isGrayscale));
    updateFontSize();
    const simpleGermanButton = document.getElementById('toggle-simple-german');
    if (simpleGermanButton && state.currentLanguage === 'de') {
        simpleGermanButton.setAttribute('aria-pressed', String(state.isSimpleGermanActive));
    }
}

async function init() {
    initializeAccessibilitySettings();
    const translationsLoaded = await fetchTranslations();
    if (translationsLoaded) {
        setLanguage(state.currentLanguage); // Applies language and also calls applyTranslations
    } else {
        console.warn("Translations did not load. Site may not be fully localized.");
        // Fallback: try to apply with whatever might be in state.translations if any part loaded
        applyTranslations();
    }

    document.getElementById('toggle-contrast')?.addEventListener('click', toggleHighContrast);
    document.getElementById('toggle-grayscale')?.addEventListener('click', toggleGrayscale);
    document.getElementById('font-increase')?.addEventListener('click', increaseFontSize);
    document.getElementById('font-decrease')?.addEventListener('click', decreaseFontSize);
    document.getElementById('toggle-simple-german')?.addEventListener('click', toggleSimpleGerman);
    
    setupScrollReveal();
    setupHeaderDropdowns();
}

document.addEventListener('DOMContentLoaded', init);