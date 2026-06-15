// Slojevi - vidljivost, redosled, transparentnost
const Layers = {
  renderPanel(container) {
    const note = Cards.getCurrent();
    if (!note) { container.innerHTML = '<p>Otvorite belešku da biste upravljali slojevima.</p>'; return; }
    if (!note.layers) note.layers = Cards.getDefaultLayers();
    note.layers.sort((a, b) => a.order - b.order);

    container.innerHTML = `
      <p style="color:var(--text-dim);font-size:12px;margin-bottom:12px;">Upravljanje slojevima kartice</p>
      ${note.layers.map(layer => `
        <div class="layer-item ${!layer.visible ? 'hidden' : ''}" data-id="${layer.id}">
          <button class="layer-visibility" data-action="toggle" data-id="${layer.id}">
            ${layer.visible ? '👁️' : '🚫'}
          </button>
          <div class="layer-name">${layer.name}</div>
          <button class="icon-btn" style="width:30px;height:30px" data-action="up" data-id="${layer.id}">▲</button>
          <button class="icon-btn" style="width:30px;height:30px" data-action="down" data-id="${layer.id}">▼</button>
        </div>
        <div class="control-row">
          <label>Transparentnost — ${layer.name} <span class="value">${(layer.opacity*100).toFixed(0)}%</span></label>
          <input type="range" min="0" max="1" step="0.05" value="${layer.opacity}" data-action="opacity" data-id="${layer.id}">
        </div>
      `).join('')}
    `;

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      const layer = note.layers.find(l => l.id === id);
      if (!layer) return;
      if (btn.dataset.action === 'toggle') {
        layer.visible = !layer.visible;
      } else if (btn.dataset.action === 'up') {
        const idx = note.layers.indexOf(layer);
        if (idx > 0) {
          note.layers[idx].order--;
          note.layers[idx-1].order++;
        }
      } else if (btn.dataset.action === 'down') {
        const idx = note.layers.indexOf(layer);
        if (idx < note.layers.length - 1) {
          note.layers[idx].order++;
          note.layers[idx+1].order--;
        }
      }
      DB.saveNote(note);
      this.renderPanel(container);
    });

    container.addEventListener('input', (e) => {
      if (e.target.dataset.action === 'opacity') {
        const id = e.target.dataset.id;
        const layer = note.layers.find(l => l.id === id);
        if (layer) {
          layer.opacity = parseFloat(e.target.value);
          DB.saveNote(note);
        }
      }
    });
  }
};
