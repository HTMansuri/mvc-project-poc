/* Visitor interaction tracking for the existing analytics proof of concept. */
(function (window, document) {
    'use strict';

    function getParentComponent(element) {
        const parent = element.closest('[id^="comp-"]');
        return parent ? parent.id : '';
    }

    window.clientClickTracking = {
        trackClick: function (event, isGTM = false) {
            const rawTarget = event && event.target;
            const clicked = rawTarget && (
                rawTarget.nodeType === 1 ? rawTarget : rawTarget.parentElement
            );
            if (!clicked || typeof clicked.closest !== 'function') return;

            const link = clicked.closest('a[href], [role="link"]');
            const button = clicked.closest('button, [role="button"], .btn, .button');
            const target = button || link;
            if (!target || !window.analytics ||
                typeof window.analytics.event !== 'function') return;

            // Resolve the nearest button-like control or link for analytics.
            const eventName = button ? 'button-tap' : 'link-tap';

            const eventData = {
                action: target.href || '',
                description: String(target.innerText || target.value || target.textContent || '').trim(),
                key: target.id || target.name || '',
                classes: typeof target.className === 'string' ? target.className : '',
                target: target.getAttribute('target') || '',
                parent: getParentComponent(target),
                gtm: Boolean(isGTM)
            };

            window.analytics.event(eventName, eventData);
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (window.analytics && typeof window.analytics.page === 'function') {
            window.analytics.page();
        }

        document.body.addEventListener('click', function (event) {
            if (event.isTrusted) {
                window.clientClickTracking.trackClick(event, false);
            }
        });
    });
})(window, document);
