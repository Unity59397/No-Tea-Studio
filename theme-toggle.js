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
