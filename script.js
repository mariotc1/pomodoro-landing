function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

document.addEventListener('DOMContentLoaded', () => {
  // --- TsParticles (sin cambios) ---
  if (window.tsParticles) {
    tsParticles.load("tsparticles", {
      fpsLimit: 60,
      background: { color: { value: "#000000" } },
      particles: {
        number: { value: 30 },
        color: { value: ["#00d18a", "#00aef0", "#7c4dff"] },
        shape: { type: "circle" },
        opacity: { value: { min: 0.1, max: 0.4 } },
        size: { value: { min: 1, max: 5 } },
        move: { enable: true, direction: "top", speed: 0.8, outModes: { default: "out" } }
      },
      interactivity: { detectsOn: "canvas", events: { onhover: { enable: false }, onclick: { enable: false } } },
      detectRetina: true
    });
  }

  // --- INTRO MEJORADA ---
  const intro = document.getElementById('intro');
  const typewriterEl = document.getElementById('typewriter');
  const enterBtn = document.getElementById('enterBtn');

  if (intro && typewriterEl && enterBtn) {
    const lines = [
      { text: 'Estás a punto de entrar...' },
      { text: 'A un lugar donde el caos se convierte en foco' },
      { text: 'Consigue acceso prioritario a la beta privada', classes: 'gradient-text' },
      { text: '¿Aceptas la invitación?', classes: 'glitch', effect: 'decode' } 
    ];

    async function typeLine(line, speed = 50) {
      const p = document.createElement('p');
      p.className = 'type-line';
      if (line.classes) p.classList.add(...line.classes.split(' '));
      p.style.animation = "fadeInUp 0.6s ease both";
      typewriterEl.appendChild(p);
      
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.innerHTML = '|';
      p.appendChild(cursor);

      if (line.effect === 'decode') {
        // Efecto especial para la última línea
        p.setAttribute('data-text', line.text);
        for (let i = 0; i < line.text.length; i++) {
          p.insertBefore(document.createTextNode(line.text[i]), cursor);
        }
        await sleep(200);
        
        const chars = p.querySelectorAll('span.char');
        for (const char of chars) {
            await sleep(30);
            char.classList.add('decoded');
        }
        await sleep(500);

      } else {
        // Escritura normal
        for (let i = 0; i < line.text.length; i++) {
          cursor.before(line.text.charAt(i));
          await sleep(speed);
        }
      }
      
      await sleep(400);
      cursor.classList.add('hidden'); // Ocultar cursor al final de la línea
    }

    async function runIntro() {
      await sleep(900);
      for (const line of lines) {
        await typeLine(line);
      }
      await sleep(300);
      
      enterBtn.classList.remove('hidden');
      enterBtn.classList.add('show');
    }

    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      intro.classList.add('fade-out');
      setTimeout(() => {
        try { intro.remove(); } catch (e) {}
        document.body.style.overflow = 'auto'; // Permitir scroll
        const nameInput = document.getElementById('name');
        if (nameInput) {
          nameInput.focus();
          nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        animateSpots();
      }, 360);
    });

    runIntro().catch((err) => { console.error('Intro failed', err); });
  }

  // --- ANIMACIÓN DE PLAZAS (sin cambios) ---
  function animateSpots() {
    const spotsCountEl = document.getElementById('spotsCount');
    if (!spotsCountEl) return;
    
    let currentSpots = 25;
    const finalSpots = 12;
    
    const interval = setInterval(() => {
      spotsCountEl.textContent = currentSpots;
      if (currentSpots > finalSpots) {
        currentSpots--;
      } else {
        clearInterval(interval);
        spotsCountEl.parentElement.style.animation = 'pulseSpots 2s ease-in-out infinite';
      }
    }, 80);
  }

  // --- CARGA DEL LOGO (sin cambios) ---
  const logoEl = document.getElementById('logo');
  if (logoEl) {
    fetch('assets/logo.json', { method: 'HEAD' }).then(res => {
      if (res.ok && window.lottie) {
        lottie.loadAnimation({ container: logoEl, path: 'assets/logo.json', renderer: 'svg', loop: true, autoplay: true });
      } else {
        logoEl.innerHTML = '<img src="assets/logo2.png" alt="PomodoroProApp" />';
      }
    }).catch(() => {
      logoEl.innerHTML = '<img src="assets/logo2.png" alt="PomodoroProApp" />';
    });
  }

  // --- FORMULARIO DE SUSCRIPCIÓN "ÉPICO" ---
  const fallbackForm = document.getElementById('fallback-form');
  if (fallbackForm) {
    fallbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const msg = document.getElementById('form-msg');
      const button = form.querySelector('button');
      
      // limpiar estados previos
      msg.textContent = '';
      msg.className = 'form-msg';
      nameInput.classList.remove('is-invalid');
      emailInput.classList.remove('is-invalid');

      if (!form.checkValidity()) {
        msg.textContent = 'Por favor, rellena los campos correctamente.';
        msg.classList.add('error');
        if (!nameInput.validity.valid) nameInput.classList.add('is-invalid');
        if (!emailInput.validity.valid) emailInput.classList.add('is-invalid');
        return;
      }

      button.disabled = true;
      button.dataset.loading = true;

      try {
        // Send the subscriber to our serverless endpoint (/api/subscribe)
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameInput.value, email: emailInput.value })
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          console.error('Server subscribe error', result);
          const errMsg = (result && (result.error || result.message)) ? (result.error || result.message) : 'Error en el servidor';
          throw new Error(errMsg);
        }

        msg.innerHTML = `¡Genial, <strong>${nameInput.value}</strong>! Revisa tu correo para la confirmación.`;
        msg.classList.add('success');
        form.reset();
        nameInput.blur();
        emailInput.blur();

      } catch (error) {
        console.error('Subscription failed:', error);
        // show a clearer message to the user
        let userMsg = 'Algo salió mal. Inténtalo de nuevo.';
        if (error && error.message) {
          // If server returned a readable message, show a friendly version
          if (error.message.includes('Missing email')) userMsg = 'Introduce un email válido.';
        }
        msg.textContent = userMsg;
        msg.classList.add('error');
      } finally {
        button.disabled = false;
        button.dataset.loading = false;
      }
    });
  }

  // --- EFECTO PARALLAX SUTIL ---
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner) {
    document.body.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (clientY - innerHeight / 2) / (innerHeight / 2);
      
      heroInner.style.transform = `rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
    });
  }
});