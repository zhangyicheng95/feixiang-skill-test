/**
 * stroke-loader · Feixiang-Laoshi Chinese-Character Stroke-Order Data Loader (v10.0.0)
 * ─────────────────────────────────────────────
 * Purpose:
 *   1. Asynchronously load stroke-data.json from the CDN (2,838 curriculum-reviewed characters)
 *   2. Expose the global getStrokeData(char) query interface
 *   3. Dispatch a stroke-data-ready event when loading finishes
 *
 * How to import:
 *   <script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v59/templates/stroke-loader.js"></script>
 *
 * How to use:
 *   window.addEventListener('stroke-data-ready', function() {
 *     var d = window.getStrokeData('学');
 *     // d = { char:'学', count:8, strokes:['点',...,'横'], source:'db' }
 *   });
 *
 * Data source:
 *   Feixiang-Laoshi 2,838-character curriculum-reviewed edition (stroke_data_v2.json, 2026-04-20).
 *   Six common cross-dataset error categories have already been corrected:
 *   穴-radical / 阝 / 殳 / 朵 / 学-family / 铅.
 */
(function (global) {
  'use strict';

  // Dynamically infer DATA_URL: derive the version number from this script's own src so the
  // loader and stroke-data.json are always on the same version. This means no manual two-place
  // version bump when the skill is upgraded.
  var DATA_URL = (function () {
    var fallback = 'https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v59/assets/stroke-data.json';
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || '';
        if (src.indexOf('/stroke-order/') !== -1 && src.indexOf('stroke-loader.js') !== -1) {
          return src.replace(/templates\/stroke-loader\.js.*$/, 'assets/stroke-data.json');
        }
      }
    } catch (e) {}
    return fallback;
  })();

  // The 32 standard stroke names (used as a whitelist for validation)
  var STD32 = [
    '点','横','竖','撇','捺','提',
    '横折','竖折','撇折','横撇','撇点',
    '竖钩','弯钩','斜钩','卧钩','竖弯钩','横钩','横折钩','横折弯钩',
    '横撇弯钩','横折折折钩','竖折折钩','横斜钩',
    '竖提','横折提',
    '竖弯','横折弯','横折折撇','竖折撇','竖折折','横折折','横折折折'
  ];
  var STD32_SET = {};
  for (var i = 0; i < STD32.length; i++) STD32_SET[STD32[i]] = true;

  var strokeDatabase = null;  // { "char": ["stroke","name","array"] }
  var textbookSet = null;     // Set: 2,865 primary-school textbook characters (incl. textbook-patch-v1 patches)
  var loadStatus = 'pending';  // pending / loading / ready / error
  var loadError = null;

  function setStatus(status, err) {
    loadStatus = status;
    if (err) loadError = err;
    if (status === 'ready' || status === 'error') {
      var ev;
      try {
        ev = new Event('stroke-data-ready');
      } catch (e) {
        ev = document.createEvent('Event');
        ev.initEvent('stroke-data-ready', false, false);
      }
      ev.detail = { status: status, error: err, total: strokeDatabase ? Object.keys(strokeDatabase).length : 0 };
      global.dispatchEvent(ev);
    }
  }

  function loadData() {
    if (loadStatus !== 'pending') return;
    loadStatus = 'loading';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', DATA_URL, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var resp = xhr.response;
        // Handle UAs that do not parse JSON automatically
        if (typeof resp === 'string') {
          try { resp = JSON.parse(resp); } catch (e) { setStatus('error', 'JSON parsing failed'); return; }
        }
        if (!resp || !resp.data) {
          setStatus('error', 'Malformed data');
          return;
        }
        strokeDatabase = resp.data;
        // Build the index of primary-school textbook characters
        if (resp.textbook_chars && typeof resp.textbook_chars === 'string') {
          textbookSet = new Set();
          for (var k = 0; k < resp.textbook_chars.length; k++) {
            textbookSet.add(resp.textbook_chars[k]);
          }
        }
        try {
          if (global.console && global.console.debug) {
            var totalN = Object.keys(strokeDatabase).length;
            var textbookN = textbookSet ? textbookSet.size : 0;
            global.console.debug('[stroke-loader] loaded ' + totalN + ' chars ('
              + 'textbook ' + textbookN + ' + extended ' + (totalN - textbookN) + ')');
          }
        } catch (e) {}
        setStatus('ready');
      } else {
        setStatus('error', 'HTTP ' + xhr.status);
      }
    };
    xhr.onerror = function () {
      setStatus('error', 'Network error');
    };
    xhr.send();
  }

  /**
   * Look up a character's stroke-order data
   * @param {string} char A single Chinese character
   * @returns {object} Standard result object — never throws
   *   Normal: { char, count:N, strokes:[...], source:'db', tier:'textbook'|'extended' }
   *   Not loaded yet: { char, count:0, strokes:[], source:'loading' }
   *   Load failed: { char, count:0, strokes:[], source:'error', error:'...' }
   *   Not in database: { char, count:0, strokes:[], source:'missing' }
   *   Contains a non-standard stroke (theoretically impossible — defensive): source:'invalid'
   *
   * `tier` field (since v10.6):
   *   - 'textbook': primary-school Chinese-textbook characters (2,865, including textbook-patch-v1).
   *                 Reviewed in 3 curriculum rounds, 100% reliable.
   *   - 'extended': dictionary expansion characters (4,953). Auto-mapping + heuristics.
   *                 Quality ≥98% but not fully reviewed.
   *
   * Recommended LLM / UI strategy:
   *   - Primary-school Chinese teaching: use only tier='textbook'; for extended characters,
   *     downgrade with "no authoritative data".
   *   - General stroke-order lookup: all are usable; flag extended characters in the UI as
   *     "to be verified".
   */
  function getStrokeData(char) {
    if (typeof char !== 'string' || char.length === 0) {
      return { char: String(char), count: 0, strokes: [], source: 'invalid', error: 'Input is not a string' };
    }

    if (loadStatus === 'pending' || loadStatus === 'loading') {
      return { char: char, count: 0, strokes: [], source: 'loading' };
    }
    if (loadStatus === 'error') {
      return { char: char, count: 0, strokes: [], source: 'error', error: loadError || 'Load failed' };
    }

    var strokes = strokeDatabase[char];
    if (!strokes || strokes.length === 0) {
      return { char: char, count: 0, strokes: [], source: 'missing' };
    }

    // Whitelist re-validation (defensive)
    for (var j = 0; j < strokes.length; j++) {
      if (!STD32_SET[strokes[j]]) {
        return {
          char: char, count: 0, strokes: [],
          source: 'invalid',
          error: 'Stroke ' + (j + 1) + ' "' + strokes[j] + '" is not among the 32 standards'
        };
      }
    }

    // v11: two-tier — textbook (within primary-school scope) / extended (outside the scope)
    var tier = (textbookSet && textbookSet.has(char)) ? 'textbook' : 'extended';
    // v10.7: each element of `strokes` is upgraded to a String instance carrying .name/.index/.path
    // so that all three of the LLM's common idioms work:
    //   - ${s}               → "撇" (native toString)
    //   - s.name             → "撇" (attached field)
    //   - s.index            → 1 (1-based ordinal)
    //   - strokes[i] === '撇' still holds (native String comparison needs ==)
    //   - strokes.join('/')  → "撇/横/横/弯钩"
    var enhanced = [];
    var detail = [];
    for (var k = 0; k < strokes.length; k++) {
      var name = strokes[k];
      /* eslint-disable no-new-wrappers */
      var s = new String(name);
      s.name = name;
      s.index = k + 1;
      s.path = '';
      enhanced.push(s);
      detail.push({ index: k + 1, name: name, path: '' });
    }
    return {
      char: char,
      count: strokes.length,
      strokes: enhanced,                  // Enhanced version (compatible with `s.name` style)
      strokes_detail: detail,             // Pure object array (recommended)
      source: 'db',
      tier: tier                          // 'textbook' (within primary-school scope) / 'extended' (outside)
    };
  }

  /**
   * Test whether a character is a textbook character
   * (primary-school Chinese writeable / recognition list).
   * @param {string} char
   * @returns {boolean|null} true / false; returns null if the database is not loaded yet.
   */
  function isTextbookChar(char) {
    if (loadStatus !== 'ready' || !textbookSet) return null;
    return textbookSet.has(char);
  }

  // Expose global API
  global.getStrokeData = getStrokeData;
  global.isTextbookChar = isTextbookChar;
  global._strokeLoader = {
    getStatus: function () { return loadStatus; },
    getError: function () { return loadError; },
    getStd32: function () { return STD32.slice(); },
    getDataURL: function () { return DATA_URL; },
    getTextbookTotal: function () { return textbookSet ? textbookSet.size : 0; },
    getExtendedTotal: function () { return strokeDatabase ? Object.keys(strokeDatabase).length - (textbookSet ? textbookSet.size : 0) : 0; },
    reload: function () {
      loadStatus = 'pending';
      loadError = null;
      strokeDatabase = null;
      textbookSet = null;
      loadData();
    }
  };

  // Auto-trigger loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }
})(typeof window !== 'undefined' ? window : this);
