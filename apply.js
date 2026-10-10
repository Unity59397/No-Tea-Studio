/* No-Tea Studio - free website application page.
   1) the "Do you qualify?" tick-list, 2) friendly validation + no-reload send for the application form.
   Progressive enhancement: without JS the form still posts to Formspree and the browser checks the required fields. */
(function () {
    'use strict';

    var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
    var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };

    /* ---------- "Do you qualify?" checker (nothing is sent) ---------- */
    var items = $$('.fit-item input');
    var bar = $('#fit-bar');
    var result = $('#fit-result');
    if (items.length && result) {
        var update = function () {
            var n = items.filter(function (i) { return i.checked; }).length;
            var total = items.length;
            if (bar) { bar.style.transform = 'scaleX(' + (n / total) + ')'; }
            if (n === total) {
                result.textContent = 'You tick every box. This looks like a great fit, so go ahead and apply!';
            } else if (n >= total - 2 && n > 0) {
                result.textContent = n + ' of ' + total + ' ticked. Nearly there, and worth applying anyway.';
            } else if (n > 0) {
                result.textContent = n + ' of ' + total + ' ticked. You can still apply, or ask us about a paid package.';
            } else {
                result.textContent = '0 of ' + total + ' ticked';
            }
            result.classList.toggle('is-good', n === total);
        };
        items.forEach(function (i) { i.addEventListener('change', update); });
        update();
    }

    /* ---------- Application form ---------- */
    var form = $('#apply-form');
    if (!form) { return; }
    form.noValidate = true; // we show our own messages; without JS the browser's own checks still apply

    var text = function (id, min, msg) {
        return { el: $('#' + id), err: $('#' + id + '-error'), ok: function (f) { return f.el.value.trim().length >= min; }, msg: msg };
    };
    var checked = function (id, msg) {
        return { el: $('#' + id), err: $('#' + id + '-error'), ok: function (f) { return f.el.checked; }, msg: msg };
    };

    var fields = [
        text('a-name', 2, 'What should we call you?'),
        {
            el: $('#a-email'), err: $('#a-email-error'),
            ok: function (f) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.el.value.trim()); },
            msg: 'That email looks a bit off. Mind checking it?'
        },
        text('a-business', 2, 'What is your business or group called?'),
        text('a-location', 2, 'Which town or city are you in?'),
        { el: $('#a-type'), err: $('#a-type-error'), ok: function (f) { return !!f.el.value; }, msg: 'Pick the closest match.' },
        { el: $('#a-size'), err: $('#a-size-error'), ok: function (f) { return !!f.el.value; }, msg: 'How big is the team?' },
        {
            el: $('#a-needs'), err: $('#a-needs-error'),
            focusEl: function () { return $('#a-needs input'); },
            ok: function () { return $$('#a-needs input').some(function (i) { return i.checked; }); },
            msg: 'Tick at least one thing a website could help with.'
        },
        text('a-about', 15, 'Tell us a little about what you do. A sentence or two is plenty.'),
        text('a-why', 15, 'Tell us how a website would help. A sentence or two is plenty.'),
        checked('a-eligible', 'Please confirm the details are true and you are a small business or group.'),
        checked('a-portfolio', 'We need your OK to feature the finished site in our portfolio.'),
        checked('a-privacy', 'Please confirm you have read the Privacy Notice.')
    ].filter(function (f) { return f.el && f.err; });

    var check = function (f) {
        var valid = f.ok(f);
        if (valid) { f.el.removeAttribute('aria-invalid'); } else { f.el.setAttribute('aria-invalid', 'true'); }
        f.err.textContent = valid ? '' : f.msg;
        return valid;
    };

    // Errors only appear on submit (an error popping in on blur can shift the layout and swallow a click).
    // Once flagged, a field re-checks as they type so the message clears as soon as it is fixed.
    fields.forEach(function (f) {
        var recheck = function () { if (f.el.getAttribute('aria-invalid') === 'true') { check(f); } };
        f.el.addEventListener('input', recheck);
        f.el.addEventListener('change', recheck);
    });

    var status = $('#apply-status');
    var wrap = $('#apply-wrap');
    var success = $('#apply-success');
    var btn = $('#apply-btn');
    var label = btn ? btn.textContent : 'Send my application';

    var setBusy = function (busy) {
        if (!btn) { return; }
        btn.disabled = busy;
        btn.textContent = busy ? 'Sending...' : label;
    };

    var showSuccess = function () {
        form.reset();
        fields.forEach(function (f) { f.el.removeAttribute('aria-invalid'); f.err.textContent = ''; });
        if (status) { status.hidden = true; }
        if (wrap) { wrap.hidden = true; }
        if (success) {
            success.hidden = false;
            var card = $('#apply-card');
            if (card && card.scrollIntoView) { card.scrollIntoView({ block: 'center' }); }
            success.focus({ preventScroll: true });
        }
    };

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var firstBad = null;
        fields.forEach(function (f) {
            if (!check(f) && !firstBad) { firstBad = f.focusEl ? f.focusEl() : f.el; }
        });
        if (firstBad) { firstBad.focus(); return; }

        // Hidden honeypot: real people never fill it in. Pretend it worked and send nothing.
        var trap = form.elements._gotcha;
        if (trap && trap.value) { showSuccess(); return; }

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
})();
