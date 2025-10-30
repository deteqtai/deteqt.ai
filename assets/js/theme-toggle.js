// Theme Toggle Functionality for Book Meeting Page
(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
        initThemeToggle();
    }

    function initThemeToggle() {
        const html = document.documentElement;
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');

        if (!themeToggle) return; // Theme toggle doesn't exist on this page

        // Remove preload class after a short delay to enable transitions
        setTimeout(() => {
            body.classList.remove('preload');
        }, 100);

        // Default theme is dark
        const THEMES = {
            DARK: 'dark',
            LIGHT: 'light'
        };

        // Get saved theme from localStorage or default to dark
        function getSavedTheme() {
            try {
                return localStorage.getItem('deteqt-theme') || THEMES.DARK;
            } catch (e) {
                return THEMES.DARK;
            }
        }

        // Save theme to localStorage
        function saveTheme(theme) {
            try {
                localStorage.setItem('deteqt-theme', theme);
            } catch (e) {
                // Fail silently if localStorage is not available
            }
        }

        // Apply theme to html and body
        function applyTheme(theme) {
            html.setAttribute('data-theme', theme);
            body.setAttribute('data-theme', theme);

            // Update logo based on theme
            updateLogo(theme);

            // Update meta theme-color for mobile browsers
            updateMetaThemeColor(theme);

            // Track theme change with Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'theme_change', {
                    'event_category': 'engagement',
                    'event_label': theme,
                    'value': theme === THEMES.DARK ? 0 : 1
                });
            }
        }

        // Update logo based on theme
        function updateLogo(theme) {
            const logo = document.getElementById('demo-logo');
            if (!logo) return;

            if (theme === THEMES.DARK) {
                logo.src = 'assets/images/deteqt-logo-white.svg';
            } else {
                logo.src = 'assets/images/Deteqt-logo-black.svg';
            }
        }

        // Update meta theme-color tag
        function updateMetaThemeColor(theme) {
            let metaThemeColor = document.querySelector('meta[name="theme-color"]');

            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.setAttribute('name', 'theme-color');
                document.head.appendChild(metaThemeColor);
            }

            metaThemeColor.setAttribute('content', theme === THEMES.DARK ? '#000000' : '#ffffff');
        }

        // Toggle between themes
        function toggleTheme() {
            const currentTheme = body.getAttribute('data-theme') || THEMES.DARK;
            const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;

            applyTheme(newTheme);
            saveTheme(newTheme);

            // Add animation class to button
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 300);
        }

        // Initialize theme on page load
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);

        // Add click event listener to toggle button
        themeToggle.addEventListener('click', toggleTheme);

        // Optional: Listen for system theme preference changes
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Only auto-switch if user hasn't manually set a preference
            darkModeQuery.addEventListener('change', (e) => {
                // Check if user has manually set theme
                const hasManualPreference = localStorage.getItem('deteqt-theme');

                if (!hasManualPreference) {
                    const systemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
                    applyTheme(systemTheme);
                }
            });
        }

        // Keyboard shortcut: Ctrl/Cmd + Shift + D to toggle theme
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
})();
