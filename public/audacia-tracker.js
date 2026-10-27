// Tracker da Audácia (comportamento e mapa de calor). Copiado sem alteração de medicao-bora.html,
// enviado pelo Alex em 27/10/2026. Carregado em todas as páginas pelo AnalyticsBoot.
// Os eventos da LP chegam como `custom` por window.audaciaTrack (lib/analytics.ts).
window.AUDACIA_TRACKER={endpoint:"https://uwsrhlifgdpmkezduimk.supabase.co/functions/v1/tracker-pixel",key:"081f7fd91ab3f2f13b6b22b8819605db"};
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__audacia_tracker_loaded) return;
  window.__audacia_tracker_loaded = true;

  var cfg = window.AUDACIA_TRACKER || {};
  if (!cfg.endpoint || !cfg.key) return;

  var COOKIE = 'audacia_vid';
  var COOKIE_DAYS = 730;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return match ? match[1] : null;
  }
  /* O DOMÍNIO DO COOKIE TEM QUE SER TENTADO, NÃO PRESUMIDO (consertado em
     07/08/2026, medido ao ligar o tracker no athleteshub.com.br).

     O BUG: pegar os dois últimos rótulos do host dá `.com.br` num domínio
     brasileiro, e `.com.br` é SUFIXO PÚBLICO. Nenhum navegador aceita cookie
     de sufixo público, então o cookie simplesmente não gravava e CADA PÁGINA
     VIRAVA UM VISITANTE NOVO: sem sessão, sem jornada, sem ligar lead à visita.
     Silencioso, porque `document.cookie =` não devolve erro. Nos domínios de
     dois rótulos (boraassessoria.com) funcionava, e foi por isso que passou.

     A saída não é lista de sufixos (ela muda e envelhece): é tentar com o
     domínio, conferir se pegou, e cair para o host atual quando não pegou. */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    var base = name + '=' + value + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
    var domain = '';
    try {
      var host = location.hostname.split('.');
      if (host.length >= 2) domain = '; domain=.' + host.slice(-2).join('.');
    } catch (_e) {}
    if (domain) {
      document.cookie = base + domain;
      if (getCookie(name) === value) return; // o navegador aceitou: subdomínios compartilham
    }
    document.cookie = base; // host atual, que é melhor do que cookie nenhum
  }
  function generateId() {
    return 'v_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36) +
      Math.random().toString(36).slice(2, 6);
  }

  var visitorId = getCookie(COOKIE);
  if (!visitorId) {
    visitorId = generateId();
    setCookie(COOKIE, visitorId, COOKIE_DAYS);
  }
  try { sessionStorage.setItem('audacia_vid', visitorId); } catch (_e) {}

  function parseUtms() {
    var params = new URLSearchParams(location.search || '');
    return {
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_term: params.get('utm_term') || null,
      utm_content: params.get('utm_content') || null,
      gclid: params.get('gclid') || null,
      fbclid: params.get('fbclid') || null,
      msclkid: params.get('msclkid') || null,
    };
  }

  // Fila com flush em batch (reduz requests)
  var queue = [];
  var flushTimer = null;
  function send(event_type, extra) {
    var body = {
      visitor_id: visitorId,
      event_type: event_type,
      url: location.href,
      path: location.pathname,
      title: document.title,
      referrer: document.referrer || '',
    };
    var utms = parseUtms();
    for (var k in utms) body[k] = utms[k];
    if (extra) for (var k2 in extra) body[k2] = extra[k2];

    /* EVENTO DE DESPEDIDA NÃO PODE IR PRA FILA (consertado em 07/08/2026,
       medido no banco: 247 pageviews contra 62 scroll_depth e ZERO quick_back).

       O BUG: `scroll_depth` e `quick_back` só existem no `pagehide`, e o
       `pagehide → flushNow` é registrado ANTES dos handlers deles. Listener de
       evento roda na ordem de registro, então o flush esvaziava a fila e SÓ
       DEPOIS o evento era enfileirado — pra ninguém. O que chegava era o
       resto: o timer de 3s pegando a aba que escondeu sem morrer.

       Quem nasce na saída da página vai imediato, por sendBeacon, que é
       justamente a API feita pra sobreviver ao unload. */
    if (event_type === 'pageview' || event_type === 'identify' || event_type === 'duration' ||
        event_type === 'scroll_depth' || event_type === 'quick_back') {
      flush([body]);
      return;
    }
    queue.push(body);
    if (queue.length >= 10) { flushNow(); return; }
    if (!flushTimer) flushTimer = setTimeout(flushNow, 3000);
  }
  function flushNow() {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (queue.length === 0) return;
    var batch = queue.splice(0);
    flush(batch);
  }
  function flush(batch) {
    var url = cfg.endpoint + '?key=' + encodeURIComponent(cfg.key);
    // Manda um por um (endpoint é por evento)
    batch.forEach(function (item) {
      var data = JSON.stringify(item);
      var blob = new Blob([data], { type: 'application/json' });
      if (navigator.sendBeacon && navigator.sendBeacon(url, blob)) return;
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data, keepalive: true, mode: 'cors', credentials: 'omit',
        }).catch(function () {});
      } catch (_e) {}
    });
  }
  window.addEventListener('pagehide', flushNow);
  window.addEventListener('beforeunload', flushNow);

  // === 1) Pageview ao carregar ===
  var pageStart = Date.now();
  send('pageview', {});

  // === 2) Tempo na página ===
  var sentDuration = false;
  function sendDuration() {
    if (sentDuration) return;
    sentDuration = true;
    var seconds = Math.round((Date.now() - pageStart) / 1000);
    if (seconds > 0 && seconds < 3600) send('duration', { duration_seconds: seconds });
  }
  window.addEventListener('pagehide', sendDuration);
  window.addEventListener('beforeunload', sendDuration);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendDuration();
  });

  // === 3) SPA detection ===
  var lastPath = location.pathname;
  function checkUrlChange() {
    if (location.pathname !== lastPath) {
      sendDuration();
      flushNow();
      lastPath = location.pathname;
      pageStart = Date.now();
      sentDuration = false;
      resetPageState();
      send('pageview', {});
    }
  }
  setInterval(checkUrlChange, 1000);

  // === 4) Scroll depth ===
  var maxScrollPct = 0;
  function getScrollPct() {
    var doc = document.documentElement;
    var scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    var docHeight = Math.max(doc.scrollHeight, doc.offsetHeight, document.body ? document.body.scrollHeight : 0);
    var winHeight = window.innerHeight || doc.clientHeight;
    if (docHeight <= winHeight) return 100;
    return Math.round(((scrollTop + winHeight) / docHeight) * 100);
  }
  function trackScroll() {
    var pct = getScrollPct();
    if (pct > maxScrollPct) maxScrollPct = pct;
  }
  window.addEventListener('scroll', trackScroll, { passive: true });
  /* A PROFUNDIDADE VAI DENTRO DE `properties` (consertado em 07/08/2026).

     O BUG: isto mandava `max_depth_percent` na raiz do corpo, e a edge
     function só grava `body.properties`. As 62 linhas de `scroll_depth` que
     chegaram tinham `properties` NULL — o evento existia, o número não. O
     dashboard lia `properties.max_depth_percent` como 0 e jogava todo mundo
     no balde "0-25%", ou seja: mostrava um gráfico falso, não um vazio. */
  var sentScroll = false;
  function sendScrollDepth() {
    if (sentScroll) return;
    sentScroll = true;
    if (maxScrollPct > 0) send('scroll_depth', { properties: { max_depth_percent: maxScrollPct } });
  }
  window.addEventListener('pagehide', sendScrollDepth);
  window.addEventListener('beforeunload', sendScrollDepth);

  function resetPageState() {
    maxScrollPct = 0;
    sentScroll = false;
    recentClicks = [];
  }

  // === 5) Click tracking + Rage clicks + Dead clicks ===
  var recentClicks = [];
  var RAGE_WINDOW_MS = 2000;
  var RAGE_DIST_PX = 50;
  var RAGE_THRESHOLD = 3;

  function cssPath(el) {
    if (!el || el.nodeType !== 1) return '';
    var parts = [];
    var depth = 0;
    while (el && el.nodeType === 1 && depth < 5) {
      var name = el.nodeName.toLowerCase();
      if (el.id) { parts.unshift(name + '#' + el.id); break; }
      if (el.className && typeof el.className === 'string') {
        var cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (cls) name += '.' + cls;
      }
      parts.unshift(name);
      el = el.parentElement;
      depth++;
    }
    return parts.join(' > ');
  }

  function textOf(el) {
    if (!el) return '';
    var t = (el.innerText || el.textContent || '').trim().slice(0, 80);
    return t;
  }

  function isInteractive(el) {
    if (!el) return false;
    var tag = el.nodeName;
    if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'].indexOf(tag) >= 0) return true;
    if (el.getAttribute('role') === 'button') return true;
    if (el.onclick) return true;
    return false;
  }

  // Dead click detection: clica e nada muda no DOM nem navega em 700ms
  var pendingDeadCheck = null;
  function startDeadCheck(el, payload) {
    if (pendingDeadCheck) clearTimeout(pendingDeadCheck.timer);
    var initialHtml = document.body ? document.body.innerHTML.length : 0;
    var initialUrl = location.href;
    pendingDeadCheck = {
      timer: setTimeout(function () {
        if (location.href !== initialUrl) return; // navegou: não é dead
        var newLen = document.body ? document.body.innerHTML.length : 0;
        var changed = Math.abs(newLen - initialHtml) > 50; // mudou DOM significativamente
        if (!changed && !isInteractive(el)) {
          send('dead_click', payload);
        }
      }, 700),
    };
  }

  document.addEventListener('click', function (e) {
    var el = e.target;
    if (!el) return;
    // Ignora cliques em inputs (privacidade) e em elementos não-renderizados
    var tag = el.nodeName;
    if (tag === 'PASSWORD' || tag === 'TEXTAREA') return;
    if (el.type === 'password') return;

    var x = e.clientX, y = e.clientY;
    var pageX = e.pageX, pageY = e.pageY;
    var sel = cssPath(el);
    var text = textOf(el);
    var href = el.href || '';
    var payload = {
      properties: {
        x: x, y: y,
        page_x: pageX, page_y: pageY,
        selector: sel,
        text: text,
        tag: tag,
        href: href,
        viewport_w: window.innerWidth,
        viewport_h: window.innerHeight,
      },
    };

    // Rage detection
    var now = Date.now();
    recentClicks = recentClicks.filter(function (c) { return now - c.t < RAGE_WINDOW_MS; });
    recentClicks.push({ t: now, x: x, y: y });
    var cluster = recentClicks.filter(function (c) {
      return Math.abs(c.x - x) < RAGE_DIST_PX && Math.abs(c.y - y) < RAGE_DIST_PX;
    });
    if (cluster.length >= RAGE_THRESHOLD) {
      send('rage_click', {
        properties: {
          click_count: cluster.length,
          x: x, y: y,
          selector: sel,
          text: text,
        },
      });
      recentClicks = []; // reset pra não duplicar
    }

    // Click normal
    send('click', payload);

    // Dead click: só se não for interativo
    startDeadCheck(el, payload);
  }, true);

  // === 6) JS errors ===
  window.addEventListener('error', function (e) {
    send('js_error', {
      properties: {
        message: (e.message || '').slice(0, 500),
        source: (e.filename || '').slice(0, 200),
        line: e.lineno || 0,
        column: e.colno || 0,
        stack: e.error && e.error.stack ? String(e.error.stack).slice(0, 1000) : '',
      },
    });
  });
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    var msg = '';
    if (reason instanceof Error) msg = reason.message;
    else if (typeof reason === 'string') msg = reason;
    else { try { msg = JSON.stringify(reason); } catch (_e) { msg = String(reason); } }
    send('js_error', {
      properties: {
        message: ('Promise rejection: ' + msg).slice(0, 500),
        stack: reason && reason.stack ? String(reason.stack).slice(0, 1000) : '',
      },
    });
  });

  // === 7) Quick back (volta logo apertando back) ===
  var quickBackChecked = false;
  setTimeout(function () { quickBackChecked = true; }, 5000);
  window.addEventListener('pagehide', function () {
    if (!quickBackChecked) {
      var seconds = Math.round((Date.now() - pageStart) / 1000);
      if (seconds < 5) send('quick_back', { properties: { seconds_on_page: seconds } });
    }
  });

  // === 8) Forms ===
  function injectIntoForms() {
    document.querySelectorAll('form').forEach(function (form) {
      if (form.querySelector('input[name="audacia_visitor_id"]')) return;
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'audacia_visitor_id';
      input.value = visitorId;
      form.appendChild(input);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectIntoForms);
  } else { injectIntoForms(); }
  setInterval(injectIntoForms, 2000);

  // Form submit tracking
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.nodeName !== 'FORM') return;
    send('form_submit', {
      properties: {
        form_id: form.id || '',
        form_name: form.name || '',
        form_action: form.action || '',
        classes: form.className || '',
      },
    });
  }, true);

  // === 9) API global pra eventos customizados ===
  window.audaciaTrack = function (eventName, properties) {
    send('custom', { properties: { event_name: eventName, data: properties || {} } });
  };
})();
