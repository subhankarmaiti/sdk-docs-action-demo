/**
 * Version switcher for docs published by sdk-docs-hub.
 *
 * A single copy of this file lives at the site root and is included by every
 * published version, so a new release is immediately offered by older docs too.
 *
 * Config comes from `versions.json` (`ui.mount`, `ui.position`) so that changing
 * the mount re-aims the control on already-published versions. The injected
 * <script> tag's data-mount / data-position attributes override it per version.
 */
(function () {
  'use strict';

  var ELEMENT_ID = 'sdk-docs-version-selector';
  var VERSION_SEGMENT = /\/(v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\//;
  var POSITIONS = ['left', 'right', 'top', 'bottom'];

  var script = document.currentScript;

  /** Site root without a trailing slash, e.g. `/my-sdk` or `` at a domain root. */
  function resolveSiteRoot() {
    if (script && script.src) {
      // The script always sits at the site root, so its own directory is the root.
      var url = new URL(script.src, window.location.href);
      return url.pathname.replace(/\/[^/]*$/, '').replace(/\/$/, '');
    }
    // Fall back to deriving it from the version segment in the current path.
    var match = VERSION_SEGMENT.exec(window.location.pathname);
    if (match) {
      return window.location.pathname.slice(0, match.index).replace(/\/$/, '');
    }
    return '';
  }

  var siteRoot = resolveSiteRoot();

  /**
   * The version directory this page is served from, or null when the page is the
   * root mirror (which always holds the newest stable).
   */
  function currentVersionTag() {
    var relative = window.location.pathname.slice(siteRoot.length);
    var match = VERSION_SEGMENT.exec(relative.charAt(0) === '/' ? relative : '/' + relative);
    return match ? match[1] : null;
  }

  /** Path of the current page relative to its version root, e.g. `classes/Client.html`. */
  function pathWithinVersion(tag) {
    var prefix = siteRoot + (tag ? '/' + tag : '');
    var rest = window.location.pathname.slice(prefix.length);
    return rest.replace(/^\/+/, '');
  }

  function readOverride(name, fallback) {
    if (!script) return fallback;
    var value = script.getAttribute('data-' + name);
    return value === null || value === '' ? fallback : value;
  }

  function normalisePosition(value) {
    var candidate = String(value || '').trim().toLowerCase();
    return POSITIONS.indexOf(candidate) === -1 ? 'right' : candidate;
  }

  function injectStyles() {
    if (document.getElementById(ELEMENT_ID + '-styles')) return;
    var style = document.createElement('style');
    style.id = ELEMENT_ID + '-styles';
    style.textContent = [
      '#' + ELEMENT_ID + ' {',
      '  display: inline-flex; align-items: center; gap: 0.4em;',
      '  font: inherit; font-size: 0.85rem; margin: 0 0.5em;',
      '}',
      '#' + ELEMENT_ID + ' select {',
      '  font: inherit; padding: 0.15em 0.4em; border-radius: 4px;',
      '  color: var(--color-nav-link-color, inherit);',
      '  background: var(--color-fill, transparent);',
      '  border: 1px solid var(--color-grid, rgba(128,128,128,0.4));',
      '  cursor: pointer; max-width: 14em;',
      '}',
      '#' + ELEMENT_ID + '[data-floating="1"] {',
      '  position: fixed; z-index: 2147483000;',
      '  padding: 0.35em 0.6em; border-radius: 6px;',
      '  background: var(--color-fill, #fff);',
      '  border: 1px solid var(--color-grid, rgba(128,128,128,0.4));',
      '  box-shadow: 0 2px 8px rgba(0,0,0,0.15);',
      '}',
      // Edges mirror the configured position so the control stays predictable.
      '#' + ELEMENT_ID + '[data-floating="1"][data-position="left"] { top: 1em; left: 1em; }',
      '#' + ELEMENT_ID + '[data-floating="1"][data-position="right"] { top: 1em; right: 1em; }',
      '#' + ELEMENT_ID + '[data-floating="1"][data-position="top"] {',
      '  top: 1em; left: 50%; transform: translateX(-50%);',
      '}',
      '#' + ELEMENT_ID + '[data-floating="1"][data-position="bottom"] {',
      '  bottom: 1em; left: 50%; transform: translateX(-50%);',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  /** First element matching any selector in the comma-separated priority list. */
  function findHost(mount) {
    var selectors = String(mount || '')
      .split(',')
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);

    for (var i = 0; i < selectors.length; i += 1) {
      try {
        var host = document.querySelector(selectors[i]);
        if (host) return host;
      } catch (_error) {
        // An invalid selector should not take the whole control down.
        if (window.console && console.warn) {
          console.warn('[sdk-docs-hub] ignoring invalid selector:', selectors[i]);
        }
      }
    }
    return null;
  }

  /**
   * Places the control relative to `host`.
   *
   * `left`/`right` treat the host as a sibling control (a toolbar button, say);
   * `top`/`bottom` treat it as a container to nest inside.
   */
  function mountElement(element, host, position) {
    if (!host || !host.parentNode) {
      element.setAttribute('data-floating', '1');
      document.body.appendChild(element);
      return;
    }
    element.removeAttribute('data-floating');
    switch (position) {
      case 'left':
        host.parentNode.insertBefore(element, host);
        break;
      case 'right':
        host.parentNode.insertBefore(element, host.nextSibling);
        break;
      case 'top':
        host.insertBefore(element, host.firstChild);
        break;
      case 'bottom':
        host.appendChild(element);
        break;
    }
  }

  function versionUrl(tag, stableTag, withinVersion) {
    // The newest stable is mirrored at the root, so it gets the version-less URL.
    var base = tag === stableTag ? siteRoot : siteRoot + '/' + tag;
    return base + '/' + withinVersion;
  }

  function landingUrl(tag, stableTag) {
    return tag === stableTag ? siteRoot + '/' : siteRoot + '/' + tag + '/';
  }

  function navigate(url) {
    window.location.assign(url + window.location.hash);
  }

  function buildControl(manifest, currentTag, mount, position) {
    var stableTag = manifest.stable;
    var versions = manifest.versions || [];
    var withinVersion = pathWithinVersion(currentTag);
    // A page served from the root mirror is showing the stable release.
    var selectedTag = currentTag || stableTag;

    var wrapper = document.createElement('div');
    wrapper.id = ELEMENT_ID;
    wrapper.setAttribute('data-position', position);

    var label = document.createElement('label');
    label.setAttribute('for', ELEMENT_ID + '-select');
    label.textContent = 'Version';

    var select = document.createElement('select');
    select.id = ELEMENT_ID + '-select';
    select.setAttribute('aria-label', 'Documentation version');

    var known = false;
    versions.forEach(function (entry) {
      var option = document.createElement('option');
      option.value = entry.path;
      option.textContent = entry.name + (entry.path === stableTag ? ' (latest)' : '');
      if (entry.path === selectedTag) {
        option.selected = true;
        known = true;
      }
      select.appendChild(option);
    });

    // The version being viewed may have been pruned; still show where we are.
    if (!known && selectedTag) {
      var unlisted = document.createElement('option');
      unlisted.value = selectedTag;
      unlisted.textContent = selectedTag + ' (unlisted)';
      unlisted.selected = true;
      select.insertBefore(unlisted, select.firstChild);
    }

    select.addEventListener('change', function () {
      var target = select.value;
      if (!target || target === selectedTag) return;
      var candidate = versionUrl(target, stableTag, withinVersion);
      var fallback = landingUrl(target, stableTag);

      if (!withinVersion) {
        navigate(fallback);
        return;
      }

      // Probe first: the same page may not exist in the target version.
      fetch(candidate, { method: 'HEAD' })
        .then(function (response) {
          navigate(response && response.ok ? candidate : fallback);
        })
        .catch(function () {
          navigate(fallback);
        });
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
  }

  function start(manifest) {
    var mount = readOverride('mount', (manifest.ui && manifest.ui.mount) || '');
    var position = normalisePosition(
      readOverride('position', (manifest.ui && manifest.ui.position) || 'right'),
    );
    var currentTag = currentVersionTag();

    injectStyles();

    function render() {
      if (document.getElementById(ELEMENT_ID)) return;
      var control = buildControl(manifest, currentTag, mount, position);
      mountElement(control, findHost(mount), position);
    }

    render();

    // Doc themes re-render their nav client-side (DocC is a Vue SPA), which drops
    // the control; re-insert whenever the DOM changes.
    if (window.MutationObserver && document.body) {
      new MutationObserver(render).observe(document.body, { childList: true, subtree: true });
    }
  }

  function boot() {
    // no-cache: the Pages CDN would otherwise keep serving an older version list.
    fetch(siteRoot + '/versions.json', { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('versions.json responded ' + response.status);
        return response.json();
      })
      .then(start)
      .catch(function (error) {
        if (window.console && console.warn) {
          console.warn('[sdk-docs-hub] version selector unavailable:', error);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
