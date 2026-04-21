// ==UserScript==
// @name         Internet Archive Verification Checkmark
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a verification checkmark to specific Archive.org items based on a remote JSON list.
// @author       Your Name
// @match        https://archive.org/details/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant          GM_getValue
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    const DB_URL = 'https://raw.githubusercontent.com/Baked-Cake1/Internet-Archive-Verification-Checkmark/refs/heads/main/verify.json';
    const CHECKMARK_SVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#37ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 8px;" class="lucide lucide-circle-check">
            <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
        </svg>
    `;

    // 1. Handle User Consent for Fetching
    let isEnabled = GM_getValue("fetch_enabled", null);

    if (isEnabled === null) {
        if (confirm("Allow 'Internet Archive Verification Checkmark' to fetch the verification database from GitHub?")) {
            GM_setValue("fetch_enabled", true);
            isEnabled = true;
        } else {
            GM_setValue("fetch_enabled", false);
            isEnabled = false;
        }
    }

    if (!isEnabled) return;

    // 2. Extract the identifier (3rd segment after slashes)
    // Example: /details/win10_22h2 -> win10_22h2
    const pathSegments = window.location.pathname.split('/');
    const identifier = pathSegments[2];

    if (!identifier) return;

    // 3. Fetch the database
    GM_xmlhttpRequest({
        method: "GET",
        url: DB_URL,
        onload: function(response) {
            try {
                const data = JSON.parse(response.responseText);
                const verifiedList = data.verified || [];

                // 4. Check if current page is in the verified array
                if (verifiedList.includes(identifier)) {
                    injectCheckmark();
                }
            } catch (e) {
                console.error("Error parsing verification JSON", e);
            }
        }
    });

    function injectCheckmark() {
        // Target the .breaker-breaker class
        const target = document.querySelector('.breaker-breaker');
        
        if (target && !document.querySelector('.lucide-circle-check')) {
            // Create a wrapper to hold the SVG so we don't break the original layout
            const wrapper = document.createElement('span');
            wrapper.innerHTML = CHECKMARK_SVG;
            target.appendChild(wrapper);
        }
    }

})();
