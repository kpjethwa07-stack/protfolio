/**
 * ExperienceSection — "Where I've Been"
 * Immersive Horizontal Spatial Canvas controlled by Vertical Scroll
 * Zero-dependency robust 60/120 FPS animation
 */

export function initExperienceSection() {
  const section = document.getElementById('experience');
  if (!section) return;

  const stage = document.getElementById('exp-horizontal-stage');
  if (!stage) return;

  const tickerTop = document.getElementById('exp-ticker-top');
  const tickerBottom = document.getElementById('exp-ticker-bottom');
  const hudProgress = document.getElementById('exp-hud-progress');
  const hudPhase = document.getElementById('exp-hud-phase');
  const dateBgs = document.querySelectorAll('.exp-date-bg');
  const jumpButtons = document.querySelectorAll('.exp-jump-btn');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    stage.style.transform = 'none';
    return;
  }

  // Camera & Interpolation Physics
  let currentTranslateX = 0;
  let targetTranslateX = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let isTicking = false;

  function getDimensions() {
    const totalDist = section.offsetHeight - window.innerHeight;
    const stageWidth = stage.scrollWidth;
    const maxTranslate = Math.max(0, stageWidth - window.innerWidth);
    return { totalDist, maxTranslate };
  }

  let { totalDist, maxTranslate } = getDimensions();

  window.addEventListener('resize', () => {
    ({ totalDist, maxTranslate } = getDimensions());
    onScroll();
  }, { passive: true });

  function renderFrame() {
    isTicking = false;

    // Smooth inertia lerp
    currentProgress += (targetProgress - currentProgress) * 0.12;
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.12;

    // 1. Move Horizontal Camera / Stage
    stage.style.transform = `translate3d(${currentTranslateX.toFixed(2)}px, 0, 0)`;

    // 2. Parallax Drift for Large Background Dates
    dateBgs.forEach(dateEl => {
      const factor = parseFloat(dateEl.getAttribute('data-parallax-factor') || '0.15');
      const dateOffset = -currentTranslateX * factor;
      dateEl.style.transform = `translate3d(${dateOffset.toFixed(2)}px, 0, 0)`;
    });

    // 3. Counter-drifting Background Tickers
    if (tickerTop) {
      const topOffset = currentTranslateX * 0.35;
      tickerTop.style.transform = `translate3d(${topOffset.toFixed(2)}px, 0, 0)`;
    }
    if (tickerBottom) {
      const bottomOffset = -currentTranslateX * 0.25;
      tickerBottom.style.transform = `translate3d(${bottomOffset.toFixed(2)}px, 0, 0)`;
    }

    // 4. Update HUD Progress Bar
    if (hudProgress) {
      hudProgress.style.width = `${(currentProgress * 100).toFixed(1)}%`;
    }

    // 5. Update HUD Phase Title
    if (hudPhase) {
      if (currentProgress < 0.30) {
        hudPhase.textContent = "ORIGIN & FOUNDATIONS";
      } else if (currentProgress < 0.65) {
        hudPhase.textContent = "DSA & SYSTEMS LEARNING";
      } else {
        hudPhase.textContent = "PROJECT ENGINEERING";
      }
    }

    // 6. Highlight active bottom jump button
    jumpButtons.forEach(btn => {
      const btnTarget = parseFloat(btn.getAttribute('data-target-progress') || '0');
      const isCurrent = Math.abs(currentProgress - btnTarget) < 0.20;
      if (isCurrent) {
        btn.classList.add('text-white', 'bg-white/20', 'border-white/40');
        btn.classList.remove('text-neutral-500', 'border-white/5');
      } else {
        btn.classList.remove('text-white', 'bg-white/20', 'border-white/40');
        btn.classList.add('text-neutral-500', 'border-white/5');
      }
    });

    // Keep loop active until settled
    if (Math.abs(targetTranslateX - currentTranslateX) > 0.05 || Math.abs(targetProgress - currentProgress) > 0.0005) {
      requestAnimationFrame(renderFrame);
      isTicking = true;
    }
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrolled = -rect.top;

    if (totalDist <= 0) return;

    // Normalized progress within the section's vertical travel track (0.0 to 1.0)
    const rawProgress = scrolled / totalDist;
    targetProgress = Math.min(Math.max(rawProgress, 0), 1);
    targetTranslateX = -targetProgress * maxTranslate;

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderFrame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Interactive Chapter Jump Click Handlers
  jumpButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const p = parseFloat(btn.getAttribute('data-target-progress') || '0');
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const targetScroll = sectionTop + p * totalDist;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  });

  // Initial calculation
  onScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperienceSection);
} else {
  initExperienceSection();
}
