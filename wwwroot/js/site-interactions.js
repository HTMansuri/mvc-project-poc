(function (window, document) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var tiles = document.querySelectorAll('.quotegriditem');
        var quoteForm = document.getElementById('quote-form');
        var currentRequest = null;

        // Quote product selection requests a new ZIP-code form from MVC.
        // The form is not present on the page until the AJAX request succeeds.
        tiles.forEach(function (tile) {
            tile.addEventListener('click', async function (event) {
                event.preventDefault();

                var product = tile.id.replace(/^quotegriditem_/, '');
                tiles.forEach(function (x) { x.classList.remove('selected'); });
                tile.classList.add('selected');

                if (!quoteForm) return;

                if (currentRequest) currentRequest.abort();
                var controller = new AbortController();
                currentRequest = controller;

                quoteForm.hidden = false;
                quoteForm.innerHTML = '<p class="quote-loading" role="status">Loading ZIP-code entry…</p>';

                try {
                    var response = await fetch('/quote/widget?product=' + encodeURIComponent(product), {
                        method: 'GET',
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                        signal: controller.signal
                    });

                    if (!response.ok) {
                        throw new Error('Unexpected response: ' + response.status);
                    }

                    var html = await response.text();
                    if (currentRequest !== controller) return;

                    quoteForm.innerHTML = html;
                    var zipInput = quoteForm.querySelector('#zip');
                    if (zipInput) zipInput.focus();
                } catch (error) {
                    if (error.name === 'AbortError' || currentRequest !== controller) return;
                    quoteForm.innerHTML = '<p class="quote-error" role="alert">Unable to load the quote form. Please select a product again.</p>';
                } finally {
                    if (currentRequest === controller) currentRequest = null;
                }
            });
        });

        // Both login menus start closed. Mobile has a separate markup hierarchy.
        document.querySelectorAll('.login-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                var menu = document.getElementById(toggle.getAttribute('aria-controls'));
                if (!menu) return;

                menu.hidden = !menu.hidden;
                toggle.setAttribute('aria-expanded', String(!menu.hidden));
            });
        });

        var refresh = document.getElementById('refresh-events');
        var count = document.getElementById('event-count');
        var state = document.getElementById('analytics-state');
        var recent = document.getElementById('recent-events');

        if (state) state.textContent = window.analytics ? 'Yes' : 'No';

        async function refreshEvents() {
            if (!count && !recent) return;
            try {
                var response = await fetch('/api/analytics/events');
                if (!response.ok) throw new Error('Unexpected response: ' + response.status);
                var events = await response.json();
                if (count) count.textContent = Array.isArray(events) ? String(events.length) : 'Unavailable';
                if (recent) recent.textContent = JSON.stringify(events.slice(-10).reverse(), null, 2);
            } catch {
                if (count) count.textContent = 'Unavailable';
                if (recent) recent.textContent = 'Unable to load events.';
            }
            if (state) state.textContent = window.analytics ? 'Yes' : 'No';
        }

        if (refresh) refresh.addEventListener('click', refreshEvents);
        refreshEvents();
    });
})(window, document);
