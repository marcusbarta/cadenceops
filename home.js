(() => {
  const strip = document.querySelector('.tempo-strip');
  if (!strip) return;

  const marker = strip.querySelector('.tempo-marker');
  const bpmEl = strip.querySelector('.tempo-bpm');
  const phaseEl = strip.querySelector('.tempo-phase-label');
  const pulseEl = strip.querySelector('.tempo-pulse');
  if (!marker || !bpmEl || !phaseEl) return;

  const phases = [
    { name: 'Prep',      bpm: 58,  pos: 0,   hold: 4000 },
    { name: 'Doors',     bpm: 74,  pos: 25,  hold: 3000 },
    { name: 'Rush',      bpm: 132, pos: 50,  hold: 5000 },
    { name: 'Last Call', bpm: 96,  pos: 75,  hold: 3500 },
    { name: 'Close',     bpm: 61,  pos: 100, hold: 3500 },
  ];
  const TRANSITION_MS = 1200;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let rafId = null;

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function setStatic() {
    const rush = phases[2];
    marker.style.setProperty('--marker-pos', rush.pos + '%');
    bpmEl.textContent = String(rush.bpm);
    phaseEl.textContent = rush.name;
    if (pulseEl) pulseEl.style.removeProperty('--beat-ms');
  }

  function runLoop(startTime) {
    let phaseIndex = 0;
    let segmentStart = startTime;
    let mode = 'hold';

    function frame(now) {
      let elapsed = now - segmentStart;
      const current = phases[phaseIndex];

      if (mode === 'hold') {
        marker.style.setProperty('--marker-pos', current.pos + '%');
        bpmEl.textContent = String(current.bpm);
        phaseEl.textContent = current.name;
        if (pulseEl) pulseEl.style.setProperty('--beat-ms', Math.round(60000 / current.bpm) + 'ms');

        if (elapsed >= current.hold) {
          mode = 'transition';
          segmentStart = now;
          elapsed = 0;
        }
      }

      if (mode === 'transition') {
        const next = phases[(phaseIndex + 1) % phases.length];
        const t = Math.min(elapsed / TRANSITION_MS, 1);
        const e = ease(t);
        const pos = current.pos + (next.pos - current.pos) * e;
        const bpm = Math.round(current.bpm + (next.bpm - current.bpm) * e);

        marker.style.setProperty('--marker-pos', pos + '%');
        bpmEl.textContent = String(bpm);
        phaseEl.textContent = t < 0.5 ? current.name : next.name;

        if (t >= 1) {
          phaseIndex = (phaseIndex + 1) % phases.length;
          mode = 'hold';
          segmentStart = now;
        }
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId !== null) return;
    runLoop(performance.now());
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    setStatic();
  }

  function applyMotionPreference() {
    if (reduceQuery.matches) {
      stop();
    } else {
      start();
    }
  }

  applyMotionPreference();
  reduceQuery.addEventListener('change', applyMotionPreference);
})();
