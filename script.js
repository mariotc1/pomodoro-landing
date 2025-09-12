function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

document.addEventListener('DOMContentLoaded', () => {
  initializeParticleBackground();
  initializeIntroSequence();
  initializeLogoAnimation();
  initializeSubscriptionForm();
  initializeParallaxEffect();
});

function initializeParticleBackground() {
  if (!window.tsParticles) return;

  const particleConfig = {
    fpsLimit: 60,
    background: {
      color: { value: "#000000" }
    },
    particles: {
      number: { value: 30 },
      color: { value: ["#00d18a", "#00aef0", "#7c4dff"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.1, max: 0.4 } },
      size: { value: { min: 1, max: 5 } },
      move: {
        enable: true,
        direction: "top",
        speed: 0.8,
        outModes: { default: "out" }
      }
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onhover: { enable: false },
        onclick: { enable: false }
      }
    },
    detectRetina: true
  };

  tsParticles.load("tsparticles", particleConfig);
}

function initializeIntroSequence() {
  const intro = document.getElementById('intro');
  const typewriterEl = document.getElementById('typewriter');
  const enterBtn = document.getElementById('enterBtn');

  if (!intro || !typewriterEl || !enterBtn) return;

  const introLines = [
    { text: 'Estás a punto de entrar...' },
    { text: 'A un lugar donde el caos se convierte en foco' },
    { text: 'Consigue acceso prioritario a la beta privada', classes: 'gradient-text' },
    { text: '¿Aceptas la invitación?', classes: 'glitch', effect: 'decode' }
  ];

  async function createTypewriterLine(line, typingSpeed = 50) {
    const paragraph = document.createElement('p');
    paragraph.className = 'type-line';
    
    if (line.classes) {
      paragraph.classList.add(...line.classes.split(' '));
    }
    
    paragraph.style.animation = "fadeInUp 0.6s ease both";
    typewriterEl.appendChild(paragraph);

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.innerHTML = '|';
    paragraph.appendChild(cursor);

    if (line.effect === 'decode') {
      await createDecodeEffect(paragraph, line.text, cursor);
    } else {
      await typeTextNormally(paragraph, line.text, cursor, typingSpeed);
    }

    await delay(400);
    cursor.classList.add('hidden');
  }

  async function createDecodeEffect(paragraph, text, cursor) {
    paragraph.setAttribute('data-text', text);
    
    for (let i = 0; i < text.length; i++) {
      paragraph.insertBefore(document.createTextNode(text[i]), cursor);
    }
    
    await delay(200);
    
    const characters = paragraph.querySelectorAll('span.char');
    for (const character of characters) {
      await delay(30);
      character.classList.add('decoded');
    }
    
    await delay(500);
  }

  async function typeTextNormally(paragraph, text, cursor, speed) {
    for (let i = 0; i < text.length; i++) {
      cursor.before(text.charAt(i));
      await delay(speed);
    }
  }

  async function runIntroAnimation() {
    await delay(900);
    
    for (const line of introLines) {
      await createTypewriterLine(line);
    }
    
    await delay(300);
    enterBtn.classList.remove('hidden');
    enterBtn.classList.add('show');
  }

function handleEnterButtonClick(event) {
  event.preventDefault();
  
  const hero = document.querySelector('.hero'); 
  const intro = document.getElementById('intro');

  document.body.classList.add('transitioning');
  intro.classList.add('fade-out');
  
  if (hero) {
    hero.classList.add('zoom-in');
  }
  
  setTimeout(() => {
    try {
      intro.remove();
    } catch (error) {
      console.error('Error removing intro:', error);
    }
    
    document.body.style.overflow = 'auto';
    document.body.classList.remove('transitioning');

    focusOnNameInput();
    animateAvailableSpots();
  }, 700);
}

  function focusOnNameInput() {
    const nameInput = document.getElementById('name');
    if (nameInput) {
      nameInput.focus();
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  enterBtn.addEventListener('click', handleEnterButtonClick);
  runIntroAnimation().catch(error => console.error('Intro animation failed:', error));
}

function animateAvailableSpots() {
  const spotsCountElement = document.getElementById('spotsCount');
  if (!spotsCountElement) return;

  let currentSpots = 25;
  const finalSpots = 12;

  const countdownInterval = setInterval(() => {
    spotsCountElement.textContent = currentSpots;
    
    if (currentSpots > finalSpots) {
      currentSpots--;
    } else {
      clearInterval(countdownInterval);
      spotsCountElement.parentElement.style.animation = 'pulseSpots 2s ease-in-out infinite';
    }
  }, 80);
}

function initializeLogoAnimation() {
  const logoElement = document.getElementById('logo');
  if (!logoElement) return;

  function loadLottieAnimation() {
    if (window.lottie) {
      lottie.loadAnimation({
        container: logoElement,
        path: 'assets/logo.json',
        renderer: 'svg',
        loop: true,
        autoplay: true
      });
    } else {
      showFallbackLogo();
    }
  }

  function showFallbackLogo() {
    logoElement.innerHTML = '<img src="assets/logo2.png" alt="PomodoroProApp" />';
  }

  fetch('assets/logo.json', { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        loadLottieAnimation();
      } else {
        showFallbackLogo();
      }
    })
    .catch(() => {
      showFallbackLogo();
    });
}

function initializeSubscriptionForm() {
  const subscriptionForm = document.getElementById('fallback-form');
  if (!subscriptionForm) return;

  async function handleFormSubmission(event) {
    event.preventDefault();
    
    const formElements = getFormElements(event.target);
    clearPreviousFormState(formElements);

    if (!validateForm(formElements)) {
      return;
    }

    setLoadingState(formElements.button, true);

    try {
      await submitSubscription(formElements);
      showSuccessMessage(formElements);
    } catch (error) {
      showErrorMessage(formElements, error);
    } finally {
      setLoadingState(formElements.button, false);
    }
  }

  function getFormElements(form) {
    return {
      form: form,
      nameInput: document.getElementById('name'),
      emailInput: document.getElementById('email'),
      messageElement: document.getElementById('form-msg'),
      button: form.querySelector('button')
    };
  }

  function clearPreviousFormState(elements) {
    elements.messageElement.textContent = '';
    elements.messageElement.className = 'form-msg';
    elements.nameInput.classList.remove('is-invalid');
    elements.emailInput.classList.remove('is-invalid');
  }

  function validateForm(elements) {
    if (!elements.form.checkValidity()) {
      elements.messageElement.textContent = 'Por favor, rellena los campos correctamente.';
      elements.messageElement.classList.add('error');
      
      if (!elements.nameInput.validity.valid) {
        elements.nameInput.classList.add('is-invalid');
      }
      
      if (!elements.emailInput.validity.valid) {
        elements.emailInput.classList.add('is-invalid');
      }
      
      return false;
    }
    
    return true;
  }

  function setLoadingState(button, isLoading) {
    button.disabled = isLoading;
    button.dataset.loading = isLoading;
  }

  async function submitSubscription(elements) {
    const subscriptionData = {
      name: elements.nameInput.value,
      email: elements.emailInput.value
    };

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData)
    });

    const result = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error('Server subscription error:', result);
      const errorMessage = result?.error || result?.message || 'Error en el servidor';
      throw new Error(errorMessage);
    }

    return result;
  }

  function showSuccessMessage(elements) {
    const userName = elements.nameInput.value;
    elements.messageElement.innerHTML = `
      ¡Genial, <strong>${userName}</strong>! Revisa tu bandeja de entrada para la confirmación.<br>
      Si no lo ves, mira en la carpeta de <em>Promociones</em> o <em>Spam</em>.
    `;
    elements.messageElement.classList.add('success');
    elements.form.reset();
    elements.nameInput.blur();
    elements.emailInput.blur();
  }

  function showErrorMessage(elements, error) {
    console.error('Subscription failed:', error);
    
    let userMessage = 'Algo salió mal. Inténtalo de nuevo.';
    
    if (error?.message?.includes('Missing email')) {
      userMessage = 'Introduce un email válido.';
    }
    
    elements.messageElement.textContent = userMessage;
    elements.messageElement.classList.add('error');
  }

  subscriptionForm.addEventListener('submit', handleFormSubmission);
}

function initializeParallaxEffect() {
  const heroInner = document.querySelector('.hero-inner');
  if (!heroInner) return;

  function handleMouseMovement(event) {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;

    const normalizedX = (clientX - innerWidth / 2) / (innerWidth / 2);
    const normalizedY = (clientY - innerHeight / 2) / (innerHeight / 2);

    const rotationIntensity = 3;
    const rotateY = normalizedX * rotationIntensity;
    const rotateX = -normalizedY * rotationIntensity;

    heroInner.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  }

  document.body.addEventListener('mousemove', handleMouseMovement);
}