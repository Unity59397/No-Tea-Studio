/* No-Tea Studio - homepage behaviour.
   Everything here is progressive enhancement: the page reads and the form posts without it. */
(function () {
    'use strict';

    var root = document.documentElement;
    root.classList.add('js-ready');

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
    var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };

    /* ---------- Toast ---------- */
    var toastEl = $('#toast');
    var toastTimer;
    function toast(message) {
        if (!toastEl) { return; }
        toastEl.textContent = message;
        toastEl.classList.add('is-on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2800);
    }

    /* ---------- Header shadow, scroll progress, back-to-top ---------- */
    var header = $('.site-header');
    var progressBar = $('.progress span');
    var toTop = $('.to-top');
    var ticking = false;

    function onScroll() {
        ticking = false;
        var y = window.pageYOffset || root.scrollTop;
        var max = root.scrollHeight - window.innerHeight;
        if (progressBar) { progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')'; }
        if (header) { header.classList.toggle('is-scrolled', y > 8); }
        if (toTop) { toTop.classList.toggle('is-on', y > 700); }
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Mobile menu ---------- */
    var burger = $('.nav-burger');
    var panel = $('#nav-panel');
    function setMenu(open) {
        if (!burger || !panel) { return; }
        panel.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (burger && panel) {
        burger.addEventListener('click', function () {
            setMenu(burger.getAttribute('aria-expanded') !== 'true');
        });
        panel.addEventListener('click', function (event) {
            if (event.target.closest('a')) { setMenu(false); }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { setMenu(false); }
        });
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.nav')) { setMenu(false); }
        });
    }

    /* ---------- Browser theme-color follows the active palette ---------- */
    function syncThemeColor() {
        var bg = getComputedStyle(root).getPropertyValue('--c-bg').trim();
        if (!bg) { return; }
        $$('meta[name="theme-color"]').forEach(function (meta) { meta.parentNode.removeChild(meta); });
        var meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = bg;
        document.head.appendChild(meta);
    }
    if (window.MutationObserver) {
        new MutationObserver(syncThemeColor).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
    }

    /* ---------- Halloween palette: seasonal copy ----------
       Elements with data-halloween get that text while the Halloween palette is on and
       their original text back otherwise. The default (non-Halloween) text stays in the HTML. */
    function isHalloween() { return root.getAttribute('data-palette') === 'halloween'; }

    var booPending = true; // the first poke of the pumpkin is always "BOO!"
    var cupBtn = $('.art-cup');
    function applySeasonalCopy() {
        var on = isHalloween();
        $$('[data-halloween]').forEach(function (el) {
            if (!el.hasAttribute('data-default')) { el.setAttribute('data-default', el.textContent); }
            el.textContent = on ? el.getAttribute('data-halloween') : el.getAttribute('data-default');
        });
        if (cupBtn) {
            cupBtn.setAttribute('aria-label', on ? 'Pumpkin: hover or focus for a spooky fun fact' : 'Teacup: hover or focus for a fun fact');
        }
        if (on) { booPending = true; }
    }
    applySeasonalCopy();
    if (window.MutationObserver) {
        new MutationObserver(applySeasonalCopy).observe(root, { attributes: true, attributeFilter: ['data-palette'] });
    }

    /* ---------- Palette picker ("Pick your brew") ---------- */
    var paletteBtn = $('.palette-btn');
    var palettePop = $('#palette-pop');
    if (paletteBtn && palettePop) {
        var radios = $$('[role="radio"]', palettePop);

        var markPalette = function (name) {
            radios.forEach(function (radio) {
                radio.setAttribute('aria-checked', String(radio.getAttribute('data-palette') === name));
            });
        };
        var setPop = function (open) {
            palettePop.hidden = !open;
            paletteBtn.setAttribute('aria-expanded', String(open));
        };

        markPalette(root.getAttribute('data-palette'));

        paletteBtn.addEventListener('click', function () { setPop(palettePop.hidden); });

        palettePop.addEventListener('click', function (event) {
            var radio = event.target.closest('[role="radio"]');
            if (!radio) { return; }
            var name = radio.getAttribute('data-palette');
            root.setAttribute('data-palette', name);
            try { localStorage.setItem('palette', name); } catch (e) { /* storage blocked: still works for this visit */ }
            markPalette(name);
            if (name === 'halloween') { toast('BOO! Happy Halloween.'); }
        });

        palettePop.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') { return; }
            event.preventDefault();
            var i = radios.indexOf(document.activeElement);
            var next = event.key === 'ArrowDown' ? (i + 1) % radios.length : (i - 1 + radios.length) % radios.length;
            radios[next].focus();
        });

        document.addEventListener('click', function (event) {
            if (!palettePop.hidden && !event.target.closest('.palette')) { setPop(false); }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !palettePop.hidden) {
                setPop(false);
                paletteBtn.focus();
            }
        });
        paletteBtn.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setPop(true);
                (radios.filter(function (r) { return r.getAttribute('aria-checked') === 'true'; })[0] || radios[0]).focus();
            }
        });
    }

    /* ---------- First-visit hint: "you can change the colours and light/dark mode" ---------- */
    (function firstVisitHint() {
        var nav = $('.site-header .nav');
        var palBtn = $('.palette-btn');
        var themeBtn = $('.theme-toggle');
        if (!nav || !palBtn || !themeBtn) { return; }

        var KEY = 'hint-seen';
        var store = function (fn) {
            try { return fn(window.localStorage); } catch (e) {
                try { return fn(window.sessionStorage); } catch (e2) { return null; }
            }
        };
        // Only for people who haven't found the controls yet.
        if (store(function (s) { return s.getItem(KEY) || s.getItem('palette') || s.getItem('theme'); })) { return; }

        var isDark = root.getAttribute('data-theme') === 'dark';
        var sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>';
        var moon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></svg>';
        var drop = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z" /></svg>';

        var hint = document.createElement('div');
        hint.className = 'hint';
        hint.setAttribute('role', 'region');
        hint.setAttribute('aria-label', 'Tip: make the site your own');
        hint.innerHTML =
            '<p class="hint-title">Make it yours</p>' +
            '<ul class="hint-list">' +
            '<li><span class="hint-ico">' + drop + '</span><span>Tap the <strong>drop</strong> to swap the colours.</span></li>' +
            '<li><span class="hint-ico">' + (isDark ? sun : moon) + '</span><span>Tap the <strong>' + (isDark ? 'sun' : 'moon') + '</strong> to switch to ' + (isDark ? 'light' : 'dark') + ' mode.</span></li>' +
            '</ul>' +
            '<button class="hint-ok" type="button">Got it</button>';
        nav.appendChild(hint);

        // point the little arrow at the middle of the two buttons
        var place = function () {
            var n = nav.getBoundingClientRect();
            var a = palBtn.getBoundingClientRect();
            var b = themeBtn.getBoundingClientRect();
            var mid = (a.left + b.right) / 2;
            hint.style.setProperty('--arrow-x', Math.max(14, n.right - mid - 7) + 'px');
        };

        var timer;
        var closed = false;
        var close = function () {
            if (closed) { return; }
            closed = true;
            clearTimeout(timer);
            store(function (s) { s.setItem(KEY, '1'); });
            palBtn.classList.remove('hint-ring');
            themeBtn.classList.remove('hint-ring');
            hint.classList.remove('is-on');
            setTimeout(function () { if (hint.parentNode) { hint.parentNode.removeChild(hint); } }, 300);
        };

        $('.hint-ok', hint).addEventListener('click', close);
        palBtn.addEventListener('click', close);
        themeBtn.addEventListener('click', close);
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { close(); } });
        window.addEventListener('resize', place);

        setTimeout(function () {
            if (closed) { return; }
            place();
            hint.classList.add('is-on');
            palBtn.classList.add('hint-ring');
            themeBtn.classList.add('hint-ring');
            timer = setTimeout(close, 16000); // never nag: it fades out on its own too
        }, 1600);
    })();

    /* ---------- Scroll reveal ---------- */
    var revealEls = $$('.reveal');
    $$('.offer-grid, .work-grid, .trust-grid, .steps').forEach(function (group) {
        $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--d', (i * 90) + 'ms'); });
    });

    // Once an element has faded in, drop the reveal class so it gets its normal hover transitions back.
    function finishReveal(el) {
        var done = false;
        var cleanup = function () {
            if (done) { return; }
            done = true;
            el.classList.remove('reveal', 'is-in');
            el.style.removeProperty('--d');
        };
        el.addEventListener('transitionend', function (event) {
            if (event.target === el && event.propertyName === 'opacity') { cleanup(); }
        });
        setTimeout(cleanup, 1800);
    }

    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                entry.target.classList.add('is-in');
                finishReveal(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ---------- Rotating word in the hero ---------- */
    var rotator = $('.rotator');
    if (rotator && !reduceMotion) {
        var split = function (name) { return (rotator.getAttribute(name) || '').split('|').filter(Boolean); };
        var words = split('data-words');
        var spookyWords = split('data-words-halloween');
        var wordIndex = 0;
        if (words.length > 1) {
            setInterval(function () {
                if (document.hidden) { return; }
                rotator.classList.add('is-out');
                setTimeout(function () {
                    var list = isHalloween() && spookyWords.length > 1 ? spookyWords : words;
                    wordIndex = (wordIndex + 1) % list.length;
                    rotator.textContent = list[wordIndex];
                    rotator.classList.remove('is-out');
                }, 240);
            }, 2600);
        }
    }

    /* ---------- The teacup ---------- */
    var cup = $('.art-cup');
    var bubble = $('#cup-bubble');
    if (cup && bubble) {
        var quipSets = {
            tea: [
                'Plot twist: there is no tea in No-Tea.',
                'We spill no tea. Only clean code.',
                'Fun fact: I am 100% SVG and 0% caffeine.',
                'Websites without the drama. Just the good bits.',
                'Our waffle budget is zero. Our enthusiasm budget is not.',
                'Yes, we really do aim to reply within 24 hours.',
                'Psst... the Book Us button is right up there.',
                'I have no hands, but I have strong opinions about spacing.'
            ],
            halloween: [
                'BOO!',
                'Did I scare you? Be honest. I can take it.',
                'No tea here. Only tricks, treats and tidy code.',
                'Trick or treat? The treat is asking us for a quote.',
                'Slow-loading pages are scarier than any ghost.',
                'Broken links are the real horror story. We bury them.',
                'We will not haunt your inbox. We aim to reply within 24 hours.',
                'Is your current website a bit... cursed? We can help.',
                'Is your website a zombie? We can bring it back to life.',
                'I am 100% SVG and 0% pumpkin spice.',
                'Carved by hand? Nope. Carved by CSS.',
                'We spill no tea. Only candy corn.',
                'Psst... the Book Us button is up there. Boo-k Us, if you like.',
                'I have no hands, but I have strong opinions about spacing. And teeth.'
            ]
        };
        var lastQuip = { tea: -1, halloween: -1 };
        var nextQuip = function () {
            var key = isHalloween() ? 'halloween' : 'tea';
            if (key === 'halloween' && booPending) { booPending = false; return 'BOO!'; }
            var list = quipSets[key];
            var next;
            do { next = Math.floor(Math.random() * list.length); } while (next === lastQuip[key]);
            lastQuip[key] = next;
            return list[next];
        };
        var speak = function () {
            var line = nextQuip();
            var boo = line === 'BOO!';
            bubble.textContent = line;
            bubble.classList.toggle('is-boo', boo);
            bubble.classList.add('is-on');
            cup.classList.remove('is-boo');
            if (boo && !reduceMotion) {
                void cup.offsetWidth; // restart the jump animation
                cup.classList.add('is-boo');
            }
        };
        // The bubble only exists while the cup is hovered or focused.
        var showQuip = speak;
        var hideQuip = function () { bubble.classList.remove('is-on'); };

        // Pointer events with pointerType 'mouse' so a touch tap (which fakes mouse events) doesn't
        // flash the bubble open and shut.
        cup.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') { showQuip(); } });
        cup.addEventListener('pointerleave', function (event) { if (event.pointerType === 'mouse') { hideQuip(); } });
        cup.addEventListener('focus', function () {
            // keyboard focus only: a mouse click already shows the bubble via hover
            if (cup.matches(':focus-visible')) { showQuip(); }
        });
        cup.addEventListener('blur', hideQuip);

        // Click / tap: a fresh quip and a hop. Touch screens have no hover, so a tap shows it
        // and a tap anywhere else hides it again.
        cup.addEventListener('click', function () {
            speak();
            cup.classList.remove('is-hop');
            void cup.offsetWidth; // restart the hop animation
            cup.classList.add('is-hop');
        });
        document.addEventListener('pointerdown', function (event) {
            if (event.pointerType === 'touch' && !event.target.closest('.art-cup')) { hideQuip(); }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { hideQuip(); }
        });
    }

    /* ---------- Hero parallax (mouse only) ---------- */
    var art = $('.hero-art');
    if (art && !reduceMotion && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
        var layers = $$('.art-layer', art);
        art.addEventListener('pointermove', function (event) {
            var rect = art.getBoundingClientRect();
            var x = (event.clientX - rect.left) / rect.width - 0.5;
            var y = (event.clientY - rect.top) / rect.height - 0.5;
            layers.forEach(function (layer) {
                var depth = parseFloat(layer.getAttribute('data-depth')) || 10;
                layer.style.transform = 'translate3d(' + (x * depth).toFixed(1) + 'px,' + (y * depth).toFixed(1) + 'px,0)';
            });
        });
        art.addEventListener('pointerleave', function () {
            layers.forEach(function (layer) { layer.style.transform = ''; });
        });
    }

    /* ---------- Work filter ---------- */
    var seg = $('.seg');
    var cards = $$('.work-card, .project-row');
    if (seg && cards.length) {
        seg.addEventListener('click', function (event) {
            var button = event.target.closest('button[data-filter]');
            if (!button) { return; }
            var filter = button.getAttribute('data-filter');
            $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
            cards.forEach(function (card) {
                card.hidden = !(filter === 'all' || card.getAttribute('data-kind') === filter);
            });
        });
    }

    /* ---------- Contact: project chips start the message ---------- */
    var form = $('#contact-form');
    var subjectInput = $('#subject');
    var messageInput = $('#message');
    var chips = $$('.chip');
    var presets = {
        onepage: {
            subject: 'One-page website enquiry',
            message: 'Hi No-Tea Studio, I would like a focused one-page website for my business. A bit about what I do:\n\n'
        },
        business: {
            subject: 'Small business website enquiry',
            message: 'Hi No-Tea Studio, I would like a small multi-page website (for example home, about, services and contact). A bit about my business:\n\n'
        },
        custom: {
            subject: 'Custom website enquiry',
            message: 'Hi No-Tea Studio, I have a more custom idea in mind. The features I am thinking about are:\n\n'
        },
        unsure: {
            subject: 'Help me work out what I need',
            message: 'Hi No-Tea Studio, I am not sure exactly what I need yet. Here is where I am at:\n\n'
        }
    };
    var autoSubject = '';
    var autoMessage = '';

    function clearAutoFill() {
        if (messageInput && messageInput.value === autoMessage) { messageInput.value = ''; }
        if (subjectInput && subjectInput.value === autoSubject) { subjectInput.value = ''; }
        autoSubject = '';
        autoMessage = '';
    }

    if (form && subjectInput && messageInput && chips.length) {
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var preset = presets[chip.getAttribute('data-preset')];
                if (!preset) { return; }
                var wasOn = chip.getAttribute('aria-pressed') === 'true';
                chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
                if (wasOn) { clearAutoFill(); return; }

                chip.setAttribute('aria-pressed', 'true');
                // Only overwrite fields that are empty or still hold our own starter text.
                if (!messageInput.value.trim() || messageInput.value === autoMessage) {
                    messageInput.value = preset.message;
                    autoMessage = preset.message;
                }
                if (!subjectInput.value.trim() || subjectInput.value === autoSubject) {
                    subjectInput.value = preset.subject;
                    autoSubject = preset.subject;
                }
                messageInput.focus();
                messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
            });
        });
    }

    /* ---------- Contact form: friendly validation + no-reload send ---------- */
    if (form) {
        form.noValidate = true; // we show our own messages; without JS the browser's own checks still apply

        var status = $('#form-status');
        var formWrap = $('#form-wrap');
        var success = $('#form-success');
        var submitBtn = $('#submit-btn');
        var submitLabel = submitBtn ? submitBtn.textContent : 'Get Quote';

        var fields = [
            {
                el: $('#email'), err: $('#email-error'),
                ok: function (f) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.el.value.trim()); },
                msg: 'That email looks a bit off. Mind checking it?'
            },
            {
                el: $('#subject'), err: $('#subject-error'),
                ok: function (f) { return f.el.value.trim().length >= 2; },
                msg: 'What is this about? A few words will do.'
            },
            {
                el: $('#message'), err: $('#message-error'),
                ok: function (f) { return f.el.value.trim().length >= 10; },
                msg: 'Tell us a little about your idea. A sentence or two is plenty.'
            },
            {
                el: $('#privacy-consent'), err: $('#consent-error'),
                ok: function (f) { return f.el.checked; },
                msg: 'Please confirm you have read the Privacy Notice.'
            }
        ].filter(function (f) { return f.el && f.err; });

        var check = function (f) {
            var valid = f.ok(f);
            if (valid) { f.el.removeAttribute('aria-invalid'); } else { f.el.setAttribute('aria-invalid', 'true'); }
            f.err.textContent = valid ? '' : f.msg;
            return valid;
        };

        // Errors only appear when the visitor presses submit (never on blur: an error popping in while
        // they click the button shifts the layout under the cursor and swallows the click).
        // Once a field is flagged, it re-checks as they type so the message clears as soon as it's fixed.
        fields.forEach(function (f) {
            var recheck = function () {
                if (f.el.getAttribute('aria-invalid') === 'true') { check(f); }
            };
            f.el.addEventListener('input', recheck);
            f.el.addEventListener('change', recheck);
        });

        var setBusy = function (busy) {
            if (!submitBtn) { return; }
            submitBtn.disabled = busy;
            submitBtn.textContent = busy ? 'Sending...' : submitLabel;
        };

        var showSuccess = function () {
            form.reset();
            chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
            autoSubject = '';
            autoMessage = '';
            fields.forEach(function (f) { f.el.removeAttribute('aria-invalid'); f.err.textContent = ''; });
            if (status) { status.hidden = true; }
            if (formWrap) { formWrap.hidden = true; }
            if (success) {
                success.hidden = false;
                success.focus();
            }
        };

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var firstBad = null;
            fields.forEach(function (f) {
                if (!check(f) && !firstBad) { firstBad = f.el; }
            });
            if (firstBad) { firstBad.focus(); return; }

            // Hidden honeypot: real people never fill it in. Pretend it worked and send nothing.
            var trap = form.elements._gotcha;
            if (trap && trap.value) { showSuccess(); return; }

            // Email subject for the inbox: "New project enquiry: <what they typed>"
            var mailSubject = form.elements._subject;
            if (mailSubject && subjectInput && subjectInput.value.trim()) {
                mailSubject.value = mailSubject.defaultValue + ': ' + subjectInput.value.trim();
            }

            setBusy(true);
            if (status) { status.hidden = true; }

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            }).then(function (response) {
                if (!response.ok) { throw new Error('Request failed: ' + response.status); }
                showSuccess();
            }).catch(function () {
                if (status) {
                    status.textContent = 'Hmm, that did not send. Please try again, or email us at info@noteastudio.co.uk.';
                    status.hidden = false;
                }
            }).then(function () {
                setBusy(false);
            });
        });

        var again = $('#send-another');
        if (again) {
            again.addEventListener('click', function () {
                if (success) { success.hidden = true; }
                if (formWrap) { formWrap.hidden = false; }
                var email = $('#email');
                if (email) { email.focus(); }
            });
        }
    }

    /* ---------- Copy email ---------- */
    $$('.copy-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            var text = button.getAttribute('data-copy');
            var done = function () { toast('Email copied. Go forth and write!'); };
            var fallback = function () {
                var temp = document.createElement('textarea');
                temp.value = text;
                temp.setAttribute('readonly', '');
                temp.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
                document.body.appendChild(temp);
                temp.select();
                try {
                    document.execCommand('copy');
                    done();
                } catch (e) {
                    toast('Copy it by hand: ' + text);
                }
                document.body.removeChild(temp);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, fallback);
            } else {
                fallback();
            }
        });
    });

    /* ---------- Lightbox for the client feedback image ---------- */
    var lightbox = $('#lightbox');
    var lightboxImg = $('#lightbox-img');
    if (lightbox && lightboxImg && typeof lightbox.showModal === 'function') {
        $$('[data-lightbox-src]').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                lightboxImg.src = trigger.getAttribute('data-lightbox-src');
                lightboxImg.alt = trigger.getAttribute('data-lightbox-alt') || '';
                lightbox.showModal();
            });
        });
        var closeBtn = $('.lightbox-close', lightbox);
        if (closeBtn) { closeBtn.addEventListener('click', function () { lightbox.close(); }); }
        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) { lightbox.close(); }
        });
    }

    /* ---------- A little hello for the curious ---------- */
    if (window.console && console.log) {
        console.log('%cNo-Tea Studio', 'font-weight:700;font-size:16px', '\nHello, curious developer. No tea here, just tidy code. info@noteastudio.co.uk');
    }
})();
