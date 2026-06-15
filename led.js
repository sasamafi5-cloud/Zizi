// LED sistem sa RGB/HEX/HSL picker-om i režimima
const LED = {
  enabled: true,
  color: '#7c8cff',
  intensity: 0.6,
  width: 60,
  height: 60,
  radius: 50,
  blur: 80,
  glow: 0.4,
  neon: 0,
  pulse: false,
  ambient: true,
  mode: 'static', // static | dynamic | auto
  autoInterval: null,

  init() {
    this.apply();
    this.setupLEDTracking();
  },

  apply() {
    const led = document.getElementById('ledGlobal');
    if (!led) return;
    if (!this.enabled) {
      led.style.opacity = '0';
      return;
    }
    led.style.opacity = this.intensity;
    led.style.setProperty('--led-color', this.color);
    led.style.setProperty('--led-width', this.width + 'px');
    led.style.setProperty('--led-height', this.height + 'px');
    led.style.setProperty('--led-blur', this.blur + 'px');
    led.style.setProperty('--led-glow', this.glow);
    led.style.setProperty('--led-intensity', this.intensity);
    led.style.borderRadius = this.radius + '%';
  },

  setupLEDTracking() {
    const led = document.getElementById('ledGlobal');
    if (!led) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx, cy = ty;

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    document.addEventListener('touchmove', (e) => {
      if (e.touches[0]) {
        tx = e.touches[0].clientX;
        ty = e.touches[0].clientY;
      }
    }, { passive: true });

    const animate = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      led.style.left = (cx - this.width / 2) + 'px';
      led.style.top = (cy - this.height / 2) + 'px';
      requestAnimationFrame(animate);
    };
    animate();
  },

  startAutoMode() {
    if (this.autoInterval) clearInterval(this.autoInterval);
    if (this.mode !== 'auto') return;
    const hueStep = 2;
    this.autoInterval = setInterval(() => {
      if (this.mode !== 'auto') return;
      const h = (Date.now() / 30) % 360;
      this.color = `hsl(${h}, 80%, 65%)`;
      this.apply();
    }, 50);
  },

  setMode(mode) {
    this.mode = mode;
    if (mode === 'auto') {
      this.startAutoMode();
    } else {
      if (this.autoInterval) { clearInterval(this.autoInterval); this.autoInterval = null; }
      this.apply();
    }
  },

  setColor(c) {
    this.color = c;
    if (this.mode === 'auto') this.mode = 'static';
    this.apply();
  },

  setEnabled(e) {
    this.enabled = e;
    this.apply();
  }
};
