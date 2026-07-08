/* =========================================================
   ROMANTIC WEBSITE — SCRIPT.JS
   Handles: loader, page navigation, floating hearts,
   cursor trail, envelope/letter reveal, question page,
   confetti, and background music toggle.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. LOADING SCREEN
     Hide the cute heart loader once the page is ready.
  --------------------------------------------------------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hide');
    }, 900); // small delay so the animation is actually seen
  });

  /* ---------------------------------------------------------
     2. PAGE NAVIGATION (single-page app style)
     Any element with [data-goto="page-id"] switches pages.
  --------------------------------------------------------- */
  const pages = document.querySelectorAll('.page');

  function goToPage(pageId) {
    const target = document.getElementById(pageId);
    if (!target) return;

    pages.forEach((page) => page.classList.remove('active-page'));
    // Small timeout lets the exit state paint before entering, for a soft cross-fade feel
    requestAnimationFrame(() => {
      target.classList.add('active-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', () => goToPage(el.getAttribute('data-goto')));
  });

  /* ---------------------------------------------------------
     3. FLOATING HEARTS BACKGROUND
     Continuously spawns small hearts drifting upward.
  --------------------------------------------------------- */
  const heartsContainer = document.getElementById('floating-hearts');
  const heartEmojis = ['❤️', '💕', '💖', '💗', '💓'];

  function spawnFloatingHeart() {
    const heart = document.createElement('span');
    heart.className = 'fh-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

    const size = Math.random() * 18 + 14; // 14px - 32px
    const startX = Math.random() * 100; // vw
    const duration = Math.random() * 6 + 8; // 8s - 14s
    const drift = (Math.random() - 0.5) * 160; // px sideways drift

    heart.style.left = `${startX}vw`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.setProperty('--drift', `${drift}px`);

    heartsContainer.appendChild(heart);

    // Clean up after animation finishes to avoid DOM bloat
    setTimeout(() => heart.remove(), duration * 1000 + 500);
  }

  // Spawn a steady trickle of hearts
  setInterval(spawnFloatingHeart, 700);
  for (let i = 0; i < 6; i++) setTimeout(spawnFloatingHeart, i * 300); // initial burst

  /* ---------------------------------------------------------
     4. CURSOR TRAIL HEARTS
     Small hearts pop near the cursor as it moves (throttled).
  --------------------------------------------------------- */
  let lastCursorHeart = 0;

  function spawnCursorHeart(x, y) {
    const now = Date.now();
    if (now - lastCursorHeart < 90) return; // throttle for performance
    lastCursorHeart = now;

    const heart = document.createElement('span');
    heart.className = 'cursor-heart';
    heart.textContent = '💗';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 900);
  }

  window.addEventListener('pointermove', (e) => {
    spawnCursorHeart(e.clientX, e.clientY);
  });

  /* ---------------------------------------------------------
     5. LOVE LETTER PAGE — envelope opening interaction
  --------------------------------------------------------- */
  const envelope = document.getElementById('envelope');
  const letter = document.getElementById('letter');

  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('opened')) return; // only opens once
    envelope.classList.add('opened');

    // Reveal the letter shortly after the flap finishes opening
    setTimeout(() => {
      letter.classList.add('revealed');
      letter.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  });

  /* ---------------------------------------------------------
     6. QUESTION PAGE — Yes / No logic
     "No" never rejects — it playfully becomes a "yes" too.
  --------------------------------------------------------- */
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const questionCard = document.getElementById('question-card');
  const answerCard = document.getElementById('answer-card');
  const answerText = document.getElementById('answer-text');

  function showAnswer(message) {
    answerText.textContent = message;
    answerCard.classList.remove('hidden');
    answerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    launchConfetti();
    heartBurst();
  }

  btnYes.addEventListener('click', () => {
    showAnswer('I knew it! ❤️ I love you too, my little pookie. Forever and always. 🥰');
  });

  btnNo.addEventListener('click', () => {
    // Never a sad ending — it flips into a cute reply instead
    showAnswer('Hehe... I know you love me. 😏❤️ I love you too, forever and ever! 🥺💕');
  });

  /* Extra burst of floating hearts on answer reveal */
  function heartBurst() {
    for (let i = 0; i < 18; i++) {
      setTimeout(spawnFloatingHeart, i * 60);
    }
  }

  /* ---------------------------------------------------------
     7. CONFETTI ANIMATION (canvas based, no libraries)
  --------------------------------------------------------- */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const confettiColors = ['#E91E63', '#f06292', '#f8bbd0', '#ad1457', '#ffffff'];

  function createConfettiPiece() {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 8 + 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'heart' : 'square',
    };
  }

  function drawConfettiPiece(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;

    if (p.shape === 'heart') {
      // Tiny heart shape drawn with two arcs and a triangle
      const s = p.size / 2;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(s, -s * 0.6, s * 1.8, s * 0.5, 0, s * 1.6);
      ctx.bezierCurveTo(-s * 1.8, s * 0.5, -s, -s * 0.6, 0, s * 0.3);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      drawConfettiPiece(p);
    });

    // Remove pieces that fell off screen
    confettiPieces = confettiPieces.filter((p) => p.y < canvas.height + 30);

    if (confettiPieces.length > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      cancelAnimationFrame(confettiAnimId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function launchConfetti() {
    const newPieces = Array.from({ length: 90 }, createConfettiPiece);
    confettiPieces = confettiPieces.concat(newPieces);

    if (!confettiAnimId) {
      animateConfetti();
    }
  }

  /* ---------------------------------------------------------
     8. BACKGROUND MUSIC TOGGLE
     Gracefully handles the case where no music file exists.
  --------------------------------------------------------- */
  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const bgMusic = document.getElementById('bg-music');
  let isPlaying = false;

  musicToggle.addEventListener('click', () => {
    if (!isPlaying) {
      bgMusic.play()
        .then(() => {
          isPlaying = true;
          musicIcon.textContent = '🎶';
          musicToggle.classList.add('playing');
        })
        .catch(() => {
          // No audio file available or autoplay blocked — fail silently and gracefully
          musicIcon.textContent = '🔇';
          setTimeout(() => { musicIcon.textContent = '🎵'; }, 1200);
        });
    } else {
      bgMusic.pause();
      isPlaying = false;
      musicIcon.textContent = '🎵';
      musicToggle.classList.remove('playing');
    }
  });

});
