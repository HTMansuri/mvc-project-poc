import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const trackingJs = read('wwwroot/js/click-tracking.js');
const analyticsJs = read('wwwroot/js/analytics-api-client.js');
const layout = read('Views/Shared/_Layout.cshtml');

function createClick(id = 'quotegriditem_auto', isButton = true) {
    const anchor = {
        nodeType: 1,
        href: 'http://localhost:5088/#quote-form',
        innerText: 'Auto', id, className: isButton ? 'quotegriditem button' : '',
        name: '', textContent: 'Auto',
        matches(selector) { return isButton && selector.includes('.button'); },
        getAttribute() { return null; },
        closest(selector) {
            if (selector === '[id^="comp-"]') return null;
            if (selector.includes('a[href]')) return this;
            if (isButton && selector.includes('[role="button"]')) return this;
            return null;
        }
    };
    return { target: anchor };
}

function runTracking(analytics) {
    const listeners = new Map();
    const document = {
        addEventListener: (name, callback) => listeners.set(name, callback),
        body: { addEventListener: () => {} }
    };
    const window = analytics ? { analytics } : {};
    vm.runInNewContext(trackingJs, { window, document });
    return { window, listeners };
}

test('layout loads the working analytics adapter before click tracking', () => {
    assert.match(layout, /src="~\/js\/analytics-api-client\.js"/);
    assert.ok(layout.indexOf('analytics-api-client.js') < layout.indexOf('click-tracking.js'));
});

test('analytics adapter posts events to the local API', async () => {
    const calls = [];
    const window = { location: { href: 'http://localhost:5088/' } };
    const fetch = async (url, opts) => {
        calls.push({ url, opts });
        return { ok: true, status: 202 };
    };
    vm.runInNewContext(analyticsJs, { window, fetch, console });
    await window.analytics.event('button-tap', { key: 'quotegriditem_auto' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, '/api/analytics/events');
    const payload = JSON.parse(calls[0].opts.body);
    assert.equal(payload.eventName, 'button-tap');
    assert.equal(payload.event.key, 'quotegriditem_auto');
});

test('click tracking reports a button-tap and correct element ID', () => {
    const events = [];
    const { window } = runTracking({ event: (name, data) => events.push({ name, data }) });
    window.clientClickTracking.trackClick(createClick());
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'button-tap');
    assert.equal(events[0].data.key, 'quotegriditem_auto');
});

test('analytics tracker remains safe when analytics global is unavailable', () => {
    const { window } = runTracking();
    assert.doesNotThrow(() => window.clientClickTracking.trackClick(createClick()));
});