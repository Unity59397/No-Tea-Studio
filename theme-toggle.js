(function () {
    const toggleButtons = document.querySelectorAll('.theme-toggle');
    if (!toggleButtons.length) {
        return;
    }

    function updateButtons(theme) {
        toggleButtons.forEach((button) => {
            button.setAttribute('aria-pressed', theme === 'dark');
            button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    // The inline script in <head> already set data-theme before paint;
    // this just syncs the button state to match.
    updateButtons(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateButtons(next);
        });
    });

    // Follow the OS-level theme live, but only until the visitor makes an explicit choice
    if (!localStorage.getItem('theme') && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
            const theme = event.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            updateButtons(theme);
        });
    }
})();

// Template for dark mode:
// <script src="theme-toggle.js"></script>
//        <button class="theme-toggle" type="button" aria-label="Toggle dark mode">
//             <svg class="icon-sun" viewBox="0 0 24 24">
//                 <circle cx="12" cy="12" r="4" />
//                 <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
//             </svg>
//             <svg class="icon-moon" viewBox="0 0 24 24">
//                 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
//             </svg>
//         </button>

// html[data-theme="dark"] {
// 	--ink: #edf0f4;
// 	--ink-soft: #a3adb9;
// 	--paper: #12161c;
// 	--paper-bright: #1a1f28;
// 	--coral: #e8825f;
// 	--coral-deep: #f2966f;
// 	--mint: #1f342f;
// 	--line: #2b313c;
// 	--shadow-soft: rgba(0, 0, 0, 0.35);
// 	--shadow-strong: rgba(0, 0, 0, 0.5);
// 	color-scheme: dark;
// }