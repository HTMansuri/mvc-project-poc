/* Local analytics adapter for the existing visitor-interaction POC.
 * No external analytics provider is contacted.
 */
(function (window) {
    'use strict';

    async function post(eventName, event) {
        try {
            const response = await fetch('/api/analytics/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventName: eventName,
                    event: event || {},
                    page: window.location.href
                })
            });
            if (!response.ok) {
                console.warn('Analytics POC endpoint returned', response.status);
            }
        } catch (error) {
            console.warn('Analytics POC endpoint unavailable.', error);
        }
    }

    window.analytics = {
        event: function (eventName, eventData) {
            return post(eventName, eventData);
        },
        page: function () {
            return post('page_view', { page: window.location.href });
        }
    };
})(window);
