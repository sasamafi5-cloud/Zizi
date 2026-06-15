// Kartice sa 3D telom, glassmorphism-om, slikama i slojevima
const Cards = {
  notes: [],
  currentOpenId: null,

  async load() {
    const stored = await DB.getAllNotes();
    if (stored && stored.length > 0) {
      this.notes = stored.sort((a, b) => (b.order || 0) - (a.order || 0));
    } else {
      // Kreiraj default dve kartice
      this.notes = [
        {
          id: 'personal',
          title: 'Lično',
          icon: '🌟',
          content: '<p>Dobrodošli u Lične beleške. Piši sve što ti padne na pamet.</p>',
          preview: 'Dobrodošli u Lične beleške.',
          images: [],
          coverImage: null,
          style: this.getDefaultCardStyle(),
          textStyle: this.getDefaultTextStyle(),
          layers: this.getDefaultLayers(),
          led: { enabled: true, color: '#7c8cff' },
          order: 2
        },
        {
          id: 'docs',
          title: 'Dokumenti',
          icon: '📄',
          content: '<p>Važni dokumenti, linkovi, beleške, sve na jednom mestu.</p>',
          preview: 'Važni dokumenti, linkovi, beleške.',
          images: [],
          coverImage: null,
          style: this.getDefaultCardStyle(),
          textStyle: this.getDefaultTextStyle(),
          layers: this.getDefaultLayers(),
          led: { enabled: true, color: '#b78dff' },
          order: 1
        }
      ];
      await Promise.all(this.notes.map(n => DB.saveNote(n)));
    }
  },

  getDefaultCardStyle() {
    return {
      depth: 30, thickness: 18, height: 30, radius: 50,
      shadowOut: 0.5, shadowBlur: 40, shadowDist: 20, shadowIn: 0.4,
      opacity: 0.65, blur: 30, reflect: 0.35,
      lightTop: 0.5, lightBot: 0.2,
      edgeL: 0.5, edgeR: 0.5, ambient: 0.3, hover: 20, intensity3d: 1,
      contrast: 1, gloss: 0.5, fresnel: 0.4, bloom: 0.3, softlight: 0.4,
      reflStr: 0.4, reflSpread: 0.5, edgeBright: 0.6, edgeSoft: 0.5,
      ao: 0.4, gi: 0.4, float: 1
    };
  },

  getDefaultTextStyle() {
    return {
      depth: 6, thickness: 2, extrude: 8, shadow: 8, shadowBlur: 12,
      reflection: 0.3, gloss: 0.5, opacity: 1, glow: 0.4, intensity3d: 1,
      front: '#ffffff', side: '#b8b8d0', light: '#ffffff',
      neon: 0, ambient: 0.4, style: 'glass'
    };
  },

  getDefaultLayers() {
    return [
      { id: 'bg', name: 'Pozadina', visible: true, opacity: 1, order: 1 },
      { id: 'led', name: 'LED efekti', visible: true, opacity: 1, order: 2 },
      { id: 'image', name: 'Slika', visible: true, opacity: 1, order: 3 },
      { id: 'decor', name: 'Dekorativni elementi', visible: true, opacity: 1, order: 4 },
      { id: 'text3d', name: '3D tekst', visible: true, opacity: 1, order: 5 },
      { id: 'icon', name: 'Ikonice', visible: true, opacity: 1, order: 6 },
      { id: 'interactive', name: 'Interaktivni elementi', visible: true, opacity: 1, order: 7 }
    ];
  },

  renderGrid() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    this.notes.forEach((note, i) => {
      const card = this.createCardElement(note, i);
      grid.appendChild(card);
    });
  },

  createCardElement(note, index) {
    const card = document.createElement('div');
    card.className = 'card card-floating';
    card.dataset.id = note.id;
    card.style.animationDelay = (index * 0.3) + 's';

    // LED
    if (note.led && note.led.enabled) {
      const led = document.createElement('div');
      led.className = 'card-led on';
      led.style.setProperty('--led-color', note.led.color);
      card.appendChild(led);
    }

    // Slika kao cover
    if (note.coverImage) {
      const img = document.createElement('div');
      img.className = 'card-image show';
      img.style.backgroundImage = `url(${note.coverImage})`;
      card.appendChild(img);
    } else if (note.images && note.images.length > 0) {
      const img = document.createElement('div');
      img.className = 'card-image show';
      img.style.backgroundImage = `url(${note.images[0]})`;
      card.appendChild(img);
    }

    // Edge
    const edgeL = document.createElement('div');
    edgeL.className = 'card-edge card-edge-left';
    card.appendChild(edgeL);
    const edgeR = document.createElement('div');
    edgeR.className = 'card-edge card-edge-right';
    card.appendChild(edgeR);

    // Apply 3D style to card
    this.applyCardStyle(card, note.style || this.getDefaultCardStyle());

    // Content
    const content = document.createElement('div');
    content.className = 'card-content';

    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.textContent = note.icon || '📝';
    content.appendChild(icon);

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = note.title;
    content.appendChild(title);

    const preview = document.createElement('div');
    preview.className = 'card-preview';
    preview.textContent = note.preview || 'Prazna beleška. Dodirni da otvoriš.';
    content.appendChild(preview);

    card.appendChild(content);

    card.addEventListener('click', () => this.open(note.id));

    return card;
  },

  applyCardStyle(card, s) {
    const c = card;
    c.style.setProperty('--c-depth', s.depth);
    c.style.setProperty('--c-thickness', s.thickness);
    c.style.setProperty('--c-height', s.height);
    c.style.setProperty('--c-radius', s.radius);
    c.style.setProperty('--c-shadow-out', s.shadowOut);
    c.style.setProperty('--c-shadow-blur', s.shadowBlur);
    c.style.setProperty('--c-shadow-dist', s.shadowDist);
    c.style.setProperty('--c-shadow-in', s.shadowIn);
    c.style.setProperty('--c-opacity', s.opacity);
    c.style.setProperty('--c-blur', s.blur);
    c.style.setProperty('--c-reflect', s.reflect);
    c.style.setProperty('--c-light-top', s.lightTop);
    c.style.setProperty('--c-light-bot', s.lightBot);
    c.style.setProperty('--c-edge-l', s.edgeL);
    c.style.setProperty('--c-edge-r', s.edgeR);
    c.style.setProperty('--c-ambient', s.ambient);
    c.style.setProperty('--c-hover', s.hover);
    c.style.setProperty('--c-3d', s.intensity3d);
    c.style.setProperty('--c-contrast', s.contrast);
    c.style.setProperty('--c-gloss', s.gloss);
    c.style.setProperty('--c-fresnel', s.fresnel);
    c.style.setProperty('--c-bloom', s.bloom);
    c.style.setProperty('--c-softlight', s.softlight);
    c.style.setProperty('--c-refl-str', s.reflStr);
    c.style.setProperty('--c-refl-spread', s.reflSpread);
    c.style.setProperty('--c-edge-bright', s.edgeBright);
    c.style.setProperty('--c-edge-soft', s.edgeSoft);
    c.style.setProperty('--c-ao', s.ao);
    c.style.setProperty('--c-gi', s.gi);
    c.style.setProperty('--c-float', s.float);
  },

  applyTextStyle(title, s) {
    title.dataset.style = s.style || 'glass';
    title.style.setProperty('--t-depth', s.depth);
    title.style.setProperty('--t-thickness', s.thickness);
    title.style.setProperty('--t-extrude', s.extrude);
    title.style.setProperty('--t-shadow', s.shadow);
    title.style.setProperty('--t-shadow-blur', s.shadowBlur);
    title.style.setProperty('--t-reflection', s.reflection);
    title.style.setProperty('--t-gloss', s.gloss);
    title.style.setProperty('--t-opacity', s.opacity);
    title.style.setProperty('--t-glow', s.glow);
    title.style.setProperty('--t-3d-intensity', s.intensity3d);
    title.style.setProperty('--t-front', s.front);
    title.style.setProperty('--t-side', s.side);
    title.style.setProperty('--t-light', s.light);
    title.style.setProperty('--t-neon', s.neon);
    title.style.setProperty('--t-ambient', s.ambient);
  },

  open(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;
    this.currentOpenId = id;

    const fs = document.getElementById('cardFullscreen');
    const body = document.getElementById('fullscreenBody');
    fs.classList.add('open');

    // Editor
    Editor.init(id, body);

    // Ubaci cover image overlay
    const cover = note.coverImage;
    if (cover) {
      const overlay = document.createElement('div');
      overlay.className = 'overlay-image';
      overlay.style.backgroundImage = `url(${cover})`;
      overlay.id = 'fullscreenOverlayImage';
      body.appendChild(overlay);
    }

    // Ubaci galeriju
    if (note.images && note.images.length > 0) {
      const gallery = document.createElement('div');
      gallery.className = 'card-gallery';
      gallery.id = 'cardGallery';
      note.images.forEach((img, idx) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${img}"><button class="delete-img" data-idx="${idx}">×</button>`;
        gallery.appendChild(item);
      });
      body.appendChild(gallery);
    }

    // Postavi sadržaj
    setTimeout(() => Editor.setContent(note.content || ''), 0);
  },

  close() {
    const fs = document.getElementById('cardFullscreen');
    fs.classList.remove('open');
    this.currentOpenId = null;
    // sačuvaj pre zatvaranja
    if (Editor.currentNoteId) {
      const note = this.notes.find(n => n.id === Editor.currentNoteId);
      if (note) {
        note.content = Editor.getContent();
        note.preview = Editor.stripHtml(note.content).slice(0, 200);
        DB.saveNote(note);
      }
    }
  },

  getCurrent() {
    return this.notes.find(n => n.id === this.currentOpenId);
  },

  async updateCurrent(updates) {
    const note = this.getCurrent();
    if (!note) return;
    Object.assign(note, updates);
    await DB.saveNote(note);
    this.renderGrid();
  },

  async createNew() {
    const id = 'note_' + Date.now();
    const note = {
      id,
      title: 'Nova beleška',
      icon: '📝',
      content: '<p>Nova beleška...</p>',
      preview: 'Nova beleška...',
      images: [],
      coverImage: null,
      style: this.getDefaultCardStyle(),
      textStyle: this.getDefaultTextStyle(),
      layers: this.getDefaultLayers(),
      led: { enabled: true, color: '#5fd5ff' },
      order: Date.now()
    };
    this.notes.push(note);
    await DB.saveNote(note);
    this.renderGrid();
    this.open(id);
    Toast.show('Nova beleška kreirana');
  },

  async deleteCurrent() {
    if (!this.currentOpenId) return;
    if (!confirm('Obriši ovu belešku?')) return;
    await DB.deleteNote(this.currentOpenId);
    this.notes = this.notes.filter(n => n.id !== this.currentOpenId);
    this.close();
    this.renderGrid();
    Toast.show('Beleška obrisana');
  },

  async addImage(file) {
    const note = this.getCurrent();
    if (!note) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (!note.images) note.images = [];
      note.images.push(dataUrl);
      DB.saveNote(note);
      this.refreshGalleryInOpen(note);
      this.renderGrid();
      Toast.show('Slika dodata');
    };
    reader.readAsDataURL(file);
  },

  refreshGalleryInOpen(note) {
    const existing = document.getElementById('cardGallery');
    if (existing) existing.remove();
    const body = document.getElementById('fullscreenBody');
    if (!body) return;
    if (note.images && note.images.length > 0) {
      const gallery = document.createElement('div');
      gallery.className = 'card-gallery';
      gallery.id = 'cardGallery';
      note.images.forEach((img, idx) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${img}"><button class="delete-img" data-idx="${idx}">×</button>`;
        gallery.appendChild(item);
      });
      // Ubaci posle toolbar-a
      const editor = body.querySelector('.editor-content');
      if (editor) body.insertBefore(gallery, editor);
      else body.appendChild(gallery);
    }
  },

  async setCoverImage(idx) {
    const note = this.getCurrent();
    if (!note || !note.images || !note.images[idx]) return;
    note.coverImage = note.images[idx];
    await DB.saveNote(note);
    // Refresh overlay
    const existing = document.getElementById('fullscreenOverlayImage');
    if (existing) existing.remove();
    const body = document.getElementById('fullscreenBody');
    const overlay = document.createElement('div');
    overlay.className = 'overlay-image';
    overlay.style.backgroundImage = `url(${note.coverImage})`;
    overlay.id = 'fullscreenOverlayImage';
    body.insertBefore(overlay, body.firstChild);
    this.renderGrid();
    Toast.show('Slika postavljena kao pozadina');
  }
};
