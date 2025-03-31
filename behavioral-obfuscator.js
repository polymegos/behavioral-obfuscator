// ==UserScript==
// @name            Behavioral Obfuscator
// @version         0.1.0
// @description     Anti-Fingerprinting Timing & Scroll Protection - Introduces randomized timing jitter to prevent fingerprinting via scroll and typing patterns without affecting UX.
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

    // Small-range subtle jitter generation
    function generateJitter(range) {
        return (Math.random() * 2 - 1) * range;
    }

    // Apply typing jitter only when a keys are pressed
    let typingTimer = null;
    window.addEventListener('keydown', (e) => {
        if (typingTimer) clearTimeout(typingTimer);
        // Some small delay before processing key event
        typingTimer = setTimeout(() => {
            const delay = Math.random() * 40 + Math.random() * 40; // 0-80ms delay for typing
            e.preventDefault();
            setTimeout(() => {
                // Simulate the keypress after random delay
                document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: e.key,
                    code: e.code,
                    keyCode: e.keyCode,
                    which: e.which
                }));
            }, delay);
        }, 5); // Prefix with tiny added initial delay before simulating keypress
    });

    // Apply scroll delay jitter only when user actually scrolls
    let lastScrollTime = 0;
    window.addEventListener('scroll', () => {
        const now = performance.now();
        const delay = Math.random() * 75 + Math.random() * 75; // 0-150ms delay between scrolls
        
        // Add small jitter to scroll position when the user scrolls
        if (now - lastScrollTime < delay) return; // Don't interrupt if scrolling too fast
        lastScrollTime = now;
        let scrollX = window.scrollX;
        let scrollY = window.scrollY;
        
        // Add small jitter to scroll position (1-2 pixels offset)
        const noiseX = generateJitter(2);
        const noiseY = generateJitter(2);
        window.scrollTo(scrollX + noiseX, scrollY + noiseY);
    }, { passive: true });

})();
