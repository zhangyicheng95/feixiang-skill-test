/**
 * 飞象风课件预览壳 — 对齐飞象老师产物预览 UI
 * 外框 100%（顶栏 + 缩略图栏 + 浅灰舞台）；主区居中固定 960×540 画布
 */
window.__CW_SHELL_MAIN__ = function () {
  'use strict';

  var CANVAS_W = 960;
  var CANVAS_H = 540;
  var STAGE_BG = '#eef1f5';
  var THUMB_SCALE = 120 / CANVAS_W;

  function parseShared() {
    var el = document.querySelector('template.page-shared');
    return el ? el.innerHTML.trim() : '';
  }

  function parsePages() {
    return Array.prototype.slice
      .call(document.querySelectorAll('template.page-data'))
      .map(function (el) {
        return {
          id: Number(el.getAttribute('data-id')) || 0,
          name: el.getAttribute('data-name') || '',
          body: el.innerHTML,
        };
      })
      .sort(function (a, b) {
        return a.id - b.id;
      });
  }

  function buildSrcdoc(page, sharedHead, mode, index, total) {
    var meta =
      'window.__CW_MODE__=' +
      JSON.stringify(mode || 'main') +
      ';window.__CW_PAGE__={id:' +
      (page.id || 0) +
      ',index:' +
      (index || 0) +
      ',total:' +
      (total || 0) +
      ',name:' +
      JSON.stringify(page.name || '') +
      '};';

    var frameFill =
      'document.addEventListener("DOMContentLoaded",function(){var p=window.__CW_PAGE__||{};' +
      'document.querySelectorAll("[data-fx-pageno]").forEach(function(el){el.textContent=(p.index!=null?p.index+1:"")+" / "+(p.total||"");});' +
      'document.querySelectorAll("[data-fx-pagename]").forEach(function(el){if(!el.textContent.trim())el.textContent=p.name||"";});' +
      'document.querySelectorAll("[data-fx-progress]").forEach(function(h){if(h.children.length)return;for(var i=0;i<(p.total||0);i++){var d=document.createElement("i");d.className="fx-dot"+(i===p.index?" fx-dot--on":"");h.appendChild(d);}});' +
      '});';

    var ready =
      'window.addEventListener("load",function(){window.parent.postMessage({type:"pageReady",mode:' +
      JSON.stringify(mode || 'main') +
      ',index:' +
      (index || 0) +
      '},"*");});';

    var navKeys =
      'document.addEventListener("keydown",function(e){' +
      'if(window.__CW_MODE__!=="main")return;' +
      'var t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable))return;' +
      'if(e.key==="ArrowRight"||e.key===" "||e.key==="PageDown"){' +
      'e.preventDefault();window.parent.postMessage({type:"cwNav",dir:"next"},"*");' +
      '}else if(e.key==="ArrowLeft"||e.key==="PageUp"){' +
      'e.preventDefault();window.parent.postMessage({type:"cwNav",dir:"prev"},"*");' +
      '}});';

    var pageFix =
      '<style id="cw-page">' +
      'html,body{background:' +
      STAGE_BG +
      '}' +
      '.page-container{height:100%;max-height:100%;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}' +
      '</style>';

    return (
      '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' +
      '<style>*{box-sizing:border-box}html,body{margin:0;padding:0;width:' +
      CANVAS_W +
      'px;height:' +
      CANVAS_H +
      'px;overflow:hidden;background:' +
      STAGE_BG +
      '}</style>' +
      sharedHead +
      pageFix +
      '<script>' +
      meta +
      frameFill +
      '<\/script></head><body>' +
      page.body +
      '<script>' +
      ready +
      navKeys +
      '<\/script></body></html>'
    );
  }

  function CoursewareShell(pages, sharedHead) {
    this.pages = pages;
    this.sharedHead = sharedHead;
    this.index = 0;
    this.pageStates = {};
    this.mainIframe = null;
    this.frameWrap = null;
    this.bodyEl = null;
    this.stageEl = null;
    this.thumbList = null;
    this.titleEl = null;
    this.pageLabel = null;
    this.thumbIframes = [];
    this.scorm = null;
  }

  CoursewareShell.prototype._handleNavKey = function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      this.prev();
    }
  };

  CoursewareShell.prototype._focusFs = function () {
    if (!this.bodyEl) return;
    this.bodyEl.setAttribute('tabindex', '-1');
    try {
      this.bodyEl.focus({ preventScroll: true });
    } catch (err) {
      this.bodyEl.focus();
    }
  };

  CoursewareShell.prototype.mount = function () {
    if (window.__CW_EXPORT_MODE__) {
      this.mountExport();
      return;
    }
    var loading = document.getElementById('cw-loading');
    if (loading) loading.remove();

    document.body.innerHTML = '';
    document.head.appendChild(this._shellStyles());

    var root = document.createElement('div');
    root.className = 'cw-root';

    var header = document.createElement('header');
    header.className = 'cw-header';
    header.innerHTML =
      '<div class="cw-header-left">' +
      '<span class="cw-file-icon" aria-hidden="true"></span>' +
      '<span class="cw-title"></span>' +
      '</div>' +
      '<div class="cw-header-actions">' +
      '<button type="button" class="cw-action" data-action="edit">编辑</button>' +
      '<button type="button" class="cw-action" data-action="fullscreen">全屏预览</button>' +
      '<button type="button" class="cw-action" data-action="download">下载</button>' +
      '<button type="button" class="cw-action" data-action="scorm">SCORM 包</button>' +
      '<button type="button" class="cw-action cw-action--icon" data-action="close" aria-label="关闭">×</button>' +
      '</div>';
    this.titleEl = header.querySelector('.cw-title');

    var body = document.createElement('div');
    body.className = 'cw-body';
    this.bodyEl = body;

    this.thumbList = document.createElement('aside');
    this.thumbList.className = 'cw-thumbs';
    this.thumbList.id = 'cw-thumb-list';

    this.stageEl = document.createElement('main');
    this.stageEl.className = 'cw-stage';

    this.frameWrap = document.createElement('div');
    this.frameWrap.className = 'cw-stage-frame';

    this.mainIframe = document.createElement('iframe');
    this.mainIframe.className = 'cw-main-iframe';
    this.mainIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    this.frameWrap.appendChild(this.mainIframe);
    this.stageEl.appendChild(this.frameWrap);

    body.appendChild(this.thumbList);
    body.appendChild(this.stageEl);

    var footer = document.createElement('footer');
    footer.className = 'cw-footer';
    this.pageLabel = document.createElement('span');
    this.pageLabel.className = 'cw-footer-label';
    footer.appendChild(this.pageLabel);

    root.appendChild(header);
    root.appendChild(body);
    root.appendChild(footer);
    document.body.appendChild(root);

    var self = this;
    header.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (action === 'fullscreen') self._toggleFullscreen();
      else if (action === 'download') self._download();
      else if (action === 'scorm') self._downloadScorm();
      else if (action === 'close') window.history.length > 1 ? window.history.back() : null;
    });

    window.addEventListener('message', function (e) {
      if (!e.data || !e.data.type) return;
      if (e.data.type === 'cwNav') {
        if (e.data.dir === 'next') self.next();
        else if (e.data.dir === 'prev') self.prev();
      } else if (e.data.type === 'saveState') {
        var page = self.pages[self.index];
        if (page) self.pageStates[page.id] = e.data.state;
      }
    });

    window.addEventListener('resize', function () {
      self._fitMain();
    });

    var onKey = function (e) {
      self._handleNavKey(e);
    };
    document.addEventListener('keydown', onKey);

    document.addEventListener('fullscreenchange', function () {
      if (self._isFullscreen()) self._focusFs();
      self._fitMain();
    });
    document.addEventListener('webkitfullscreenchange', function () {
      if (self._isFullscreen()) self._focusFs();
      self._fitMain();
    });

    this._renderThumbs();
    this.show(0, 'forward');
  };

  /** 下载/导出模式：无顶栏，保留缩略图侧栏 + 画布 + 底部分页 */
  CoursewareShell.prototype.mountExport = function () {
    var loading = document.getElementById('cw-loading');
    if (loading) loading.remove();

    document.body.innerHTML = '';
    document.head.appendChild(this._shellStyles());
    var exportFix = document.createElement('style');
    exportFix.textContent =
      '.cw-export-root{height:100vh;display:flex;flex-direction:column;background:#fff}' +
      '.cw-export-root .cw-body{flex:1;min-height:0}';
    document.head.appendChild(exportFix);

    var root = document.createElement('div');
    root.className = 'cw-export-root';

    var body = document.createElement('div');
    body.className = 'cw-body';
    this.bodyEl = body;

    this.thumbList = document.createElement('aside');
    this.thumbList.className = 'cw-thumbs';
    this.thumbList.id = 'cw-thumb-list';

    this.stageEl = document.createElement('main');
    this.stageEl.className = 'cw-stage';

    this.frameWrap = document.createElement('div');
    this.frameWrap.className = 'cw-stage-frame';

    this.mainIframe = document.createElement('iframe');
    this.mainIframe.className = 'cw-main-iframe';
    this.mainIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    this.frameWrap.appendChild(this.mainIframe);
    this.stageEl.appendChild(this.frameWrap);

    body.appendChild(this.thumbList);
    body.appendChild(this.stageEl);

    var footer = document.createElement('footer');
    footer.className = 'cw-footer';
    this.pageLabel = document.createElement('span');
    this.pageLabel.className = 'cw-footer-label';
    footer.appendChild(this.pageLabel);

    root.appendChild(body);
    root.appendChild(footer);
    document.body.appendChild(root);

    this.titleEl = null;

    var self = this;
    window.addEventListener('message', function (e) {
      if (!e.data || !e.data.type) return;
      if (e.data.type === 'cwNav') {
        if (e.data.dir === 'next') self.next();
        else if (e.data.dir === 'prev') self.prev();
      } else if (e.data.type === 'saveState') {
        var page = self.pages[self.index];
        if (page) self.pageStates[page.id] = e.data.state;
      } else if (e.data.type === 'cwScore' && self.scorm) {
        self.scorm.reportScore(e.data);
      }
    });

    window.addEventListener('resize', function () {
      self._fitMain();
    });

    document.addEventListener('keydown', function (e) {
      self._handleNavKey(e);
    });

    this.scorm = new ScormRT();
    var start = 0;
    if (this.scorm.init(this.pages.length)) {
      var loc = this.scorm.bookmark();
      if (loc >= 0 && loc < this.pages.length) start = loc;
      var finish = function () {
        self.scorm.finish();
      };
      window.addEventListener('pagehide', finish);
      window.addEventListener('beforeunload', finish);
      window.addEventListener('unload', finish);
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') self.scorm.suspend();
        else self.scorm.resume();
      });
      this.scorm.keepAlive = setInterval(function () {
        self.scorm.tick();
      }, 10000);
    }

    this._renderThumbs();
    this.show(start, 'forward');
  };

  CoursewareShell.prototype._shellStyles = function () {
    var style = document.createElement('style');
    style.textContent =
      'html,body{margin:0;height:100%;overflow:hidden}' +
      '.cw-root{height:100vh;display:flex;flex-direction:column;background:#fff;' +
      'font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#1e293b}' +
      '.cw-header{height:52px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;' +
      'padding:0 20px;border-bottom:1px solid #e5e7eb;background:#fff}' +
      '.cw-header-left{display:flex;align-items:center;gap:10px;min-width:0}' +
      '.cw-file-icon{width:22px;height:22px;border-radius:4px;background:linear-gradient(135deg,#34d399,#10b981);' +
      'position:relative;flex-shrink:0}' +
      '.cw-file-icon::after{content:"";position:absolute;left:5px;top:6px;width:12px;height:2px;background:#fff;' +
      'box-shadow:0 4px 0 #fff,0 8px 0 #fff;border-radius:1px}' +
      '.cw-title{font-size:14px;font-weight:600;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.cw-header-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}' +
      '.cw-action{border:1px solid #e2e8f0;background:#fff;color:#475569;font-size:13px;padding:6px 14px;' +
      'border-radius:8px;cursor:pointer;line-height:1}' +
      '.cw-action:hover{background:#f8fafc;border-color:#cbd5e1}' +
      '.cw-action--icon{width:32px;height:32px;padding:0;font-size:18px;color:#94a3b8}' +
      '.cw-body{flex:1;display:flex;min-height:0;background:' +
      STAGE_BG +
      ';outline:none}' +
      '.cw-body:fullscreen,.cw-body:-webkit-full-screen{width:100%;height:100%;display:flex;min-height:0;' +
      'background:' +
      STAGE_BG +
      '}' +
      '.cw-body:fullscreen .cw-thumbs,.cw-body:-webkit-full-screen .cw-thumbs{height:100%}' +
      '.cw-thumbs{width:136px;flex-shrink:0;padding:12px 10px;overflow-y:auto;background:#fff;' +
      'border-right:1px solid #e5e7eb}' +
      '#cw-thumb-list{scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}' +
      '#cw-thumb-list::-webkit-scrollbar{width:4px}' +
      '#cw-thumb-list::-webkit-scrollbar-track{background:transparent}' +
      '#cw-thumb-list::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:999px}' +
      '#cw-thumb-list::-webkit-scrollbar-thumb:hover{background:#94a3b8}' +
      '.cw-thumb{position:relative;width:116px;height:' +
      Math.round(CANVAS_H * THUMB_SCALE) +
      'px;margin:0 auto 10px;border:2px solid #e5e7eb;border-radius:8px;overflow:hidden;' +
      'cursor:pointer;background:#f8fafc;transition:border-color .15s,box-shadow .15s}' +
      '.cw-thumb:hover{border-color:#86efac}' +
      '.cw-thumb--on{border-color:#10b981;box-shadow:0 0 0 1px #10b981}' +
      '.cw-thumb-inner{width:' +
      CANVAS_W +
      'px;height:' +
      CANVAS_H +
      'px;transform:scale(' +
      THUMB_SCALE +
      ');transform-origin:top left;pointer-events:none}' +
      '.cw-thumb iframe{width:100%;height:100%;border:none;display:block}' +
      '.cw-thumb-no{position:absolute;right:4px;bottom:4px;min-width:18px;height:18px;padding:0 4px;' +
      'border-radius:999px;background:#64748b;color:#fff;font-size:11px;font-weight:700;' +
      'display:flex;align-items:center;justify-content:center;z-index:2;line-height:1}' +
      '.cw-thumb--on .cw-thumb-no{background:#10b981}' +
      '.cw-body:fullscreen .cw-stage,.cw-body:-webkit-full-screen .cw-stage{background:' +
      STAGE_BG +
      ';padding:0}' +
      '.cw-stage{flex:1;display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;' +
      'padding:24px;background:' +
      STAGE_BG +
      ';outline:none}' +
      '.cw-stage-frame{width:' +
      CANVAS_W +
      'px;height:' +
      CANVAS_H +
      'px;overflow:hidden;background:transparent;border:none;border-radius:0;box-shadow:none;' +
      'transform-origin:center center;flex-shrink:0}' +
      '.cw-main-iframe{width:100%;height:100%;border:none;display:block}' +
      '.cw-footer{height:40px;flex-shrink:0;display:flex;align-items:center;padding:0 20px;' +
      'border-top:1px solid #e5e7eb;background:#fff;font-size:12px;color:#64748b}';
    return style;
  };

  CoursewareShell.prototype._renderThumbs = function () {
    var self = this;
    this.thumbList.innerHTML = '';
    this.thumbIframes = [];

    this.pages.forEach(function (p, i) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'cw-thumb' + (i === self.index ? ' cw-thumb--on' : '');
      item.title = p.id + '. ' + p.name;
      item.dataset.index = String(i);

      var inner = document.createElement('div');
      inner.className = 'cw-thumb-inner';

      var iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      iframe.srcdoc = buildSrcdoc(p, self.sharedHead, 'thumbnail', i, self.pages.length);

      var badge = document.createElement('span');
      badge.className = 'cw-thumb-no';
      badge.textContent = String(p.id);

      inner.appendChild(iframe);
      item.appendChild(inner);
      item.appendChild(badge);

      item.addEventListener('click', function () {
        self.show(i, i > self.index ? 'forward' : 'back');
      });

      self.thumbList.appendChild(item);
      self.thumbIframes.push(iframe);
    });
  };

  CoursewareShell.prototype._updateThumbActive = function () {
    if (!this.thumbList) return;
    var items = this.thumbList.querySelectorAll('.cw-thumb');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('cw-thumb--on', i === this.index);
    }
    var active = items[this.index];
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  CoursewareShell.prototype._isFullscreen = function () {
    var fs = document.fullscreenElement || document.webkitFullscreenElement;
    return fs === this.bodyEl;
  };

  CoursewareShell.prototype._toggleFullscreen = function () {
    var self = this;
    if (this._isFullscreen()) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }
    var el = this.bodyEl;
    var req = el.requestFullscreen
      ? el.requestFullscreen()
      : el.webkitRequestFullscreen
        ? el.webkitRequestFullscreen()
        : null;
    if (req && req.then) {
      req.then(function () {
        self._focusFs();
        self._fitMain();
      });
    }
  };

  CoursewareShell.prototype._fitMain = function () {
    if (!this.stageEl || !this.frameWrap) return;
    var fs = this._isFullscreen();
    var pad = fs ? 0 : 48;
    var sw = this.stageEl.clientWidth - pad;
    var sh = this.stageEl.clientHeight - pad;
    var scale = Math.min(sw / CANVAS_W, sh / CANVAS_H);
    if (!fs) scale = Math.min(scale, 1);
    this.frameWrap.style.transform = Math.abs(scale - 1) < 0.001 ? '' : 'scale(' + scale + ')';
  };

  function captureSourceHtml() {
    var headBits = [];
    var hi;
    for (hi = 0; hi < document.head.childNodes.length; hi++) {
      var hn = document.head.childNodes[hi];
      if (hn.nodeType === 8) headBits.push('<!--' + hn.textContent + '-->');
      else if (hn.nodeType === 1) headBits.push(hn.outerHTML);
    }
    var bodyBits = [];
    var loading = document.getElementById('cw-loading');
    if (loading) bodyBits.push(loading.outerHTML);
    document.querySelectorAll('template').forEach(function (t) {
      bodyBits.push(t.outerHTML);
    });
    bodyBits.push('<script src="./courseware-shell.js"><\/script>');
    return (
      '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n' +
      headBits.join('\n') +
      '\n</head>\n<body>\n' +
      bodyBits.join('\n') +
      '\n</body>\n</html>'
    );
  }

  function bundleHtml(sourceHtml, shellCode) {
    return sourceHtml.replace(
      /<script\s+src=["']\.\/courseware-shell\.js["']\s*><\/script>/i,
      '<script>window.__CW_EXPORT_MODE__=true;<\/script>\n<script>\n' + shellCode + '\n<\/script>'
    );
  }

  function triggerBlobDownload(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  function triggerDownload(html, filename) {
    triggerBlobDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), filename);
  }

  /* ============================ SCORM 2004 运行时 ============================
   * 导出的单文件 HTML 内置本运行时。放入 LMS（可发现 API_1484_11）时自动上报；
   * 作为普通文件打开（无 API）时静默无副作用。
   * 上报：session_time（时长）、progress_measure（进度）、completion_status、
   *       location + suspend_data（断点续学）、score（测验页可选上报）。
   * ========================================================================== */

  function scormFindAPI(win) {
    var tries = 0;
    while (win && tries < 20) {
      try {
        if (win.API_1484_11) return win.API_1484_11;
      } catch (e) {}
      if (win.parent === win) break;
      win = win.parent;
      tries++;
    }
    return null;
  }

  function scormGetAPI() {
    var api = scormFindAPI(window);
    if (!api && window.opener) {
      try {
        api = scormFindAPI(window.opener);
      } catch (e) {}
    }
    return api;
  }

  function scormDuration(ms) {
    var s = Math.max(0, ms / 1000);
    var h = Math.floor(s / 3600);
    s -= h * 3600;
    var m = Math.floor(s / 60);
    s -= m * 60;
    var sec = Math.round(s * 100) / 100;
    return 'PT' + h + 'H' + m + 'M' + sec + 'S';
  }

  function ScormRT() {
    this.api = null;
    this.active = false;
    this.terminated = false;
    this.enterTime = 0;
    this.accumMs = 0;
    this.visited = {};
    this.total = 0;
    this.completed = false;
    this.scores = {};
    this.keepAlive = null;
  }

  ScormRT.prototype._ok = function (v) {
    return v === 'true' || v === true;
  };
  ScormRT.prototype._log = function () {
    if (window.__CW_SCORM_DEBUG__ && window.console) {
      try {
        console.log.apply(console, ['[SCORM]'].concat([].slice.call(arguments)));
      } catch (e) {}
    }
  };
  ScormRT.prototype._warn = function () {
    if (window.console) {
      try {
        console.log.apply(console, ['[SCORM]'].concat([].slice.call(arguments)));
      } catch (e) {}
    }
  };
  ScormRT.prototype.get = function (k) {
    if (!this.active) return '';
    return this.api.GetValue(k);
  };
  ScormRT.prototype.set = function (k, v) {
    if (!this.active) return false;
    var ok = this._ok(this.api.SetValue(k, String(v)));
    if (!ok) {
      var err = '';
      try {
        err = this.api.GetLastError() + ' ' + this.api.GetErrorString(this.api.GetLastError());
      } catch (e) {}
      this._warn('SetValue 被拒绝:', k, '=', v, '错误:', err);
    } else {
      this._log('SetValue', k, '=', v);
    }
    return ok;
  };
  ScormRT.prototype.commit = function () {
    if (this.active) this.api.Commit('');
  };

  /** 当前会话累计时长（毫秒），跨可见性切换累加 */
  ScormRT.prototype._elapsedMs = function () {
    var live = this.enterTime ? Date.now() - this.enterTime : 0;
    return this.accumMs + live;
  };
  ScormRT.prototype._pushTime = function () {
    this.set('cmi.session_time', scormDuration(this._elapsedMs()));
  };
  ScormRT.prototype.pause = function () {
    if (this.enterTime) {
      this.accumMs += Date.now() - this.enterTime;
      this.enterTime = 0;
    }
  };
  ScormRT.prototype.resume = function () {
    if (!this.enterTime) this.enterTime = Date.now();
  };

  ScormRT.prototype.init = function (total) {
    this.api = scormGetAPI();
    if (!this.api) return false;
    if (!this._ok(this.api.Initialize(''))) {
      this.api = null;
      return false;
    }
    this.active = true;
    this.total = total;
    this.enterTime = Date.now();
    this.accumMs = 0;

    var suspend = this.get('cmi.suspend_data');
    if (suspend) {
      try {
        var d = JSON.parse(suspend);
        if (d && d.visited) this.visited = d.visited;
        if (d && d.scores) this.scores = d.scores;
      } catch (e) {}
    }
    var cs = this.get('cmi.completion_status');
    this.completed = cs === 'completed';
    if (!cs || cs === 'unknown' || cs === 'not attempted') {
      this.set('cmi.completion_status', 'incomplete');
    }
    this.commit();
    this._warn('Initialize 成功，total=', total, '，已恢复已看页=', Object.keys(this.visited).length);
    return true;
  };

  ScormRT.prototype._persist = function () {
    this.set('cmi.suspend_data', JSON.stringify({ visited: this.visited, scores: this.scores }));
  };

  /** 保活：定时刷新时长并提交，降低真实 LMS 退出时异步保存被取消导致的数据丢失 */
  ScormRT.prototype.tick = function () {
    if (!this.active || this.terminated) return;
    this._pushTime();
    this.commit();
  };

  ScormRT.prototype.bookmark = function () {
    if (!this.active) return -1;
    var loc = parseInt(this.get('cmi.location'), 10);
    return isNaN(loc) ? -1 : loc;
  };

  ScormRT.prototype.visit = function (index) {
    if (!this.active) return;
    this.visited[index] = 1;
    var count = 0;
    for (var k in this.visited) if (this.visited.hasOwnProperty(k)) count++;
    var pm = this.total ? Math.min(1, count / this.total) : 0;
    this.set('cmi.progress_measure', pm.toFixed(4));
    this.set('cmi.location', String(index));
    if (count >= this.total && this.total > 0) {
      this.completed = true;
      this.set('cmi.completion_status', 'completed');
    } else {
      this.set('cmi.completion_status', 'incomplete');
    }
    this._persist();
    // 每次翻页也刷新一次时长并提交，降低 Terminate 未触发时的时长丢失
    this._pushTime();
    this.commit();
  };

  /** 接收答题页上报的成绩，聚合为整课分数写入 cmi.score / success_status */
  ScormRT.prototype.reportScore = function (data) {
    if (!this.active || !data) return;
    var id = data.id != null ? String(data.id) : 'q';
    var raw = Number(data.raw);
    var max = Number(data.max);
    if (!isNaN(raw) && !isNaN(max) && max > 0) {
      this.scores[id] = { raw: raw, max: max };
    } else if (typeof data.scaled === 'number') {
      this.scores[id] = { raw: data.scaled, max: 1 };
    } else {
      return;
    }
    var sr = 0;
    var sm = 0;
    for (var k in this.scores) {
      if (this.scores.hasOwnProperty(k)) {
        sr += this.scores[k].raw;
        sm += this.scores[k].max;
      }
    }
    var scaled = sm > 0 ? Math.max(0, Math.min(1, sr / sm)) : 0;
    this.set('cmi.score.min', '0');
    this.set('cmi.score.max', String(sm));
    this.set('cmi.score.raw', String(sr));
    this.set('cmi.score.scaled', scaled.toFixed(4));
    this.set('cmi.success_status', scaled >= 0.6 ? 'passed' : 'failed');
    this._persist();
    this._pushTime();
    this.commit();
    this._warn('成绩上报 raw/max=', sr + '/' + sm, ' scaled=', scaled.toFixed(4));
  };

  /** 页面隐藏（切标签/最小化）：暂停计时并提交，不结束会话 */
  ScormRT.prototype.suspend = function () {
    if (!this.active || this.terminated) return;
    this._pushTime();
    this.pause();
    this.commit();
  };

  ScormRT.prototype.finish = function () {
    if (!this.active || this.terminated) return;
    this.terminated = true;
    if (this.keepAlive) {
      clearInterval(this.keepAlive);
      this.keepAlive = null;
    }
    this._pushTime();
    this.set('cmi.exit', this.completed ? 'normal' : 'suspend');
    this.commit();
    var res = '';
    try {
      res = this.api.Terminate('');
    } catch (e) {}
    this._warn('Terminate 结果:', res, '，本次时长:', scormDuration(this._elapsedMs()), '，完成状态:', this.completed ? 'completed' : 'incomplete');
    this.active = false;
  };

  /* ============================ 纯前端 ZIP 打包 ============================
   * store 方式（无压缩，合法 zip）。file:// 下也可用。仅依赖 TextEncoder。
   * ======================================================================== */

  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    var u = unescape(encodeURIComponent(str));
    var arr = new Uint8Array(u.length);
    for (var i = 0; i < u.length; i++) arr[i] = u.charCodeAt(i);
    return arr;
  }

  var CRC_TABLE = null;
  function crc32(bytes) {
    if (!CRC_TABLE) {
      CRC_TABLE = [];
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        CRC_TABLE[n] = c >>> 0;
      }
    }
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeZip(files) {
    function u16(n) {
      return [n & 0xff, (n >> 8) & 0xff];
    }
    function u32(n) {
      return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
    }
    var parts = [];
    var central = [];
    var offset = 0;
    files.forEach(function (f) {
      var nameBytes = utf8Bytes(f.name);
      var data = utf8Bytes(f.str);
      var crc = crc32(data);
      var local = new Uint8Array(
        [].concat(
          u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
          u32(crc), u32(data.length), u32(data.length),
          u16(nameBytes.length), u16(0)
        )
      );
      parts.push(local, nameBytes, data);
      var cen = new Uint8Array(
        [].concat(
          u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
          u32(crc), u32(data.length), u32(data.length),
          u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset)
        )
      );
      central.push(cen, nameBytes);
      offset += local.length + nameBytes.length + data.length;
    });
    var centralSize = 0;
    central.forEach(function (c) {
      centralSize += c.length;
    });
    var end = new Uint8Array(
      [].concat(
        u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
        u32(centralSize), u32(offset), u16(0)
      )
    );
    return new Blob(parts.concat(central, [end]), { type: 'application/zip' });
  }

  function xmlEscape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildManifest(title) {
    var id = 'CW-' + Date.now().toString(36);
    var t = xmlEscape(title || '课件');
    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<manifest identifier="MANIFEST-' + id + '" version="1"\n' +
      '  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"\n' +
      '  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"\n' +
      '  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"\n' +
      '  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"\n' +
      '  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"\n' +
      '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
      '  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd\n' +
      '    http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd\n' +
      '    http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd\n' +
      '    http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd\n' +
      '    http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">\n' +
      '  <metadata>\n' +
      '    <schema>ADL SCORM</schema>\n' +
      '    <schemaversion>2004 4th Edition</schemaversion>\n' +
      '  </metadata>\n' +
      '  <organizations default="ORG-1">\n' +
      '    <organization identifier="ORG-1">\n' +
      '      <title>' + t + '</title>\n' +
      '      <item identifier="ITEM-1" identifierref="RES-1" isvisible="true">\n' +
      '        <title>' + t + '</title>\n' +
      '        <imsss:sequencing>\n' +
      '          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true"/>\n' +
      '        </imsss:sequencing>\n' +
      '      </item>\n' +
      '    </organization>\n' +
      '  </organizations>\n' +
      '  <resources>\n' +
      '    <resource identifier="RES-1" type="webcontent" adlcp:scormType="sco" href="index.html">\n' +
      '      <file href="index.html"/>\n' +
      '    </resource>\n' +
      '  </resources>\n' +
      '</manifest>\n'
    );
  }

  var SOURCE_HTML = captureSourceHtml();
  var FILE_TITLE = (document.querySelector('title') && document.querySelector('title').textContent) || 'courseware';
  var SHELL_SOURCE = null;

  /**
   * 重建壳脚本源码。首选用 window.__CW_SHELL_MAIN__.toString() 自我序列化，
   * 无需读取任何外部文件 —— file:// 双击打开时也能打包。
   */
  function getSelfSource() {
    var fn = window.__CW_SHELL_MAIN__;
    if (typeof fn === 'function') {
      var body = fn.toString();
      if (body && body.indexOf('CoursewareShell') !== -1) {
        return '(' + body + ')();';
      }
    }
    return null;
  }

  function getInlineShellSource() {
    var scripts = document.getElementsByTagName('script');
    var i;
    for (i = scripts.length - 1; i >= 0; i--) {
      if (!scripts[i].src && scripts[i].textContent.indexOf('CoursewareShell') !== -1) {
        return scripts[i].textContent;
      }
    }
    return null;
  }

  function fetchShellSource() {
    if (SHELL_SOURCE) return Promise.resolve(SHELL_SOURCE);
    var self = getSelfSource() || getInlineShellSource();
    if (self) {
      SHELL_SOURCE = self;
      return Promise.resolve(self);
    }
    if (typeof fetch !== 'function') return Promise.reject(new Error('no fetch'));
    return fetch('./courseware-shell.js')
      .then(function (r) {
        if (!r.ok) throw new Error('shell fetch failed');
        return r.text();
      })
      .then(function (t) {
        SHELL_SOURCE = t;
        return t;
      });
  }

  fetchShellSource().catch(function () {});

  CoursewareShell.prototype._download = function () {
    var name = (FILE_TITLE || 'courseware').replace(/\.html$/i, '') + '.html';
    var btn = document.querySelector('[data-action="download"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '打包中…';
    }
    fetchShellSource()
      .then(function (shellCode) {
        triggerDownload(bundleHtml(SOURCE_HTML, shellCode), name);
      })
      .catch(function () {
        var hint =
          window.location.protocol === 'file:'
            ? '无法读取 courseware-shell.js。请确认它与 index.html 在同一文件夹；若仍失败，请在本文件夹运行：python3 -m http.server 8765，再用浏览器打开 http://127.0.0.1:8765/index.html 后下载。'
            : '无法打包单文件课件。请确认 index.html 与 courseware-shell.js 在同一目录，且通过 http:// 访问本页后再点下载。';
        window.alert(hint);
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = '下载';
        }
      });
  };

  CoursewareShell.prototype._downloadScorm = function () {
    var base = (FILE_TITLE || 'courseware').replace(/\.html$/i, '');
    var btn = document.querySelector('[data-action="scorm"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '打包中…';
    }
    fetchShellSource()
      .then(function (shellCode) {
        var html = bundleHtml(SOURCE_HTML, shellCode);
        var zip = makeZip([
          { name: 'index.html', str: html },
          { name: 'imsmanifest.xml', str: buildManifest(base) },
        ]);
        triggerBlobDownload(zip, base + '-scorm2004.zip');
      })
      .catch(function () {
        var hint =
          window.location.protocol === 'file:'
            ? '无法生成 SCORM 包。请确认 courseware-shell.js 与 index.html 在同一文件夹；若仍失败，请在本文件夹运行：python3 -m http.server 8765，再用浏览器打开后重试。'
            : '无法生成 SCORM 包。请确认通过 http:// 访问本页后再重试。';
        window.alert(hint);
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'SCORM 包';
        }
      });
  };

  CoursewareShell.prototype.show = function (index, direction) {
    if (index < 0 || index >= this.pages.length) return;
    this.index = index;
    var page = this.pages[index];
    if (this.titleEl) {
      var fileTitle = document.querySelector('title')?.textContent || '课件.html';
      document.title = page.name;
      this.titleEl.textContent = fileTitle.indexOf('.') > -1 ? fileTitle : fileTitle + '.html';
    } else if (window.__CW_EXPORT_MODE__) {
      document.title = (FILE_TITLE || page.name || '课件').replace(/\.html$/i, '');
    }
    if (this.pageLabel) {
      this.pageLabel.textContent =
        '第 ' + (index + 1) + ' / ' + this.pages.length + ' 页 · ' + page.name +
        (window.__CW_EXPORT_MODE__ ? '（← → 翻页）' : '');
    }

    var saved = direction === 'back' ? this.pageStates[page.id] : undefined;
    this.mainIframe.srcdoc = buildSrcdoc(
      page,
      this.sharedHead,
      'main',
      index,
      this.pages.length
    );

    var self = this;
    var onReady = function (e) {
      if (!e.data || e.data.type !== 'pageReady' || e.data.mode !== 'main') return;
      if (e.data.index !== self.index) return;
      window.removeEventListener('message', onReady);
      if (saved !== undefined) {
        self.mainIframe.contentWindow.postMessage(
          { type: 'restoreState', state: saved },
          '*'
        );
      }
      self._fitMain();
    };
    window.addEventListener('message', onReady);
    this._updateThumbActive();
    this._fitMain();

    if (this.scorm) this.scorm.visit(index);
  };

  CoursewareShell.prototype.next = function () {
    if (this.index < this.pages.length - 1) {
      this.show(this.index + 1, 'forward');
    }
  };

  CoursewareShell.prototype.prev = function () {
    if (this.index > 0) {
      this.show(this.index - 1, 'back');
    }
  };

  var pages = parsePages();
  if (!pages.length) {
    console.error('[courseware-shell] No template.page-data found');
    return;
  }

  new CoursewareShell(pages, parseShared()).mount();
};
window.__CW_SHELL_MAIN__();
