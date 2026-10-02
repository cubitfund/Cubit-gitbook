(function () {
  'use strict';
  if (window.__cubitDocsLoaded) return;
  window.__cubitDocsLoaded = true;
  var mobile = window.matchMedia('(max-width: 760px)');
  var config = JSON.parse(document.querySelector('#cubit-i18n').textContent);
  var ui = config.ui;
  var formatter = new Intl.NumberFormat(config.locale.tag, { maximumFractionDigits: 1 });
  var searchSequence = 0;
  var searchIndexPromise;
  var languageOpen = false;
  var observer;
  var menuWasOpen = false;

  function menu(open, restoreFocus) {
    var book = document.querySelector('.book');
    var sidebar = document.querySelector('.book-summary');
    var button = document.querySelector('.mobile-menu');
    if (!book || !sidebar || !button) return;
    book.classList.toggle('with-summary', !mobile.matches || open);
    sidebar.inert = mobile.matches && !open;
    sidebar.setAttribute('aria-hidden', String(mobile.matches && !open));
    button.setAttribute('aria-expanded', String(mobile.matches && open));
    button.setAttribute('aria-label', open ? ui.closeSummary : ui.openSummary);
    button.firstElementChild.textContent = open ? '✕' : '☰';
    document.querySelector('.book-body').inert = mobile.matches && open;
    if (restoreFocus) button.focus();
    menuWasOpen = mobile.matches && open;
  }

  function preparePage() {
    searchSequence++;
    var searchInput = document.querySelector('#cubit-search');
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', updateSearch);
    }
    if (searchInput) searchInput.value = new URLSearchParams(location.search).get('q') || '';
    updateSearch();
    var book = document.querySelector('.book');
    if (book && !book.querySelector('.sidebar-shade')) {
      var shade = document.createElement('button');
      shade.type = 'button';
      shade.className = 'sidebar-shade';
      shade.tabIndex = -1;
      shade.setAttribute('aria-label', ui.closeSummary);
      book.appendChild(shade);
    }
    var sidebar = document.querySelector('.book-summary');
    if (sidebar) sidebar.id = 'cubit-sidebar';
    menu(false, false);
    var toc = document.querySelector('#on-this-page');
    if (observer) observer.disconnect();
    if (toc) {
      toc.replaceChildren();
      document.querySelectorAll('#article-body h2[id]').forEach(function (heading) {
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        toc.appendChild(link);
      });
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          toc.querySelectorAll('a').forEach(function (link) {
            var active = decodeURIComponent(link.hash.slice(1)) === entry.target.id;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      }, { root: document.querySelector('.body-inner'), rootMargin: '-5% 0px -70% 0px' });
      document.querySelectorAll('#article-body h2[id]').forEach(function (el) { observer.observe(el); });
    }
    document.querySelectorAll('#article-body pre').forEach(function (pre) {
      if (pre.querySelector('.copy-code')) return;
      var code = pre.querySelector('code');
      if (!code) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = ui.copy;
      button.setAttribute('aria-label', ui.copyCode);
      button.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(code.textContent);
          button.textContent = ui.copied;
        } catch (_) {
          var range = document.createRange();
          range.selectNodeContents(code);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          button.textContent = ui.textSelected;
        }
        setTimeout(function () { button.textContent = ui.copy; }, 2200);
      });
      pre.appendChild(button);
    });
    var input = document.querySelector('#market-cap');
    if (input && !input.dataset.bound) {
      input.dataset.bound = 'true';
      input.addEventListener('input', updateWall);
      document.querySelectorAll('[data-market-preset]').forEach(function (button) {
        button.addEventListener('click', function () { input.value = button.dataset.marketPreset; updateWall(); });
      });
      updateWall();
    }
  }

  function updateWall() {
    var input = document.querySelector('#market-cap');
    if (!input) return;
    var cap = Number(input.value);
    var target = 0.4 * cap + 0.6 * 7000;
    document.querySelector('#market-value').textContent = formatter.format(cap) + ' ' + ui.units;
    document.querySelector('#target-value').textContent = formatter.format(target) + ' ' + ui.units;
    document.querySelector('#lab-market-bar').style.width = (cap / 120000 * 100) + '%';
    document.querySelector('#lab-target-bar').style.width = (target / 120000 * 100) + '%';
    document.querySelector('#lab-target-label').textContent = formatter.format(target / 1000) + 'k';
    document.querySelector('#lab-market-label').textContent = formatter.format(cap / 1000) + 'k';
  }

  function setLanguageMenu(open, restoreFocus) {
    var button = document.querySelector('.lang-toggle');
    var list = document.querySelector('.lang-menu');
    languageOpen = open;
    list.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) {
      menu(false, false);
      (list.querySelector('[aria-selected="true"]') || list.querySelector('[role="option"]')).focus();
    } else if (restoreFocus) button.focus();
  }

  function switchLanguage(id) {
    if (!config.locales.some(function (locale) { return locale.id === id; })) return;
    try { localStorage.setItem('cubit.docs.locale', id); } catch (_) {}
    var parts = location.pathname.split('/');
    if (config.locales.some(function (locale) { return locale.id === parts[1]; })) parts.splice(1, 1);
    var page = parts.join('/').replace(/^\//, '') || 'index.html';
    location.assign('/' + id + '/' + page + location.search + location.hash);
  }

  function normalize(text) {
    return text.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase(config.locale.tag).replace(/đ/g, 'd');
  }
  async function updateSearch() {
    var sequence = ++searchSequence;
    var input = document.querySelector('#cubit-search');
    if (!input) return;
    var query = input.value.trim().slice(0, 200);
    var results = document.querySelector('#cubit-search-results');
    var documentBody = document.querySelector('#cubit-document');
    var title = document.querySelector('#search-results-title');
    var hint = document.querySelector('#search-results-hint');
    var list = results.querySelector('ul');
    var book = document.querySelector('.book');
    results.hidden = !query;
    documentBody.hidden = Boolean(query);
    book.classList.toggle('with-search', Boolean(query));
    var url = new URL(location.href);
    if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    list.replaceChildren();
    if (!query) return;
    title.textContent = ui.searchLoading;
    hint.textContent = '';
    try {
      if (!searchIndexPromise) searchIndexPromise = fetch('/' + config.locale.id + '/search_index.json').then(function (response) {
        if (!response.ok) throw new Error('Search unavailable');
        return response.json();
      }).catch(function (error) { searchIndexPromise = undefined; throw error; });
      var index = await searchIndexPromise;
      if (sequence !== searchSequence) return;
      var tokens = normalize(query).split(/\s+/).filter(Boolean);
      var normalizedQuery = normalize(query);
      var matches = index.map(function (entry) {
        var body = normalize(entry.body);
        var heading = normalize(entry.title);
        var score = (heading.includes(normalizedQuery) ? 10 : 0) + tokens.filter(function (token) { return heading.includes(token); }).length;
        return { entry: entry, score: score, matches: tokens.every(function (token) { return body.includes(token) || heading.includes(token); }) };
      }).filter(function (item) { return item.matches; }).sort(function (a, b) { return b.score - a.score; });
      title.textContent = (matches.length ? ui.resultsFor : ui.noResultsFor).replace('{query}', query);
      hint.textContent = matches.length ? '' : ui.searchHint;
      matches.forEach(function (item) {
        var entry = item.entry;
        var row = document.createElement('li');
        row.className = 'search-results-item';
        var heading = document.createElement('h2');
        var link = document.createElement('a');
        link.href = entry.href;
        link.textContent = entry.title;
        heading.appendChild(link);
        var snippet = document.createElement('p');
        snippet.textContent = entry.body.slice(0, 240) + (entry.body.length > 240 ? '…' : '');
        row.append(heading, snippet);
        list.appendChild(row);
      });
    } catch (_) {
      if (sequence !== searchSequence) return;
      title.textContent = ui.searchError;
    }
  }

  document.addEventListener('click', function (event) {
    var option = event.target.closest('[data-language]');
    if (option) { switchLanguage(option.dataset.language); return; }
    if (event.target.closest('.lang-toggle')) { setLanguageMenu(!languageOpen, false); return; }
    if (languageOpen && !event.target.closest('.language-selector')) setLanguageMenu(false, false);
    if (event.target.closest('.mobile-menu')) menu(!menuWasOpen, false);
    if (event.target.closest('.sidebar-shade')) menu(false, true);
    if (event.target.closest('.mobile-search-results')) {
      document.querySelector('#cubit-search').blur();
      menu(false, false);
      document.querySelector('#search-results-title').focus();
    }
    if (mobile.matches && event.target.closest('.book-summary a')) menu(false, false);
  });
  document.addEventListener('keydown', function (event) {
    if (languageOpen) {
      var options = Array.from(document.querySelectorAll('.lang-option'));
      var current = options.indexOf(document.activeElement);
      if (event.key === 'Escape') { event.preventDefault(); setLanguageMenu(false, true); return; }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        var next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus(); return;
      }
      if (event.key === 'Tab') setLanguageMenu(false, true);
    } else if (event.target.closest('.lang-toggle') && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); setLanguageMenu(true, false); return;
    }
    var editing = event.target.matches('input,textarea,select,[contenteditable="true"]');
    if ((event.key === '/' && !editing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault();
      menu(true, false);
      document.querySelector('#cubit-search')?.focus();
    }
    if (event.key === 'Escape') {
      var input = document.querySelector('#cubit-search');
      if (input && input.value) { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); }
      if (mobile.matches) menu(false, true);
    }
    if (event.key === 'Enter' && event.target.id === 'cubit-search' && mobile.matches) {
      event.preventDefault();
      event.target.blur();
      menu(false, false);
      document.querySelector('#search-results-title').focus();
    }
    if (event.key === 'Tab' && mobile.matches && menuWasOpen) {
      var focusable = [document.querySelector('.mobile-menu'), document.querySelector('.lang-toggle')].concat(Array.from(document.querySelectorAll('.book-summary input, .book-summary a, .mobile-search-results')).filter(function (element) { return element.offsetParent !== null; }));
      var index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); focusable.at(-1).focus(); }
      else if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
    }
  });
  mobile.addEventListener('change', function () { menu(false, false); });
  require(['gitbook'], function (gitbook) {
    gitbook.events.on('page.change', preparePage);
    preparePage();
  });
})();
