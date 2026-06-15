// Rich text editor sa toolbar-om
const Editor = {
  currentNoteId: null,
  saveTimeout: null,

  init(noteId, container) {
    this.currentNoteId = noteId;
    container.innerHTML = `
      <div class="editor-toolbar">
        <button class="editor-btn" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
        <button class="editor-btn" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
        <button class="editor-btn" data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
        <button class="editor-btn" data-cmd="insertUnorderedList" title="Lista">•</button>
        <button class="editor-btn" data-cmd="insertOrderedList" title="Numerisana">1.</button>
        <button class="editor-btn" id="emojiBtn" title="Emoji">😊</button>
        <button class="editor-btn" data-cmd="formatBlock" data-arg="h1" title="Naslov">H1</button>
        <button class="editor-btn" data-cmd="formatBlock" data-arg="h2" title="Podnaslov">H2</button>
        <button class="editor-btn" data-cmd="formatBlock" data-arg="p" title="Paragraf">P</button>
        <button class="editor-btn" data-cmd="removeFormat" title="Očisti format">⌫</button>
      </div>
      <div class="editor-content" contenteditable="true" data-placeholder="Počni da pišeš..." id="editorContent"></div>
    `;

    const content = container.querySelector('#editorContent');
    const toolbar = container.querySelector('.editor-toolbar');

    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.editor-btn');
      if (!btn) return;
      e.preventDefault();
      if (btn.id === 'emojiBtn') {
        this.insertEmoji(content);
        return;
      }
      const cmd = btn.dataset.cmd;
      const arg = btn.dataset.arg || null;
      document.execCommand(cmd, false, arg);
      content.focus();
      this.scheduleSave();
    });

    content.addEventListener('input', () => this.scheduleSave());
    content.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // default behavior
      }
    });

    // Emoji picker
    this.setupEmojiPicker(content);
  },

  insertEmoji(content) {
    const emojis = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','✨','⭐','🌟','💫','🔥','💥','💯','💢','💨','💦','💧','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️','🌊','💧','💦','🎉','🎊','🎈','🎁','🎀','🎂','🍰','🧁','🍕','🍔','🍟','🌭','🍿','🥨','🥯','🥖','🧀','🥗','🥙','🥪','🌮','🌯','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥮','🥢','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾'];
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    picker.style.cssText = 'position:absolute;background:rgba(20,20,30,0.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:10px;display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-width:300px;z-index:1000;';
    emojis.forEach(emoji => {
      const b = document.createElement('button');
      b.textContent = emoji;
      b.style.cssText = 'background:none;border:none;font-size:20px;cursor:pointer;padding:4px;border-radius:6px;';
      b.onmouseover = () => b.style.background = 'rgba(124,140,255,0.3)';
      b.onmouseout = () => b.style.background = 'none';
      b.onclick = () => {
        this.insertAtCursor(content, emoji);
        picker.remove();
      };
      picker.appendChild(b);
    });
    const rect = content.getBoundingClientRect();
    picker.style.top = (rect.top + window.scrollY - 280) + 'px';
    picker.style.left = (rect.left + 50) + 'px';
    document.body.appendChild(picker);
    setTimeout(() => {
      const closer = (e) => {
        if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', closer); }
      };
      document.addEventListener('click', closer);
    }, 50);
  },

  setupEmojiPicker() {/* placeholder */},

  insertAtCursor(content, text) {
    content.focus();
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      content.innerHTML += text;
    }
    this.scheduleSave();
  },

  setContent(html) {
    const content = document.getElementById('editorContent');
    if (content) content.innerHTML = html || '';
  },

  getContent() {
    const content = document.getElementById('editorContent');
    return content ? content.innerHTML : '';
  },

  scheduleSave() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      if (window.Cards && this.currentNoteId) {
        const note = window.Cards.notes.find(n => n.id === this.currentNoteId);
        if (note) {
          note.content = this.getContent();
          note.preview = this.stripHtml(note.content).slice(0, 200);
          DB.saveNote(note).then(() => {
            window.Cards.renderGrid();
          });
        }
      }
    }, 600);
  },

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
};
