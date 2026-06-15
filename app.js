// Glavni app — wire-up svega
const ICONS = ['📝','📄','🌟','💼','🎯','💡','🔖','📚','🎨','🎵','✈️','🍔','⚽','🌍','💖','🚀','🔥','⭐','🌙','☀️','🎁','🎉','🔐','🎮','📷','🎬','🎤','🎧','🛒','💎','🏆','🎓','⚡','🌈','🦋','🌸','🌺','🌻','🌷','🍀','🌿','🌳','🌲','🏔️','🌋','🏖️','🏝️','🏜️','🌅','🌄','🌠','🌌','🪐','🌟','💫','✨','⚙️','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚖️','🔗','⛓️','🧰','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','⚱️','🏺','🔮','📿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'];

const Toast = {
  el: null,
  show(msg, duration = 2500) {
    if (!this.el) this.el = document.getElementById('toast');
    if (!this.el) return;
    this.el.textContent = msg;
    this.el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => this.el.classList.remove('show'), duration);
  }
};

window.Toast = Toast;
window.Cards = Cards;
window.Editor = Editor;
window.LED = LED;
window.Panels = Panels;
window.Layers = Layers;

const App = {
  async init() {
    // Register DB
    await DB.open();
    await Cards.load();

    // LED restore
    const ledSettings = await DB.getSetting('led');
    if (ledSettings) {
      Object.assign(LED, ledSettings);
    }

    // App title settings
    const appName = await DB.getSetting('appName');
    if (appName) {
      document.getElementById('mainTitle').textContent = appName;
      document.getElementById('mainTitle').dataset.text = appName;
      document.getElementById('appNameInput').value = appName;
    }
    const appTitleStyle = await DB.getSetting('appTitleStyle');
    if (appTitleStyle) {
      document.getElementById('appTitleStyle').value = appTitleStyle;
    }

    // Init LED
    LED.init();
    LED.apply();

    // Render cards
    Cards.renderGrid();

    // Apply default text style
    const main = document.getElementById('mainTitle');
    const defaultText = Cards.getDefaultTextStyle();
    Cards.applyTextStyle(main, defaultText);

    // Apply saved title style
    if (appTitleStyle) {
      main.dataset.style = appTitleStyle;
    }

    this.bindUI();
  },

  bindUI() {
    // Header buttons
    document.getElementById('btnAddNote').addEventListener('click', () => Cards.createNew());
    document.getElementById('btnSettings').addEventListener('click', () => Panels.open('panelSettings'));
    document.getElementById('btnLED').addEventListener('click', () => Panels.open('panelLED'));

    // Back
    document.getElementById('btnBack').addEventListener('click', () => Cards.close());

    // Fullscreen card actions
    document.getElementById('btnCardImage').addEventListener('click', () => {
      document.getElementById('imageInput').click();
    });
    document.getElementById('btnCardLayers').addEventListener('click', () => Panels.open('panelLayers'));
    document.getElementById('btnCardStyle').addEventListener('click', () => Panels.open('panelCard3D'));
    document.getElementById('btnCardText3D').addEventListener('click', () => Panels.open('panelText3D'));
    document.getElementById('btnDeleteNote').addEventListener('click', () => Cards.deleteCurrent());

    // Image input
    document.getElementById('imageInput').addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach(f => Cards.addImage(f));
      e.target.value = '';
    });

    // Panel close buttons
    document.querySelectorAll('.close-panel').forEach(b => {
      b.addEventListener('click', () => Panels.close());
    });

    // Modal close
    document.querySelectorAll('.close-modal').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
      });
    });

    // Title edit
    document.getElementById('mainTitle').addEventListener('dblclick', () => {
      this.editTitle();
    });

    // Settings inputs
    document.getElementById('appNameInput').addEventListener('input', (e) => {
      const v = e.target.value || 'Beleške';
      const t = document.getElementById('mainTitle');
      t.textContent = v;
      t.dataset.text = v;
      DB.setSetting('appName', v);
    });

    document.getElementById('appTitleStyle').addEventListener('change', (e) => {
      const t = document.getElementById('mainTitle');
      t.dataset.style = e.target.value;
      DB.setSetting('appTitleStyle', e.target.value);
    });

    document.getElementById('ledEnabled').addEventListener('change', (e) => {
      LED.setEnabled(e.target.checked);
      DB.setSetting('led', { ...LED });
    });

    document.getElementById('btnReset').addEventListener('click', async () => {
      if (!confirm('Obriši sve beleške i resetuj podešavanja?')) return;
      await DB.clearAll();
      location.reload();
    });

    // Click na card-title dugme (otvori card)
    // (card open se već handluje preko card.click)

    // ESC za zatvaranje
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const open = document.querySelector('.panel.open');
        const modalOpen = document.querySelector('.modal.open');
        if (modalOpen) modalOpen.classList.remove('open');
        else if (open) Panels.close();
        else if (document.getElementById('cardFullscreen').classList.contains('open')) Cards.close();
      }
    });

    // Click na overlay fullscreen za zatvaranje
    document.getElementById('cardFullscreen').addEventListener('click', (e) => {
      if (e.target.id === 'cardFullscreen') Cards.close();
    });

    // Gallery image click — set as cover
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gallery-item') || e.target.closest('.gallery-item')) {
        const item = e.target.closest('.gallery-item');
        if (e.target.classList.contains('delete-img')) {
          e.stopPropagation();
          const idx = parseInt(e.target.dataset.idx);
          const note = Cards.getCurrent();
          if (note && note.images) {
            note.images.splice(idx, 1);
            if (note.coverImage === note.images[idx]) note.coverImage = null;
            DB.saveNote(note);
            Cards.refreshGalleryInOpen(note);
            Cards.renderGrid();
          }
          return;
        }
        if (confirm('Postavi kao pozadinu kartice?')) {
          const idx = Array.from(item.parentNode.children).indexOf(item);
          Cards.setCoverImage(idx);
        }
      }
    });
  },

  editTitle() {
    const t = document.getElementById('mainTitle');
    const cur = t.textContent;
    const newName = prompt('Naziv aplikacije:', cur);
    if (newName !== null && newName.trim()) {
      t.textContent = newName;
      t.dataset.text = newName;
      document.getElementById('appNameInput').value = newName;
      DB.setSetting('appName', newName);
    }
  }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => App.init());
