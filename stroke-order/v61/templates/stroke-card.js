/**
 * stroke-card · A one-tag, drop-in stroke-order display component (Web Component)
 * ─────────────────────────────────────────────
 * Goal: **Eliminate the dual-data-source problem when LLMs generate HTML.**
 *       — The LLM only needs to write <stroke-card char="学"></stroke-card>
 *       — All stroke-name display (character, count, per-stroke list, tier badge, tip text)
 *         **comes uniformly from window.getStrokeData**
 *       — The LLM does not need to and must not hand-code stroke names anywhere in the HTML
 *
 * Import (must be loaded together with stroke-loader.js on the same page):
 *   <script src=".../v42/templates/stroke-loader.js"></script>
 *   <script src=".../v42/templates/stroke-card.js"></script>
 *
 * Usage:
 *   <stroke-card char="学"></stroke-card>
 *   <stroke-card char="曼" size="large"></stroke-card>
 *   <stroke-card char="写" layout="horizontal" show-tips="false"></stroke-card>
 *
 * Attributes (optional):
 *   char         (required): the Chinese character to display
 *   size         "small" | "default" | "large"
 *   layout       "vertical" (default — character on top, strokes below) | "horizontal" (character on left, strokes on right)
 *   show-tips    "true" (default) | "false" — whether to show "stroke N" badges
 *   show-tier    "true" (default) | "false" — whether to show the "textbook authoritative / to be verified" badge
 *   show-strict  "true" — strict mode: characters with tier !== textbook are not displayed
 *   show-missing "true" (default) — characters outside the database show "no data"
 */
(function (global) {
  'use strict';

  const STYLE = `
    :host { display: inline-block; vertical-align: top; }
    .card { display: inline-flex; flex-direction: column; align-items: center;
            padding: 16px; background: #fff; border: 1px solid #e5e7eb;
            border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06);
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }
    .card.extended { border: 1px dashed #bdc3c7; }
    .card.missing { color: #9ca3af; font-style: italic; }
    .ch { font-size: 64px; line-height: 1; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
    .meta { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
    .count { color: #e74c3c; font-size: 14px; font-weight: 600; }
    .count.dim { color: #6b7280; }
    /* v11 two-tier badge */
    .tier { font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .tier.textbook { background: #d1fae5; color: #047857; }     /* Within primary-school scope */
    .tier.extended { background: #fef3c7; color: #92400e; }     /* Outside primary-school scope */
    .strokes { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
               max-width: 420px; }
    .step { display: inline-flex; align-items: center; padding: 4px 10px;
            background: #f3f4f6; border-radius: 6px; font-size: 13px; color: #374151; }
    .step .idx { color: #9ca3af; margin-right: 4px; font-size: 11px; }
    :host([size="small"]) .ch { font-size: 40px; }
    :host([size="small"]) .step { font-size: 11px; padding: 2px 6px; }
    :host([size="large"]) .ch { font-size: 96px; }
    :host([size="large"]) .step { font-size: 15px; padding: 6px 12px; }
    :host([layout="horizontal"]) .card { flex-direction: row; gap: 20px; align-items: flex-start; }
    :host([layout="horizontal"]) .left { display: flex; flex-direction: column; align-items: center; }
  `;

  class StrokeCard extends HTMLElement {
    static get observedAttributes() {
      return ['char', 'size', 'layout', 'show-tips', 'show-tier', 'show-strict', 'show-missing'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._rendered = false;
    }

    connectedCallback() {
      if (global._strokeLoader && global._strokeLoader.getStatus() === 'ready') {
        this._render();
      } else {
        global.addEventListener('stroke-data-ready', () => this._render(), { once: true });
        this._renderLoading();
      }
    }

    attributeChangedCallback() {
      if (this._rendered && global._strokeLoader &&
          global._strokeLoader.getStatus() === 'ready') {
        this._render();
      }
    }

    _renderLoading() {
      this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="card missing">Loading...</div>`;
    }

    _render() {
      const ch = (this.getAttribute('char') || '').trim();
      if (!ch) {
        this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="card missing">No char attribute specified</div>`;
        return;
      }

      const d = global.getStrokeData(ch);
      const showTips = this.getAttribute('show-tips') !== 'false';
      const showTier = this.getAttribute('show-tier') !== 'false';
      const showStrict = this.getAttribute('show-strict') === 'true';
      const showMissing = this.getAttribute('show-missing') !== 'false';

      // Strict mode: refuse to display non-textbook characters
      if (showStrict && d.source === 'db' && d.tier !== 'textbook') {
        this.shadowRoot.innerHTML = `
          <style>${STYLE}</style>
          <div class="card missing">
            <div class="ch">${ch}</div>
            <div>Not in the primary-school textbook character list</div>
          </div>`;
        this._rendered = true;
        return;
      }

      if (d.source !== 'db') {
        const msg = d.source === 'missing' ? 'No stroke-order data for this character'
                  : d.source === 'loading' ? 'Loading...'
                  : 'Data error';
        this.shadowRoot.innerHTML = showMissing
          ? `<style>${STYLE}</style><div class="card missing"><div class="ch">${ch}</div><div>${msg}</div></div>`
          : '';
        this._rendered = true;
        return;
      }

      // Normal render: every stroke name comes uniformly from d.strokes
      // v11 two-tier badge: within / outside primary-school scope
      let tierHtml = '';
      if (showTier) {
        tierHtml = d.tier === 'textbook'
          ? '<span class="tier textbook">✓ Within primary-school scope</span>'
          : '<span class="tier extended">⚠ Outside primary-school scope</span>';
      }

      const stepsHtml = showTips
        ? d.strokes.map((s, i) =>
            `<span class="step"><span class="idx">${i + 1}.</span>${s}</span>`
          ).join('')
        : '';

      const layout = this.getAttribute('layout') === 'horizontal' ? 'horizontal' : 'vertical';

      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <div class="card ${d.tier}">
          <div class="left">
            <div class="ch">${ch}</div>
            <div class="meta">
              <span class="count ${d.tier === 'extended' ? 'dim' : ''}">${d.count} strokes</span>
              ${tierHtml}
            </div>
          </div>
          <div class="strokes">${stepsHtml}</div>
        </div>
      `;

      this._rendered = true;
    }
  }

  if (!global.customElements.get('stroke-card')) {
    global.customElements.define('stroke-card', StrokeCard);
  }

  // ─────────────────────────────────────────
  // <stroke-tier char="X"> — standalone badge component
  // Scenario: the LLM wants to show a "within / outside primary-school scope" label
  //           **outside** the main component (e.g. titles, captions, list items).
  // Usage: <stroke-tier char="讯"></stroke-tier>
  //        → automatically calls isTextbookChar and renders the unified badge.
  // The LLM is strictly forbidden from hand-writing the literal text
  // "✓ Within primary-school scope" or "⚠ Outside primary-school scope" anywhere on the page.
  // ─────────────────────────────────────────
  class StrokeTier extends HTMLElement {
    static get observedAttributes() { return ['char']; }
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      if (global._strokeLoader && global._strokeLoader.getStatus() === 'ready') this._render();
      else global.addEventListener('stroke-data-ready', () => this._render(), { once: true });
    }
    attributeChangedCallback() {
      if (global._strokeLoader && global._strokeLoader.getStatus() === 'ready') this._render();
    }
    _render() {
      const ch = (this.getAttribute('char') || '').trim();
      if (!ch) { this.shadowRoot.innerHTML = ''; return; }
      const isTB = global.isTextbookChar(ch);
      const style = `
        :host { display: inline-block; }
        .b { font-size: 11px; padding: 2px 8px; border-radius: 10px;
             font-family: 'PingFang SC', sans-serif; vertical-align: middle; }
        .b.textbook { background: #d1fae5; color: #047857; }
        .b.extended { background: #fef3c7; color: #92400e; }
        .b.unknown  { background: #f3f4f6; color: #6b7280; }
      `;
      if (isTB === null) {
        this.shadowRoot.innerHTML = `<style>${style}</style><span class="b unknown">· Loading</span>`;
        return;
      }
      const cls = isTB ? 'textbook' : 'extended';
      const text = isTB ? '✓ Within primary-school scope' : '⚠ Outside primary-school scope';
      this.shadowRoot.innerHTML = `<style>${style}</style><span class="b ${cls}">${text}</span>`;
    }
  }
  if (!global.customElements.get('stroke-tier')) {
    global.customElements.define('stroke-tier', StrokeTier);
  }

  global._strokeCard = { version: '1.1.0' };
})(typeof window !== 'undefined' ? window : this);
