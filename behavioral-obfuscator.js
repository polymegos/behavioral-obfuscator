// ==UserScript==
// @name            Behavioral Obfuscator
// @version         0.1.0
// @description     Anti-Fingerprinting Timing & Scroll Protection - Introduces randomized timing jitter to prevent fingerprinting via scroll, typing, and behavior patterns without affecting UX.
// @author          PolyMegos (https://github.com/polymegos)
// @namespace       https://github.com/polymegos/behavioral-obfuscator
// @supportURL      https://github.com/polymegos/behavioral-obfuscator/issues
// @license         MIT
// @match           *://*/*
// @run-at          document-start
// @grant           none
// @compatible      chrome
// @compatible      firefox
// @compatible      opera
// @compatible      edge
// @compatible      safari
// ==/UserScript==

(function() {
    'use strict';

    // Fast, random jitter generation
    function generateJitter(range) {
        return (Math.random() * 2 - 1) * range;
    }

    // Dynamically change jitter scale with different interval
    let jitterScale = 1.0;  // Vary this between 0.5 and 1.5
    let jitterInterval = setInterval(() => {
        jitterScale = 0.5 + Math.random();
    }, 4000);  // This helps avoid long-term pattern detection

    // Handle 'performance.now' jittering
    const origPerformanceNow = performance.now.bind(performance);
    Object.defineProperty(performance, 'now', {
        value: function() {
            const jitter = generateJitter(80 * jitterScale); // +/-(40-120ms) jitter
            return origPerformanceNow() + jitter;
        },
        writable: false,
        configurable: false
    });

    // Handle 'Date.now' jittering (different scale from 'performance.now')
    const origDateNow = Date.now.bind(Date);
    Object.defineProperty(Date, 'now', {
        value: function() {
            const jitter = generateJitter(160 * jitterScale); // +/-(80-240ms) jitter
            return origDateNow() + jitter;
        },
        writable: false,
        configurable: false
    });

    // Hook into 'Date.prototype.getTime', prevent alternate timing fingerprinting
    const origGetTime = Date.prototype.getTime;
    Date.prototype.getTime = function() {
        const jitter = generateJitter(160 * jitterScale); // +/-(80-240ms) jitter
        return origGetTime.call(this) + jitter;
    };

    // Injectable pauses for scroll or typing
    function randomPause() {
        if (Math.random() < 0.05) {  // Likelihood is 5% for UX
            const delay = Math.random() * 3;  // 0-3ms delay, light enough not to be notices
            const start = performance.now();
            while (performance.now() - start < delay) {}  // Busy-waiting, but eh, it's quick
        }
    }

    // Noisy scroll jittering
    let lastScrollTime = 0;
    window.addEventListener('scroll', () => {
        randomPause();
        const now = performance.now();
        if (now - lastScrollTime < 40) return;
        lastScrollTime = now;

        let scrollX = window.scrollX;
        let scrollY = window.scrollY;

        // Randomized noise to scroll values (2 pixels +/-)
        const noiseX = generateJitter(2);
        const noiseY = generateJitter(2);

        window.scrollTo(scrollX + noiseX, scrollY + noiseY);
    }, { passive: true });

    // Typing obfuscation via typing event jitter
    let typingTimer = null;
    const TYPING_DELAY_MIN = 50;  // Min keystroke delay
    const TYPING_DELAY_MAX = 250; // Max keystroke delay

    // Triggers typing jitter on key events
    window.addEventListener('keydown', (e) => {
        randomPause();
        if (typingTimer) clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            // Obfuscate timing with random delay preceding each keypress
            const randomDelay = Math.random() * (TYPING_DELAY_MAX - TYPING_DELAY_MIN) + TYPING_DELAY_MIN;
            e.preventDefault();
            setTimeout(() => {
                // We trigger the keypress ourselves here, after the delay
                document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: e.key,
                    code: e.code,
                    keyCode: e.keyCode,
                    which: e.which
                }));
            }, randomDelay);
        }, 10);
    });
})();
