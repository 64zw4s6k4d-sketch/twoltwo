/* 2L² / Customer Information — expressive robot interaction and cursor tracking.
   A first click makes the robot shy; a second click makes it playfully angry.
   Speech is visual (animated dialogue and mouth); no audio is played. */
(() => {
  'use strict';
  const robot = document.querySelector('.robot-character');
  const section = document.querySelector('.robot-section');
  const button = document.querySelector('#robot-interact');
  const speech = document.querySelector('#robot-speech-text');
  const announcement = document.querySelector('#robot-announcement');
  if (!robot || !section || !button || !speech || !announcement) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const LINES = {
    ja: {
      hello: 'こんにちは！ぼくが案内するよ。気軽にタップしてね。',
      shy: 'えっ、ぼくを呼んだの？……ちょっと照れちゃうな。',
      angry: 'も〜っ！2回も押したら、ぷんぷんだよ！',
      honest: '知らないことは、知らないって正直に伝えるよ。',
      label: 'ロボットくんに話しかける。1回で照れ顔、2回で怒り顔'
    },
    en: {
      hello: 'Hello! I can show you around. Give me a tap!',
      shy: 'Oh, you called me? Now I am blushing!',
      angry: 'Hey! Twice?! Now I am a little grumpy!',
      honest: 'If I do not know, I will say so honestly.',
      label: 'Talk to the robot: tap once to make it blush, twice for an angry face'
    },
    th: {
      hello: 'สวัสดี! ให้ฉันพาชมนะ ลองแตะดูสิ',
      shy: 'เอ๊ะ เรียกฉันเหรอ? เขินเลยนะ!',
      angry: 'โธ่! กดตั้งสองครั้ง ฉันงอนแล้วนะ!',
      honest: 'ถ้าไม่รู้ ฉันจะบอกตรง ๆ ว่าไม่รู้',
      label: 'คุยกับหุ่นยนต์ แตะครั้งแรกให้เขิน แตะครั้งที่สองให้งอน'
    }
  };

  let language = LINES[document.documentElement.lang] ? document.documentElement.lang : 'ja';
  let clickCount = 0;
  let typeTimer = null;
  let idleTimer = null;
  let resetTimer = null;
  let speechSerial = 0;

  function graphemes(value) {
    if (typeof Intl.Segmenter === 'function') {
      return Array.from(new Intl.Segmenter(language, { granularity: 'grapheme' }).segment(value), item => item.segment);
    }
    return Array.from(value);
  }

  function speak(message) {
    speechSerial += 1;
    const serial = speechSerial;
    window.clearTimeout(typeTimer);
    section.classList.remove('is-speaking');
    announcement.textContent = message;
    const parts = graphemes(message);

    if (reducedMotion.matches || parts.length === 0) {
      speech.textContent = message;
      return;
    }

    speech.textContent = '';
    section.classList.add('is-speaking');
    let index = 0;
    const interval = Math.max(20, Math.min(38, Math.floor(2100 / parts.length)));
    const next = () => {
      if (serial !== speechSerial) return;
      index += 1;
      speech.textContent = parts.slice(0, index).join('');
      if (index < parts.length) {
        typeTimer = window.setTimeout(next, interval);
      } else {
        section.classList.remove('is-speaking');
        typeTimer = null;
      }
    };
    typeTimer = window.setTimeout(next, 110);
  }

  function talkAs(mood, lineKey) {
    section.dataset.mood = mood;
    speak(LINES[language][lineKey || mood]);
  }

  function resetIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (section.dataset.mood === 'neutral') speak(LINES[language].honest);
    }, 14000);
  }

  button.setAttribute('aria-label', LINES[language].label);
  speech.textContent = LINES[language].hello;
  window.setTimeout(() => {
    if (clickCount === 0) talkAs('neutral', 'hello');
  }, 480);
  resetIdleTimer();

  button.addEventListener('click', () => {
    window.clearTimeout(resetTimer);
    clickCount += 1;
    if (clickCount === 1) {
      talkAs('shy');
    } else {
      talkAs('angry');
      clickCount = 0;
    }
    resetIdleTimer();
    resetTimer = window.setTimeout(() => {
      clickCount = 0;
      talkAs('neutral', 'hello');
      resetIdleTimer();
    }, 7600);
  });

  window.addEventListener('customer-language-change', event => {
    const nextLang = event.detail?.lang;
    if (!LINES[nextLang]) return;
    language = nextLang;
    button.setAttribute('aria-label', LINES[language].label);
    talkAs(section.dataset.mood || 'neutral');
    resetIdleTimer();
  });

  // Respect reduced-motion preferences without disabling click interactions.
  if (reducedMotion.matches) return;
  const root = document.documentElement;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rect = null;
  let visible = true;

  function updateRect() { rect = robot.getBoundingClientRect(); }
  updateRect();
  window.addEventListener('resize', updateRect);
  window.addEventListener('scroll', updateRect, { passive: true });

  function onMove(clientX, clientY) {
    if (!rect) updateRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.35;
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.45;
    targetX = Math.max(-1, Math.min(1, (clientX - cx) / maxDist));
    targetY = Math.max(-1, Math.min(1, (clientY - cy) / maxDist));
  }
  window.addEventListener('mousemove', event => onMove(event.clientX, event.clientY), { passive: true });
  window.addEventListener('touchmove', event => {
    if (event.touches.length) onMove(event.touches[0].clientX, event.touches[0].clientY);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function loop() {
    window.requestAnimationFrame(loop);
    if (!visible) return;
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    root.style.setProperty('--robot-eye-x', (currentX * 5).toFixed(2) + 'px');
    root.style.setProperty('--robot-eye-y', (currentY * 5).toFixed(2) + 'px');
    root.style.setProperty('--robot-head-rot', (currentX * 12).toFixed(2) + 'deg');
    root.style.setProperty('--robot-body-tilt', (currentX * 4).toFixed(2) + 'deg');
    root.style.setProperty('--robot-cube-x', (currentX * 12).toFixed(2) + 'px');
    root.style.setProperty('--robot-cube-y', (currentY * 8).toFixed(2) + 'px');
  }
  loop();
})();
