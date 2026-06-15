// Panel sistem - 3D tekst, 3D kartica, LED
const Panels = {
  open(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
    const panel = document.getElementById(id);
    if (!panel) return;
    panel.classList.add('open');

    if (id === 'panelText3D') this.renderText3D();
    else if (id === 'panelCard3D') this.renderCard3D();
    else if (id === 'panelLED') this.renderLED();
    else if (id === 'panelLayers') Layers.renderPanel(document.getElementById('layersPanelBody'));
  },

  close() {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
  },

  // Helper za range input
  rangeRow(label, key, min, max, step, value, obj) {
    return `
      <div class="control-row">
        <label>${label} <span class="value">${typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}</span></label>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-key="${key}">
      </div>`;
  },

  colorRow(label, key, value) {
    return `
      <div class="control-row">
        <label>${label}</label>
        <input type="color" value="${value}" data-key="${key}">
      </div>`;
  },

  textRow(label, key, value) {
    return `
      <div class="control-row">
        <label>${label}</label>
        <input type="text" value="${value}" data-key="${key}">
      </div>`;
  },

  selectRow(label, key, value, options) {
    return `
      <div class="control-row">
        <label>${label}</label>
        <select data-key="${key}">
          ${options.map(o => `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>`;
  },

  switchRow(label, key, value) {
    return `
      <div class="control-row">
        <label>${label}</label>
        <label class="switch">
          <input type="checkbox" data-key="${key}" ${value ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>`;
  },

  renderText3D() {
    const body = document.getElementById('text3DPanelBody');
    const note = Cards.getCurrent();
    if (!note) { body.innerHTML = '<p>Otvorite belešku.</p>'; return; }
    const s = note.textStyle || Cards.getDefaultTextStyle();

    body.innerHTML = `
      ${this.selectRow('Stil slova', 'style', s.style, ['glass','crystal','metal','neon','matte','chrome','premium'])}
      ${this.rangeRow('Dubina slova', 'depth', 0, 20, 1, s.depth)}
      ${this.rangeRow('Debljina slova', 'thickness', 0, 10, 1, s.thickness)}
      ${this.rangeRow('Visina ekstrudiranja', 'extrude', 0, 30, 1, s.extrude)}
      ${this.rangeRow('Senka slova', 'shadow', 0, 30, 1, s.shadow)}
      ${this.rangeRow('Blur senke', 'shadowBlur', 0, 40, 1, s.shadowBlur)}
      ${this.rangeRow('Refleksija', 'reflection', 0, 1, 0.05, s.reflection)}
      ${this.rangeRow('Sjaj', 'gloss', 0, 1, 0.05, s.gloss)}
      ${this.rangeRow('Transparentnost', 'opacity', 0, 1, 0.05, s.opacity)}
      ${this.rangeRow('Glow', 'glow', 0, 1, 0.05, s.glow)}
      ${this.rangeRow('Intenzitet 3D efekta', 'intensity3d', 0, 1, 0.05, s.intensity3d)}
      ${this.colorRow('Boja prednje strane', 'front', s.front)}
      ${this.colorRow('Boja bočnih stranica', 'side', s.side)}
      ${this.colorRow('Boja svetla', 'light', s.light)}
      ${this.rangeRow('Neon efekat', 'neon', 0, 1, 0.05, s.neon)}
      ${this.rangeRow('Ambijentalno osvetljenje', 'ambient', 0, 1, 0.05, s.ambient)}
      <div class="control-row">
        <label>Resetuj tekst</label>
        <button class="primary-btn" data-reset="text">Resetuj</button>
      </div>
    `;

    body.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', (e) => {
        const k = e.target.dataset.key;
        if (!k) return;
        let v = e.target.value;
        if (e.target.type === 'range') v = parseFloat(v);
        s[k] = v;
        note.textStyle = s;
        DB.saveNote(note);
        // Update naslov
        const main = document.getElementById('mainTitle');
        if (main) Cards.applyTextStyle(main, s);
        this.renderText3D();
      });
    });
    body.querySelector('[data-reset="text"]')?.addEventListener('click', () => {
      note.textStyle = Cards.getDefaultTextStyle();
      DB.saveNote(note);
      this.renderText3D();
      const main = document.getElementById('mainTitle');
      if (main) Cards.applyTextStyle(main, note.textStyle);
      Toast.show('Stil teksta resetovan');
    });
  },

  renderCard3D() {
    const body = document.getElementById('card3DPanelBody');
    const note = Cards.getCurrent();
    if (!note) { body.innerHTML = '<p>Otvorite belešku.</p>'; return; }
    const s = note.style || Cards.getDefaultCardStyle();

    body.innerHTML = `
      ${this.rangeRow('Dubina kartice', 'depth', 0, 80, 1, s.depth)}
      ${this.rangeRow('Debljina kartice', 'thickness', 0, 60, 1, s.thickness)}
      ${this.rangeRow('Visina kartice', 'height', 0, 80, 1, s.height)}
      ${this.rangeRow('Radius uglova', 'radius', 0, 100, 1, s.radius)}
      ${this.rangeRow('Jačina spoljne senke', 'shadowOut', 0, 1, 0.05, s.shadowOut)}
      ${this.rangeRow('Blur spoljne senke', 'shadowBlur', 0, 100, 1, s.shadowBlur)}
      ${this.rangeRow('Udaljenost senke', 'shadowDist', 0, 80, 1, s.shadowDist)}
      ${this.rangeRow('Jačina unutrašnje senke', 'shadowIn', 0, 1, 0.05, s.shadowIn)}
      ${this.rangeRow('Transparentnost', 'opacity', 0, 1, 0.05, s.opacity)}
      ${this.rangeRow('Blur stakla', 'blur', 0, 80, 1, s.blur)}
      ${this.rangeRow('Jačina refleksije', 'reflect', 0, 1, 0.05, s.reflect)}
      ${this.rangeRow('Gornje osvetljenje', 'lightTop', 0, 1, 0.05, s.lightTop)}
      ${this.rangeRow('Donje osvetljenje', 'lightBot', 0, 1, 0.05, s.lightBot)}
      ${this.rangeRow('Leva ivica', 'edgeL', 0, 1, 0.05, s.edgeL)}
      ${this.rangeRow('Desna ivica', 'edgeR', 0, 1, 0.05, s.edgeR)}
      ${this.rangeRow('Ambijentalni glow', 'ambient', 0, 1, 0.05, s.ambient)}
      ${this.rangeRow('Hover visina', 'hover', 0, 60, 1, s.hover)}
      ${this.rangeRow('Intenzitet 3D efekta', 'intensity3d', 0, 1, 0.05, s.intensity3d)}
      ${this.rangeRow('Kontrast površine', 'contrast', 0, 2, 0.05, s.contrast)}
      ${this.rangeRow('Sjaj površine', 'gloss', 0, 1, 0.05, s.gloss)}
      ${this.rangeRow('Fresnel efekat', 'fresnel', 0, 1, 0.05, s.fresnel)}
      ${this.rangeRow('Bloom efekat', 'bloom', 0, 1, 0.05, s.bloom)}
      ${this.rangeRow('Soft light', 'softlight', 0, 1, 0.05, s.softlight)}
      ${this.rangeRow('Reflection strength', 'reflStr', 0, 1, 0.05, s.reflStr)}
      ${this.rangeRow('Reflection spread', 'reflSpread', 0, 1, 0.05, s.reflSpread)}
      ${this.rangeRow('Edge brightness', 'edgeBright', 0, 1, 0.05, s.edgeBright)}
      ${this.rangeRow('Edge softness', 'edgeSoft', 0, 1, 0.05, s.edgeSoft)}
      ${this.rangeRow('Ambient Occlusion', 'ao', 0, 1, 0.05, s.ao)}
      ${this.rangeRow('Global Illumination', 'gi', 0, 1, 0.05, s.gi)}
      ${this.rangeRow('Floating intenzitet', 'float', 0, 1, 0.05, s.float)}
      <div class="control-row">
        <label>Resetuj karticu</label>
        <button class="primary-btn" data-reset="card">Resetuj</button>
      </div>
    `;

    body.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const k = e.target.dataset.key;
        if (!k) return;
        s[k] = parseFloat(e.target.value);
        note.style = s;
        DB.saveNote(note);
        Cards.renderGrid();
        this.renderCard3D();
      });
    });
    body.querySelector('[data-reset="card"]')?.addEventListener('click', () => {
      note.style = Cards.getDefaultCardStyle();
      DB.saveNote(note);
      Cards.renderGrid();
      this.renderCard3D();
      Toast.show('Stil kartice resetovan');
    });
  },

  renderLED() {
    const body = document.getElementById('ledPanelBody');
    const presets = ['#7c8cff','#b78dff','#5fd5ff','#ff7eb6','#ff5b6e','#ffd93d','#6bcf7f','#ffffff','#ff6b35','#00d4ff','#a855f7','#ec4899','#10b981','#f59e0b','#ef4444','#3b82f6'];

    body.innerHTML = `
      ${this.switchRow('LED uključen', 'enabled', LED.enabled)}
      ${this.colorRow('Boja', 'color', LED.color)}
      <div class="control-row">
        <label>HEX unos</label>
        <input type="text" value="${LED.color}" data-key="hexColor">
      </div>
      <div class="control-row">
        <label>HSL birač</label>
        <input type="range" min="0" max="360" value="${this.hexToHue(LED.color)}" data-key="hue">
      </div>
      <div class="control-row">
        <label>Color preset</label>
        <div class="color-presets">
          ${presets.map(c => `<div class="color-preset" style="background:${c}" data-color="${c}"></div>`).join('')}
        </div>
      </div>
      <div class="control-row">
        <label>Gradient birač</label>
        <div class="color-presets">
          <div class="color-preset" style="background:linear-gradient(45deg,#ff0080,#7928ca)" data-color="linear-gradient(45deg,#ff0080,#7928ca)"></div>
          <div class="color-preset" style="background:linear-gradient(45deg,#00d4ff,#5fd5ff,#7c8cff)" data-color="linear-gradient(45deg,#00d4ff,#5fd5ff,#7c8cff)"></div>
          <div class="color-preset" style="background:linear-gradient(45deg,#ffd93d,#ff5b6e)" data-color="linear-gradient(45deg,#ffd93d,#ff5b6e)"></div>
          <div class="color-preset" style="background:linear-gradient(45deg,#10b981,#5fd5ff)" data-color="linear-gradient(45deg,#10b981,#5fd5ff)"></div>
        </div>
      </div>
      ${this.rangeRow('Intenzitet', 'intensity', 0, 1, 0.05, LED.intensity)}
      ${this.rangeRow('Širina', 'width', 20, 200, 5, LED.width)}
      ${this.rangeRow('Visina', 'height', 20, 200, 5, LED.height)}
      ${this.rangeRow('Radius', 'radius', 0, 100, 5, LED.radius)}
      ${this.rangeRow('Blur', 'blur', 10, 200, 5, LED.blur)}
      ${this.rangeRow('Glow', 'glow', 0, 1, 0.05, LED.glow)}
      ${this.rangeRow('Neon', 'neon', 0, 1, 0.05, LED.neon)}
      ${this.selectRow('Režim', 'mode', LED.mode, ['static','dynamic','auto'])}
      ${this.switchRow('Pulsiranje', 'pulse', LED.pulse)}
      ${this.switchRow('Ambijentalno svetlo', 'ambient', LED.ambient)}
    `;

    body.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', (e) => {
        const k = e.target.dataset.key;
        if (!k) return;
        let v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (e.target.type === 'range') v = parseFloat(v);
        if (k === 'hexColor') {
          LED.setColor(v);
        } else if (k === 'hue') {
          LED.setColor(`hsl(${v}, 80%, 65%)`);
        } else if (k === 'enabled') {
          LED.setEnabled(v);
        } else if (k === 'mode') {
          LED.setMode(v);
        } else if (k === 'pulse') {
          LED.pulse = v;
          document.getElementById('ledGlobal').style.animation = v ? 'pulse 2s ease-in-out infinite' : 'none';
        } else {
          LED[k] = (typeof v === 'string' && !isNaN(parseFloat(v)) && e.target.type !== 'text') ? parseFloat(v) : v;
          LED.apply();
        }
        DB.setSetting('led', {
          enabled: LED.enabled, color: LED.color, intensity: LED.intensity,
          width: LED.width, height: LED.height, blur: LED.blur, glow: LED.glow,
          mode: LED.mode, pulse: LED.pulse
        });
      });
    });

    body.querySelectorAll('.color-preset').forEach(p => {
      p.addEventListener('click', () => {
        const c = p.dataset.color;
        if (c.includes('gradient')) {
          // poseban slučaj
          LED.color = c;
        } else {
          LED.setColor(c);
        }
        this.renderLED();
      });
    });
  },

  hexToHue(hex) {
    if (!hex || !hex.startsWith('#')) return 0;
    const r = parseInt(hex.slice(1,3), 16) / 255;
    const g = parseInt(hex.slice(3,5), 16) / 255;
    const b = parseInt(hex.slice(5,7), 16) / 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    if (max === min) return 0;
    let h;
    if (max === r) h = ((g-b)/(max-min)) * 60;
    else if (max === g) h = ((b-r)/(max-min) + 2) * 60;
    else h = ((r-g)/(max-min) + 4) * 60;
    return Math.round(h);
  }
};

// Dodaj keyframe za pulsiranje LED-a
const ledStyle = document.createElement('style');
ledStyle.textContent = `
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
`;
document.head.appendChild(ledStyle);
