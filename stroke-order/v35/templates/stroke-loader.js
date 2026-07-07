/**
 * stroke-loader · 飞象老师汉字笔顺数据加载器 (v10.0.0)
 * ─────────────────────────────────────────────
 * 作用：
 *   1. 异步从 CDN 加载 stroke-data.json（2838 字教研校验版）
 *   2. 暴露全局 getStrokeData(char) 查询接口
 *   3. 加载完成后派发 stroke-data-ready 事件
 *
 * 引入方式：
 *   <script src="https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v35/templates/stroke-loader.js"></script>
 *
 * 使用方式：
 *   window.addEventListener('stroke-data-ready', function() {
 *     var d = window.getStrokeData('学');
 *     // d = { char:'学', count:8, strokes:['点',...,'横'], source:'db' }
 *   });
 *
 * 数据源：
 *   飞象老师 2838 字教研校验版（stroke_data_v2.json，2026-04-20）
 *   已修正穴字头/阝/殳/朵/学字族/铅 等 6 类数据集共性错误
 */
(function (global) {
  'use strict';

  var DATA_URL = 'https://musk-test.fbcontent.cn/pub-musk-ai-studio/skills/stroke-order/v35/assets/stroke-data.json';

  // 32 种标准笔画名称（白名单校验用）
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

  var strokeDatabase = null;  // { "字": ["笔","画","名"] }
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
        // 兼容某些 UA 不解析 JSON 的情况
        if (typeof resp === 'string') {
          try { resp = JSON.parse(resp); } catch (e) { setStatus('error', 'JSON 解析失败'); return; }
        }
        if (!resp || !resp.data) {
          setStatus('error', '数据格式错误');
          return;
        }
        strokeDatabase = resp.data;
        try {
          if (global.console && global.console.debug) {
            global.console.debug('[stroke-loader] 已加载', Object.keys(strokeDatabase).length, '字');
          }
        } catch (e) {}
        setStatus('ready');
      } else {
        setStatus('error', 'HTTP ' + xhr.status);
      }
    };
    xhr.onerror = function () {
      setStatus('error', '网络错误');
    };
    xhr.send();
  }

  /**
   * 查询字的笔顺数据
   * @param {string} char 单个汉字
   * @returns {object} 标准结果对象，永不抛异常
   *   正常: { char, count:N, strokes:[...], source:'db' }
   *   未加载: { char, count:0, strokes:[], source:'loading' }
   *   加载失败: { char, count:0, strokes:[], source:'error', error:'...' }
   *   数据库未收录: { char, count:0, strokes:[], source:'missing' }
   *   含非标准笔画（理论不会发生，兜底）: source:'invalid'
   */
  function getStrokeData(char) {
    if (typeof char !== 'string' || char.length === 0) {
      return { char: String(char), count: 0, strokes: [], source: 'invalid', error: '输入非字符串' };
    }

    if (loadStatus === 'pending' || loadStatus === 'loading') {
      return { char: char, count: 0, strokes: [], source: 'loading' };
    }
    if (loadStatus === 'error') {
      return { char: char, count: 0, strokes: [], source: 'error', error: loadError || '加载失败' };
    }

    var strokes = strokeDatabase[char];
    if (!strokes || strokes.length === 0) {
      return { char: char, count: 0, strokes: [], source: 'missing' };
    }

    // 白名单二次校验（兜底）
    for (var j = 0; j < strokes.length; j++) {
      if (!STD32_SET[strokes[j]]) {
        return {
          char: char, count: 0, strokes: [],
          source: 'invalid',
          error: '第 ' + (j + 1) + ' 笔「' + strokes[j] + '」不在 32 标准之内'
        };
      }
    }

    return { char: char, count: strokes.length, strokes: strokes.slice(), source: 'db' };
  }

  // 曝光全局 API
  global.getStrokeData = getStrokeData;
  global._strokeLoader = {
    getStatus: function () { return loadStatus; },
    getError: function () { return loadError; },
    getStd32: function () { return STD32.slice(); },
    getDataURL: function () { return DATA_URL; },
    reload: function () {
      loadStatus = 'pending';
      loadError = null;
      strokeDatabase = null;
      loadData();
    }
  };

  // 自动触发加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }
})(typeof window !== 'undefined' ? window : this);
