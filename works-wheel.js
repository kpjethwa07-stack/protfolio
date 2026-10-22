/**
 * WorksWheel - 3D Vertical Drum & Ring Portfolio Index Component
 * Vanilla JavaScript Implementation of the WorksWheel React Component
 */

const CARD_H = 0.38; // front card height, of the stage
const CARD_MAX_W = 0.34; // ... but never wider than this much of the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
const BOW = 1.82;
const TITLE = 0.115; // ring label and front-card title
const INDEX = 0.038; // the index down the right-hand side
const CULL = 1.6;

const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
const SETTLE = 140;
const EASE = 0.12;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rad = (deg) => (deg * Math.PI) / 180;
const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export const DEFAULT_WORKS = [
  {
    title: "Bastion",
    subtitle: "Security Simulation & Test Automation",
    description: "A security-policy simulation project built to explore backend logic, data storage, and automated testing. Implemented and tested application logic with 15 passing test suites in pytest.",
    image: "Project Images/bastion.jpg",
    src: "Project Images/bastion.jpg",
    href: "https://www.youtube.com/watch?v=DMimN9Z5P9E",
    link: "https://www.youtube.com/watch?v=DMimN9Z5P9E",
    stats: "15 Passing Tests • Educational Simulation • SQLite & pytest",
    tools: ["Python", "Flask", "SQLite", "pytest"],
    deliverables: [
      "Security policy simulation backend logic",
      "Automated test runner with 15 verified tests",
      "SQLite data storage and query architecture"
    ]
  },
  {
    title: "TraceBack",
    subtitle: "Lost-and-Found Discovery Web App",
    description: "A lost-and-found web application concept designed to help users list, browse, and find lost belongings with an emphasis on responsive UI and intuitive item discovery.",
    image: "Project Images/traceback.jpg",
    src: "Project Images/traceback.jpg",
    href: "https://stellar-yeot-f05e3d.netlify.app/",
    link: "https://stellar-yeot-f05e3d.netlify.app/",
    stats: "TypeScript Architecture • Netlify Deployment • Item Discovery Flow",
    tools: ["HTML", "CSS", "TypeScript", "Netlify"],
    deliverables: [
      "Item listing & search catalog interface",
      "Responsive card grid & category filtering",
      "User claim discovery and item verification flow"
    ]
  },
  {
    title: "Proximity Alert",
    subtitle: "Embedded Hardware & Obstacle Detection",
    description: "An embedded hardware project that detects nearby obstacles and emits real-time audiovisual warnings using an ultrasonic sensor, LED, and buzzer.",
    image: "Project Images/arduino.jpg",
    src: "Project Images/arduino.jpg",
    href: "https://github.com/kpjethwa07-stack",
    link: "https://github.com/kpjethwa07-stack",
    stats: "HC-SR04 Sensor • Ultrasonic Timing • Threshold-Based Alerts",
    tools: ["C++", "Arduino UNO", "HC-SR04", "Embedded Hardware"],
    deliverables: [
      "Real-time ultrasonic pulse timing & distance calculation",
      "Threshold-based buzzer and LED alert trigger",
      "Embedded C++ control loop and breadboard wiring"
    ]
  },
  {
    title: "CS50x Harvard",
    subtitle: "Introduction to Computer Science",
    description: "Completed all 11 weeks of Harvard University's foundational CS program, covering low-level memory, algorithms, data structures, and web application architecture.",
    image: "Project Images/cs50.jpg",
    src: "Project Images/cs50.jpg",
    href: "https://github.com/kpjethwa07-stack",
    link: "https://github.com/kpjethwa07-stack",
    stats: "Harvard / CS50 • 11 Weeks Completed • Capstone Project",
    tools: ["C", "Python", "SQL", "Flask", "Data Structures"],
    deliverables: [
      "Memory management, pointers, and memory-safe code in C",
      "Relational SQL database queries and schema design",
      "Final software capstone project implementation"
    ]
  },
  {
    title: "Operating Systems",
    subtitle: "NPTEL · IIT Madras (Elite 65%)",
    description: "In-depth study and rigorous examination of operating system internals, kernel processes, memory virtualization, CPU scheduling, and synchronization.",
    image: "Project Images/operatingsystems.jpg",
    src: "Project Images/operatingsystems.jpg",
    href: "https://github.com/kpjethwa07-stack",
    link: "https://github.com/kpjethwa07-stack",
    stats: "Elite Certificate • 65% Score • IIT Madras",
    tools: ["Operating Systems", "Process Concurrency", "Memory Paging"],
    deliverables: [
      "CPU scheduling algorithms and thread synchronization",
      "Virtual memory paging, translation lookaside buffers, and deadlocks",
      "File system architecture and I/O management"
    ]
  },
  {
    title: "AWS Cloud Found.",
    subtitle: "Amazon Web Services Academy",
    description: "Foundational training in cloud computing infrastructure, security protocols, scalable storage, virtual compute instances, and modern cloud deployment architectures.",
    image: "Project Images/dsa.jpg",
    src: "Project Images/dsa.jpg",
    href: "https://github.com/kpjethwa07-stack",
    link: "https://github.com/kpjethwa07-stack",
    stats: "AWS Academy • Cloud Computing Fundamentals • Core Services",
    tools: ["AWS", "Cloud Architecture", "Virtual Compute", "Security"],
    deliverables: [
      "Cloud concepts, pricing models, and security governance",
      "Compute, storage, networking, and database service patterns",
      "Well-Architected Framework compliance and resilience"
    ]
  }
];

export function initWorksWheel(container, options = {}) {
  if (!container) return null;

  const items = options.items || DEFAULT_WORKS;
  const label = options.label || "Works '26";
  const action = options.action !== undefined ? options.action : "View";
  const onSelect = options.onSelect || null;

  const count = items.length;
  const last = Math.max(count - 1, 0);

  let turn = 0;
  let target = 0;
  let active = 0;
  let stage = { w: container.clientWidth || 800, h: container.clientHeight || 600 };
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Build DOM Structure
  container.innerHTML = "";
  container.classList.add("relative", "w-full", "h-full", "overflow-hidden", "select-none");

  const section = document.createElement("section");
  section.setAttribute("aria-label", label);
  section.className = "relative w-full h-full min-h-[24rem] overflow-hidden select-none bg-transparent text-neutral-900";

  // Stage (perspective container)
  const stageEl = document.createElement("div");
  stageEl.tabIndex = 0;
  stageEl.role = "listbox";
  stageEl.setAttribute("aria-label", label);
  stageEl.className = "absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:-outline-offset-4 active:cursor-grabbing";

  // Wheel (preserve-3d anchor)
  const wheelEl = document.createElement("div");
  wheelEl.className = "absolute top-1/2 left-1/2 pointer-events-none";
  wheelEl.style.transformStyle = "preserve-3d";

  // Cards
  const cardRefs = [];
  items.forEach((item, i) => {
    const card = document.createElement("div");
    card.id = `works-wheel-${i}`;
    card.role = "option";
    card.setAttribute("aria-selected", i === 0 ? "true" : "false");
    card.className = "group absolute cursor-pointer pointer-events-auto [backface-visibility:hidden]";
    card.style.transformStyle = "preserve-3d";
    card.style.willChange = "transform, opacity";

    const face = document.createElement("div");
    face.className = "relative block w-full h-full overflow-hidden rounded-2xl bg-white border border-neutral-300/80 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_28px_50px_-10px_rgba(0,0,0,0.22)] hover:border-neutral-500";
    face.style.willChange = "transform";
    face.style.transformOrigin = "center center";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.draggable = false;
    img.className = "w-full h-full object-cover select-none pointer-events-none";
    img.loading = "eager";

    face.appendChild(img);

    // Subtle gradient overlay for card readability
    const gradientOverlay = document.createElement("div");
    gradientOverlay.className = "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent";
    face.appendChild(gradientOverlay);

    // Bottom subtle info badge on card
    const cardInfo = document.createElement("div");
    cardInfo.className = "pointer-events-none absolute left-3.5 bottom-3.5 right-3.5 flex items-center justify-between";
    cardInfo.innerHTML = `
      <span class="text-[11px] font-mono tracking-wider text-white drop-shadow-sm font-semibold truncate max-w-[70%]">
        ${item.title}
      </span>
      <span class="bg-white/95 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
        ${action} ↗
      </span>
    `;
    face.appendChild(cardInfo);

    card.appendChild(face);

    // Click on card
    card.addEventListener("click", (e) => {
      if (dragDelta > 6) return; // Ignore drag clicks
      if (active === i) {
        if (onSelect) {
          onSelect(i, item);
        } else if (window.openProjectModal) {
          window.openProjectModal(item);
        } else if (item.href && item.href.startsWith("http")) {
          window.open(item.href, "_blank");
        }
      } else {
        to(i + 1);
      }
    });

    wheelEl.appendChild(card);
    cardRefs.push(card);
  });

  stageEl.appendChild(wheelEl);
  section.appendChild(stageEl);

  // Center ring label ("Works '26" or "Landing Pages")
  const labelEl = document.createElement("div");
  labelEl.className = "pointer-events-none absolute inset-0 grid place-items-center tracking-tight font-black uppercase text-center text-neutral-900 select-none z-10 transition-opacity duration-300";
  labelEl.textContent = label;
  section.appendChild(labelEl);

  // Front-card title
  const titleEl = document.createElement("div");
  titleEl.className = "pointer-events-none absolute top-1/2 left-[5%] md:left-[7%] -translate-y-1/2 tracking-tight font-black uppercase text-neutral-900 opacity-0 select-none z-10 max-w-[42%] leading-[1.05]";
  titleEl.textContent = items[0] ? items[0].title : "";
  section.appendChild(titleEl);

  // Side Index List
  const indexList = document.createElement("ol");
  indexList.className = "text-neutral-500 absolute top-[7%] right-[3%] text-right leading-[1.75] z-20 space-y-0.5 select-none font-mono";
  const indexButtons = [];

  items.forEach((item, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = item.title;
    btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-400 hover:text-neutral-900 block ml-auto";
    if (i === 0) {
      btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-900 font-bold block ml-auto underline decoration-2 underline-offset-4";
    }
    btn.addEventListener("click", () => {
      to(i + 1);
    });
    li.appendChild(btn);
    indexList.appendChild(li);
    indexButtons.push(btn);
  });
  section.appendChild(indexList);

  // Bottom helper pill
  const hintPill = document.createElement("div");
  hintPill.className = "pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-neutral-200 shadow-sm backdrop-blur-md text-[10px] md:text-[11px] font-mono text-neutral-600 uppercase tracking-wider";
  hintPill.innerHTML = `
    <svg class="w-3 h-3 text-neutral-500 animate-bounce" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>SCROLL OR DRAG DRUM TO CYCLE</span>
  `;
  section.appendChild(hintPill);

  container.appendChild(section);

  // Geometry computation
  let currentMetrics = calculateMetrics();

  function calculateMetrics() {
    const w = stage.w || 800;
    const h = stage.h || 600;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;

    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: Math.max(22, cardH * TITLE),
      index: Math.max(10, cardH * INDEX),
    };
  }

  function applyMetrics() {
    currentMetrics = calculateMetrics();
    stageEl.style.perspective = `${currentMetrics.depth}px`;

    cardRefs.forEach((card) => {
      card.style.width = `${currentMetrics.cardW}px`;
      card.style.height = `${currentMetrics.cardH}px`;
      card.style.marginLeft = `${-currentMetrics.cardW / 2}px`;
      card.style.marginTop = `${-currentMetrics.cardH / 2}px`;
    });

    labelEl.style.fontSize = `${currentMetrics.title}px`;
    titleEl.style.fontSize = `${currentMetrics.title * 0.9}px`;
  }

  applyMetrics();

  // ResizeObserver
  const ro = new ResizeObserver(() => {
    stage = { w: stageEl.clientWidth, h: stageEl.clientHeight };
    applyMetrics();
  });
  ro.observe(stageEl);

  // Target steering
  function to(next) {
    target = clamp(next, 0, last + 1);
  }

  // Wheel interaction
  let settlingTimer = null;
  const onWheel = (event) => {
    const delta = event.deltaY;
    const next = target + delta / WHEEL_UNITS;
    // Native listener: cancellable only while inside wheel range so page scrolls on at edges
    if (next > 0 && next < last + 1) {
      event.preventDefault();
    }
    to(next);
    clearTimeout(settlingTimer);
    settlingTimer = setTimeout(() => {
      to(Math.round(target));
    }, SETTLE);
  };
  stageEl.addEventListener("wheel", onWheel, { passive: false });

  // Pointer drag interaction
  let isPointerDown = false;
  let dragStartY = 0;
  let dragDelta = 0;

  stageEl.addEventListener("pointerdown", (event) => {
    isPointerDown = true;
    dragStartY = event.clientY;
    dragDelta = 0;
    try {
      stageEl.setPointerCapture(event.pointerId);
    } catch (_) {}
  });

  stageEl.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;
    const diff = dragStartY - event.clientY;
    dragDelta += Math.abs(diff);
    to(target + diff / DRAG_UNITS);
    dragStartY = event.clientY;
  });

  const endDrag = (event) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    try {
      stageEl.releasePointerCapture(event.pointerId);
    } catch (_) {}
    if (target > 1) {
      to(Math.round(target));
    }
  };

  stageEl.addEventListener("pointerup", endDrag);
  stageEl.addEventListener("pointercancel", endDrag);

  // Keyboard navigation
  stageEl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      to(Math.round(target) + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      to(Math.round(target) - 1);
    }
  });

  // UI Active State Update
  function updateActiveUI(near) {
    stageEl.setAttribute("aria-activedescendant", `works-wheel-${near}`);
    cardRefs.forEach((card, idx) => {
      card.setAttribute("aria-selected", idx === near ? "true" : "false");
    });

    indexButtons.forEach((btn, idx) => {
      if (idx === near) {
        btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-900 font-bold block ml-auto scale-105 underline decoration-2 underline-offset-4";
      } else {
        btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-400 hover:text-neutral-900 block ml-auto";
      }
    });

    const counter = document.getElementById("works-wheel-counter");
    if (counter) {
      counter.textContent = `${String(near + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    }

    if (items[near]) {
      titleEl.textContent = items[near].title;
    }
  }

  // Animation Loop (Single rAF pass writing direct DOM transforms)
  let frameId = 0;
  let isRunning = true;

  const draw = () => {
    if (!isRunning) return;
    frameId = requestAnimationFrame(draw);

    const gap = target - turn;
    if (Math.abs(gap) < 0.0005) {
      turn = target;
    } else {
      turn += gap * (reduced ? 1 : EASE);
    }

    const t = turn;
    const m = clamp(t, 0, 1);
    const pos = Math.max(0, t - 1);

    const { ringR, ringScale, drumR, bow } = currentMetrics;

    if (wheelEl) {
      wheelEl.style.transform = `translateZ(${-m * drumR}px)`;
    }

    for (let i = 0; i < count; i++) {
      const d = i - pos;
      const drumDeg = d * STEP;
      const card = cardRefs[i];
      if (card) {
        card.style.transform = place(
          d * (360 / count),
          drumDeg,
          ringR,
          drumR,
          bow,
          m
        );
        card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
      }
      const face = card ? card.firstElementChild : null;
      if (face) {
        face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }
    }

    if (labelEl) labelEl.style.opacity = String(1 - m);
    if (titleEl) titleEl.style.opacity = String(m);

    const near = clamp(Math.round(pos), 0, last);
    if (near !== active) {
      active = near;
      updateActiveUI(near);
    }
  };

  frameId = requestAnimationFrame(draw);

  return {
    to,
    next: () => to(Math.min(last + 1, Math.round(target) + 1)),
    prev: () => to(Math.max(0, Math.round(target) - 1)),
    getActive: () => active,
    destroy: () => {
      isRunning = false;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      stageEl.removeEventListener("wheel", onWheel);
      clearTimeout(settlingTimer);
    }
  };
}
