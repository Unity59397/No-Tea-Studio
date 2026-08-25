// Cookie Consent Banner - Simple GDPR/PECR Compliant Solution
(function() {
    const COOKIE_NAME = 'notea-studio-cookies-accepted';
    const COOKIE_EXPIRY = 365; // days

    function getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
        }
        return null;
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function showCookieBanner() {
        if (getCookie(COOKIE_NAME)) {
            // User has already accepted, hide banner
            return;
        }

        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-container">
                <div class="cookie-consent-content">
                    <p class="cookie-consent-text">We use cookies to improve your experience. By continuing to use this site, you accept our use of cookies and <a href="/privacy/">Privacy Notice</a>.</p>
                    <div class="cookie-consent-buttons">
                        <button class="cookie-accept-btn" id="cookie-accept">Accept</button>
                        <button class="cookie-decline-btn" id="cookie-decline">Decline</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Handle Accept button
        document.getElementById('cookie-accept').addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'true', COOKIE_EXPIRY);
            banner.remove();
        });

        // Handle Decline button
        document.getElementById('cookie-decline').addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'false', COOKIE_EXPIRY);
            banner.remove();
        });
    }

    // Show banner when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showCookieBanner);
    } else {
        showCookieBanner();
    }
})();
