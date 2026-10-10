/* No-Tea Studio - small extras for the inner pages.
   Highlights the current section in the side rail (About and Privacy) as you scroll.
   Everything else (menu, palette, dark mode, forms, lightbox) lives in home.js.
   The pages work fine without this file. */
(function () {
    'use strict';

    var links = Array.prototype.slice.call(document.querySelectorAll('.rail a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) { return; }

    var targets = links.map(function (link) {
        return document.getElementById(link.getAttribute('href').slice(1));
    });

    function setActive(id) {
        links.forEach(function (link) {
            var on = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', on);
            if (on) { link.setAttribute('aria-current', 'location'); } else { link.removeAttribute('aria-current'); }
            // keep the active chip visible when the rail scrolls sideways on phones
            if (on && link.scrollIntoView && link.parentNode.parentNode.scrollWidth > link.parentNode.parentNode.clientWidth) {
                var list = link.parentNode.parentNode;
                list.scrollLeft = link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2;
            }
        });
    }

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
        for (var i = 0; i < targets.length; i++) {
            if (targets[i] && visible[targets[i].id]) { setActive(targets[i].id); return; }
        }
    }, { rootMargin: '-18% 0px -62% 0px' });

    targets.forEach(function (target) { if (target) { observer.observe(target); } });
    if (targets[0]) { setActive(targets[0].id); }
})();
